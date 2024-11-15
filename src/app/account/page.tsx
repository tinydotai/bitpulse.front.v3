'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import axios from 'axios'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { DOMAIN } from '../config'

interface EditedUser {
  email: string
  mobile: string
  currentPassword: string
  newPassword: string
}

export default function AccountPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [editedUser, setEditedUser] = useState<EditedUser | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    } else if (user) {
      setEditedUser({
        email: user.email,
        mobile: user.mobile,
        currentPassword: '',
        newPassword: '',
      })
    }
  }, [isAuthenticated, isLoading, user, router])

  const handleEdit = () => {
    setIsEditing(true)
    setError(null)
    setSuccessMessage(null)
    setPasswordError(null)
  }

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long'
    }
    if (!/\d/.test(password)) {
      return 'Password must contain at least 1 number'
    }
    return null
  }

  const handleSave = async () => {
    if (!editedUser) return

    setError(null)
    setSuccessMessage(null)
    setPasswordError(null)

    try {
      // Update user info (email and mobile)
      // This is a placeholder as the API doesn't provide an endpoint for updating user info
      console.log('Updating user info:', { email: editedUser.email, mobile: editedUser.mobile })

      // Change password if new password is provided
      if (editedUser.currentPassword && editedUser.newPassword) {
        const passwordValidationError = validatePassword(editedUser.newPassword)
        if (passwordValidationError) {
          setPasswordError(passwordValidationError)
          return
        }

        const formData = new URLSearchParams()
        formData.append('current_password', editedUser.currentPassword)
        formData.append('new_password', editedUser.newPassword)

        await axios.post(`${DOMAIN}/jwt/change-password`, formData, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })

        setSuccessMessage('Password changed successfully')
      }

      setIsEditing(false)
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.detail || 'An error occurred while updating your account')
      } else {
        setError('An unexpected error occurred')
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editedUser) {
      setEditedUser({
        ...editedUser,
        [e.target.name]: e.target.value,
      })
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated || !user || !editedUser) {
    return null
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>My Account</CardTitle>
          <CardDescription>View and edit your account information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatar || ''} alt={user.username} />
              <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{user.username}</h2>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={isEditing ? editedUser.email : user.email}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="mobile">Mobile</Label>
              <Input
                id="mobile"
                name="mobile"
                value={isEditing ? editedUser.mobile : user.mobile}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            {isEditing && (
              <>
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={editedUser.currentPassword}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={editedUser.newPassword}
                    onChange={handleChange}
                  />
                </div>
                {passwordError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{passwordError}</AlertDescription>
                  </Alert>
                )}
              </>
            )}
          </div>
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {successMessage && (
            <Alert variant="default" className="mt-4">
              <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
              <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </>
          ) : (
            <Button onClick={handleEdit}>Edit Profile</Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
