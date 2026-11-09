import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const instant = false

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [programmes, students, applicants, cohorts, enrolments] = await Promise.all([
    prisma.programme.count(),
    prisma.student.count(),
    prisma.applicant.count(),
    prisma.cohort.count(),
    prisma.enrolment.count(),
  ])

  const byCategory = await prisma.programme.groupBy({
    by: ['category'],
    _count: { _all: true },
  })

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-500 mt-1">
              Welcome, {session.name} · Role: <span className="font-mono">{session.role}</span>
            </p>
          </div>
          <form action={async () => {
            'use server'
            const { logout } = await import('@/lib/actions/auth')
            await logout()
          }}>
            <button type="submit" className="text-sm text-gray-500 hover:text-gray-900">
              Sign out
            </button>
          </form>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Programmes', value: programmes, href: '/programmes' },
            { label: 'Students', value: students, href: '/students' },
            { label: 'Applicants', value: applicants, href: '/applicants' },
            { label: 'Cohorts', value: cohorts, href: '/cohorts' },
            { label: 'Enrolments', value: enrolments, href: '/enrolments' },
          ].map(item => (
            <Link
              key={item.label}
              href={item.href}
              className="bg-white border rounded-lg p-6 hover:shadow-md transition"
            >
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className="text-3xl font-bold mt-2">{item.value}</p>
            </Link>
          ))}
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Programmes by Category</h2>
          <div className="space-y-3">
            {byCategory.map(cat => (
              <div key={cat.category} className="flex items-center justify-between">
                <span className="text-sm">{cat.category}</span>
                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{cat._count._all}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
