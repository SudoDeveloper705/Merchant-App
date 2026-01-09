import React from 'react'
import './globals.css'
import { ClientAuthProvider } from '@/components/ClientAuthProvider'

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
    <html lang="en">
      <body className="antialiased">
        <ClientAuthProvider>{children}</ClientAuthProvider>
      </body>
    </html>
  )
}
