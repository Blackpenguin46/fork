/**
 * Admin Setup Utilities
 * Helper functions for setting up and managing admin users
 */

import { supabase } from '@/lib/supabase'

export interface AdminSetupResult {
  success: boolean
  message: string
  userId?: string
}

/**
 * Check if any admin users exist in the system
 */
export async function checkAdminExists(): Promise<{ hasAdmin: boolean; adminCount: number }> {
  try {
    if (!supabase) {
      return { hasAdmin: false, adminCount: 0 }
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id, role')
      .in('role', ['admin', 'super_admin'])

    if (error) {
      console.error('Error checking for admin users:', error)
      return { hasAdmin: false, adminCount: 0 }
    }

    return {
      hasAdmin: data.length > 0,
      adminCount: data.length
    }
  } catch (error) {
    console.error('Error checking for admin users:', error)
    return { hasAdmin: false, adminCount: 0 }
  }
}

/**
 * Promote an existing user to admin role
 */
export async function promoteUserToAdmin(
  userEmail: string,
  role: 'admin' | 'super_admin' = 'admin'
): Promise<AdminSetupResult> {
  try {
    if (!supabase) {
      return {
        success: false,
        message: 'Database connection not available'
      }
    }
    
    // First, check if user exists
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, email, role, full_name')
      .eq('email', userEmail)
      .single()

    if (userError || !user) {
      return {
        success: false,
        message: `User with email ${userEmail} not found. Make sure the user has registered first.`
      }
    }

    if (user.role === 'admin' || user.role === 'super_admin') {
      return {
        success: false,
        message: `User ${userEmail} is already an admin (role: ${user.role})`
      }
    }

    // Update user role
    if (!supabase) {
      return {
        success: false,
        message: 'Database connection not available'
      }
    }
    
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        role,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      return {
        success: false,
        message: `Failed to promote user: ${updateError.message}`
      }
    }

    // Log the promotion
    if (supabase) {
      await supabase.from('admin_actions').insert({
        admin_user_id: user.id, // Self-promotion for initial setup
        target_user_id: user.id,
        action: `promote_to_${role}`,
        details: {
          previous_role: user.role,
          new_role: role,
          setup_action: true,
          promoted_at: new Date().toISOString()
        }
      })
    }

    return {
      success: true,
      message: `Successfully promoted ${user.full_name || userEmail} to ${role}`,
      userId: user.id
    }

  } catch (error) {
    console.error('Error promoting user to admin:', error)
    return {
      success: false,
      message: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * Get setup instructions for creating the first admin
 */
export function getAdminSetupInstructions(): string[] {
  return [
    "1. Register a new account through the normal signup process at /auth/register",
    "2. Verify your email address by clicking the link in the verification email",
    "3. Run this command in your database or use the promote function:",
    "   UPDATE profiles SET role = 'super_admin' WHERE email = 'your-email@example.com';",
    "4. Access the admin dashboard at /admin",
    "",
    "Alternatively, you can use the promoteUserToAdmin() function:",
    "   import { promoteUserToAdmin } from '@/lib/utils/admin-setup'",
    "   await promoteUserToAdmin('your-email@example.com', 'super_admin')"
  ]
}

/**
 * Validate email format for admin setup
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Setup first admin user (for use in setup scripts)
 */
export async function setupFirstAdmin(email: string): Promise<AdminSetupResult> {
  if (!isValidEmail(email)) {
    return {
      success: false,
      message: 'Invalid email format'
    }
  }

  // Check if admin already exists
  const { hasAdmin } = await checkAdminExists()
  if (hasAdmin) {
    return {
      success: false,
      message: 'Admin users already exist in the system'
    }
  }

  // Promote the user
  return await promoteUserToAdmin(email, 'super_admin')
}

/**
 * Get admin dashboard stats for setup verification
 */
export async function getAdminDashboardStats() {
  try {
    if (!supabase) {
      return {
        success: false,
        error: 'Database connection not available'
      }
    }
    
    const { data: stats, error } = await supabase
      .from('user_stats')
      .select('*')
      .single()

    if (error) {
      throw error
    }

    return {
      success: true,
      data: stats
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get stats'
    }
  }
}