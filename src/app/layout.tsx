import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Matchup Analyzer',
  description: 'Generate most likely outcomes for baseball matchups',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}