import { supabase } from '@/lib/supabase'

interface RegisterData {
  email: string
  password: string
  fullName: string
  username: string
}

interface AuthResult {
  success: boolean
  error?: string
  message?: string
}

/**
 * Register a new user with email and username validation
 */
export async function registerUser(data: RegisterData): Promise<AuthResult> {
  if (!supabase) {
    return {
      success: false,
      error: 'Authentication service is not available'
    }
  }

  try {
    console.log('Starting registration for:', data.email)

    // 1. Check if email already exists
    const { data: existingEmail, error: emailCheckError } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', data.email)
      .maybeSingle()

    if (emailCheckError) {
      console.error('Email check error:', emailCheckError)
      return {
        success: false,
        error: 'Database error occurred. Please try again.'
      }
    }

    if (existingEmail) {
      return {
        success: false,
        error: 'An account with this email already exists. Please sign in instead.'
      }
    }

    // 2. Check if username already exists
    const { data: existingUsername, error: usernameCheckError } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', data.username)
      .maybeSingle()

    if (usernameCheckError) {
      console.error('Username check error:', usernameCheckError)
      return {
        success: false,
        error: 'Database error occurred. Please try again.'
      }
    }

    if (existingUsername) {
      return {
        success: false,
        error: 'This username is already taken. Please choose a different username.'
      }
    }

    // 3. Create the user account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/auth/callback`,
        data: {
          full_name: data.fullName,
          username: data.username,
        }
      }
    })

    if (authError) {
      console.error('Auth signup error:', authError)
      return {
        success: false,
        error: authError.message || 'Failed to create account. Please try again.'
      }
    }

    if (!authData.user) {
      return {
        success: false,
        error: 'Failed to create account. Please try again.'
      }
    }

    // 4. Create the profile record
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: data.email,
        username: data.username,
        full_name: data.fullName,
        subscription_tier: 'free',
        subscription_status: 'active'
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Don't fail the registration if profile creation fails
      // The profile can be created later
    }

    console.log('Registration successful for:', data.email)

    return {
      success: true,
      message: 'Account created successfully! Please check your email to verify your account.'
    }

  } catch (error) {
    console.error('Registration error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    }
  }
}

/**
 * Sign in user
 */
export async function loginUser(email: string, password: string): Promise<AuthResult> {
  if (!supabase) {
    return {
      success: false,
      error: 'Authentication service is not available'
    }
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Login error:', error)
      
      if (error.message.includes('Invalid login credentials')) {
        return {
          success: false,
          error: 'Invalid email or password. Please check your credentials and try again.'
        }
      }
      
      if (error.message.includes('Email not confirmed')) {
        return {
          success: false,
          error: 'Please verify your email address before signing in. Check your inbox for the verification email.'
        }
      }
      
      return {
        success: false,
        error: error.message || 'Login failed. Please try again.'
      }
    }

    if (!data.user) {
      return {
        success: false,
        error: 'Login failed. Please try again.'
      }
    }

    return {
      success: true,
      message: 'Signed in successfully!'
    }

  } catch (error) {
    console.error('Login error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    }
  }
}