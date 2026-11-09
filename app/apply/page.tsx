import { prisma } from '@/lib/prisma'
import { createApplicant } from '@/lib/actions/applicant'

export const instant = false

export default async function ApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>
}) {
  const params = await searchParams
  const programmes = await prisma.programme.findMany({
    orderBy: [{ category: 'asc' }, { title: 'asc' }],
    select: { id: true, title: true, category: true, code: true },
  })

  const errorMessage =
    params.error === 'missing'
      ? 'Please fill in all required fields.'
      : params.error === 'duplicate'
        ? 'You already have an application on file. Please contact the front desk.'
        : null

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white border rounded-lg p-8">
          <h1 className="text-3xl font-bold">Apply to Selemogo SIS</h1>
          <p className="text-gray-500 mt-2 mb-6">
            Complete this form to start your application. Our front desk will contact you.
          </p>

          {params.success && (
            <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded mb-4">
              <strong>Application received.</strong> Our team will be in touch within 2 working days.
            </div>
          )}

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded mb-4">
              {errorMessage}
            </div>
          )}

          <form action={createApplicant} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First name *</label>
                <input name="firstName" required className="border p-2 w-full rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last name *</label>
                <input name="lastName" required className="border p-2 w-full rounded" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <input name="email" type="email" required className="border p-2 w-full rounded" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input name="phone" className="border p-2 w-full rounded" placeholder="+267..." />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Programme of interest</label>
              <select name="programmeId" className="border p-2 w-full rounded">
                <option value="">Select a programme (optional)</option>
                {programmes.map(p => (
                  <option key={p.id} value={p.id}>
                    [{p.category}] {p.title}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 w-full"
            >
              Submit Application
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
