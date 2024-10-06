import '@/app/globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from './providers'
import { ThemeToggle } from '@/components/theme-toggler'
import { AuthProvider } from '@/hooks/useAuth'
import { AuthButton } from '@/components/auth-button'
import { Metadata } from 'next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Bitpulse - Crypto Data Hub',
  description: 'crypto data hub',
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
                  <div className="w-10 h-10">
                    <ThemeToggle />
                  </div>
                  <div className="w-20 h-10 flex justify-end">
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
