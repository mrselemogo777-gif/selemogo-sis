import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/rbac'
import Link from 'next/link'

export const instant = false

const statusColors: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-800',
  SCREENING: 'bg-yellow-100 text-yellow-800',
  OFFERED: 'bg-purple-100 text-purple-800',
  ACCEPTED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  CONVERTED: 'bg-gray-100 text-gray-800',
}

export default async function ApplicantsPage() {
  await requirePermission('applicants:read')

  const applicants = await prisma.applicant.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Applicants</h1>
            <p className="text-gray-500 mt-1">{applicants.length} total</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/apply"
              className="text-sm bg-black text-white px-3 py-2 rounded hover:bg-gray-800"
            >
              Public form
            </Link>
            <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900">
              ← Dashboard
            </Link>
          </div>
        </div>

        {applicants.length === 0 ? (
          <div className="bg-white border rounded-lg p-12 text-center">
            <p className="text-gray-500">No applicants yet.</p>
            <p className="text-gray-400 text-sm mt-1">
              Applications submitted through the public form will appear here.
            </p>
          </div>
        ) : (
          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="text-left p-3 font-semibold">Name</th>
                  <th className="text-left p-3 font-semibold">Email</th>
                  <th className="text-left p-3 font-semibold">Phone</th>
                  <th className="text-left p-3 font-semibold">Status</th>
                  <th className="text-left p-3 font-semibold">Applied</th>
                  <th className="text-left p-3 font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {applicants.map(a => (
                  <tr key={a.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      {a.firstName} {a.lastName}
                    </td>
                    <td className="p-3 text-xs">{a.email}</td>
                    <td className="p-3 text-xs">{a.phone ?? '—'}</td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-1 rounded ${statusColors[a.status]}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-gray-500">
                      {a.createdAt.toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <Link
                        href={`/applicants/${a.id}`}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        View →
                      </Link>
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
