'use client'

import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export function AuthButton() {
  const { isAuthenticated, logout } = useAuth()
  const router = useRouter()

  const handleClick = () => {
    if (isAuthenticated) {
      logout()
    } else {
      router.push('/login')
    }
  }

  return (
    <Button onClick={handleClick} variant="ghost">
      {isAuthenticated ? 'Logout' : 'Login'}
    </Button>
  )
}
