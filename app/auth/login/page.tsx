'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { loginUser, resendConfirmation } from '@/lib/auth/supabase-auth'
import { validateLoginForm, ValidationError } from '@/lib/auth/validation'
import { Shield, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [submitError, setSubmitError] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showResendVerification, setShowResendVerification] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  // Check for error messages from URL params (from auth callback)
  useEffect(() => {
    const error = searchParams.get('error')
    const message = searchParams.get('message')
    
    if (error) {
      let errorMessage = 'An error occurred during authentication.'
      
      switch (error) {
        case 'auth_error':
          errorMessage = message ? decodeURIComponent(message) : 'Authentication failed. Please try again.'
          break
        case 'callback_error':
          errorMessage = 'Authentication callback failed. Please try again.'
          break
        case 'no_code':
          errorMessage = 'Invalid authentication link. Please try again.'
          break
        default:
          errorMessage = message ? decodeURIComponent(message) : 'An unexpected error occurred.'
      }
      
      setSubmitError(errorMessage)
    }
  }, [searchParams])

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
    const validation = validateLoginForm(formData)
    if (!validation.isValid) {
      setErrors(validation.errors)
      setLoading(false)
      return
    }

    // Submit login
    const result = await loginUser(formData)
    
    if (result.success) {
      // Small delay to ensure session is established
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Redirect to dashboard or intended page
      const redirectTo = new URLSearchParams(window.location.search).get('redirect') || '/dashboard'
      router.push(redirectTo)
      router.refresh() // Ensure the page refreshes to update auth state
    } else {
      const errorMessage = result.error || 'Login failed. Please try again.'
      setSubmitError(errorMessage)
      
      // Show resend verification option if it's an email confirmation issue
      if (errorMessage.includes('email') || errorMessage.includes('confirm') || errorMessage.includes('verify')) {
        setShowResendVerification(true)
      }
    }
    
    setLoading(false)
  }

  const handleResendVerification = async () => {
    if (!formData.email) {
      setSubmitError('Please enter your email address first.')
      return
    }

    setResendLoading(true)
    setResendSuccess(false)

    const result = await resendConfirmation(formData.email)
    
    if (result.success) {
      setResendSuccess(true)
      setShowResendVerification(false)
      setSubmitError('')
    } else {
      setSubmitError(result.error || 'Failed to resend verification email. Please try again.')
    }
    
    setResendLoading(false)
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
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Sign in to your cybersecurity hub
          </p>
        </div>

        {/* Form */}
        <div className="cyber-card">
          {submitError && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          {resendSuccess && (
            <Alert variant="default" className="mb-6 border-green-500/30 bg-green-500/10">
              <AlertDescription className="text-green-400">
                Verification email sent! Please check your inbox and click the link to verify your account.
              </AlertDescription>
            </Alert>
          )}

          {showResendVerification && (
            <Alert variant="default" className="mb-6 border-blue-500/30 bg-blue-500/10">
              <AlertDescription className="text-blue-400">
                Need to verify your email? 
                <Button
                  type="button"
                  variant="link"
                  onClick={handleResendVerification}
                  disabled={resendLoading}
                  className="p-0 ml-2 h-auto text-blue-400 hover:text-blue-300"
                >
                  {resendLoading ? 'Sending...' : 'Resend verification email'}
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <Label htmlFor="email" className="flex items-center text-slate-200">
                <Mail className="h-4 w-4 mr-2" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
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
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter your password"
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
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-cyber-cyan focus:ring-cyber-cyan border-slate-600 rounded bg-slate-800"
                />
                <Label htmlFor="remember-me" className="ml-2 text-sm text-slate-400">
                  Remember me
                </Label>
              </div>

              <div className="text-sm">
                <Link
                  href="/auth/forgot-password"
                  className="text-cyber-cyan hover:text-cyber-magenta transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>
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
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-900 text-slate-400">Don&apos;t have an account?</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <Link href="/auth/register">
              <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:border-cyber-cyan hover:text-cyber-cyan">
                Create Account
              </Button>
            </Link>
          </div>
        </div>

        {/* Additional Links */}
        <div className="text-center space-y-2">
          <p className="text-xs text-slate-500">
            Having trouble signing in?{' '}
            <Link href="/contact" className="text-cyber-cyan hover:underline">
              Contact Support
            </Link>
          </p>
          <p className="text-xs text-slate-500">
            New to cybersecurity?{' '}
            <Link href="/academy" className="text-cyber-cyan hover:underline">
              Start Learning
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}