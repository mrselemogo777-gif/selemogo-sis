import { login } from '@/lib/actions/auth'

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
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <form action={login} className="bg-white border rounded-lg p-8 w-96 space-y-4 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold">Granjo SIS</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to continue</p>
        </div>

        {errorMessage && (
          <p className="text-red-600 text-sm bg-red-50 p-2 rounded">{errorMessage}</p>
        )}

        <input
          type="email"
          name="email"
          defaultValue="admin@granjo.demo"
          className="border p-2 w-full rounded"
          placeholder="Email"
          required
        />
        <input
          type="password"
          name="password"
          defaultValue="Admin123!"
          className="border p-2 w-full rounded"
          placeholder="Password"
          required
        />
        <button
          type="submit"
          className="bg-black text-white p-2 w-full rounded hover:bg-gray-800"
        >
          Sign In
        </button>
        <p className="text-xs text-gray-400 text-center">
          Demo: admin@granjo.demo / Admin123!
        </p>
      </form>
    </main>
  )
}
