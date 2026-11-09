'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '◧' },
  { href: '/applicants', label: 'Applicants', icon: '◉' },
  { href: '/students', label: 'Students', icon: '◈' },
  { href: '/cohorts', label: 'Cohorts', icon: '▣' },
  { href: '/programmes', label: 'Programmes', icon: '▤' },
  { href: '/audit', label: 'Audit Log', icon: '◐' },
]

type SidebarProps = {
  role: string
  userName: string
}

export function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-60 min-h-screen bg-[var(--color-primary)] text-white flex flex-col fixed left-0 top-0 bottom-0">
      {/* Brand */}
      <div className="px-5 py-6 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center text-sm font-bold">
            G
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight">SIS</p>
            <p className="text-[10px] text-white/50 uppercase tracking-wider">Student Records</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(item => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors ${
                isActive
                  ? 'bg-white/15 text-white font-medium'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="text-xs opacity-70">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="px-5 py-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-xs font-semibold">
            {userName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{userName}</p>
            <p className="text-[10px] text-white/50 uppercase tracking-wider">{role}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
