import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/rbac'
import Link from 'next/link'

export const instant = false

const actionColors: Record<string, string> = {
  CREATE_APPLICANT: 'bg-blue-100 text-blue-800',
  CONVERT_APPLICANT: 'bg-purple-100 text-purple-800',
  CREATE_COHORT: 'bg-green-100 text-green-800',
  CREATE_SESSION: 'bg-indigo-100 text-indigo-800',
  CREATE_ENROLMENT: 'bg-teal-100 text-teal-800',
  MARK_ATTENDANCE: 'bg-yellow-100 text-yellow-800',
  CAPTURE_RESULTS: 'bg-orange-100 text-orange-800',
}

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string }>
}) {
  await requirePermission('audit:read')
  const params = await searchParams
  const filterAction = params.action

  const where = filterAction ? { action: filterAction } : {}

  const logs = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: { user: { select: { name: true, email: true } } },
  })

  const actionTypes = await prisma.auditLog.groupBy({
    by: ['action'],
    _count: { _all: true },
    orderBy: { _count: { action: 'desc' } },
  })

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Audit Log</h1>
            <p className="text-gray-500 mt-1">
              {logs.length} {filterAction ? `entries for ${filterAction}` : 'entries'}
              {filterAction && (
                <Link href="/audit" className="text-blue-600 hover:underline ml-2">
                  (clear filter)
                </Link>
              )}
            </p>
          </div>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900">
            ← Dashboard
          </Link>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Link
            href="/audit"
            className={`text-xs px-3 py-1 rounded border ${
              !filterAction ? 'bg-black text-white border-black' : 'bg-white hover:bg-gray-50'
            }`}
          >
            All
          </Link>
          {actionTypes.map(a => (
            <Link
              key={a.action}
              href={`/audit?action=${a.action}`}
              className={`text-xs px-3 py-1 rounded border font-mono ${
                filterAction === a.action
                  ? 'bg-black text-white border-black'
                  : 'bg-white hover:bg-gray-50'
              }`}
            >
              {a.action} ({a._count._all})
            </Link>
          ))}
        </div>

        {logs.length === 0 ? (
          <div className="bg-white border rounded-lg p-12 text-center">
            <p className="text-gray-500">No audit entries yet.</p>
          </div>
        ) : (
          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="text-left p-3 font-semibold">Time</th>
                  <th className="text-left p-3 font-semibold">Action</th>
                  <th className="text-left p-3 font-semibold">Entity</th>
                  <th className="text-left p-3 font-semibold">By</th>
                  <th className="text-left p-3 font-semibold">Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-xs font-mono text-gray-500">
                      {log.createdAt.toLocaleString()}
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-xs px-2 py-1 rounded font-mono ${
                          actionColors[log.action] ?? 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 text-xs">
                      <span className="font-semibold">{log.entity}</span>
                      <br />
                      <span className="text-gray-400 font-mono">{log.entityId.slice(0, 12)}...</span>
                    </td>
                    <td className="p-3 text-xs">{log.user?.name ?? 'system'}</td>
                    <td className="p-3 text-xs text-gray-500">
                      {log.after && typeof log.after === 'object' ? (
                        <code className="text-xs">
                          {JSON.stringify(log.after).slice(0, 80)}
                          {JSON.stringify(log.after).length > 80 ? '...' : ''}
                        </code>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}
