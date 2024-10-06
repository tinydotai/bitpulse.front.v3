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
import { AlertCircle, Check } from 'lucide-react'

interface ErrorResponse {
  detail: string | { msg: string }[]
}

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    mobile: '',
  })
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    number: false,
  })

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
    setPasswordCriteria({
      length: formData.password.length >= 8,
      number: /\d/.test(formData.password),
    })
  }, [formData.password])

  const passwordValid = Object.values(passwordCriteria).every(Boolean)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    if (formData.password !== passwordConfirmation) {
      setError("Passwords don't match")
      setIsLoading(false)
      return
    }

    if (!passwordValid) {
      setError('Password does not meet the required criteria')
      setIsLoading(false)
      return
    }

    try {
      const response = await axios.post('http://localhost:8000/auth/register', formData)
      console.log('Registration successful:', response.data)
      router.push('/login')
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ErrorResponse>
        if (axiosError.response?.status === 400) {
          setError(
            typeof axiosError.response.data.detail === 'string'
              ? axiosError.response.data.detail
              : 'Registration failed. Please check your input.'
          )
        } else if (axiosError.response?.status === 422) {
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
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Register</CardTitle>
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
                className="w-full"
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
                className="w-full"
              />
              <ul className="space-y-1 text-sm">
                <li
                  className={`flex items-center ${
                    passwordCriteria.length ? 'text-green-500' : 'text-muted-foreground'
                  }`}
                >
                  <Check
                    className={`w-4 h-4 mr-2 ${
                      passwordCriteria.length ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                  At least 8 characters long
                </li>
                <li
                  className={`flex items-center ${
                    passwordCriteria.number ? 'text-green-500' : 'text-muted-foreground'
                  }`}
                >
                  <Check
                    className={`w-4 h-4 mr-2 ${
                      passwordCriteria.number ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                  Includes a number
                </li>
              </ul>
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
                className="w-full"
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
