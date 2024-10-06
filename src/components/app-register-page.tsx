'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import axios, { AxiosError } from 'axios'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

interface ErrorResponse {
  detail: string | { msg: string }[]
}

export function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    mobile: '',
  })
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [passwordValid, setPasswordValid] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handlePasswordConfirmationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordConfirmation(e.target.value)
  }

  const handlePhoneChange = (value: string | undefined) => {
    setFormData({ ...formData, mobile: value || '' })
  }

  useEffect(() => {
    // Password validation: minimum 8 characters with at least one number
    const passwordRegex = /^(?=.*[0-9])(?=.*[a-zA-Z]).{8,}$/
    setPasswordValid(passwordRegex.test(formData.password))
  }, [formData.password])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    if (!passwordValid) {
      setError('Password must be at least 8 characters long and include a number')
      setIsLoading(false)
      return
    }

    if (formData.password !== passwordConfirmation) {
      setError("Passwords don't match")
      setIsLoading(false)
      return
    }

    try {
      const dataToSubmit = {
        ...formData,
        username: formData.email, // Set username as email
      }
      const formUrlEncoded = new URLSearchParams(dataToSubmit).toString()
      const response = await axios.post('http://localhost:8000/jwt/register', formUrlEncoded, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })

      console.log('Registration successful:', response.data)
      router.push('/login') // Redirect to login page after successful registration
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ErrorResponse>
        if (axiosError.response?.status === 400) {
          // Handle 400 Bad Request errors
          setError(
            typeof axiosError.response.data.detail === 'string'
              ? axiosError.response.data.detail
              : 'Registration failed. Please check your input.'
          )
        } else if (axiosError.response?.status === 422) {
          // Handle validation errors
          const validationErrors = axiosError.response.data.detail
          if (Array.isArray(validationErrors)) {
            const errorMessages = validationErrors.map(err => err.msg).join(', ')
            setError(`Validation error: ${errorMessages}`)
          } else {
            setError('Validation failed. Please check your input.')
          }
        } else {
          setError(
            typeof axiosError.response?.data?.detail === 'string'
              ? axiosError.response.data.detail
              : 'Registration failed'
          )
        }
        console.error('Axios error:', axiosError.response?.data)
      } else if (error instanceof Error) {
        setError(error.message || 'An unexpected error occurred')
        console.error('Unexpected error:', error)
      } else {
        setError('An unexpected error occurred')
        console.error('Unknown error:', error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Register</CardTitle>
          <CardDescription>Create a new account to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
              />
              {!passwordValid && formData.password && (
                <p className="text-sm text-red-500">
                  Password must be at least 8 characters long and include a number
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="passwordConfirmation">Repeat Password</Label>
              <Input
                id="passwordConfirmation"
                name="passwordConfirmation"
                type="password"
                required
                value={passwordConfirmation}
                onChange={handlePasswordConfirmationChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile</Label>
              <PhoneInput
                international
                countryCallingCodeEditable={false}
                defaultCountry="US"
                value={formData.mobile}
                onChange={handlePhoneChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={isLoading || !passwordValid}>
              {isLoading ? 'Registering...' : 'Register'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
