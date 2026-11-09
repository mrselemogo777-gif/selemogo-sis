import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/rbac'
import { createSession, enrolStudent } from '@/lib/actions/cohort'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const instant = false

export default async function CohortDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ enrolled?: string; error?: string }>
}) {
  await requirePermission('cohorts:read')
  const { id } = await params
  const query = await searchParams

  const cohort = await prisma.cohort.findUnique({
    where: { id },
    include: {
      programme: true,
      enrolments: {
        include: {
          student: true,
          attendances: true,
        },
        orderBy: { enrolledAt: 'asc' },
      },
      sessions: { orderBy: { date: 'desc' } },
    },
  })

  if (!cohort) notFound()

  const enrolledStudentIds = cohort.enrolments.map(e => e.studentId)
  const availableStudents = await prisma.student.findMany({
    where: { id: { notIn: enrolledStudentIds } },
    orderBy: { studentNo: 'asc' },
    take: 50,
  })

  const errorMessages: Record<string, string> = {
    missing: 'Please fill in all required fields.',
    date: 'Invalid date.',
    full: 'Cohort is at capacity.',
    duplicate: 'Student is already enrolled.',
  }
  const errorMessage = query.error ? errorMessages[query.error] : null

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold font-mono">{cohort.code}</h1>
            <p className="text-gray-500 mt-1">
              [{cohort.programme.code}] {cohort.programme.title}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {cohort.startDate.toLocaleDateString()} → {cohort.endDate.toLocaleDateString()} · Capacity: {cohort.enrolments.length}/{cohort.capacity}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/cohorts/${cohort.id}/results`}
              className="text-sm bg-black text-white px-3 py-2 rounded hover:bg-gray-800"
            >
              Capture Results
            </Link>
            <Link href="/cohorts" className="text-sm text-gray-500 hover:text-gray-900">
              ← Cohorts
            </Link>
          </div>
        </div>

        {query.enrolled && (
          <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded mb-4">
            Student enrolled successfully.
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded mb-4">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: Roster */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white border rounded-lg p-6">
              <h2 className="font-semibold mb-4">
                Enrolled Students ({cohort.enrolments.length})
              </h2>

              {cohort.enrolments.length === 0 ? (
                <p className="text-gray-500 text-sm">No students enrolled yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left p-2 font-semibold">Student No.</th>
                      <th className="text-left p-2 font-semibold">Name</th>
                      <th className="text-left p-2 font-semibold">Status</th>
                      <th className="text-left p-2 font-semibold">Attendance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cohort.enrolments.map(e => {
                      const present = e.attendances.filter(a => a.status === 'PRESENT').length
                      const total = e.attendances.length
                      return (
                        <tr key={e.id} className="border-b">
                          <td className="p-2 font-mono text-xs">{e.student.studentNo}</td>
                          <td className="p-2">
                            {e.student.firstName} {e.student.lastName}
                          </td>
                          <td className="p-2 text-xs">{e.status}</td>
                          <td className="p-2 text-xs">
                            {total > 0 ? `${present}/${total}` : '—'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>

            <div className="bg-white border rounded-lg p-6">
              <h2 className="font-semibold mb-4">
                Sessions ({cohort.sessions.length})
              </h2>

              {cohort.sessions.length === 0 ? (
                <p className="text-gray-500 text-sm">No sessions scheduled yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left p-2 font-semibold">Date</th>
                      <th className="text-left p-2 font-semibold">Topic</th>
                      <th className="text-left p-2 font-semibold"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cohort.sessions.map(s => (
                      <tr key={s.id} className="border-b">
                        <td className="p-2 text-xs">{s.date.toLocaleDateString()}</td>
                        <td className="p-2 text-xs">{s.topic ?? '—'}</td>
                        <td className="p-2">
                          <Link
                            href={`/cohorts/${cohort.id}/attendance/${s.id}`}
                            className="text-blue-600 hover:underline text-xs"
                          >
                            Mark attendance →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="space-y-6">
            <div className="bg-white border rounded-lg p-6">
              <h2 className="font-semibold mb-3">Enrol Student</h2>
              {availableStudents.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No available students. Convert an applicant first.
                </p>
              ) : (
                <form action={enrolStudent} className="space-y-3">
                  <input type="hidden" name="cohortId" value={cohort.id} />
                  <select name="studentId" required className="border p-2 w-full rounded text-sm">
                    <option value="">Select a student</option>
                    {availableStudents.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.studentNo} — {s.firstName} {s.lastName}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="bg-black text-white px-4 py-2 rounded text-sm w-full hover:bg-gray-800"
                  >
                    Enrol
                  </button>
                </form>
              )}
            </div>

            <div className="bg-white border rounded-lg p-6">
              <h2 className="font-semibold mb-3">Add Session</h2>
              <form action={createSession} className="space-y-3">
                <input type="hidden" name="cohortId" value={cohort.id} />
                <input
                  name="date"
                  type="date"
                  required
                  className="border p-2 w-full rounded text-sm"
                />
                <input
                  name="topic"
                  placeholder="Topic (optional)"
                  className="border p-2 w-full rounded text-sm"
                />
                <button
                  type="submit"
                  className="bg-black text-white px-4 py-2 rounded text-sm w-full hover:bg-gray-800"
                >
                  Add Session
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
