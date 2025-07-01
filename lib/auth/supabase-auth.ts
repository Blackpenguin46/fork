import { supabase } from '@/lib/supabase'
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

export async function registerUser(data: RegisterData): Promise<AuthResult> {
  try {
    // Quick check if Supabase is available
    if (!supabase) {
      return {
        success: false,
        error: 'Authentication service is not available. Please try again later.'
      }
    }

    // Check if username is already taken (use .single() like the original working version)
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', data.username)
      .single()

    if (existingUser) {
      return {
        success: false,
        error: 'Username is already taken. Please choose a different username.'
      }
    }

    // Sign up the user (use direct dashboard redirect like the original)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/dashboard?verified=true`,
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
    return {
      success: false,
      error: 'An unexpected error occurred during registration. Please try again.'
    }
  }
}

export async function loginUser(data: LoginData): Promise<AuthResult> {
  try {
    if (!supabase) {
      return {
        success: false,
        error: 'Authentication service is not available. Please try again later.'
      }
    }

    console.log('Attempting login for:', data.email)
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    console.log('Login result:', { 
      user: authData?.user?.id, 
      emailConfirmed: authData?.user?.email_confirmed_at,
      error: authError?.message 
    })

    if (authError) {
      console.error('Login auth error:', authError)
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
    if (!supabase) {
      return {
        success: false,
        error: 'Authentication service is not available.'
      }
    }

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
    if (!supabase) {
      return {
        success: false,
        error: 'Authentication service is not available. Please try again later.'
      }
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/auth/reset-password`,
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
    if (!supabase) {
      return {
        success: false,
        error: 'Authentication service is not available. Please try again later.'
      }
    }

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

// Debug function to check user email confirmation status
export async function checkUserEmailStatus(email: string): Promise<any> {
  try {
    if (!supabase) {
      return { error: 'Supabase not available' }
    }

    // Get the current user from auth
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    // Also try to get user info from the profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single()

    return {
      currentAuthUser: {
        id: user?.id,
        email: user?.email,
        emailConfirmed: user?.email_confirmed_at,
        userError
      },
      profileData: {
        profile,
        profileError
      }
    }
  } catch (error) {
    console.error('Error checking user status:', error)
    return { error: error instanceof Error ? error.message : String(error) }
  }
}

export async function resendConfirmation(email: string): Promise<AuthResult> {
  try {
    if (!supabase) {
      return {
        success: false,
        error: 'Authentication service is not available. Please try again later.'
      }
    }

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/dashboard?verified=true`
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
  console.log('Processing auth error:', error.message)
  
  switch (error.message) {
    case 'Invalid email or password':
      return 'Invalid email or password. Please check your credentials and try again.'
    case 'Email not confirmed':
      return 'Debug: Email not confirmed error - this might be a Supabase configuration issue. Original message: ' + error.message
    case 'Invalid login credentials':
      return 'Debug: Invalid login credentials - this could be email confirmation related. Original message: ' + error.message
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
      return `Debug: ${error.message}` || 'An unexpected error occurred. Please try again.'
  }
}