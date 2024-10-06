import '@/app/globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from './providers'
import { ThemeToggle } from '@/components/theme-toggler'
import { LogoutButton } from '@/components/logout-button'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <title>Bitpulse - Crypto Data Hub</title>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="min-h-screen bg-background text-foreground">
            <header className="container mx-auto p-4">
              <ThemeToggle />
              <LogoutButton />
            </header>
            <main className="container mx-auto p-4">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
