'use client'

import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export function AuthButton() {
  const { isAuthenticated, logout, isLoading } = useAuth()
  const router = useRouter()

  const handleClick = () => {
    if (isAuthenticated) {
      logout()
    } else {
      router.push('/login')
    }
  }

  if (isLoading) {
    return (
      <Button variant="ghost" className="w-20" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      </Button>
    )
  }

  return (
    <Button onClick={handleClick} variant="ghost" className="w-20">
      {isAuthenticated ? 'Logout' : 'Login'}
    </Button>
  )
}
