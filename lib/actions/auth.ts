'use server'

import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { createSession, deleteSession } from '@/lib/session'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    redirect('/login?error=missing')
  }

  const user = await prisma.user.findUnique({ where: { email } })

  if (!user || !user.passwordHash) {
    redirect('/login?error=invalid')
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    redirect('/login?error=invalid')
  }

  await createSession({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })

  redirect('/dashboard')
}

export async function logout() {
  await deleteSession()
  redirect('/login')
}
