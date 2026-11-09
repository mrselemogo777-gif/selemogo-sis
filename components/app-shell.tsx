import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { Sidebar } from './sidebar'

type AppShellProps = {
  children: React.ReactNode
}

export async function AppShell({ children }: AppShellProps) {
  const session = await getSession()
  if (!session) redirect('/login')

  return (
    <div className="min-h-screen relative">
      {/* Full background image — same as login, no fade */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/vtc.png')", zIndex: 0 }}
        aria-hidden="true"
      />

      {/* White overlay — semi-transparent so image shows through but text stays readable */}
      <div
        className="fixed inset-0 bg-white/70"
        style={{ zIndex: 1 }}
        aria-hidden="true"
      />

      {/* Content layer — sits above both */}
      <div className="relative" style={{ zIndex: 2 }}>
        <Sidebar role={session.role} userName={session.name} />
        <div className="ml-60 min-h-screen">
          {children}
        </div>
      </div>
    </div>
  )
}
