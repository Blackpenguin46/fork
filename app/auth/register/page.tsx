'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AuthService } from '@/lib/services/auth'
import { validateRegistrationForm, ValidationError } from '@/lib/auth/validation'
import { Shield, User, Mail, Lock, AtSign, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react'
import PasswordStrengthIndicator from '@/components/auth/PasswordStrengthIndicator'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    fullName: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [submitError, setSubmitError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear field-specific errors when user starts typing
    setErrors(prev => prev.filter(error => error.field !== field))
    setSubmitError('')
  }

  const getFieldError = (field: string) => {
    return errors.find(error => error.field === field)?.message
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors([])
    setSubmitError('')

    // Validate form
    const validation = validateRegistrationForm(formData)
    if (!validation.isValid) {
      setErrors(validation.errors)
      setLoading(false)
      return
    }

    // Submit registration
    const result = await AuthService.register({
      email: formData.email,
      password: formData.password,
      username: formData.username,
      full_name: formData.fullName
    })
    
    if (result.success) {
      setSuccess(true)
      // Redirect based on whether verification is needed
      setTimeout(() => {
        if (result.data?.needsVerification) {
          router.push(`/auth/verify-email?email=${encodeURIComponent(formData.email)}`)
        } else {
          router.push('/auth/login?message=Registration successful! You can now sign in.')
        }
      }, 3000)
    } else {
      setSubmitError(result.error || 'Registration failed. Please try again.')
    }
    
    setLoading(false)
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
              Registration Successful!
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              We&apos;ve sent a verification email to <strong>{formData.email}</strong>
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Please check your email and click the verification link to activate your account.
            </p>
            <p className="mt-4 text-xs text-slate-500">
              Redirecting to verification page...
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
            Create Your Account
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Join the cybersecurity community
          </p>
        </div>

        {/* Form */}
        <div className="cyber-card">
          {submitError && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <Label htmlFor="fullName" className="flex items-center text-slate-200">
                <User className="h-4 w-4 mr-2" />
                Full Name
              </Label>
              <Input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="John Doe"
                className={getFieldError('fullName') ? 'border-red-500' : ''}
                disabled={loading}
              />
              {getFieldError('fullName') && (
                <p className="mt-1 text-sm text-red-400">{getFieldError('fullName')}</p>
              )}
            </div>

            {/* Username */}
            <div>
              <Label htmlFor="username" className="flex items-center text-slate-200">
                <AtSign className="h-4 w-4 mr-2" />
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="cyberpro123"
                className={getFieldError('username') ? 'border-red-500' : ''}
                disabled={loading}
              />
              {getFieldError('username') && (
                <p className="mt-1 text-sm text-red-400">{getFieldError('username')}</p>
              )}
              <p className="mt-1 text-xs text-slate-500">
                This will be your unique identifier on the platform
              </p>
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" className="flex items-center text-slate-200">
                <Mail className="h-4 w-4 mr-2" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="your.email@example.com"
                className={getFieldError('email') ? 'border-red-500' : ''}
                disabled={loading}
              />
              {getFieldError('email') && (
                <p className="mt-1 text-sm text-red-400">{getFieldError('email')}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password" className="flex items-center text-slate-200">
                <Lock className="h-4 w-4 mr-2" />
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Create a strong password"
                  className={`pr-10 ${getFieldError('password') ? 'border-red-500' : ''}`}
                  disabled={loading}
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
              {getFieldError('password') && (
                <p className="mt-1 text-sm text-red-400">{getFieldError('password')}</p>
              )}
              
              {/* Password Strength Indicator */}
              <PasswordStrengthIndicator
                password={formData.password}
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <Label htmlFor="confirmPassword" className="flex items-center text-slate-200">
                <Lock className="h-4 w-4 mr-2" />
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirm your password"
                  className={`pr-10 ${getFieldError('confirmPassword') ? 'border-red-500' : ''}`}
                  disabled={loading}
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
              {getFieldError('confirmPassword') && (
                <p className="mt-1 text-sm text-red-400">{getFieldError('confirmPassword')}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full cyber-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              Already have an account?{' '}
              <Link 
                href="/auth/login"
                className="text-cyber-cyan hover:text-cyber-magenta transition-colors font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Terms */}
          <div className="mt-4 text-center">
            <p className="text-xs text-slate-500">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="text-cyber-cyan hover:underline">
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-cyber-cyan hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}