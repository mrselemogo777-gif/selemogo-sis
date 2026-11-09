import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/rbac'
import Link from 'next/link'
import { AppShell } from '@/components/app-shell'
import { Topbar } from '@/components/topbar'

export const instant = false

const statusStyles: Record<string, string> = {
  NEW: 'bg-blue-50 text-blue-700 border-blue-200',
  SCREENING: 'bg-amber-50 text-amber-700 border-amber-200',
  OFFERED: 'bg-purple-50 text-purple-700 border-purple-200',
  ACCEPTED: 'bg-green-50 text-green-700 border-green-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
  CONVERTED: 'bg-slate-50 text-slate-700 border-slate-200',
}

export default async function ApplicantsPage() {
  await requirePermission('applicants:read')

  const applicants = await prisma.applicant.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return (
    <AppShell>
      <Topbar title="Applicants" subtitle="Selemogo SIS" />
      <main className="p-8">
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm font-medium text-[var(--color-text-primary)]">
            Applications received through the registration form
          </p>
          <Link
            href="/apply"
            className="text-sm bg-[var(--color-primary)] text-white px-4 py-2 rounded hover:bg-[var(--color-primary-hover)] transition-colors"
          >
            Open Registration Form →
          </Link>
        </div>

        {applicants.length === 0 ? (
          <div className="bg-white border border-[var(--color-border)] rounded-lg p-12 text-center">
            <p className="text-[var(--color-text-secondary)]">No applicants yet.</p>
          </div>
        ) : (
          <div className="bg-white border border-[var(--color-border)] rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-surface)] border-b border-[var(--color-border)]">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Phone</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Applied</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {applicants.map(a => (
                  <tr key={a.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface)] transition-colors">
                    <td className="px-4 py-3 font-semibold">{a.firstName} {a.lastName}</td>
                    <td className="px-4 py-3 text-xs text-[var(--color-text-secondary)]">{a.email}</td>
                    <td className="px-4 py-3 text-xs text-[var(--color-text-secondary)]">{a.phone ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex text-xs px-2 py-0.5 rounded border ${statusStyles[a.status]}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--color-text-muted)] tabular">
                      {a.createdAt.toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/applicants/${a.id}`} className="text-xs text-[var(--color-accent)] hover:underline font-medium">
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </AppShell>
  )
}
