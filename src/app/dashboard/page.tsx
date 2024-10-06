'use client'

import { useUser } from '@/hooks/useUser'
import { useAuth } from '@/hooks/useAuth'

export default function DashboardPage() {
  useAuth() // This will redirect to login if not authenticated
  const user = useUser()

  if (!user) return null // or a loading spinner

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome, {user.username}!</h1>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
      {/* Add more dashboard content here */}
    </div>
  )
}
