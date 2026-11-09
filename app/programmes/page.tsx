import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function ProgrammesPage() {
  const programmes = await prisma.programme.findMany({
    orderBy: [{ category: 'asc' }, { code: 'asc' }],
    include: { prerequisite: true },
  })

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Programmes ({programmes.length})</h1>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900">← Dashboard</Link>
        </div>
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="text-left p-3 font-semibold">Code</th>
                <th className="text-left p-3 font-semibold">Title</th>
                <th className="text-left p-3 font-semibold">Category</th>
                <th className="text-left p-3 font-semibold">Level</th>
                <th className="text-left p-3 font-semibold">Duration</th>
                <th className="text-left p-3 font-semibold">Prerequisite</th>
              </tr>
            </thead>
            <tbody>
              {programmes.map(p => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-mono text-xs">{p.code}</td>
                  <td className="p-3">{p.title}</td>
                  <td className="p-3 text-xs">{p.category}</td>
                  <td className="p-3">{p.ncqfLevel ?? '—'}</td>
                  <td className="p-3 text-xs">{p.durationLabel}</td>
                  <td className="p-3 text-xs text-gray-600">
                    {p.prerequisite ? p.prerequisite.code : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
