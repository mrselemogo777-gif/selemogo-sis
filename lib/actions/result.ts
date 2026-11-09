'use server'

import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requirePermission } from '@/lib/rbac'
import { audit } from '@/lib/audit'

const PASS_MARK = 50

export async function captureResults(formData: FormData) {
  const session = await requirePermission('results:write')

  const cohortId = formData.get('cohortId') as string
  if (!cohortId) throw new Error('Cohort ID required')

  const cohort = await prisma.cohort.findUnique({
    where: { id: cohortId },
    include: {
      enrolments: {
        include: { results: true },
      },
    },
  })

  if (!cohort) throw new Error('Cohort not found')

  const updates: { enrolmentId: string; mark: number; moderated: boolean }[] = []
  for (const enrolment of cohort.enrolments) {
    const markStr = formData.get(`mark_${enrolment.id}`) as string
    if (!markStr || markStr.trim() === '') continue

    const mark = parseInt(markStr, 10)
    if (isNaN(mark) || mark < 0 || mark > 100) continue

    const moderated = formData.get(`moderated_${enrolment.id}`) === 'on'
    updates.push({ enrolmentId: enrolment.id, mark, moderated })
  }

  if (updates.length === 0) {
    redirect(`/cohorts/${cohortId}/results?error=empty`)
  }

  await prisma.$transaction(
    updates.map(u => {
      const outcome = u.mark >= PASS_MARK ? 'PASS' : 'FAIL'
      return prisma.result.upsert({
        where: { enrolmentId: u.enrolmentId },
        create: {
          enrolmentId: u.enrolmentId,
          mark: u.mark,
          outcome: outcome as any,
          assessedBy: session.userId,
          assessedAt: new Date(),
          moderated: u.moderated,
        },
        update: {
          mark: u.mark,
          outcome: outcome as any,
          assessedBy: session.userId,
          assessedAt: new Date(),
          moderated: u.moderated,
        },
      })
    })
  )

  // Auto-complete enrolments whose results are recorded
  await prisma.enrolment.updateMany({
    where: {
      cohortId,
      id: { in: updates.map(u => u.enrolmentId) },
    },
    data: { status: 'COMPLETED' },
  })

  await audit({
    action: 'CAPTURE_RESULTS',
    entity: 'Cohort',
    entityId: cohortId,
    after: {
      recordCount: updates.length,
      capturedBy: session.userId,
    },
  })

  revalidatePath(`/cohorts/${cohortId}`)
  revalidatePath(`/cohorts/${cohortId}/results`)
  redirect(`/cohorts/${cohortId}/results?saved=1`)
}
