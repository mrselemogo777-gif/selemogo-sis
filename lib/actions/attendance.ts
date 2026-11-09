'use server'

import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requirePermission } from '@/lib/rbac'
import { audit } from '@/lib/audit'

export async function markAttendance(formData: FormData) {
  const session = await requirePermission('attendance:write')

  const sessionId = formData.get('sessionId') as string
  if (!sessionId) throw new Error('Session ID required')

  const dbSession = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      cohort: {
        include: { enrolments: true },
      },
    },
  })

  if (!dbSession) throw new Error('Session not found')

  // Collect the attendance status for each enrolment
  const updates: { enrolmentId: string; status: string }[] = []
  for (const enrolment of dbSession.cohort.enrolments) {
    const status = formData.get(`status_${enrolment.id}`) as string
    if (status && ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'].includes(status)) {
      updates.push({ enrolmentId: enrolment.id, status })
    }
  }

  if (updates.length === 0) {
    redirect(`/cohorts/${dbSession.cohortId}/attendance/${sessionId}?error=empty`)
  }

  // Upsert in a transaction — bulk operation
  await prisma.$transaction(
    updates.map(u =>
      prisma.attendance.upsert({
        where: {
          sessionId_enrolmentId: {
            sessionId,
            enrolmentId: u.enrolmentId,
          },
        },
        create: {
          sessionId,
          enrolmentId: u.enrolmentId,
          status: u.status as any,
        },
        update: {
          status: u.status as any,
          markedAt: new Date(),
        },
      })
    )
  )

  await audit({
    action: 'MARK_ATTENDANCE',
    entity: 'Session',
    entityId: sessionId,
    after: {
      cohortId: dbSession.cohortId,
      recordCount: updates.length,
      markedBy: session.userId,
    },
  })

  revalidatePath(`/cohorts/${dbSession.cohortId}`)
  revalidatePath(`/cohorts/${dbSession.cohortId}/attendance/${sessionId}`)
  redirect(`/cohorts/${dbSession.cohortId}/attendance/${sessionId}?saved=1`)
}
