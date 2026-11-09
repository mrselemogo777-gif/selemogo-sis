import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Selemogo SIS',
  description: 'Selemogo Student Information System — prototype',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
