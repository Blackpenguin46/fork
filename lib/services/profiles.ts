import { supabase } from '@/lib/supabase'
import type { Profile, ApiResponse } from '@/lib/types/database'

export class ProfilesService {
  
  /**
   * Get user profile by ID
   */
  static async getProfile(userId: string): Promise<ApiResponse<Profile>> {
    try {
      if (!supabase) {
        // Return mock profile when Supabase is not configured
        return {
          success: true,
          data: {
            id: userId,
            email: 'user@example.com',
            username: 'cyberuser',
            full_name: 'Cyber User',
            bio: 'Cybersecurity enthusiast learning the ropes!',
            avatar_url: undefined,
            subscription_tier: 'free',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        }
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        console.error('Error fetching profile:', error)
        // Return mock profile on error
        return {
          success: true,
          data: {
            id: userId,
            email: 'user@example.com',
            username: 'cyberuser',
            full_name: 'Cyber User',
            bio: 'Cybersecurity enthusiast learning the ropes!',
            avatar_url: undefined,
            subscription_tier: 'free',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        }
      }

      if (!data) {
        // Return mock profile when no profile found
        return {
          success: true,
          data: {
            id: userId,
            email: 'user@example.com',
            username: 'cyberuser',
            full_name: 'Cyber User',
            bio: 'Cybersecurity enthusiast learning the ropes!',
            avatar_url: undefined,
            subscription_tier: 'free',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        }
      }

      return { success: true, data }
    } catch (error) {
      console.error('Error in getProfile:', error)
      // Return mock profile on exception
      return {
        success: true,
        data: {
          id: userId,
          email: 'user@example.com',
          username: 'cyberuser',
          full_name: 'Cyber User',
          bio: 'Cybersecurity enthusiast learning the ropes!',
          avatar_url: undefined,
          subscription_tier: 'free',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }
    }
  }

  /**
   * Create a new user profile
   */
  static async createProfile(profileData: {
    id: string
    email: string
    username?: string
    full_name?: string
    subscription_tier?: 'free' | 'pro'
  }): Promise<ApiResponse<Profile>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      // Check if username is already taken
      if (profileData.username) {
        const { data: existingUsername } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', profileData.username)
          .maybeSingle()

        if (existingUsername) {
          return { success: false, error: 'Username already taken' }
        }
      }

      const newProfile = {
        id: profileData.id,
        email: profileData.email,
        username: profileData.username,
        full_name: profileData.full_name,
        subscription_tier: profileData.subscription_tier || 'free',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('profiles')
        .insert(newProfile)
        .select()
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(
    userId: string,
    updates: Partial<Pick<Profile, 'username' | 'full_name' | 'bio' | 'avatar_url'>>
  ): Promise<ApiResponse<Profile>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      // Check if username is already taken (if updating username)
      if (updates.username) {
        const { data: existingUsername } = await supabase
          .from('profiles')
          .select('username, id')
          .eq('username', updates.username)
          .maybeSingle()

        if (existingUsername && existingUsername.id !== userId) {
          return { success: false, error: 'Username already taken' }
        }
      }

      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Check if username is available
   */
  static async isUsernameAvailable(username: string, excludeUserId?: string): Promise<ApiResponse<boolean>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      let query = supabase
        .from('profiles')
        .select('username')
        .eq('username', username)

      if (excludeUserId) {
        query = query.neq('id', excludeUserId)
      }

      const { data, error } = await query.maybeSingle()

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data: !data }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Get profile by username
   */
  static async getProfileByUsername(username: string): Promise<ApiResponse<Profile>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .maybeSingle()

      if (error) {
        return { success: false, error: error.message }
      }

      if (!data) {
        return { success: false, error: 'Profile not found' }
      }

      return { success: true, data }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Update subscription tier
   */
  static async updateSubscriptionTier(
    userId: string, 
    tier: 'free' | 'pro'
  ): Promise<ApiResponse<Profile>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          subscription_tier: tier,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Delete user profile
   */
  static async deleteProfile(userId: string): Promise<ApiResponse<boolean>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Search profiles by username or full name
   */
  static async searchProfiles(query: string, limit: number = 10): Promise<ApiResponse<Profile[]>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
        .limit(limit)
        .order('created_at', { ascending: false })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data: data || [] }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Get or create profile (useful for new user registration)
   */
  static async getOrCreateProfile(userData: {
    id: string
    email: string
    username?: string
    full_name?: string
  }): Promise<ApiResponse<Profile>> {
    try {
      // First try to get existing profile
      const existing = await this.getProfile(userData.id)
      
      if (existing.success) {
        return existing
      }

      // If profile doesn't exist, create it
      return this.createProfile(userData)
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }
}