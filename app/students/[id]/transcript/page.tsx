import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/rbac'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const instant = false

export default async function TranscriptPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requirePermission('students:read')
  const { id } = await params

  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      enrolments: {
        include: {
          programme: true,
          cohort: true,
          results: true,
        },
        orderBy: { enrolledAt: 'asc' },
      },
    },
  })

  if (!student) notFound()

  const passedProgrammes = student.enrolments.filter(e => e.results[0]?.outcome === 'PASS')
  const failedProgrammes = student.enrolments.filter(e => e.results[0]?.outcome === 'FAIL')
  const pendingProgrammes = student.enrolments.filter(e => !e.results[0])

  const issueDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  return (
    <main className="min-h-screen bg-gray-100 p-8 print:bg-white print:p-0">
      <div className="max-w-3xl mx-auto mb-6 print:hidden">
        <div className="flex items-center justify-between">
          <Link href={`/students/${student.id}`} className="text-sm text-gray-500 hover:text-gray-900">
            ← Back to profile
          </Link>
          <button
            className="text-sm bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
            // Print requires client-side JS — use a simple print link
            formAction=""
            onClick={undefined as any}
          >
            <a href="#" onClick={typeof window !== 'undefined' ? (e) => { e.preventDefault(); window.print() } : undefined}>
              Print transcript
            </a>
          </button>
        </div>
      </div>

      <div className="bg-white shadow-lg max-w-3xl mx-auto p-12 print:shadow-none print:max-w-none">
        {/* Header */}
        <div className="border-b-2 border-gray-900 pb-6 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">SELEMOGO STUDENT INFORMATION SYSTEM</h1>
              <p className="text-xs text-gray-500 mt-1">Enrolment Management</p>
              <p className="text-xs text-gray-400 mt-1">Demo prototype · Not an official document</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Issue date</p>
              <p className="text-sm font-mono font-bold">{issueDate}</p>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold uppercase tracking-widest">Academic Transcript</h2>
        </div>

        {/* Student details */}
        <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Student name</p>
            <p className="font-semibold mt-1">
              {student.firstName} {student.lastName}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Student number</p>
            <p className="font-mono font-semibold mt-1">{student.studentNo}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
            <p className="mt-1">{student.email ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Enrolment date</p>
            <p className="mt-1">{student.createdAt.toLocaleDateString('en-GB')}</p>
          </div>
        </div>

        {/* Completed programmes */}
        <div className="mb-8">
          <h3 className="text-sm font-bold uppercase tracking-wide border-b border-gray-300 pb-2 mb-3">
            Completed programmes ({passedProgrammes.length + failedProgrammes.length})
          </h3>

          {passedProgrammes.length === 0 && failedProgrammes.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No completed programmes.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-semibold text-xs uppercase text-gray-500">
                    Programme
                  </th>
                  <th className="text-left py-2 font-semibold text-xs uppercase text-gray-500">
                    Cohort
                  </th>
                  <th className="text-right py-2 font-semibold text-xs uppercase text-gray-500">
                    Mark
                  </th>
                  <th className="text-right py-2 font-semibold text-xs uppercase text-gray-500">
                    Outcome
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...passedProgrammes, ...failedProgrammes].map(e => {
                  const r = e.results[0]
                  return (
                    <tr key={e.id} className="border-b border-gray-100">
                      <td className="py-2">
                        <span className="font-mono text-xs text-gray-500">[{e.programme.code}]</span>{' '}
                        {e.programme.title}
                      </td>
                      <td className="py-2 font-mono text-xs">{e.cohort.code}</td>
                      <td className="py-2 text-right font-mono">{r.mark ?? '—'}</td>
                      <td className="py-2 text-right">
                        <span
                          className={
                            r.outcome === 'PASS'
                              ? 'text-green-700 font-semibold'
                              : 'text-red-700 font-semibold'
                          }
                        >
                          {r.outcome}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pending */}
        {pendingProgrammes.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-bold uppercase tracking-wide border-b border-gray-300 pb-2 mb-3">
              Programmes in progress ({pendingProgrammes.length})
            </h3>
            <table className="w-full text-sm">
              <tbody>
                {pendingProgrammes.map(e => (
                  <tr key={e.id} className="border-b border-gray-100">
                    <td className="py-2">
                      <span className="font-mono text-xs text-gray-500">[{e.programme.code}]</span>{' '}
                      {e.programme.title}
                    </td>
                    <td className="py-2 font-mono text-xs">{e.cohort.code}</td>
                    <td className="py-2 text-right text-xs text-gray-500">Pending</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary */}
        <div className="border-t border-gray-300 pt-4 mb-12">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Programmes passed</p>
              <p className="font-bold text-lg mt-1">{passedProgrammes.length}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Programmes failed</p>
              <p className="font-bold text-lg mt-1">{failedProgrammes.length}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">In progress</p>
              <p className="font-bold text-lg mt-1">{pendingProgrammes.length}</p>
            </div>
          </div>
        </div>

        {/* Signature */}
        <div className="grid grid-cols-2 gap-12 mt-16">
          <div>
            <div className="border-t border-gray-400 pt-2">
              <p className="text-xs text-gray-500">Academic Registrar</p>
            </div>
          </div>
          <div>
            <div className="border-t border-gray-400 pt-2">
              <p className="text-xs text-gray-500">Date of Issue</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-400 text-center">
            This is a demo transcript generated by the Selemogo Student Information System.
            <br />
            Not an official academic document.
          </p>
        </div>
      </div>
    </main>
  )
}
