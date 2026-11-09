import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/rbac'
import { markAttendance } from '@/lib/actions/attendance'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const instant = false

const statusOptions = [
  { value: 'PRESENT', label: 'Present', color: 'text-green-700' },
  { value: 'ABSENT', label: 'Absent', color: 'text-red-700' },
  { value: 'LATE', label: 'Late', color: 'text-yellow-700' },
  { value: 'EXCUSED', label: 'Excused', color: 'text-blue-700' },
]

export default async function AttendancePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; sessionId: string }>
  searchParams: Promise<{ saved?: string; error?: string }>
}) {
  await requirePermission('attendance:read')
  const { id: cohortId, sessionId } = await params
  const query = await searchParams

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      cohort: {
        include: {
          programme: true,
          enrolments: {
            include: {
              student: true,
              attendances: { where: { sessionId } },
            },
            orderBy: { enrolledAt: 'asc' },
          },
        },
      },
    },
  })

  if (!session || session.cohortId !== cohortId) notFound()

  const enrolmentCount = session.cohort.enrolments.length

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Mark Attendance</h1>
            <p className="text-gray-500 mt-1">
              <span className="font-mono text-xs">{session.cohort.code}</span>
              {' · '}
              {session.date.toLocaleDateString()}
              {session.topic ? ` · ${session.topic}` : ''}
            </p>
          </div>
          <Link href={`/cohorts/${cohortId}`} className="text-sm text-gray-500 hover:text-gray-900">
            ← Cohort
          </Link>
        </div>

        {query.saved && (
          <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded mb-4">
            Attendance saved successfully.
          </div>
        )}

        {query.error === 'empty' && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded mb-4">
            No status selected. Choose at least one student before saving.
          </div>
        )}

        {enrolmentCount === 0 ? (
          <div className="bg-white border rounded-lg p-12 text-center">
            <p className="text-gray-500">No students enrolled in this cohort.</p>
            <Link href={`/cohorts/${cohortId}`} className="inline-block mt-4 text-blue-600 hover:underline text-sm">
              Go to cohort to enrol students →
            </Link>
          </div>
        ) : (
          <form action={markAttendance}>
            <input type="hidden" name="sessionId" value={sessionId} />

            <div className="bg-white border rounded-lg overflow-hidden mb-4">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="text-left p-3 font-semibold">Student No.</th>
                    <th className="text-left p-3 font-semibold">Name</th>
                    <th className="text-left p-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {session.cohort.enrolments.map(e => {
                    const existing = e.attendances[0]?.status ?? 'PRESENT'
                    return (
                      <tr key={e.id} className="border-b">
                        <td className="p-3 font-mono text-xs">{e.student.studentNo}</td>
                        <td className="p-3">
                          {e.student.firstName} {e.student.lastName}
                        </td>
                        <td className="p-3">
                          <div className="flex gap-3">
                            {statusOptions.map(opt => (
                              <label key={opt.value} className="flex items-center gap-1 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`status_${e.id}`}
                                  value={opt.value}
                                  defaultChecked={existing === opt.value}
                                  className="accent-black"
                                />
                                <span className={`text-xs ${opt.color}`}>{opt.label}</span>
                              </label>
                            ))}
                          </div>
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
                Save Attendance
              </button>
              <Link href={`/cohorts/${cohortId}`} className="px-6 py-2 rounded border hover:bg-gray-50">
                Cancel
              </Link>
            </div>
          </form>
        )}
      </div>
    </main>
  )
}
