/**
 * Supabase Auth Helper Functions
 * Re-exports key authentication functions for easier imports
 */

import { AuthService } from '@/lib/services/auth'

// Re-export commonly used auth functions
export const updatePassword = AuthService.updatePassword
export const resetPassword = AuthService.resetPassword
export const resendVerification = AuthService.resendVerification
export const login = AuthService.login
export const register = AuthService.register
export const logout = AuthService.logout
export const getCurrentUser = AuthService.getCurrentUser
export const checkUserExists = AuthService.checkUserExists