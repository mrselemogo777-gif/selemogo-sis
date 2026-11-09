import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const ACCA_LADDER = [
  { code: 'ACCA-L4', title: 'ACCA Diploma in Financial and Management Accounting (Level 4)', ncqfLevel: 4, prereq: null as string | null },
  { code: 'ACCA-L5', title: 'ACCA Diploma in Financial and Management Accounting (Level 5)', ncqfLevel: 5, prereq: 'ACCA-L4' },
  { code: 'ACCA-L6', title: 'ACCA Diploma in Accounting and Business (Level 6)', ncqfLevel: 6, prereq: 'ACCA-L5' },
  { code: 'ACCA-L8', title: 'ACCA Advanced Diploma in Accounting and Business (Level 8)', ncqfLevel: 8, prereq: 'ACCA-L6' },
  { code: 'ACCA-L9', title: 'ACCA Strategic Professional (Level 9)', ncqfLevel: 9, prereq: 'ACCA-L8' },
]

const TRADES = [
  'Roofing, Scaffolding & Cladding',
  'Professional Plumbing & Pipe Fitting',
  'Power, Solar Systems, Pumps & Generators',
  'Interior Design, Decoration & Renovation',
  'Mechatronics, Robotics & AI',
  'Instrumentation, Automation, PLC & SCADA',
  'Fashion Design, Sewing & Dressmaking',
  'Electrical Installation & Electronics',
  'Paving, Tiling & Landscaping',
  'Cellphones, Computers & Printers',
  'CCTV, Alarms & Access Control',
  'Carpentry, Joinery & Furniture',
  'Bricklaying, Plastering & Painting',
  'Boilermaking, Welding & Fabrication',
  'Automotive Mechanics',
  'Automotive Electronics',
  'Architectural Draughting & Engineering Drawings',
  'Air Conditioning & Refrigeration',
]

const PROFESSIONAL = [
  'Management & Leadership Development',
  'Corporate Governance',
  'Public Crisis, Disaster & Emergency Management',
  'Fraud Forensics, Money Laundering & Digital Security',
  'Customer Service & Sales Excellence',
  'Procurement & Tender Process Management',
  'Emotional Intelligence & Stress Management',
  'Occupational Health & Safety',
  'Accounting & Finance for Non-Financial Personnel',
  'Supervisory & Team Management',
  'Certified Rigger & Signaller',
  'First Aid & Fire Marshal',
  'Facility & Housekeeping Management',
  'Taxation, Computations & Filings',
  'Insurance & Risk Management',
  'Education & Training Development (Train the Trainer)',
  'Certified Data Protection Officer',
  'Certificate of Proficiency (COP): Long Term Insurance',
  'Certificate of Proficiency (COP): Short Term Insurance',
  'Financial Planning & Wealth Management',
  'Computerised Management Systems',
  'Facility Engineering',
  'Welding: Plastic',
  'Welding: Coded (Certified)',
  'Welding: ARC',
  'Welding: Gas',
  'Prospecting, Sales and Follow Up Skills',
  'Mentoring, Coaching and Talent Development',
  'Financial Reporting Act, Codes and Standards',
  'Certified Fire and Explosion Investigator',
  'Asset Management, Incident & Root Cause Analysis',
  'IFRS 9, IFRS 17 and Solvency',
  'Credit Control & Debt Collection',
  'Training of Trainers',
  'Assessors',
  'Moderators',
  'Facilitators',
  'Entrepreneurship & Financial Management',
  'Financial Statements, Reporting & Accounting Softwares',
  'Digital Marketing, Content Creation & Social Media',
  'Team Building & Effectiveness',
  'Vocational Training',
  'Events Management',
  'Ethics & Professional Skills (EPSM)',
  'International Accounting & Financial Reporting Standards (IFRS & IAS)',
  'Financial Accounting',
  'Management Accounting',
  'Business & Technology',
  'Fluids, Hydraulics & Pneumatics',
  'Cybersecurity, Networking & Ethical Hacking',
  'Web Development, Graphic Design & Photography',
]

async function main() {
  console.log('🌱 Seeding database...')

  const existing = await prisma.programme.count()
  if (existing > 0) {
    console.log(`⚠️  ${existing} programmes already exist — skipping programme seed`)
  } else {
    // 1. ACCA ladder with prerequisite chain
    const accaIds: Record<string, string> = {}
    for (const level of ACCA_LADDER) {
      const prog = await prisma.programme.create({
        data: {
          code: level.code,
          title: level.title,
          category: 'ACCA Qualifications',
          ncqfLevel: level.ncqfLevel,
          durationLabel: '3 Months',
          prerequisiteId: level.prereq ? accaIds[level.prereq] : null,
        },
      })
      accaIds[level.code] = prog.id
    }
    console.log(`  ✅ ${ACCA_LADDER.length} ACCA qualifications (prerequisite chain wired)`)

    // 2. Trades
    let tradeIdx = 1
    for (const title of TRADES) {
      await prisma.programme.create({
        data: {
          code: `TRD-${String(tradeIdx).padStart(3, '0')}`,
          title,
          category: 'Trades & Technical',
          durationLabel: '3 Months',
        },
      })
      tradeIdx++
    }
    console.log(`  ✅ ${TRADES.length} trades & technical programmes`)

    // 3. Professional
    let profIdx = 1
    for (const title of PROFESSIONAL) {
      await prisma.programme.create({
        data: {
          code: `PRO-${String(profIdx).padStart(3, '0')}`,
          title,
          category: 'Professional Certificates',
          durationLabel: '3 Months',
        },
      })
      profIdx++
    }
    console.log(`  ✅ ${PROFESSIONAL.length} professional certificates`)
  }

  // 4. Admin user
  const adminExists = await prisma.user.findUnique({ where: { email: 'admin@granjo.demo' } })
  if (!adminExists) {
    await prisma.user.create({
      data: {
        email: 'admin@granjo.demo',
        name: 'System Admin',
        passwordHash: await bcrypt.hash('Admin123!', 10),
        role: 'ADMIN',
      },
    })
    console.log('  ✅ Admin user created: admin@granjo.demo / Admin123!')
  } else {
    console.log('  ⚠️  Admin user already exists')
  }

  const total = await prisma.programme.count()
  console.log(`\n🎉 Seed complete — ${total} programmes in the database`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
