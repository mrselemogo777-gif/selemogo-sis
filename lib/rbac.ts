import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'

export type Role = 'ADMIN' | 'REGISTRAR' | 'TRAINER' | 'STUDENT'

const permissions: Record<string, Role[]> = {
  'applicants:read': ['ADMIN', 'REGISTRAR'],
  'applicants:write': ['ADMIN', 'REGISTRAR'],
  'applicants:convert': ['ADMIN', 'REGISTRAR'],
  'students:read': ['ADMIN', 'REGISTRAR', 'TRAINER'],
  'students:write': ['ADMIN', 'REGISTRAR'],
  'programmes:read': ['ADMIN', 'REGISTRAR', 'TRAINER', 'STUDENT'],
  'programmes:write': ['ADMIN'],
  'cohorts:read': ['ADMIN', 'REGISTRAR', 'TRAINER'],
  'cohorts:write': ['ADMIN', 'REGISTRAR'],
  'enrolments:read': ['ADMIN', 'REGISTRAR', 'TRAINER'],
  'enrolments:write': ['ADMIN', 'REGISTRAR'],
  'attendance:read': ['ADMIN', 'REGISTRAR', 'TRAINER'],
  'attendance:write': ['ADMIN', 'TRAINER'],
  'results:read': ['ADMIN', 'REGISTRAR', 'TRAINER', 'STUDENT'],
  'results:write': ['ADMIN', 'TRAINER'],
  'audit:read': ['ADMIN'],
  'users:manage': ['ADMIN'],
}

export async function requirePermission(permission: string) {
  const session = await getSession()
  if (!session) redirect('/login')

  const allowed = permissions[permission]
  if (!allowed || !allowed.includes(session.role as Role)) {
    throw new Error(`Forbidden: missing permission ${permission}`)
  }

  return session
}

export async function can(permission: string): Promise<boolean> {
  const session = await getSession()
  if (!session) return false
  const allowed = permissions[permission]
  return !!allowed && allowed.includes(session.role as Role)
}
