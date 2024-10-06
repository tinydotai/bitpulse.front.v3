'use client'

import { useState, useEffect } from 'react'

interface User {
  email: string
  username: string
  mobile: string
  id: string
  role: string
  avatar: string | null
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      setUser(JSON.parse(userStr))
    }
  }, [])

  return user
}
