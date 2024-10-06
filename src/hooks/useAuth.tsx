'use client'

import React, { useState, useEffect, createContext, useContext } from 'react'
import axios from 'axios'

interface User {
  email: string
  username: string
  mobile: string
  id: string
  role: string
  avatar: string | null
}

interface AuthContextType {
  user: User | null
  login: (formData: URLSearchParams) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      fetchUserData(token)
    }
  }, [])

  const fetchUserData = async (token: string) => {
    try {
      const response = await axios.get<User>('http://localhost:8000/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setUser(response.data)
    } catch (error) {
      console.error('Failed to fetch user data:', error)
      logout()
    }
  }

  const login = async (formData: URLSearchParams) => {
    try {
      const response = await axios.post('http://localhost:8000/jwt/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })

      const token = response.data.access_token
      localStorage.setItem('token', token)
      await fetchUserData(token)
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const contextValue: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
