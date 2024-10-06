'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = () => {
    // Clear the token from localStorage
    localStorage.removeItem('token')

    // Redirect to login page
    router.push('/login')
  }

  return <Button onClick={handleLogout}>Logout</Button>
}
