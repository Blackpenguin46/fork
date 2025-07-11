import { supabase } from '@/lib/supabase'
import type { LearningPath, ApiResponse, PaginatedResponse } from '@/lib/types/database'

export class LearningPathsService {
  
  /**
   * Get learning paths with filtering and pagination
   */
  static async getLearningPaths(params?: {
    difficultyLevel?: string
    isPremium?: boolean
    isPublished?: boolean
    searchQuery?: string
    limit?: number
    page?: number
    sortBy?: 'created_at' | 'title' | 'difficulty_level'
    sortOrder?: 'asc' | 'desc'
  }): Promise<ApiResponse<PaginatedResponse<LearningPath>>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      let query = supabase
        .from('learning_paths')
        .select('*', { count: 'exact' })

      // Apply filters
      if (params?.difficultyLevel) {
        query = query.eq('difficulty_level', params.difficultyLevel)
      }

      if (params?.isPremium !== undefined) {
        query = query.eq('is_premium', params.isPremium)
      }

      if (params?.isPublished !== undefined) {
        query = query.eq('is_published', params.isPublished)
      }

      // Search functionality
      if (params?.searchQuery) {
        query = query.or(`title.ilike.%${params.searchQuery}%,description.ilike.%${params.searchQuery}%`)
      }

      // Sorting
      const sortBy = params?.sortBy || 'created_at'
      const sortOrder = params?.sortOrder || 'desc'
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })

      // Apply pagination
      const limit = params?.limit || 20
      const page = params?.page || 1
      const offset = (page - 1) * limit

      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) {
        return { success: false, error: error.message }
      }

      const totalPages = count ? Math.ceil(count / limit) : 0

      return {
        success: true,
        data: {
          data: data || [],
          count: count || 0,
          totalPages,
          currentPage: page,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
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
   * Get a single learning path by ID or slug
   */
  static async getLearningPath(identifier: string): Promise<ApiResponse<LearningPath>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      // Try to get by ID first, then by slug
      let { data, error } = await supabase
        .from('learning_paths')
        .select('*')
        .eq('id', identifier)
        .eq('is_published', true)
        .maybeSingle()

      if (!data && !error) {
        // Try by slug
        const result = await supabase
          .from('learning_paths')
          .select('*')
          .eq('slug', identifier)
          .eq('is_published', true)
          .maybeSingle()
        
        data = result.data
        error = result.error
      }

      if (error) {
        return { success: false, error: error.message }
      }

      if (!data) {
        return { success: false, error: 'Learning path not found' }
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
   * Get featured learning paths
   */
  static async getFeaturedLearningPaths(limit: number = 6): Promise<ApiResponse<LearningPath[]>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      const { data, error } = await supabase
        .from('learning_paths')
        .select('*')
        .eq('is_published', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })
        .limit(limit)

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
   * Get learning paths by difficulty level
   */
  static async getLearningPathsByDifficulty(
    difficultyLevel: string,
    limit: number = 10
  ): Promise<ApiResponse<LearningPath[]>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      const { data, error } = await supabase
        .from('learning_paths')
        .select('*')
        .eq('difficulty_level', difficultyLevel)
        .eq('is_published', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })
        .limit(limit)

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
   * Get recommended learning paths for user based on their progress
   */
  static async getRecommendedPaths(
    userId: string,
    limit: number = 5
  ): Promise<ApiResponse<LearningPath[]>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      // For now, return featured paths for beginners
      // In a full implementation, this would analyze user progress and preferences
      const { data, error } = await supabase
        .from('learning_paths')
        .select('*')
        .eq('is_published', true)
        .eq('difficulty_level', 'beginner')
        .order('sort_order', { ascending: true })
        .limit(limit)

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
   * Get user's progress on a learning path
   */
  static async getPathProgress(
    userId: string,
    learningPathId: string
  ): Promise<ApiResponse<{
    totalResources: number
    completedResources: number
    inProgressResources: number
    progressPercentage: number
    lastAccessedAt?: string
  }>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      // Get progress records for this learning path
      const { data: progressData, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('learning_path_id', learningPathId)

      if (error) {
        return { success: false, error: error.message }
      }

      const progress = progressData || []
      const totalResources = progress.length
      const completedResources = progress.filter(p => p.status === 'completed').length
      const inProgressResources = progress.filter(p => p.status === 'in_progress').length
      const progressPercentage = totalResources > 0 ? (completedResources / totalResources) * 100 : 0

      // Get last accessed date
      const sortedProgress = progress
        .filter(p => p.last_accessed_at)
        .sort((a, b) => new Date(b.last_accessed_at!).getTime() - new Date(a.last_accessed_at!).getTime())
      
      const lastAccessedAt = sortedProgress.length > 0 ? sortedProgress[0].last_accessed_at! : undefined

      return {
        success: true,
        data: {
          totalResources,
          completedResources,
          inProgressResources,
          progressPercentage,
          lastAccessedAt
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
   * Start a learning path for a user
   */
  static async startLearningPath(
    userId: string,
    learningPathId: string
  ): Promise<ApiResponse<{ message: string }>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      // Check if path exists and is published
      const pathResult = await this.getLearningPath(learningPathId)
      if (!pathResult.success) {
        return pathResult as any
      }

      // Create initial progress record for the learning path
      const { error } = await supabase
        .from('user_progress')
        .insert({
          user_id: userId,
          learning_path_id: learningPathId,
          progress_percentage: 0,
          status: 'in_progress',
          time_spent_minutes: 0
        })

      if (error && !error.message.includes('duplicate')) {
        return { success: false, error: error.message }
      }

      return { 
        success: true, 
        data: { message: 'Learning path started successfully' }
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Search learning paths
   */
  static async searchLearningPaths(
    query: string,
    filters?: {
      difficultyLevel?: string
      isPremium?: boolean
    }
  ): Promise<ApiResponse<LearningPath[]>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      let supabaseQuery = supabase
        .from('learning_paths')
        .select('*')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .eq('is_published', true)

      if (filters?.difficultyLevel) {
        supabaseQuery = supabaseQuery.eq('difficulty_level', filters.difficultyLevel)
      }

      if (filters?.isPremium !== undefined) {
        supabaseQuery = supabaseQuery.eq('is_premium', filters.isPremium)
      }

      const { data, error } = await supabaseQuery
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })
        .limit(20)

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
}