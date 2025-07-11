/**
 * Enhanced Authentication Service
 * Handles user authentication, registration, and admin functions
 */

import { supabase } from '@/lib/supabase'
import type { ApiResponse } from '@/lib/api'

export interface AuthUser {
  id: string
  email: string
  email_confirmed_at?: string
  created_at: string
  user_metadata?: {
    full_name?: string
    username?: string
  }
}

export interface UserProfile {
  id: string
  email: string
  username: string
  full_name: string
  role: 'user' | 'admin' | 'super_admin'
  subscription_tier: 'free' | 'premium' | 'enterprise'
  subscription_status: 'active' | 'cancelled' | 'expired' | 'trial'
  avatar_url?: string
  bio?: string
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export interface AuthAuditLog {
  id: string
  user_id: string
  action: string
  details: Record<string, any>
  ip_address?: string
  user_agent?: string
  success: boolean
  error_message?: string
  created_at: string
}

export interface RegistrationData {
  email: string
  password: string
  username: string
  full_name: string
}

export interface LoginData {
  email: string
  password: string
}

export interface UserExistsCheck {
  email_exists: boolean
  username_exists: boolean
  user_id?: string
}

export class AuthService {
  /**
   * Register a new user with enhanced validation
   */
  static async register(data: RegistrationData): Promise<ApiResponse<{ user: AuthUser; needsVerification: boolean }>> {
    try {
      // First, check if user already exists
      const existsCheck = await this.checkUserExists(data.email, data.username)
      if (!existsCheck.success) {
        return { success: false, error: existsCheck.error || 'Failed to check user existence' }
      }

      if (existsCheck.data && existsCheck.data.email_exists) {
        return {
          success: false,
          error: 'An account with this email already exists'
        }
      }

      if (existsCheck.data && existsCheck.data.username_exists) {
        return {
          success: false,
          error: 'This username is already taken'
        }
      }

      // Register with Supabase Auth
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }
      
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
            username: data.username
          }
        }
      })

      if (error) {
        await this.logAuthAttempt(null, 'registration_failed', { email: data.email }, false, error.message)
        return {
          success: false,
          error: error.message
        }
      }

      if (!authData.user) {
        return {
          success: false,
          error: 'Registration failed - no user returned'
        }
      }

      // The profile will be automatically created by the database trigger
      await this.logAuthAttempt(
        authData.user.id, 
        'registration_successful', 
        { 
          email: data.email, 
          username: data.username,
          needs_verification: !authData.user.email_confirmed_at 
        }
      )

      return {
        success: true,
        data: {
          user: authData.user as AuthUser,
          needsVerification: !authData.user.email_confirmed_at
        }
      }

    } catch (error) {
      console.error('Registration error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }
    }
  }

  /**
   * Login user with audit logging
   */
  static async login(data: LoginData): Promise<ApiResponse<{ user: AuthUser; profile: UserProfile }>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }
      
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      })

      if (error) {
        await this.logAuthAttempt(null, 'login_failed', { email: data.email }, false, error.message)
        return {
          success: false,
          error: error.message
        }
      }

      if (!authData.user) {
        return {
          success: false,
          error: 'Login failed - no user returned'
        }
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      if (profileError || !profile) {
        await this.logAuthAttempt(authData.user.id, 'login_failed', { email: data.email }, false, 'Profile not found')
        return {
          success: false,
          error: 'User profile not found'
        }
      }

      await this.logAuthAttempt(authData.user.id, 'login_successful', { email: data.email })

      return {
        success: true,
        data: {
          user: authData.user as AuthUser,
          profile: profile as UserProfile
        }
      }

    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }
    }
  }

  /**
   * Logout user with audit logging
   */
  static async logout(): Promise<ApiResponse<boolean>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }
      
      const { data: { user } } = await supabase.auth.getUser()
      const userId = user?.id

      const { error } = await supabase.auth.signOut()

      if (error) {
        if (userId) {
          await this.logAuthAttempt(userId, 'logout_failed', {}, false, error.message)
        }
        return {
          success: false,
          error: error.message
        }
      }

      if (userId) {
        await this.logAuthAttempt(userId, 'logout_successful', {})
      }

      return {
        success: true,
        data: true
      }

    } catch (error) {
      console.error('Logout error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }
    }
  }

  /**
   * Check if user exists by email or username
   */
  static async checkUserExists(email?: string, username?: string): Promise<ApiResponse<UserExistsCheck>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }
      
      const { data, error } = await supabase
        .rpc('check_user_exists', {
          email_input: email || null,
          username_input: username || null
        })

      if (error) {
        return {
          success: false,
          error: error.message
        }
      }

      return {
        success: true,
        data: data[0] as UserExistsCheck
      }

    } catch (error) {
      console.error('Check user exists error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(email: string): Promise<ApiResponse<boolean>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })

      if (error) {
        await this.logAuthAttempt(null, 'password_reset_failed', { email }, false, error.message)
        return {
          success: false,
          error: error.message
        }
      }

      await this.logAuthAttempt(null, 'password_reset_requested', { email })

      return {
        success: true,
        data: true
      }

    } catch (error) {
      console.error('Reset password error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }
    }
  }

  /**
   * Update password
   */
  static async updatePassword(newPassword: string): Promise<ApiResponse<boolean>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return {
          success: false,
          error: 'Not authenticated'
        }
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        await this.logAuthAttempt(user.id, 'password_update_failed', {}, false, error.message)
        return {
          success: false,
          error: error.message
        }
      }

      await this.logAuthAttempt(user.id, 'password_updated', {})

      return {
        success: true,
        data: true
      }

    } catch (error) {
      console.error('Update password error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }
    }
  }

  /**
   * Resend email verification
   */
  static async resendVerification(email: string): Promise<ApiResponse<boolean>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      })

      if (error) {
        await this.logAuthAttempt(null, 'verification_resend_failed', { email }, false, error.message)
        return {
          success: false,
          error: error.message
        }
      }

      await this.logAuthAttempt(null, 'verification_resent', { email })

      return {
        success: true,
        data: true
      }

    } catch (error) {
      console.error('Resend verification error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }
    }
  }

  /**
   * Get current user with profile
   */
  static async getCurrentUser(): Promise<ApiResponse<{ user: AuthUser; profile: UserProfile } | null>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }
      
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error) {
        return {
          success: false,
          error: error.message
        }
      }

      if (!user) {
        return {
          success: true,
          data: null
        }
      }

      // Only return user if email is confirmed
      if (!user.email_confirmed_at) {
        return {
          success: true,
          data: null
        }
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError || !profile) {
        return {
          success: false,
          error: 'User profile not found'
        }
      }

      return {
        success: true,
        data: {
          user: user as AuthUser,
          profile: profile as UserProfile
        }
      }

    } catch (error) {
      console.error('Get current user error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }
    }
  }

  /**
   * Log authentication attempts for audit purposes
   */
  private static async logAuthAttempt(
    userId: string | null,
    action: string,
    details: Record<string, any> = {},
    success: boolean = true,
    errorMessage?: string
  ): Promise<void> {
    try {
      if (!supabase) {
        return
      }
      
      // Get client info
      const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : undefined

      await supabase
        .from('auth_audit_log')
        .insert({
          user_id: userId,
          action,
          details,
          user_agent: userAgent,
          success,
          error_message: errorMessage
        })
    } catch (error) {
      // Don't throw errors for audit logging failures
      console.error('Audit log error:', error)
    }
  }

  /**
   * Get auth audit logs for a user (admin function)
   */
  static async getAuthAuditLogs(
    userId?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<ApiResponse<AuthAuditLog[]>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }
      
      let query = supabase
        .from('auth_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query

      if (error) {
        return {
          success: false,
          error: error.message
        }
      }

      return {
        success: true,
        data: data as AuthAuditLog[]
      }

    } catch (error) {
      console.error('Get audit logs error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }
    }
  }

  /**
   * Admin function: Promote user to admin
   */
  static async promoteToAdmin(
    targetUserId: string,
    newRole: 'admin' | 'super_admin' = 'admin'
  ): Promise<ApiResponse<boolean>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return {
          success: false,
          error: 'Not authenticated'
        }
      }

      const { data, error } = await supabase
        .rpc('promote_to_admin', {
          target_user_id: targetUserId,
          admin_user_id: user.id,
          new_role: newRole
        })

      if (error) {
        return {
          success: false,
          error: error.message
        }
      }

      return {
        success: true,
        data: true
      }

    } catch (error) {
      console.error('Promote to admin error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }
    }
  }

  /**
   * Admin function: Get user statistics
   */
  static async getUserStats(): Promise<ApiResponse<{
    total_users: number
    admin_count: number
    super_admin_count: number
    free_users: number
    premium_users: number
    enterprise_users: number
    new_users_week: number
    new_users_month: number
  }>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }
      
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .single()

      if (error) {
        return {
          success: false,
          error: error.message
        }
      }

      return {
        success: true,
        data: data
      }

    } catch (error) {
      console.error('Get user stats error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }
    }
  }

  /**
   * Admin function: Get recent user activity
   */
  static async getRecentUserActivity(limit: number = 50): Promise<ApiResponse<any[]>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }
      
      const { data, error } = await supabase
        .from('recent_user_activity')
        .select('*')
        .limit(limit)

      if (error) {
        return {
          success: false,
          error: error.message
        }
      }

      return {
        success: true,
        data: data || []
      }

    } catch (error) {
      console.error('Get recent user activity error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }
    }
  }
}