/**
 * Bookmarks API Service
 * Handles user bookmarks and collections
 */

import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/supabase'

type UserBookmark = Database['public']['Tables']['user_bookmarks']['Row']
type UserBookmarkInsert = Database['public']['Tables']['user_bookmarks']['Insert']
type UserBookmarkUpdate = Database['public']['Tables']['user_bookmarks']['Update']

type BookmarkCollection = Database['public']['Tables']['bookmark_collections']['Row']
type BookmarkCollectionInsert = Database['public']['Tables']['bookmark_collections']['Insert']
type BookmarkCollectionUpdate = Database['public']['Tables']['bookmark_collections']['Update']

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface BookmarkWithResource extends UserBookmark {
  resource: {
    id: string
    title: string
    description: string
    resource_type: string
    difficulty_level: string
    thumbnail_url: string
    url: string
  }
}

export class BookmarksAPI {
  /**
   * Get user bookmarks
   */
  static async getUserBookmarks(
    userId: string,
    collectionId?: string
  ): Promise<ApiResponse<BookmarkWithResource[]>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      let query = supabase
        .from('user_bookmarks')
        .select(`
          *,
          resource:resources(
            id,
            title,
            description,
            resource_type,
            difficulty_level,
            thumbnail_url,
            url
          )
        `)
        .eq('user_id', userId)

      if (collectionId) {
        query = query.eq('collection_id', collectionId)
      }

      query = query.order('created_at', { ascending: false })

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
   * Add bookmark
   */
  static async addBookmark(
    userId: string,
    resourceId: string,
    collectionId?: string,
    notes?: string,
    tags?: string[]
  ): Promise<ApiResponse<UserBookmark>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      const { data, error } = await supabase
        .from('user_bookmarks')
        .insert({
          user_id: userId,
          resource_id: resourceId,
          collection_id: collectionId || null,
          notes: notes || null,
          tags: tags || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      // Update resource bookmark count
      await supabase
        .from('resources')
        .update({
          bookmark_count: supabase.raw('bookmark_count + 1')
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
        .from('user_bookmarks')
        .delete()
        .eq('user_id', userId)
        .eq('resource_id', resourceId)

      if (error) {
        return { success: false, error: error.message }
      }

      // Update resource bookmark count
      await supabase
        .from('resources')
        .update({
          bookmark_count: supabase.raw('bookmark_count - 1')
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
   * Update bookmark
   */
  static async updateBookmark(
    userId: string,
    resourceId: string,
    updates: {
      collection_id?: string | null
      notes?: string | null
      tags?: string[]
    }
  ): Promise<ApiResponse<UserBookmark>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      const { data, error } = await supabase
        .from('user_bookmarks')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('resource_id', resourceId)
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
   * Check if resource is bookmarked
   */
  static async isBookmarked(userId: string, resourceId: string): Promise<ApiResponse<boolean>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      const { data, error } = await supabase
        .from('user_bookmarks')
        .select('id')
        .eq('user_id', userId)
        .eq('resource_id', resourceId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
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
   * Get bookmark collections
   */
  static async getCollections(userId: string): Promise<ApiResponse<BookmarkCollection[]>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      const { data, error } = await supabase
        .from('bookmark_collections')
        .select('*')
        .eq('user_id', userId)
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
   * Create bookmark collection
   */
  static async createCollection(
    userId: string,
    name: string,
    description?: string,
    color?: string,
    isPublic?: boolean
  ): Promise<ApiResponse<BookmarkCollection>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      const { data, error } = await supabase
        .from('bookmark_collections')
        .insert({
          user_id: userId,
          name,
          description: description || null,
          color: color || '#6B7280',
          is_public: isPublic || false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
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
   * Update bookmark collection
   */
  static async updateCollection(
    userId: string,
    collectionId: string,
    updates: {
      name?: string
      description?: string | null
      color?: string
      is_public?: boolean
    }
  ): Promise<ApiResponse<BookmarkCollection>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      const { data, error } = await supabase
        .from('bookmark_collections')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', collectionId)
        .eq('user_id', userId)
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
   * Delete bookmark collection
   */
  static async deleteCollection(userId: string, collectionId: string): Promise<ApiResponse<boolean>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      // First, remove collection_id from bookmarks in this collection
      await supabase
        .from('user_bookmarks')
        .update({ collection_id: null })
        .eq('user_id', userId)
        .eq('collection_id', collectionId)

      // Then delete the collection
      const { error } = await supabase
        .from('bookmark_collections')
        .delete()
        .eq('id', collectionId)
        .eq('user_id', userId)

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
   * Get bookmark statistics
   */
  static async getBookmarkStats(userId: string): Promise<ApiResponse<{
    total: number
    byType: Record<string, number>
    byCollection: Record<string, number>
    recentlyAdded: number
  }>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      const { data: bookmarks, error } = await supabase
        .from('user_bookmarks')
        .select(`
          *,
          resource:resources(resource_type),
          collection:bookmark_collections(name)
        `)
        .eq('user_id', userId)

      if (error) {
        return { success: false, error: error.message }
      }

      const stats = {
        total: bookmarks?.length || 0,
        byType: {} as Record<string, number>,
        byCollection: {} as Record<string, number>,
        recentlyAdded: 0
      }

      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

      bookmarks?.forEach(bookmark => {
        // Count by resource type
        const resourceType = (bookmark as any).resource?.resource_type
        if (resourceType) {
          stats.byType[resourceType] = (stats.byType[resourceType] || 0) + 1
        }

        // Count by collection
        const collectionName = (bookmark as any).collection?.name || 'Uncategorized'
        stats.byCollection[collectionName] = (stats.byCollection[collectionName] || 0) + 1

        // Count recently added
        if (new Date(bookmark.created_at) > oneWeekAgo) {
          stats.recentlyAdded++
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
export const getUserBookmarks = BookmarksAPI.getUserBookmarks
export const addBookmark = BookmarksAPI.addBookmark
export const removeBookmark = BookmarksAPI.removeBookmark
export const updateBookmark = BookmarksAPI.updateBookmark
export const isBookmarked = BookmarksAPI.isBookmarked
export const getCollections = BookmarksAPI.getCollections
export const createCollection = BookmarksAPI.createCollection
export const updateCollection = BookmarksAPI.updateCollection
export const deleteCollection = BookmarksAPI.deleteCollection
export const getBookmarkStats = BookmarksAPI.getBookmarkStats