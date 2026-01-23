import React from 'react'
import './globals.css'
import { ClientAuthProvider } from '@/components/ClientAuthProvider'
import { ThemeProvider } from '@/contexts/ThemeContext'

export const metadata = {
  title: 'Merchant App',
  description: 'Financial SaaS Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          <ClientAuthProvider>{children}</ClientAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
