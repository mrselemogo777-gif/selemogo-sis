import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/rbac'
import { createCohort } from '@/lib/actions/cohort'
import Link from 'next/link'

export const instant = false

export default async function NewCohortPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  await requirePermission('cohorts:write')
  const params = await searchParams

  const programmes = await prisma.programme.findMany({
    orderBy: [{ category: 'asc' }, { title: 'asc' }],
    select: { id: true, code: true, title: true, category: true },
  })

  const errorMessages: Record<string, string> = {
    missing: 'Please fill in all required fields.',
    date: 'Invalid date format.',
    range: 'End date must be after start date.',
    duplicate: 'A cohort with that code already exists.',
  }
  const errorMessage = params.error ? errorMessages[params.error] : null

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">New Cohort</h1>
          <Link href="/cohorts" className="text-sm text-gray-500 hover:text-gray-900">
            ← Cohorts
          </Link>
        </div>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded mb-4">
            {errorMessage}
          </div>
        )}

        <form action={createCohort} className="bg-white border rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Programme *</label>
            <select name="programmeId" required className="border p-2 w-full rounded">
              <option value="">Select a programme</option>
              {programmes.map(p => (
                <option key={p.id} value={p.id}>
                  [{p.code}] {p.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Cohort code *</label>
            <input
              name="code"
              required
              placeholder="e.g. ACCA-L4-2026-01"
              className="border p-2 w-full rounded font-mono"
            />
            <p className="text-xs text-gray-500 mt-1">
              Unique identifier. Use format: PROGRAMME-YEAR-NN
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start date *</label>
              <input name="startDate" type="date" required className="border p-2 w-full rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End date *</label>
              <input name="endDate" type="date" required className="border p-2 w-full rounded" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Capacity</label>
            <input
              name="capacity"
              type="number"
              defaultValue="30"
              min="1"
              className="border p-2 w-full rounded"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
            >
              Create Cohort
            </button>
            <Link
              href="/cohorts"
              className="px-6 py-2 rounded border hover:bg-gray-50"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </main>
  )
}
