import { Suspense } from 'react'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { AppShell } from '@/components/app-shell'
import { Topbar } from '@/components/topbar'
export const instant = false


async function DashboardData() {
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

  const stats = [
    { label: 'Programmes', value: programmes, href: '/programmes' },
    { label: 'Students', value: students, href: '/students' },
    { label: 'Applicants', value: applicants, href: '/applicants' },
    { label: 'Cohorts', value: cohorts, href: '/cohorts' },
    { label: 'Enrolments', value: enrolments, href: '/cohorts' },
    { label: 'Audit Logs', value: auditLogs, href: '/audit' },
  ]

  return (
    <main className="p-8">
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
        {stats.map(item => (
          <Link key={item.label} href={item.href} className="bg-white border border-[var(--color-border)] rounded-lg p-4 hover:border-[var(--color-accent)] transition-colors">
            <p className="text-xs text-[var(--color-text-secondary)]">{item.label}</p>
            <p className="text-2xl font-bold mt-1 tabular text-[var(--color-text-primary)]">{item.value}</p>
          </Link>
        ))}
      </div>
      <div className="bg-white border border-[var(--color-border)] rounded-lg p-5 mb-6">
        <h2 className="text-base font-bold mb-3 text-[var(--color-text-primary)]">Quick actions</h2>
        <div className="flex flex-wrap gap-2">
          <Link href="/apply" className="bg-[var(--color-primary)] text-white px-4 py-2 rounded text-sm hover:bg-[var(--color-primary-hover)]">Register Applicant</Link>
          <Link href="/applicants" className="border border-[var(--color-border)] px-4 py-2 rounded text-sm hover:bg-[var(--color-surface)]">Review applicants</Link>
          <Link href="/cohorts/new" className="border border-[var(--color-border)] px-4 py-2 rounded text-sm hover:bg-[var(--color-surface)]">+ New cohort</Link>
          <Link href="/cohorts" className="border border-[var(--color-border)] px-4 py-2 rounded text-sm hover:bg-[var(--color-surface)]">Mark attendance</Link>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white border border-[var(--color-border)] rounded-lg p-5">
          <h2 className="text-base font-bold mb-4">Programmes by category</h2>
          <div className="space-y-3">
            {byCategory.map(cat => (
              <div key={cat.category} className="flex items-center justify-between">
                <span className="text-sm">{cat.category}</span>
                <span className="text-xs font-mono tabular bg-[var(--color-surface)] px-2 py-0.5 rounded">{cat._count._all}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white border border-[var(--color-border)] rounded-lg p-5">
          <h2 className="text-base font-bold mb-4">Recent activity</h2>
          {recentAudit.length === 0 ? <p className="text-sm text-[var(--color-text-muted)]">No activity yet.</p> : (
            <div className="space-y-2">
              {recentAudit.map(log => (
                <div key={log.id} className="flex items-center justify-between py-1.5 border-b border-[var(--color-border)] last:border-0">
                  <div><p className="text-xs font-mono">{log.action}</p><p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">{log.entity} · {log.user?.name ?? 'system'}</p></div>
                  <span className="text-[11px] text-[var(--color-text-muted)] tabular">{log.createdAt.toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export default function DashboardPage() {
  return (
    <AppShell>
      <Topbar title="SIS" subtitle="Selemogo Student Information System" />
      <Suspense fallback={<div className="p-8 text-sm text-[var(--color-text-muted)]">Loading dashboard...</div>}>
        <DashboardData />
      </Suspense>
    </AppShell>
  )
}
