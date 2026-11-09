import { prisma } from '@/lib/prisma'

export async function generateStudentNumber(): Promise<string> {
  const year = new Date().getFullYear()

  // Use a database-level counter to avoid race conditions
  const result = await prisma.$queryRaw<{ nextval: bigint }[]>`
    SELECT nextval('student_number_seq') as nextval
  `

  const seq = Number(result[0].nextval)
  const padded = String(seq).padStart(4, '0')
  return `GRJ-${year}-${padded}`
}
