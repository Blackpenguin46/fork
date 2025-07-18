'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AuthService } from '@/lib/services/auth'
import { validateEmail } from '@/lib/auth/validation'
import { Shield, Mail, CheckCircle, Loader2, RefreshCw } from 'lucide-react'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isVerified, setIsVerified] = useState(false)

  useEffect(() => {
    // Check if user is coming from email verification link
    const accessToken = searchParams.get('access_token')
    const refreshToken = searchParams.get('refresh_token')
    const type = searchParams.get('type')
    
    if (accessToken && refreshToken && type === 'signup') {
      setIsVerified(true)
      // Redirect to dashboard after showing success message
      setTimeout(() => {
        router.push('/dashboard?verified=true')
      }, 3000)
    }
    
    // Also check for verified parameter
    const verified = searchParams.get('verified')
    if (verified === 'true') {
      setIsVerified(true)
      setTimeout(() => {
        router.push('/dashboard')
      }, 3000)
    }
  }, [searchParams, router])

  const handleResendConfirmation = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    // Validate email
    const validation = validateEmail(email)
    if (validation) {
      setError(validation.message || 'Please enter a valid email address')
      setLoading(false)
      return
    }

    // Resend confirmation email
    const result = await AuthService.resendVerification(email)
    
    if (result.success) {
      setSuccess(true)
    } else {
      setError(result.error || 'Failed to resend confirmation email. Please try again.')
    }
    
    setLoading(false)
  }

  if (isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-3xl font-cyber font-bold text-white">
              Email Verified!
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Your email has been successfully verified. Welcome to Cybernex Academy!
            </p>
            <p className="mt-4 text-xs text-slate-500">
              Redirecting to your dashboard...
            </p>
            <div className="mt-6">
              <Link href="/dashboard">
                <Button className="w-full cyber-button">
                  Go to Dashboard
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
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-cyber-cyan/20 mb-4">
            <Mail className="h-8 w-8 text-cyber-cyan" />
          </div>
          <h2 className="text-3xl font-cyber font-bold text-white">
            Verify Your Email
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            We&apos;ve sent a verification link to your email address. Please check your inbox and click the link to verify your account.
          </p>
        </div>

        {/* Instructions */}
        <div className="cyber-card">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-cyber-cyan/20 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-xs font-bold text-cyber-cyan">1</span>
              </div>
              <div>
                <p className="text-sm text-slate-300">
                  Check your email inbox for a message from Cybernex Academy
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-cyber-cyan/20 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-xs font-bold text-cyber-cyan">2</span>
              </div>
              <div>
                <p className="text-sm text-slate-300">
                  Click the verification link in the email
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-cyber-cyan/20 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-xs font-bold text-cyber-cyan">3</span>
              </div>
              <div>
                <p className="text-sm text-slate-300">
                  Return here to access your account
                </p>
              </div>
            </div>
          </div>

          {/* Resend Email Form */}
          <div className="mt-8 pt-6 border-t border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">
              Didn&apos;t receive the email?
            </h3>
            
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert variant="success" className="mb-4">
                <AlertDescription>
                  Verification email sent! Please check your inbox.
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleResendConfirmation} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-slate-200">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError('')
                    setSuccess(false)
                  }}
                  placeholder="your.email@example.com"
                  className={error ? 'border-red-500' : ''}
                  disabled={loading}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                variant="outline"
                disabled={loading || !email}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Resend Verification Email
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Additional Help */}
        <div className="text-center space-y-4">
          <div className="space-y-2">
            <p className="text-xs text-slate-500">
              Make sure to check your spam/junk folder
            </p>
            <p className="text-xs text-slate-500">
              Still having trouble?{' '}
              <Link href="/contact" className="text-cyber-cyan hover:underline">
                Contact Support
              </Link>
            </p>
          </div>
          
          <div className="pt-4 border-t border-slate-800">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-slate-400 hover:text-cyber-cyan">
                Back to Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}