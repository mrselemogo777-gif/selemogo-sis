export const instant = false

import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function Home() {
  const [programmes, acca, students, applicants] = await Promise.all([
    prisma.programme.count(),
    prisma.programme.count({ where: { category: 'ACCA Qualifications' } }),
    prisma.student.count(),
    prisma.applicant.count(),
  ])

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border rounded-lg p-8">
          <h1 className="text-4xl font-bold mb-2">Selemogo Student Information System</h1>
          <p className="text-gray-500 mb-8">Student Records & Enrolment Management — Prototype</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="border rounded p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Programmes</p>
              <p className="text-3xl font-bold mt-1">{programmes}</p>
            </div>
            <div className="border rounded p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide">ACCA</p>
              <p className="text-3xl font-bold mt-1">{acca}</p>
            </div>
            <div className="border rounded p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Students</p>
              <p className="text-3xl font-bold mt-1">{students}</p>
            </div>
            <div className="border rounded p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Applicants</p>
              <p className="text-3xl font-bold mt-1">{applicants}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Link href="/login" className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800">
              Sign in →
            </Link>
            <Link href="/programmes" className="border px-6 py-2 rounded hover:bg-gray-100">
              Browse programmes
            </Link>
          </div>

          <p className="text-xs text-gray-400 mt-8">
            Selemogo Student Information System — independent prototype. Uses Granjo's public course catalogue as demo data. Not affiliated with Granjo.
          </p>
        </div>
      </div>
    </main>
  )
}
