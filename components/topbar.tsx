import { getSession } from '@/lib/session'
import { logout } from '@/lib/actions/auth'

type TopbarProps = {
  title: string
  subtitle?: string
}

export async function Topbar({ title, subtitle }: TopbarProps) {
  const session = await getSession()

  return (
    <header className="bg-white border-b border-[var(--color-border)] px-8 py-4 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h1 className="text-xl font-bold text-[var(--color-text-primary)]">{title}</h1>
        {subtitle && (
          <p className="text-sm font-medium text-[var(--color-text-secondary)] mt-0.5">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-4">
        <form action={logout}>
          <button
            type="submit"
            className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  )
}
