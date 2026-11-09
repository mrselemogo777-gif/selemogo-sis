import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const instant = false

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [programmes, students, applicants, cohorts, enrolments, auditLogs] = await Promise.all([
    prisma.programme.count(),
    prisma.student.count(),
    prisma.applicant.count(),
    prisma.cohort.count(),
    prisma.enrolment.count(),
    prisma.auditLog.count(),
  ])

  const byCategory = await prisma.programme.groupBy({
    by: ['category'],
    _count: { _all: true },
  })

  const recentAudit = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { user: { select: { name: true } } },
  })

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-500 mt-1">
              Welcome, {session.name} · Role: <span className="font-mono">{session.role}</span>
            </p>
          </div>
          <form action={async () => {
            'use server'
            const { logout } = await import('@/lib/actions/auth')
            await logout()
          }}>
            <button type="submit" className="text-sm text-gray-500 hover:text-gray-900">
              Sign out
            </button>
          </form>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Programmes', value: programmes, href: '/programmes' },
            { label: 'Students', value: students, href: '/students' },
            { label: 'Applicants', value: applicants, href: '/applicants' },
            { label: 'Cohorts', value: cohorts, href: '/cohorts' },
            { label: 'Enrolments', value: enrolments, href: '/cohorts' },
            { label: 'Audit Logs', value: auditLogs, href: '/audit' },
          ].map(item => (
            <Link
              key={item.label}
              href={item.href}
              className="bg-white border rounded-lg p-4 hover:shadow-md transition"
            >
              <p className="text-xs text-gray-500">{item.label}</p>
              <p className="text-2xl font-bold mt-1">{item.value}</p>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white border rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/apply"
              className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800"
            >
              Open public form
            </Link>
            <Link
              href="/applicants"
              className="border px-4 py-2 rounded text-sm hover:bg-gray-50"
            >
              Review applicants
            </Link>
            <Link
              href="/cohorts/new"
              className="border px-4 py-2 rounded text-sm hover:bg-gray-50"
            >
              + New cohort
            </Link>
            <Link
              href="/cohorts"
              className="border px-4 py-2 rounded text-sm hover:bg-gray-50"
            >
              Mark attendance
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Programmes by Category */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Programmes by Category</h2>
            <div className="space-y-3">
              {byCategory.map(cat => (
                <div key={cat.category} className="flex items-center justify-between">
                  <span className="text-sm">{cat.category}</span>
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {cat._count._all}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
            {recentAudit.length === 0 ? (
              <p className="text-gray-500 text-sm">No activity yet.</p>
            ) : (
              <div className="space-y-2">
                {recentAudit.map(log => (
                  <div key={log.id} className="text-xs border-b pb-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-gray-700">{log.action}</span>
                      <span className="text-gray-400">{log.createdAt.toLocaleTimeString()}</span>
                    </div>
                    <div className="text-gray-500 mt-1">
                      {log.entity} · by {log.user?.name ?? 'system'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
