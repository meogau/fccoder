import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FC Coder - Where Code Meets Football',
  description: 'Official website of FC Coder - A football team of programmers',
  keywords: ['football', 'soccer', 'programming', 'developers', 'team'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ProtectedRoute>
            <div className="min-h-screen bg-cyber-dark">
              {children}
            </div>
          </ProtectedRoute>
        </AuthProvider>
      </body>
    </html>
  )
}