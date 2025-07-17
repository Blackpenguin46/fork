/**
 * Enhanced Resources API Service
 * Comprehensive resource management with advanced search and filtering
 */

import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/supabase'

type Resource = Database['public']['Tables']['resources']['Row']
type ResourceInsert = Database['public']['Tables']['resources']['Insert']
type ResourceUpdate = Database['public']['Tables']['resources']['Update']

export interface ResourceFilters {
  resource_type?: string[]
  difficulty_level?: string[]
  is_premium?: boolean
  is_featured?: boolean
  is_published?: boolean
  category_ids?: string[]
  tags?: string[]
  search?: string
  author_id?: string
  created_after?: string
  created_before?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export class ResourcesAPI {
  /**
   * Get resources with advanced filtering and pagination
   */
  static async getResources(
    filters: ResourceFilters = {},
    page: number = 1,
    limit: number = 20,
    sortBy: string = 'created_at',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<ApiResponse<PaginatedResponse<Resource>>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      // Use the advanced search function for complex queries
      if (filters.search || filters.resource_type || filters.difficulty_level || filters.tags) {
        const { data, error } = await supabase.rpc('search_resources_advanced', {
          search_query: filters.search || null,
          resource_types: filters.resource_type || null,
          difficulty_levels: filters.difficulty_level || null,
          is_premium_filter: filters.is_premium,
          category_ids_filter: filters.category_ids || null,
          tags_filter: filters.tags || null,
          result_limit: limit,
          result_offset: (page - 1) * limit
        })

        if (error) {
          return { success: false, error: error.message }
        }

        // Get total count for pagination
        const { count } = await supabase
          .from('resources')
          .select('*', { count: 'exact', head: true })
          .eq('is_published', true)

        const totalPages = Math.ceil((count || 0) / limit)

        return {
          success: true,
          data: {
            data: data || [],
            total: count || 0,
            page,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        }
      }

      // Simple query for basic filtering
      let query = supabase
        .from('resources')
        .select('*', { count: 'exact' })

      // Apply filters
      if (filters.is_published !== undefined) {
        query = query.eq('is_published', filters.is_published)
      } else {
        query = query.eq('is_published', true) // Default to published only
      }

      if (filters.is_featured !== undefined) {
        query = query.eq('is_featured', filters.is_featured)
      }

      if (filters.is_premium !== undefined) {
        query = query.eq('is_premium', filters.is_premium)
      }

      if (filters.author_id) {
        query = query.eq('author_id', filters.author_id)
      }

      if (filters.created_after) {
        query = query.gte('created_at', filters.created_after)
      }

      if (filters.created_before) {
        query = query.lte('created_at', filters.created_before)
      }

      // Sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })

      // Pagination
      const offset = (page - 1) * limit
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) {
        return { success: false, error: error.message }
      }

      const totalPages = Math.ceil((count || 0) / limit)

      return {
        success: true,
        data: {
          data: data || [],
          total: count || 0,
          page,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
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
   * Get single resource by ID or slug
   */
  static async getResource(identifier: string, bySlug: boolean = false): Promise<ApiResponse<Resource>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      const column = bySlug ? 'slug' : 'id'
      
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq(column, identifier)
        .eq('is_published', true)
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      if (!data) {
        return { success: false, error: 'Resource not found' }
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
   * Get featured resources for homepage
   */
  static async getFeaturedResources(limit: number = 6): Promise<ApiResponse<Resource[]>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('is_published', true)
        .eq('is_featured', true)
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
   * Get resources by type
   */
  static async getResourcesByType(
    resourceType: string,
    limit: number = 20,
    page: number = 1
  ): Promise<ApiResponse<PaginatedResponse<Resource>>> {
    return this.getResources(
      { resource_type: [resourceType] },
      page,
      limit
    )
  }

  /**
   * Get popular resources
   */
  static async getPopularResources(limit: number = 10): Promise<ApiResponse<Resource[]>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('is_published', true)
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
   * Get recent resources
   */
  static async getRecentResources(limit: number = 10): Promise<ApiResponse<Resource[]>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('is_published', true)
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
   * Track resource view
   */
  static async trackView(resourceId: string, userId?: string): Promise<ApiResponse<boolean>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      // Increment view count
      const { error: updateError } = await supabase
        .from('resources')
        .update({
          view_count: supabase.raw('view_count + 1')
        })
        .eq('id', resourceId)

      if (updateError) {
        return { success: false, error: updateError.message }
      }

      // Track individual view if user is logged in
      if (userId) {
        await supabase
          .from('resource_views')
          .insert({
            resource_id: resourceId,
            user_id: userId,
            viewed_at: new Date().toISOString()
          })
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
   * Get resource statistics
   */
  static async getResourceStats(): Promise<ApiResponse<any>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      const { data, error } = await supabase
        .from('resources')
        .select('resource_type, difficulty_level, is_premium, is_published')

      if (error) {
        return { success: false, error: error.message }
      }

      const stats = {
        total: data?.length || 0,
        published: data?.filter(r => r.is_published).length || 0,
        unpublished: data?.filter(r => !r.is_published).length || 0,
        premium: data?.filter(r => r.is_premium).length || 0,
        byType: {} as Record<string, number>,
        byDifficulty: {} as Record<string, number>
      }

      // Count by type
      data?.forEach(resource => {
        stats.byType[resource.resource_type] = (stats.byType[resource.resource_type] || 0) + 1
        if (resource.difficulty_level) {
          stats.byDifficulty[resource.difficulty_level] = (stats.byDifficulty[resource.difficulty_level] || 0) + 1
        }
      })

      return { success: true, data: stats }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

// Export convenience functions
export const getResources = ResourcesAPI.getResources
export const getResource = ResourcesAPI.getResource
export const getFeaturedResources = ResourcesAPI.getFeaturedResources
export const getResourcesByType = ResourcesAPI.getResourcesByType
export const getPopularResources = ResourcesAPI.getPopularResources
export const getRecentResources = ResourcesAPI.getRecentResources
export const trackResourceView = ResourcesAPI.trackView
export const getResourceStats = ResourcesAPI.getResourceStats