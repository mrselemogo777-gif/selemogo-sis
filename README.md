# Selemogo Student Information System (SIS)

A prototype Student Information System (SIS) built to demonstrate the operational workflows described in Granjo's Graduate Internship JD.

**Live demo:** [deployed URL coming]

## What it does

- **Applicant intake** — public application form (no login required)
- **Student lifecycle** — convert applicant to student with sequential ID (GRJ-YYYY-NNNN)
- **Cohort management** — schedule cohorts with programme linkage
- **Attendance tracking** — bulk mark Present/Absent/Late/Excused per session
- **Results capture** — grades with automatic pass/fail derivation and moderator flag
- **Transcripts** — printable student transcript with letterhead
- **Audit trail** — every mutation is logged (BQA compliance ready)
- **RBAC** — role-based access (ADMIN/REGISTRAR/TRAINER/STUDENT)

## Tech stack

- Next.js 16 (App Router, TypeScript)
- PostgreSQL (Neon serverless)
- Prisma ORM
- JWT sessions via jose and bcryptjs
- Tailwind CSS v4

## About the data

The 74 programmes in the seed data are from Granjo's public course catalogue. They are used here as demo data only.

## Disclaimer

This is an independent prototype built for a portfolio/application context. Not affiliated with, endorsed by, or an official product of Granjo. The Granjo name and course catalogue are referenced as public information.

## Local setup

```bash
cp .env.example .env.local
# Fill in DATABASE_URL and NEXTAUTH_SECRET
npx prisma db push
npx tsx prisma/seed.ts
npm run dev
```
