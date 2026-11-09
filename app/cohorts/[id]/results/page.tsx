import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/rbac'
import { captureResults } from '@/lib/actions/result'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const instant = false

const PASS_MARK = 50

export default async function ResultsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ saved?: string; error?: string }>
}) {
  await requirePermission('results:read')
  const { id: cohortId } = await params
  const query = await searchParams

  const cohort = await prisma.cohort.findUnique({
    where: { id: cohortId },
    include: {
      programme: true,
      enrolments: {
        include: {
          student: true,
          results: true,
        },
        orderBy: { student: { studentNo: 'asc' } },
      },
    },
  })

  if (!cohort) notFound()

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Capture Results</h1>
            <p className="text-gray-500 mt-1">
              <span className="font-mono text-xs">{cohort.code}</span>
              {' · '}
              {cohort.programme.title}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Pass mark: {PASS_MARK}%
            </p>
          </div>
          <Link href={`/cohorts/${cohortId}`} className="text-sm text-gray-500 hover:text-gray-900">
            ← Cohort
          </Link>
        </div>

        {query.saved && (
          <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded mb-4">
            Results saved. Enrolments marked as COMPLETED.
          </div>
        )}

        {query.error === 'empty' && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded mb-4">
            No marks entered. Enter at least one mark before saving.
          </div>
        )}

        {cohort.enrolments.length === 0 ? (
          <div className="bg-white border rounded-lg p-12 text-center">
            <p className="text-gray-500">No students enrolled in this cohort.</p>
            <Link
              href={`/cohorts/${cohortId}`}
              className="inline-block mt-4 text-blue-600 hover:underline text-sm"
            >
              Enrol students first →
            </Link>
          </div>
        ) : (
          <form action={captureResults}>
            <input type="hidden" name="cohortId" value={cohortId} />

            <div className="bg-white border rounded-lg overflow-hidden mb-4">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="text-left p-3 font-semibold">Student No.</th>
                    <th className="text-left p-3 font-semibold">Name</th>
                    <th className="text-left p-3 font-semibold">Mark (0–100)</th>
                    <th className="text-left p-3 font-semibold">Moderated</th>
                    <th className="text-left p-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {cohort.enrolments.map(e => {
                    const existing = e.results[0]
                    return (
                      <tr key={e.id} className="border-b">
                        <td className="p-3 font-mono text-xs">{e.student.studentNo}</td>
                        <td className="p-3">
                          {e.student.firstName} {e.student.lastName}
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            name={`mark_${e.id}`}
                            min="0"
                            max="100"
                            defaultValue={existing?.mark ?? ''}
                            placeholder="—"
                            className="border p-2 w-24 rounded text-sm"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="checkbox"
                            name={`moderated_${e.id}`}
                            defaultChecked={existing?.moderated ?? false}
                            className="accent-black"
                          />
                        </td>
                        <td className="p-3 text-xs">
                          {existing ? (
                            <span
                              className={
                                existing.outcome === 'PASS'
                                  ? 'text-green-700 font-semibold'
                                  : 'text-red-700 font-semibold'
                              }
                            >
                              {existing.outcome} ({existing.mark})
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
              >
                Save Results
              </button>
              <Link
                href={`/cohorts/${cohortId}`}
                className="px-6 py-2 rounded border hover:bg-gray-50"
              >
                Cancel
              </Link>
            </div>
          </form>
        )}
      </div>
    </main>
  )
}
