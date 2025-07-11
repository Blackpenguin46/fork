import { supabase } from '@/lib/supabase'
import type { Tag, ApiResponse } from '@/lib/types/database'

export class TagsService {
  
  /**
   * Get all tags with optional filtering
   */
  static async getTags(params?: {
    limit?: number
    page?: number
    searchQuery?: string
    sortBy?: 'name' | 'usage_count' | 'created_at'
    sortOrder?: 'asc' | 'desc'
  }): Promise<ApiResponse<Tag[]>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      let query = supabase
        .from('tags')
        .select('*')

      // Apply search filter
      if (params?.searchQuery) {
        query = query.or(`name.ilike.%${params.searchQuery}%,description.ilike.%${params.searchQuery}%`)
      }

      // Apply sorting
      const sortBy = params?.sortBy || 'usage_count'
      const sortOrder = params?.sortOrder || 'desc'
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })

      // Apply pagination
      if (params?.limit) {
        const limit = params.limit
        const page = params.page || 1
        const offset = (page - 1) * limit
        query = query.range(offset, offset + limit - 1)
      }

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
   * Get popular tags (most used)
   */
  static async getPopularTags(limit: number = 20): Promise<ApiResponse<Tag[]>> {
    return this.getTags({
      limit,
      sortBy: 'usage_count',
      sortOrder: 'desc'
    })
  }

  /**
   * Get tag by slug or ID
   */
  static async getTag(identifier: string): Promise<ApiResponse<Tag>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      // Try to get by ID first, then by slug
      let { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('id', identifier)
        .maybeSingle()

      if (!data && !error) {
        // Try by slug
        const result = await supabase
          .from('tags')
          .select('*')
          .eq('slug', identifier)
          .maybeSingle()
        
        data = result.data
        error = result.error
      }

      if (error) {
        return { success: false, error: error.message }
      }

      if (!data) {
        return { success: false, error: 'Tag not found' }
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
   * Search tags by name
   */
  static async searchTags(query: string, limit: number = 10): Promise<ApiResponse<Tag[]>> {
    return this.getTags({
      searchQuery: query,
      limit,
      sortBy: 'usage_count',
      sortOrder: 'desc'
    })
  }

  /**
   * Get resources for a specific tag
   */
  static async getResourcesByTag(
    tagId: string, 
    params?: {
      limit?: number
      page?: number
      isPremium?: boolean
    }
  ): Promise<ApiResponse<any[]>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      // Note: This would require a resource_tags junction table
      // For now, we'll search resources by tag in seo_keywords
      const tag = await this.getTag(tagId)
      if (!tag.success || !tag.data) {
        return { success: false, error: 'Tag not found' }
      }

      let query = supabase
        .from('resources')
        .select('*')
        .ilike('seo_keywords', `%${tag.data.name}%`)
        .eq('is_published', true)

      if (params?.isPremium !== undefined) {
        query = query.eq('is_premium', params.isPremium)
      }

      // Apply pagination
      const limit = params?.limit || 20
      const page = params?.page || 1
      const offset = (page - 1) * limit

      query = query
        .order('view_count', { ascending: false })
        .range(offset, offset + limit - 1)

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
   * Get trending tags (tags with recent usage growth)
   */
  static async getTrendingTags(limit: number = 10): Promise<ApiResponse<Tag[]>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      // For now, just return popular tags
      // In a full implementation, this would analyze recent resource creation with tags
      return this.getPopularTags(limit)
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Get tag cloud data (tags with usage counts for visualization)
   */
  static async getTagCloud(limit: number = 50): Promise<ApiResponse<Array<Tag & { weight: number }>>> {
    try {
      const result = await this.getPopularTags(limit)
      
      if (!result.success) {
        return result as any
      }

      const tags = result.data
      if (!tags || !tags.length) {
        return { success: true, data: [] }
      }

      // Calculate weight based on usage count (normalized 1-10)
      const maxUsage = Math.max(...tags.map(t => t.usage_count))
      const minUsage = Math.min(...tags.map(t => t.usage_count))
      const range = maxUsage - minUsage || 1

      const weightedTags = tags.map(tag => ({
        ...tag,
        weight: Math.ceil(((tag.usage_count - minUsage) / range) * 9) + 1
      }))

      return { success: true, data: weightedTags }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }
}