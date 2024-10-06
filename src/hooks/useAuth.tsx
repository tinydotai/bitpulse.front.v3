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
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      if (token && !authChecked) {
        try {
          const response = await axios.get<User>('http://localhost:8000/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          })
          setUser(response.data)
          setIsAuthenticated(true)
        } catch (error) {
          console.error('Failed to fetch user data:', error)
          localStorage.removeItem('token')
        } finally {
          setIsLoading(false)
          setAuthChecked(true)
        }
      } else {
        setIsLoading(false)
        setAuthChecked(true)
      }
    }

    checkAuth()
  }, [authChecked])

  const login = async (formData: URLSearchParams) => {
    setIsLoading(true)
    try {
      const response = await axios.post('http://localhost:8000/jwt/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })

      const token = response.data.access_token
      localStorage.setItem('token', token)

      const userResponse = await axios.get<User>('http://localhost:8000/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setUser(userResponse.data)
      setIsAuthenticated(true)
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setIsAuthenticated(false)
    setAuthChecked(false)
  }

  const contextValue: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated,
    isLoading,
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
