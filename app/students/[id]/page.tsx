import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/rbac'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const instant = false

export default async function StudentProfilePage({
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
          attendances: true,
        },
        orderBy: { enrolledAt: 'desc' },
      },
    },
  })

  if (!student) notFound()

  const totalEnrolments = student.enrolments.length
  const completedEnrolments = student.enrolments.filter(e => e.status === 'COMPLETED').length
  const passedEnrolments = student.enrolments.filter(
    e => e.results[0]?.outcome === 'PASS'
  ).length
  const failedEnrolments = student.enrolments.filter(
    e => e.results[0]?.outcome === 'FAIL'
  ).length

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">
              {student.firstName} {student.lastName}
            </h1>
            <p className="text-gray-500 mt-1 font-mono text-sm">{student.studentNo}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/students/${student.id}/transcript`}
              className="text-sm bg-black text-white px-3 py-2 rounded hover:bg-gray-800"
            >
              View Transcript
            </Link>
            <Link href="/students" className="text-sm text-gray-500 hover:text-gray-900">
              ← Students
            </Link>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white border rounded-lg p-4">
            <p className="text-xs text-gray-500">Enrolments</p>
            <p className="text-2xl font-bold mt-1">{totalEnrolments}</p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p className="text-xs text-gray-500">Completed</p>
            <p className="text-2xl font-bold mt-1">{completedEnrolments}</p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p className="text-xs text-gray-500">Passed</p>
            <p className="text-2xl font-bold mt-1 text-green-700">{passedEnrolments}</p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p className="text-xs text-gray-500">Failed</p>
            <p className="text-2xl font-bold mt-1 text-red-700">{failedEnrolments}</p>
          </div>
        </div>

        {/* Personal Details */}
        <div className="bg-white border rounded-lg p-6 mb-6">
          <h2 className="font-semibold mb-3">Personal Details</h2>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <dt className="text-gray-500">Email</dt>
            <dd>{student.email ?? '—'}</dd>
            <dt className="text-gray-500">Phone</dt>
            <dd>{student.phone ?? '—'}</dd>
            <dt className="text-gray-500">ID Number</dt>
            <dd className="font-mono">{student.idNumber ?? '—'}</dd>
            <dt className="text-gray-500">Date of Birth</dt>
            <dd>{student.dob ? student.dob.toLocaleDateString() : '—'}</dd>
            <dt className="text-gray-500">Enrolled on</dt>
            <dd>{student.createdAt.toLocaleDateString()}</dd>
          </dl>
        </div>

        {/* Enrolments Table */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="font-semibold mb-4">
            Enrolments ({totalEnrolments})
          </h2>

          {totalEnrolments === 0 ? (
            <p className="text-gray-500 text-sm">No enrolments yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="text-left p-2 font-semibold">Cohort</th>
                  <th className="text-left p-2 font-semibold">Programme</th>
                  <th className="text-left p-2 font-semibold">Status</th>
                  <th className="text-left p-2 font-semibold">Attendance</th>
                  <th className="text-left p-2 font-semibold">Result</th>
                </tr>
              </thead>
              <tbody>
                {student.enrolments.map(e => {
                  const present = e.attendances.filter(a => a.status === 'PRESENT').length
                  const totalAttendance = e.attendances.length
                  const result = e.results[0]
                  return (
                    <tr key={e.id} className="border-b">
                      <td className="p-2 font-mono text-xs">
                        <Link href={`/cohorts/${e.cohortId}`} className="text-blue-600 hover:underline">
                          {e.cohort.code}
                        </Link>
                      </td>
                      <td className="p-2 text-xs">
                        [{e.programme.code}] {e.programme.title}
                      </td>
                      <td className="p-2 text-xs">{e.status}</td>
                      <td className="p-2 text-xs">
                        {totalAttendance > 0 ? `${present}/${totalAttendance}` : '—'}
                      </td>
                      <td className="p-2 text-xs">
                        {result ? (
                          <span
                            className={
                              result.outcome === 'PASS'
                                ? 'text-green-700 font-semibold'
                                : 'text-red-700 font-semibold'
                            }
                          >
                            {result.outcome} ({result.mark})
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
          )}
        </div>
      </div>
    </main>
  )
}
