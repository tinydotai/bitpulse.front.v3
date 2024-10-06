import '@/app/globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from './providers'
import { ThemeToggle } from '@/components/theme-toggler'
import { LogoutButton } from '@/components/logout-button'
import { AuthProvider } from '@/hooks/useAuth'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Bitpulse - Crypto Data Hub</title>
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <div className="min-h-screen bg-background text-foreground">
              <header className="container mx-auto p-4 flex justify-between items-center">
                <ThemeToggle />
                <LogoutButton />
              </header>
              <main className="container mx-auto p-4">{children}</main>
            </div>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
