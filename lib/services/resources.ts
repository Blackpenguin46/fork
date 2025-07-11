import { supabase } from '@/lib/supabase'
import type { Resource, ApiResponse, PaginatedResponse } from '@/lib/types/database'

export class ResourcesService {
  
  /**
   * Get resources with filtering and pagination
   */
  static async getResources(params?: {
    resourceType?: string
    difficultyLevel?: string
    isPremium?: boolean
    isFeatured?: boolean
    isPublished?: boolean
    categoryId?: string
    searchQuery?: string
    limit?: number
    page?: number
    sortBy?: 'created_at' | 'updated_at' | 'title' | 'view_count' | 'like_count'
    sortOrder?: 'asc' | 'desc'
  }): Promise<ApiResponse<PaginatedResponse<Resource>>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      let query = supabase
        .from('resources')
        .select('*', { count: 'exact' })

      // Apply filters
      if (params?.resourceType) {
        query = query.eq('resource_type', params.resourceType)
      }

      if (params?.difficultyLevel) {
        query = query.eq('difficulty_level', params.difficultyLevel)
      }

      if (params?.isPremium !== undefined) {
        query = query.eq('is_premium', params.isPremium)
      }

      if (params?.isFeatured !== undefined) {
        query = query.eq('is_featured', params.isFeatured)
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
   * Get a single resource by ID or slug
   */
  static async getResource(identifier: string): Promise<ApiResponse<Resource>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      // Try to get by ID first, then by slug
      let { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('id', identifier)
        .eq('is_published', true)
        .maybeSingle()

      if (!data && !error) {
        // Try by slug
        const result = await supabase
          .from('resources')
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
        return { success: false, error: 'Resource not found' }
      }

      // Increment view count
      await this.incrementViewCount(data.id)

      return { success: true, data }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Get featured resources
   */
  static async getFeaturedResources(limit: number = 10): Promise<ApiResponse<Resource[]>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('is_featured', true)
        .eq('is_published', true)
        .order('updated_at', { ascending: false })
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
   * Get resources by type
   */
  static async getResourcesByType(
    resourceType: string, 
    limit: number = 20,
    isPremium?: boolean
  ): Promise<ApiResponse<Resource[]>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      let query = supabase
        .from('resources')
        .select('*')
        .eq('resource_type', resourceType)
        .eq('is_published', true)

      if (isPremium !== undefined) {
        query = query.eq('is_premium', isPremium)
      }

      const { data, error } = await query
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
   * Get related resources based on tags or resource type
   */
  static async getRelatedResources(
    resourceId: string, 
    limit: number = 5
  ): Promise<ApiResponse<Resource[]>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      // First get the current resource to find similar ones
      const currentResource = await this.getResource(resourceId)
      if (!currentResource.success || !currentResource.data) {
        return { success: false, error: 'Resource not found' }
      }

      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('resource_type', currentResource.data.resource_type)
        .eq('is_published', true)
        .neq('id', resourceId)
        .order('view_count', { ascending: false })
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
   * Search resources
   */
  static async searchResources(
    query: string, 
    filters?: {
      resourceType?: string
      difficultyLevel?: string
      isPremium?: boolean
    }
  ): Promise<ApiResponse<Resource[]>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      let supabaseQuery = supabase
        .from('resources')
        .select('*')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,seo_keywords.ilike.%${query}%`)
        .eq('is_published', true)

      if (filters?.resourceType) {
        supabaseQuery = supabaseQuery.eq('resource_type', filters.resourceType)
      }

      if (filters?.difficultyLevel) {
        supabaseQuery = supabaseQuery.eq('difficulty_level', filters.difficultyLevel)
      }

      if (filters?.isPremium !== undefined) {
        supabaseQuery = supabaseQuery.eq('is_premium', filters.isPremium)
      }

      const { data, error } = await supabaseQuery
        .order('view_count', { ascending: false })
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

  /**
   * Increment view count for a resource
   */
  private static async incrementViewCount(resourceId: string): Promise<void> {
    try {
      if (!supabase) return

      await supabase
        .from('resources')
        .update({ 
          view_count: supabase.rpc('increment_view_count', { resource_id: resourceId })
        })
        .eq('id', resourceId)
    } catch (error) {
      // Silently fail for view count updates
      console.warn('Failed to increment view count:', error)
    }
  }

  /**
   * Get trending resources (high view count in recent period)
   */
  static async getTrendingResources(limit: number = 10): Promise<ApiResponse<Resource[]>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('is_published', true)
        .order('view_count', { ascending: false })
        .order('like_count', { ascending: false })
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
}