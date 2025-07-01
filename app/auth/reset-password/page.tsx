'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { updatePassword } from '@/lib/auth/supabase-auth'
import { validatePassword, validatePasswordConfirmation } from '@/lib/auth/validation'
import { Shield, Lock, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isValidLink, setIsValidLink] = useState(true)

  useEffect(() => {
    // Check if we have the necessary URL parameters for password reset
    const accessToken = searchParams.get('access_token')
    const refreshToken = searchParams.get('refresh_token')
    
    if (!accessToken || !refreshToken) {
      setIsValidLink(false)
      setError('Invalid or expired reset link. Please request a new password reset.')
    }
  }, [searchParams])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate password
    const passwordValidation = validatePassword(formData.password)
    if (!passwordValidation.isValid) {
      setError(passwordValidation.errors[0]?.message || 'Please enter a valid password')
      setLoading(false)
      return
    }

    // Validate password confirmation
    const confirmValidation = validatePasswordConfirmation(formData.password, formData.confirmPassword)
    if (!confirmValidation.isValid) {
      setError(confirmValidation.errors[0]?.message || 'Passwords do not match')
      setLoading(false)
      return
    }

    // Update password
    const result = await updatePassword(formData.password)
    
    if (result.success) {
      setSuccess(true)
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/auth/login?message=Password updated successfully')
      }, 3000)
    } else {
      setError(result.error || 'Failed to update password. Please try again.')
    }
    
    setLoading(false)
  }

  if (!isValidLink) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Shield className="mx-auto h-12 w-12 text-red-400 mb-4" />
            <h2 className="text-3xl font-cyber font-bold text-white">
              Invalid Reset Link
            </h2>
            <p className="mt-2 text-sm text-slate-400 mb-6">
              This password reset link is invalid or has expired.
            </p>
            <div className="space-y-4">
              <Link href="/auth/forgot-password">
                <Button className="w-full cyber-button">
                  Request New Reset Link
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:border-cyber-cyan hover:text-cyber-cyan">
                  Back to Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-3xl font-cyber font-bold text-white">
              Password Updated!
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Your password has been successfully updated. You can now sign in with your new password.
            </p>
            <p className="mt-4 text-xs text-slate-500">
              Redirecting to sign in page...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <Shield className="h-8 w-8 text-cyber-cyan" />
            <span className="font-cyber text-xl font-bold text-white">Cybernex Academy</span>
          </Link>
          <h2 className="text-3xl font-cyber font-bold text-white">
            Set New Password
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Enter your new password below
          </p>
        </div>

        {/* Form */}
        <div className="cyber-card">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div>
              <Label htmlFor="password" className="flex items-center text-slate-200">
                <Lock className="h-4 w-4 mr-2" />
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter your new password"
                  className="pr-10"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-300"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Must contain at least 8 characters with uppercase, lowercase, and number
              </p>
            </div>

            {/* Confirm New Password */}
            <div>
              <Label htmlFor="confirmPassword" className="flex items-center text-slate-200">
                <Lock className="h-4 w-4 mr-2" />
                Confirm New Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirm your new password"
                  className="pr-10"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-300"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full cyber-button"
              disabled={loading || !formData.password || !formData.confirmPassword}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating Password...
                </>
              ) : (
                'Update Password'
              )}
            </Button>
          </form>
        </div>

        {/* Additional Help */}
        <div className="text-center">
          <p className="text-xs text-slate-500">
            Need help?{' '}
            <Link href="/contact" className="text-cyber-cyan hover:underline">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}