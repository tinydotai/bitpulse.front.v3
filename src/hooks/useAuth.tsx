'use client'

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react'
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
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const response = await axios.get('http://localhost:8000/auth/me', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          setUser(response.data)
          setIsAuthenticated(true)
        } catch (error) {
          console.error('Authentication error:', error)
          localStorage.removeItem('token')
          setUser(null)
          setIsAuthenticated(false)
        }
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (username: string, password: string) => {
    try {
      const response = await axios.post(
        'http://localhost:8000/jwt/login',
        new URLSearchParams({
          username,
          password,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      )
      const { access_token } = response.data
      localStorage.setItem('token', access_token)
      setIsAuthenticated(true)
      const userResponse = await axios.get('http://localhost:8000/auth/me', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
      setUser(userResponse.data)
      return true
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
