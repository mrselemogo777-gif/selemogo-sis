import type { Metadata } from 'next'

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
      <head>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
