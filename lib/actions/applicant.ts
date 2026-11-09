'use server'

import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requirePermission } from '@/lib/rbac'
import { audit } from '@/lib/audit'
import { generateStudentNumber } from '@/lib/student-number'
import bcrypt from 'bcryptjs'

export async function createApplicant(formData: FormData) {
  const firstName = (formData.get('firstName') as string)?.trim()
  const lastName = (formData.get('lastName') as string)?.trim()
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const phone = (formData.get('phone') as string)?.trim() || null
  const programmeId = (formData.get('programmeId') as string) || null

  if (!firstName || !lastName || !email) {
    redirect('/apply?error=missing')
  }

  const existing = await prisma.applicant.findFirst({
    where: { email, status: { not: 'CONVERTED' } },
  })
  if (existing) {
    redirect('/apply?error=duplicate')
  }

  const applicant = await prisma.applicant.create({
    data: {
      firstName,
      lastName,
      email,
      phone,
      programmeId,
      status: 'NEW',
    },
  })

  await audit({
    action: 'CREATE_APPLICANT',
    entity: 'Applicant',
    entityId: applicant.id,
    after: applicant,
  })

  redirect('/apply?success=1')
}

export async function convertApplicantToStudent(applicantId: string) {
  const session = await requirePermission('applicants:convert')

  const result = await prisma.$transaction(async (tx) => {
    const applicant = await tx.applicant.findUnique({ where: { id: applicantId } })
    if (!applicant) throw new Error('Applicant not found')
    if (applicant.status === 'CONVERTED') throw new Error('Already converted')

    const tempPassword = Math.random().toString(36).slice(-10) + 'Aa1!'
    const passwordHash = await bcrypt.hash(tempPassword, 10)

    let user = await tx.user.findUnique({ where: { email: applicant.email } })
    if (!user) {
      user = await tx.user.create({
        data: {
          email: applicant.email,
          name: `${applicant.firstName} ${applicant.lastName}`,
          passwordHash,
          role: 'STUDENT',
        },
      })
    }

    const studentNo = await generateStudentNumber()

    const student = await tx.student.create({
      data: {
        userId: user.id,
        studentNo,
        firstName: applicant.firstName,
        lastName: applicant.lastName,
        email: applicant.email,
        phone: applicant.phone,
      },
    })

    await tx.applicant.update({
      where: { id: applicantId },
      data: {
        status: 'CONVERTED',
        convertedStudentId: student.id,
      },
    })

    return { student, tempPassword, applicant }
  })

  await audit({
    action: 'CONVERT_APPLICANT',
    entity: 'Applicant',
    entityId: applicantId,
    before: { status: result.applicant.status },
    after: {
      status: 'CONVERTED',
      studentId: result.student.id,
      studentNo: result.student.studentNo,
      convertedBy: session.userId,
    },
  })

  revalidatePath('/applicants')
  revalidatePath('/students')
  redirect(`/applicants/${applicantId}?converted=1&password=${encodeURIComponent(result.tempPassword)}`)
}
