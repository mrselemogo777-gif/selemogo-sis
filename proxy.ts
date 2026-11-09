import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/lib/session'

export async function proxy(request: NextRequest) {
  const cookie = request.cookies.get('session')?.value
  const session = await decrypt(cookie)

  if (!session) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/students/:path*',
    '/applicants/:path*',
    '/programmes/:path*',
    '/cohorts/:path*',
    '/enrolments/:path*',
  ],
}
