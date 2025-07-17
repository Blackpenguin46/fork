/**
 * Learning Management API Service
 * Handles user progress, learning paths, and achievements
 */

import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/supabase'

type UserProgress = Database['public']['Tables']['user_progress']['Row']
type UserProgressInsert = Database['public']['Tables']['user_progress']['Insert']
type UserProgressUpdate = Database['public']['Tables']['user_progress']['Update']

type LearningPath = Database['public']['Tables']['learning_paths']['Row']
type LearningPathEnrollment = Database['public']['Tables']['learning_path_enrollments']['Row']
type Achievement = Database['public']['Tables']['achievements']['Row']
type UserAchievement = Database['public']['Tables']['user_achievements']['Row']

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface DashboardStats {
  courses_started: number
  courses_completed: number
  bookmarks_count: number
  overall_progress: number
  achievements_count: number
  learning_paths_enrolled: number
  total_time_spent: number
}

export class LearningAPI {
  /**
   * Get user dashboard statistics
   */
  static async getUserDashboardStats(userId: string): Promise<ApiResponse<DashboardStats>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      const { data, error } = await supabase.rpc('get_user_dashboard_stats', {
        user_uuid: userId
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data: data?.[0] || {
        courses_started: 0,
        courses_completed: 0,
        bookmarks_count: 0,
        overall_progress: 0,
        achievements_count: 0,
        learning_paths_enrolled: 0,
        total_time_spent: 0
      }}

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Get user progress for a specific resource
   */
  static async getUserProgress(userId: string, resourceId: string): Promise<ApiResponse<UserProgress | null>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('resource_id', resourceId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        return { success: false, error: error.message }
      }

      return { success: true, data: data || null }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Update user progress
   */
  static async updateProgress(
    userId: string,
    resourceId: string,
    progressData: {
      progress_percentage?: number
      time_spent_minutes?: number
      status?: string
      notes?: string
      learning_path_id?: string
    }
  ): Promise<ApiResponse<UserProgress>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      // Get resource info
      const { data: resource } = await supabase
        .from('resources')
        .select('resource_type')
        .eq('id', resourceId)
        .single()

      if (!resource) {
        return { success: false, error: 'Resource not found' }
      }

      const updateData: UserProgressUpdate = {
        ...progressData,
        last_accessed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Mark as completed if progress is 100%
      if (progressData.progress_percentage === 100 && !progressData.status) {
        updateData.status = 'completed'
        updateData.completed_at = new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: userId,
          resource_id: resourceId,
          resource_type: resource.resource_type,
          ...updateData
        })
        .select()
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      // Check for achievements
      await this.checkAchievements(userId)

      return { success: true, data }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Get all user progress
   */
  static async getAllUserProgress(userId: string): Promise<ApiResponse<UserProgress[]>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      const { data, error } = await supabase
        .from('user_progress')
        .select(`
          *,
          resource:resources(id, title, resource_type, difficulty_level, thumbnail_url)
        `)
        .eq('user_id', userId)
        .order('last_accessed_at', { ascending: false })

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
   * Get learning paths
   */
  static async getLearningPaths(
    filters: {
      is_featured?: boolean
      difficulty_level?: string
      is_premium?: boolean
    } = {}
  ): Promise<ApiResponse<LearningPath[]>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      let query = supabase
        .from('learning_paths')
        .select('*')
        .eq('is_published', true)

      if (filters.is_featured !== undefined) {
        query = query.eq('is_featured', filters.is_featured)
      }

      if (filters.difficulty_level) {
        query = query.eq('difficulty_level', filters.difficulty_level)
      }

      if (filters.is_premium !== undefined) {
        query = query.eq('is_premium', filters.is_premium)
      }

      query = query.order('sort_order').order('created_at', { ascending: false })

      const { data, error } = await query

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
   * Get learning path with resources
   */
  static async getLearningPath(pathId: string): Promise<ApiResponse<LearningPath & { resources: any[] }>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      const { data: path, error: pathError } = await supabase
        .from('learning_paths')
        .select('*')
        .eq('id', pathId)
        .eq('is_published', true)
        .single()

      if (pathError) {
        return { success: false, error: pathError.message }
      }

      const { data: resources, error: resourcesError } = await supabase
        .from('learning_path_resources')
        .select(`
          *,
          resource:resources(*)
        `)
        .eq('learning_path_id', pathId)
        .order('sort_order')

      if (resourcesError) {
        return { success: false, error: resourcesError.message }
      }

      return {
        success: true,
        data: {
          ...path,
          resources: resources || []
        }
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Enroll in learning path
   */
  static async enrollInLearningPath(userId: string, pathId: string): Promise<ApiResponse<LearningPathEnrollment>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      const { data, error } = await supabase
        .from('learning_path_enrollments')
        .upsert({
          user_id: userId,
          learning_path_id: pathId,
          status: 'enrolled',
          progress_percentage: 0,
          started_at: new Date().toISOString(),
          last_accessed_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      // Update enrollment count
      await supabase
        .from('learning_paths')
        .update({
          enrollment_count: supabase.raw('enrollment_count + 1')
        })
        .eq('id', pathId)

      return { success: true, data }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Get user's learning path enrollments
   */
  static async getUserLearningPaths(userId: string): Promise<ApiResponse<(LearningPathEnrollment & { learning_path: LearningPath })[]>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      const { data, error } = await supabase
        .from('learning_path_enrollments')
        .select(`
          *,
          learning_path:learning_paths(*)
        `)
        .eq('user_id', userId)
        .order('last_accessed_at', { ascending: false })

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
   * Get user achievements
   */
  static async getUserAchievements(userId: string): Promise<ApiResponse<(UserAchievement & { achievement: Achievement })[]>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq('user_id', userId)
        .order('earned_at', { ascending: false })

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
   * Get all available achievements
   */
  static async getAchievements(): Promise<ApiResponse<Achievement[]>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('is_active', true)
        .order('points')

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
   * Check and award achievements
   */
  static async checkAchievements(userId: string): Promise<ApiResponse<UserAchievement[]>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      // Get user stats
      const statsResult = await this.getUserDashboardStats(userId)
      if (!statsResult.success || !statsResult.data) {
        return { success: false, error: 'Could not get user stats' }
      }

      const stats = statsResult.data

      // Get all achievements
      const { data: achievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .eq('is_active', true)

      if (achievementsError) {
        return { success: false, error: achievementsError.message }
      }

      // Get user's existing achievements
      const { data: userAchievements, error: userAchievementsError } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', userId)

      if (userAchievementsError) {
        return { success: false, error: userAchievementsError.message }
      }

      const earnedAchievementIds = new Set(userAchievements?.map(ua => ua.achievement_id) || [])
      const newAchievements: UserAchievement[] = []

      // Check each achievement
      for (const achievement of achievements || []) {
        if (earnedAchievementIds.has(achievement.id)) continue

        const criteria = achievement.criteria as any
        let earned = false

        switch (criteria.type) {
          case 'resource_completed':
          case 'resources_completed':
            earned = stats.courses_completed >= criteria.count
            break
          case 'bookmarks':
            earned = stats.bookmarks_count >= criteria.count
            break
          case 'learning_path_completed':
            // This would need additional logic to check completed learning paths
            break
          case 'total_points':
            // This would need to calculate total points from other achievements
            break
          case 'profile_complete':
            // Check if profile is complete
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, bio, avatar_url')
              .eq('id', userId)
              .single()
            earned = !!(profile?.full_name && profile?.bio && profile?.avatar_url)
            break
        }

        if (earned) {
          const { data: newAchievement, error: insertError } = await supabase
            .from('user_achievements')
            .insert({
              user_id: userId,
              achievement_id: achievement.id,
              earned_at: new Date().toISOString()
            })
            .select()
            .single()

          if (!insertError && newAchievement) {
            newAchievements.push(newAchievement)

            // Update achievement earned count
            await supabase
              .from('achievements')
              .update({
                earned_count: supabase.raw('earned_count + 1')
              })
              .eq('id', achievement.id)

            // Create notification
            await supabase
              .from('notifications')
              .insert({
                user_id: userId,
                title: 'Achievement Unlocked!',
                message: `You've earned the "${achievement.name}" achievement!`,
                type: 'achievement',
                metadata: { achievement_id: achievement.id }
              })
          }
        }
      }

      return { success: true, data: newAchievements }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

// Export convenience functions
export const getUserDashboardStats = LearningAPI.getUserDashboardStats
export const getUserProgress = LearningAPI.getUserProgress
export const updateProgress = LearningAPI.updateProgress
export const getAllUserProgress = LearningAPI.getAllUserProgress
export const getLearningPaths = LearningAPI.getLearningPaths
export const getLearningPath = LearningAPI.getLearningPath
export const enrollInLearningPath = LearningAPI.enrollInLearningPath
export const getUserLearningPaths = LearningAPI.getUserLearningPaths
export const getUserAchievements = LearningAPI.getUserAchievements
export const getAchievements = LearningAPI.getAchievements
export const checkAchievements = LearningAPI.checkAchievements