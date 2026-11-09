import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/rbac'
import { convertApplicantToStudent } from '@/lib/actions/applicant'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const instant = false

export default async function ApplicantDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ converted?: string; password?: string }>
}) {
  await requirePermission('applicants:read')
  const { id } = await params
  const query = await searchParams

  const applicant = await prisma.applicant.findUnique({ where: { id } })
  if (!applicant) notFound()

  const programme = applicant.programmeId
    ? await prisma.programme.findUnique({ where: { id: applicant.programmeId } })
    : null

  const convertedStudent = applicant.convertedStudentId
    ? await prisma.student.findUnique({ where: { id: applicant.convertedStudentId } })
    : null

  async function handleConvert() {
    'use server'
    await convertApplicantToStudent(id)
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">
            {applicant.firstName} {applicant.lastName}
          </h1>
          <Link href="/applicants" className="text-sm text-gray-500 hover:text-gray-900">
            ← Applicants
          </Link>
        </div>

        {query.converted && convertedStudent && (
          <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded mb-6">
            <strong>Converted successfully.</strong>
            <p className="mt-2 text-sm">
              Student number:{' '}
              <span className="font-mono font-bold">{convertedStudent.studentNo}</span>
            </p>
            {query.password && (
              <p className="mt-1 text-sm">
                Temporary password:{' '}
                <span className="font-mono font-bold">{query.password}</span>
                <br />
                <span className="text-xs">
                  Share this with the student — they should change it on first login.
                </span>
              </p>
            )}
          </div>
        )}

        <div className="bg-white border rounded-lg p-6 mb-6">
          <h2 className="font-semibold mb-3">Applicant details</h2>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <dt className="text-gray-500">Email</dt>
            <dd>{applicant.email}</dd>
            <dt className="text-gray-500">Phone</dt>
            <dd>{applicant.phone ?? '—'}</dd>
            <dt className="text-gray-500">Status</dt>
            <dd className="font-mono">{applicant.status}</dd>
            <dt className="text-gray-500">Programme interest</dt>
            <dd>{programme ? `[${programme.code}] ${programme.title}` : 'Not specified'}</dd>
            <dt className="text-gray-500">Applied on</dt>
            <dd>{applicant.createdAt.toLocaleString()}</dd>
          </dl>
        </div>

        {applicant.status !== 'CONVERTED' && (
          <div className="bg-white border rounded-lg p-6">
            <h2 className="font-semibold mb-3">Convert to Student</h2>
            <p className="text-sm text-gray-600 mb-4">
              This will create a student account, generate a sequential student number, and issue
              a temporary password. All actions are logged.
            </p>
            <form action={handleConvert}>
              <button
                type="submit"
                className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
              >
                Convert to Student
              </button>
            </form>
          </div>
        )}

        {convertedStudent && (
          <div className="bg-white border rounded-lg p-6">
            <h2 className="font-semibold mb-3">Student record</h2>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <dt className="text-gray-500">Student number</dt>
              <dd className="font-mono font-bold">{convertedStudent.studentNo}</dd>
              <dt className="text-gray-500">Linked student</dt>
              <dd>
                <Link
                  href={`/students/${convertedStudent.id}`}
                  className="text-blue-600 hover:underline"
                >
                  View profile →
                </Link>
              </dd>
            </dl>
          </div>
        )}
      </div>
    </main>
  )
}
