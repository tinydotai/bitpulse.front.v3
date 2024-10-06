'use client'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const { logout, isAuthenticated } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  if (!isAuthenticated) return null

  return (
    <Button onClick={handleLogout} variant="ghost">
      Logout
    </Button>
  )
}
