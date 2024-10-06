import '@/app/globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from './providers'
import { ThemeToggle } from '@/components/theme-toggler'
import { AuthProvider } from '@/hooks/useAuth'
import { AuthButton } from '@/components/auth-button'
import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LayoutDashboard } from 'lucide-react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Bitpulse - Crypto Data Hub',
  description: 'Crypto data hub',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <div className="min-h-screen bg-background text-foreground">
              <header className="container mx-auto p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <Link href="/dashboard">
                      <Button variant="ghost" className="flex items-center space-x-2">
                        <LayoutDashboard className="h-5 w-5" />
                        <span>Dashboard</span>
                      </Button>
                    </Link>
                  </div>
                  <div className="flex items-center space-x-4">
                    <ThemeToggle />
                    <AuthButton />
                  </div>
                </div>
              </header>
              <main className="container mx-auto p-4">{children}</main>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
