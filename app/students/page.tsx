import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/rbac'
import Link from 'next/link'

export const instant = false

export default async function StudentsPage() {
  await requirePermission('students:read')

  const students = await prisma.student.findMany({
    orderBy: { studentNo: 'asc' },
    take: 100,
    include: { _count: { select: { enrolments: true } } },
  })

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Students</h1>
            <p className="text-gray-500 mt-1">{students.length} total</p>
          </div>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900">
            ← Dashboard
          </Link>
        </div>

        {students.length === 0 ? (
          <div className="bg-white border rounded-lg p-12 text-center">
            <p className="text-gray-500">No students yet.</p>
            <p className="text-gray-400 text-sm mt-1">
              Convert an applicant to create the first student record.
            </p>
            <Link
              href="/applicants"
              className="inline-block mt-4 text-blue-600 hover:underline text-sm"
            >
              Go to Applicants →
            </Link>
          </div>
        ) : (
          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="text-left p-3 font-semibold">Student No.</th>
                  <th className="text-left p-3 font-semibold">Name</th>
                  <th className="text-left p-3 font-semibold">Email</th>
                  <th className="text-left p-3 font-semibold">Phone</th>
                  <th className="text-left p-3 font-semibold">Enrolments</th>
                  <th className="text-left p-3 font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-mono text-xs">{s.studentNo}</td>
                    <td className="p-3">
                      {s.firstName} {s.lastName}
                    </td>
                    <td className="p-3 text-xs">{s.email ?? '—'}</td>
                    <td className="p-3 text-xs">{s.phone ?? '—'}</td>
                    <td className="p-3 text-xs">{s._count.enrolments}</td>
                    <td className="p-3">
                      <span className="text-gray-400 text-xs">detail page next phase</span>
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
