import { supabase } from '@/lib/supabase'
import type { Bookmark, ApiResponse } from '@/lib/types/database'

export class BookmarksService {
  
  /**
   * Get user's bookmarks
   */
  static async getUserBookmarks(
    userId: string,
    params?: {
      limit?: number
      page?: number
    }
  ): Promise<ApiResponse<{ bookmarks: Bookmark[]; resources: any[] }>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      const limit = params?.limit || 20
      const page = params?.page || 1
      const offset = (page - 1) * limit

      // Get bookmarks with associated resource data
      const { data, error } = await supabase
        .from('bookmarks')
        .select(`
          *,
          resources (
            id,
            title,
            slug,
            description,
            resource_type,
            url,
            thumbnail_url,
            difficulty_level,
            estimated_time_minutes,
            is_premium,
            is_featured,
            view_count,
            like_count
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        return { success: false, error: error.message }
      }

      const bookmarks = data?.map(item => ({
        id: item.id,
        user_id: item.user_id,
        resource_id: item.resource_id,
        created_at: item.created_at
      })) || []

      const resources = data?.map(item => item.resources).filter(Boolean) || []

      return { 
        success: true, 
        data: { bookmarks, resources }
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Check if resource is bookmarked by user
   */
  static async isBookmarked(userId: string, resourceId: string): Promise<ApiResponse<boolean>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      const { data, error } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', userId)
        .eq('resource_id', resourceId)
        .maybeSingle()

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data: !!data }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Add bookmark
   */
  static async addBookmark(userId: string, resourceId: string): Promise<ApiResponse<Bookmark>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      // Check if already bookmarked
      const existingCheck = await this.isBookmarked(userId, resourceId)
      if (existingCheck.success && existingCheck.data) {
        return { success: false, error: 'Resource already bookmarked' }
      }

      const { data, error } = await supabase
        .from('bookmarks')
        .insert({
          user_id: userId,
          resource_id: resourceId
        })
        .select()
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      // Update bookmark count on resource
      await supabase
        .from('resources')
        .update({ 
          bookmark_count: supabase.rpc('increment_bookmark_count', { resource_id: resourceId })
        })
        .eq('id', resourceId)

      return { success: true, data }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Remove bookmark
   */
  static async removeBookmark(userId: string, resourceId: string): Promise<ApiResponse<boolean>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', userId)
        .eq('resource_id', resourceId)

      if (error) {
        return { success: false, error: error.message }
      }

      // Update bookmark count on resource
      await supabase
        .from('resources')
        .update({ 
          bookmark_count: supabase.rpc('decrement_bookmark_count', { resource_id: resourceId })
        })
        .eq('id', resourceId)

      return { success: true, data: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Toggle bookmark status
   */
  static async toggleBookmark(userId: string, resourceId: string): Promise<ApiResponse<{ isBookmarked: boolean }>> {
    try {
      const isBookmarkedResult = await this.isBookmarked(userId, resourceId)
      
      if (!isBookmarkedResult.success) {
        return isBookmarkedResult as any
      }

      if (isBookmarkedResult.data) {
        const removeResult = await this.removeBookmark(userId, resourceId)
        if (!removeResult.success) {
          return removeResult as any
        }
        return { success: true, data: { isBookmarked: false } }
      } else {
        const addResult = await this.addBookmark(userId, resourceId)
        if (!addResult.success) {
          return addResult as any
        }
        return { success: true, data: { isBookmarked: true } }
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Get bookmark statistics for user
   */
  static async getBookmarkStats(userId: string): Promise<ApiResponse<{
    totalBookmarks: number
    bookmarksByType: Record<string, number>
    recentBookmarks: number
  }>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      const { data, error } = await supabase
        .from('bookmarks')
        .select(`
          *,
          resources (resource_type)
        `)
        .eq('user_id', userId)

      if (error) {
        return { success: false, error: error.message }
      }

      const bookmarks = data || []
      const totalBookmarks = bookmarks.length

      // Count by resource type
      const bookmarksByType: Record<string, number> = {}
      bookmarks.forEach(bookmark => {
        const type = (bookmark.resources as any)?.resource_type || 'unknown'
        bookmarksByType[type] = (bookmarksByType[type] || 0) + 1
      })

      // Count recent bookmarks (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      const recentBookmarks = bookmarks.filter(
        bookmark => new Date(bookmark.created_at) > new Date(sevenDaysAgo)
      ).length

      return {
        success: true,
        data: {
          totalBookmarks,
          bookmarksByType,
          recentBookmarks
        }
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }
}