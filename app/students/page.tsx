import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/rbac'
import Link from 'next/link'
import { AppShell } from '@/components/app-shell'
import { Topbar } from '@/components/topbar'

export const instant = false

export default async function StudentsPage() {
  await requirePermission('students:read')

  const students = await prisma.student.findMany({
    orderBy: { studentNo: 'asc' },
    take: 100,
    include: { _count: { select: { enrolments: true } } },
  })

  return (
    <AppShell>
      <Topbar title="Students" subtitle="Selemogo SIS" />
      <main className="p-8">
        {students.length === 0 ? (
          <div className="bg-white border border-[var(--color-border)] rounded-lg p-12 text-center">
            <p className="text-[var(--color-text-secondary)]">No students yet.</p>
            <Link href="/applicants" className="inline-block mt-4 text-[var(--color-accent)] hover:underline text-sm">
              Convert an applicant to get started →
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-[var(--color-border)] rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-surface)] border-b border-[var(--color-border)]">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Student No.</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Phone</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Enrolments</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface)] transition-colors">
                    <td className="px-4 py-3 font-mono text-xs tabular">{s.studentNo}</td>
                    <td className="px-4 py-3 font-semibold">{s.firstName} {s.lastName}</td>
                    <td className="px-4 py-3 text-xs text-[var(--color-text-secondary)]">{s.email ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-[var(--color-text-secondary)]">{s.phone ?? '—'}</td>
                    <td className="px-4 py-3 text-xs tabular">{s._count.enrolments}</td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/students/${s.id}`} className="text-xs text-[var(--color-accent)] hover:underline font-medium">
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
