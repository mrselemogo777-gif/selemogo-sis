'use server'

import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requirePermission } from '@/lib/rbac'
import { audit } from '@/lib/audit'

export async function createCohort(formData: FormData) {
  await requirePermission('cohorts:write')

  const programmeId = formData.get('programmeId') as string
  const code = (formData.get('code') as string)?.trim().toUpperCase()
  const startDateStr = formData.get('startDate') as string
  const endDateStr = formData.get('endDate') as string
  const capacity = parseInt(formData.get('capacity') as string, 10) || 30

  if (!programmeId || !code || !startDateStr || !endDateStr) {
    redirect('/cohorts/new?error=missing')
  }

  const startDate = new Date(startDateStr)
  const endDate = new Date(endDateStr)

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    redirect('/cohorts/new?error=date')
  }

  if (endDate <= startDate) {
    redirect('/cohorts/new?error=range')
  }

  const existing = await prisma.cohort.findUnique({ where: { code } })
  if (existing) {
    redirect('/cohorts/new?error=duplicate')
  }

  const cohort = await prisma.cohort.create({
    data: {
      programmeId,
      code,
      startDate,
      endDate,
      capacity,
    },
  })

  await audit({
    action: 'CREATE_COHORT',
    entity: 'Cohort',
    entityId: cohort.id,
    after: cohort,
  })

  revalidatePath('/cohorts')
  redirect(`/cohorts/${cohort.id}`)
}

export async function createSession(formData: FormData) {
  await requirePermission('cohorts:write')

  const cohortId = formData.get('cohortId') as string
  const dateStr = formData.get('date') as string
  const topic = (formData.get('topic') as string)?.trim() || null

  if (!cohortId || !dateStr) {
    redirect(`/cohorts/${cohortId}?error=missing`)
  }

  const date = new Date(dateStr)
  if (isNaN(date.getTime())) {
    redirect(`/cohorts/${cohortId}?error=date`)
  }

  const session = await prisma.session.create({
    data: { cohortId, date, topic },
  })

  await audit({
    action: 'CREATE_SESSION',
    entity: 'Session',
    entityId: session.id,
    after: session,
  })

  revalidatePath(`/cohorts/${cohortId}`)
  redirect(`/cohorts/${cohortId}`)
}

export async function enrolStudent(formData: FormData) {
  await requirePermission('enrolments:write')

  const cohortId = formData.get('cohortId') as string
  const studentId = formData.get('studentId') as string

  if (!cohortId || !studentId) {
    redirect(`/cohorts/${cohortId}?error=missing`)
  }

  const cohort = await prisma.cohort.findUnique({
    where: { id: cohortId },
    include: { _count: { select: { enrolments: true } } },
  })

  if (!cohort) {
    redirect('/cohorts?error=notfound')
  }

  if (cohort._count.enrolments >= cohort.capacity) {
    redirect(`/cohorts/${cohortId}?error=full`)
  }

  const existing = await prisma.enrolment.findUnique({
    where: { studentId_cohortId: { studentId, cohortId } },
  })

  if (existing) {
    redirect(`/cohorts/${cohortId}?error=duplicate`)
  }

  const enrolment = await prisma.enrolment.create({
    data: {
      studentId,
      cohortId,
      programmeId: cohort.programmeId,
      status: 'ACTIVE',
    },
  })

  await audit({
    action: 'CREATE_ENROLMENT',
    entity: 'Enrolment',
    entityId: enrolment.id,
    after: enrolment,
  })

  revalidatePath(`/cohorts/${cohortId}`)
  redirect(`/cohorts/${cohortId}?enrolled=1`)
}
