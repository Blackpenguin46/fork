'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { resetPassword } from '@/lib/auth/supabase-auth'
import { validateEmail } from '@/lib/auth/validation'
import { Shield, Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate email
    const validation = validateEmail(email)
    if (!validation.isValid) {
      setError(validation.errors[0]?.message || 'Please enter a valid email address')
      setLoading(false)
      return
    }

    // Submit password reset request
    const result = await resetPassword(email)
    
    if (result.success) {
      setSuccess(true)
    } else {
      setError(result.error || 'Failed to send reset email. Please try again.')
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
              Check Your Email
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              We've sent a password reset link to:
            </p>
            <p className="mt-1 text-sm font-medium text-cyber-cyan">
              {email}
            </p>
            <div className="mt-6 space-y-4">
              <p className="text-xs text-slate-500">
                Didn't receive the email? Check your spam folder or{' '}
                <button
                  onClick={() => setSuccess(false)}
                  className="text-cyber-cyan hover:underline"
                >
                  try again
                </button>
              </p>
              <Link href="/auth/login">
                <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:border-cyber-cyan hover:text-cyber-cyan">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Sign In
                </Button>
              </Link>
            </div>
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
            Reset Your Password
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Enter your email address and we'll send you a link to reset your password
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
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError('')
                }}
                placeholder="your.email@example.com"
                className={error ? 'border-red-500' : ''}
                disabled={loading}
                required
              />
              <p className="mt-1 text-xs text-slate-500">
                We'll send a password reset link to this email address
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full cyber-button"
              disabled={loading || !email}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Reset Link...
                </>
              ) : (
                'Send Reset Link'
              )}
            </Button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center text-sm text-slate-400 hover:text-cyber-cyan transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign In
            </Link>
          </div>
        </div>

        {/* Additional Help */}
        <div className="text-center">
          <p className="text-xs text-slate-500">
            Need more help?{' '}
            <Link href="/contact" className="text-cyber-cyan hover:underline">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}