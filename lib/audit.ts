import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

type AuditParams = {
  action: string
  entity: string
  entityId: string
  before?: any
  after?: any
}

export async function audit({ action, entity, entityId, before, after }: AuditParams) {
  const session = await getSession()
  if (!session) return

  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      action,
      entity,
      entityId,
      before: before ?? undefined,
      after: after ?? undefined,
    },
  })
}
