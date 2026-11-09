import { login } from '@/lib/actions/auth'
import Link from 'next/link'

export const instant = false

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const errorMessage =
    params.error === 'invalid'
      ? 'Invalid email or password'
      : params.error === 'missing'
        ? 'Email and password are required'
        : null

  return (
    <main
      className="min-h-screen flex items-center justify-center relative bg-cover bg-center"
      style={{ backgroundImage: "url('/vtc.png')" }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Login card */}
      <form
        action={login}
        className="relative z-10 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg p-8 w-96 space-y-4 shadow-2xl"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SIS</h1>
          <p className="text-sm text-gray-500 mt-1">Selemogo Student Information System</p>
        </div>

        {errorMessage && (
          <p className="text-red-600 text-sm bg-red-50 p-2 rounded border border-red-200">
            {errorMessage}
          </p>
        )}

        <input
          type="email"
          name="email"
          defaultValue="admin@ses.demo"
          className="border border-gray-300 p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          placeholder="Email"
          required
        />
        <input
          type="password"
          name="password"
          defaultValue="password123"
          className="border border-gray-300 p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          placeholder="Password"
          required
        />
        <button
          type="submit"
          className="bg-[var(--color-primary)] text-white p-2 w-full rounded hover:bg-[var(--color-primary-hover)] transition-colors"
        >
          Sign In
        </button>
        <p className="text-xs text-gray-400 text-center">
          Login: admin@ses.demo · Password: password123
        </p>
      </form>
    </main>
  )
}
