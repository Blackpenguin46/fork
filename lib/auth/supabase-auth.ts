import { supabase, getSupabase } from '@/lib/supabase'
import { AuthError } from '@supabase/supabase-js'

export interface AuthResult {
  success: boolean
  error?: string
  data?: any
}

export interface RegisterData {
  email: string
  password: string
  username: string
  fullName: string
}

export interface LoginData {
  email: string
  password: string
}

// Remove the overly strict check - let individual functions handle errors
// This allows auth to work when environment variables are present

export async function registerUser(data: RegisterData): Promise<AuthResult> {
  try {
    // Get Supabase client
    const supabase = getSupabase()
    
    // Check if username is already taken
    const { data: existingUser, error: usernameCheckError } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', data.username)
      .maybeSingle()

    // If there's an error other than "no rows found", something went wrong
    if (usernameCheckError && usernameCheckError.code !== 'PGRST116') {
      console.error('Username check error:', usernameCheckError)
      return {
        success: false,
        error: 'Unable to verify username availability. Please try again.'
      }
    }

    if (existingUser) {
      return {
        success: false,
        error: 'Username is already taken. Please choose a different username.'
      }
    }

    // Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL}/auth/callback?type=signup`,
        data: {
          full_name: data.fullName,
          username: data.username,
        }
      }
    })

    if (authError) {
      return {
        success: false,
        error: getAuthErrorMessage(authError)
      }
    }

    // Create profile (handled by database trigger, but we can verify)
    if (authData.user) {
      // Wait a moment for the trigger to complete
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update profile with additional data if needed
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          username: data.username,
          full_name: data.fullName,
        })
        .eq('id', authData.user.id)

      if (profileError) {
        console.error('Profile update error:', profileError)
        // Don't fail registration for profile update errors
      }
    }

    return {
      success: true,
      data: authData
    }
  } catch (error) {
    console.error('Registration error:', error)
    
    // Log the full error for debugging
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      })
      
      if (error.message.includes('fetch')) {
        return {
          success: false,
          error: 'Network error. Please check your connection and try again.'
        }
      }
    }
    
    return {
      success: false,
      error: 'An unexpected error occurred during registration. Please try again.'
    }
  }
}

export async function loginUser(data: LoginData): Promise<AuthResult> {
  try {
    const supabase = getSupabase()
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (authError) {
      return {
        success: false,
        error: getAuthErrorMessage(authError)
      }
    }

    return {
      success: true,
      data: authData
    }
  } catch (error) {
    console.error('Login error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred during login. Please try again.'
    }
  }
}

export async function logoutUser(): Promise<AuthResult> {
  try {
    const supabase = getSupabase()
    const { error } = await supabase.auth.signOut()

    if (error) {
      return {
        success: false,
        error: getAuthErrorMessage(error)
      }
    }

    return {
      success: true
    }
  } catch (error) {
    console.error('Logout error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred during logout. Please try again.'
    }
  }
}

export async function resetPassword(email: string): Promise<AuthResult> {
  try {
    const supabase = getSupabase()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL}/auth/callback?type=recovery`,
    })

    if (error) {
      return {
        success: false,
        error: getAuthErrorMessage(error)
      }
    }

    return {
      success: true
    }
  } catch (error) {
    console.error('Password reset error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    }
  }
}

export async function updatePassword(newPassword: string): Promise<AuthResult> {
  try {
    const supabase = getSupabase()
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      return {
        success: false,
        error: getAuthErrorMessage(error)
      }
    }

    return {
      success: true
    }
  } catch (error) {
    console.error('Password update error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred while updating your password.'
    }
  }
}

export async function resendConfirmation(email: string): Promise<AuthResult> {
  try {
    const supabase = getSupabase()
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL}/auth/callback?type=signup`
      }
    })

    if (error) {
      return {
        success: false,
        error: getAuthErrorMessage(error)
      }
    }

    return {
      success: true
    }
  } catch (error) {
    console.error('Resend confirmation error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    }
  }
}

function getAuthErrorMessage(error: AuthError): string {
  switch (error.message) {
    case 'Invalid email or password':
      return 'Invalid email or password. Please check your credentials and try again.'
    case 'Email not confirmed':
      return 'Please check your email and click the confirmation link before signing in.'
    case 'Invalid login credentials':
      return 'Invalid email or password. If you just registered, please verify your email first.'
    case 'User already registered':
      return 'An account with this email already exists. Please sign in instead.'
    case 'Password should be at least 6 characters':
      return 'Password must be at least 6 characters long.'
    case 'Invalid email':
      return 'Please enter a valid email address.'
    case 'Signup disabled':
      return 'New registrations are currently disabled. Please contact support.'
    case 'Email rate limit exceeded':
      return 'Too many requests. Please wait a moment before trying again.'
    case 'For security purposes, you can only request this once every 60 seconds':
      return 'Please wait 60 seconds before requesting another email.'
    default:
      // Log unknown errors for debugging
      console.error('Unknown auth error:', error.message)
      return error.message || 'An unexpected error occurred. Please try again.'
  }
}