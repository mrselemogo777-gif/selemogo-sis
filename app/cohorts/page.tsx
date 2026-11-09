import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/rbac'
import Link from 'next/link'

export const instant = false

export default async function CohortsPage() {
  await requirePermission('cohorts:read')

  const cohorts = await prisma.cohort.findMany({
    orderBy: { startDate: 'desc' },
    take: 50,
    include: {
      programme: { select: { code: true, title: true, category: true } },
      _count: { select: { enrolments: true, sessions: true } },
    },
  })

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Cohorts</h1>
            <p className="text-gray-500 mt-1">{cohorts.length} total</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/cohorts/new"
              className="text-sm bg-black text-white px-3 py-2 rounded hover:bg-gray-800"
            >
              + New Cohort
            </Link>
            <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900">
              ← Dashboard
            </Link>
          </div>
        </div>

        {cohorts.length === 0 ? (
          <div className="bg-white border rounded-lg p-12 text-center">
            <p className="text-gray-500">No cohorts yet.</p>
            <p className="text-gray-400 text-sm mt-1">
              Create a cohort to start tracking attendance and enrolments.
            </p>
            <Link
              href="/cohorts/new"
              className="inline-block mt-4 bg-black text-white px-4 py-2 rounded text-sm"
            >
              Create your first cohort
            </Link>
          </div>
        ) : (
          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="text-left p-3 font-semibold">Code</th>
                  <th className="text-left p-3 font-semibold">Programme</th>
                  <th className="text-left p-3 font-semibold">Start</th>
                  <th className="text-left p-3 font-semibold">End</th>
                  <th className="text-left p-3 font-semibold">Enrolments</th>
                  <th className="text-left p-3 font-semibold">Sessions</th>
                  <th className="text-left p-3 font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {cohorts.map(c => (
                  <tr key={c.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-mono text-xs">{c.code}</td>
                    <td className="p-3">
                      <span className="text-xs text-gray-500">[{c.programme.code}]</span>{' '}
                      {c.programme.title}
                    </td>
                    <td className="p-3 text-xs">{c.startDate.toLocaleDateString()}</td>
                    <td className="p-3 text-xs">{c.endDate.toLocaleDateString()}</td>
                    <td className="p-3 text-xs">
                      {c._count.enrolments}/{c.capacity}
                    </td>
                    <td className="p-3 text-xs">{c._count.sessions}</td>
                    <td className="p-3">
                      <Link
                        href={`/cohorts/${c.id}`}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        Open →
                      </Link>
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
