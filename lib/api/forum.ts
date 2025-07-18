/**
 * Forum API Service
 * Handles forum posts, replies, and community features
 */

import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/supabase'

type ForumCategory = Database['public']['Tables']['forum_categories']['Row']
type ForumPost = Database['public']['Tables']['forum_posts']['Row']
type ForumReply = Database['public']['Tables']['forum_replies']['Row']

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface ForumPostWithDetails extends ForumPost {
  author: {
    id: string
    username: string
    full_name: string
    avatar_url: string
    role: string
  }
  category: ForumCategory
  reply_count: number
  like_count: number
}

export interface ForumReplyWithDetails extends ForumReply {
  author: {
    id: string
    username: string
    full_name: string
    avatar_url: string
    role: string
  }
  replies?: ForumReplyWithDetails[]
}

export class ForumAPI {
  /**
   * Get forum categories
   */
  static async getCategories(): Promise<ApiResponse<ForumCategory[]>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')

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
   * Get forum posts
   */
  static async getPosts(
    categoryId?: string,
    page: number = 1,
    limit: number = 20,
    sortBy: 'created_at' | 'last_reply_at' | 'reply_count' | 'like_count' = 'last_reply_at'
  ): Promise<ApiResponse<PaginatedResponse<ForumPostWithDetails>>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      let query = supabase
        .from('forum_posts')
        .select(`
          *,
          author:profiles!forum_posts_author_id_fkey(
            id,
            username,
            full_name,
            avatar_url,
            role
          ),
          category:forum_categories(*)
        `, { count: 'exact' })

      if (categoryId) {
        query = query.eq('category_id', categoryId)
      }

      // Pinned posts first, then by sort criteria
      query = query.order('is_pinned', { ascending: false })
      query = query.order(sortBy, { ascending: false })

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
   * Get single forum post with replies
   */
  static async getPost(postId: string): Promise<ApiResponse<ForumPostWithDetails & { replies: ForumReplyWithDetails[] }>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      // Get the post
      const { data: post, error: postError } = await supabase
        .from('forum_posts')
        .select(`
          *,
          author:profiles!forum_posts_author_id_fkey(
            id,
            username,
            full_name,
            avatar_url,
            role
          ),
          category:forum_categories(*)
        `)
        .eq('id', postId)
        .single()

      if (postError) {
        return { success: false, error: postError.message }
      }

      // Get replies
      const { data: replies, error: repliesError } = await supabase
        .from('forum_replies')
        .select(`
          *,
          author:profiles!forum_replies_author_id_fkey(
            id,
            username,
            full_name,
            avatar_url,
            role
          )
        `)
        .eq('post_id', postId)
        .order('created_at')

      if (repliesError) {
        return { success: false, error: repliesError.message }
      }

      // Organize replies into threads
      const repliesMap = new Map<string, ForumReplyWithDetails>()
      const topLevelReplies: ForumReplyWithDetails[] = []

      // First pass: create all reply objects
      replies?.forEach(reply => {
        const replyWithDetails = {
          ...reply,
          replies: []
        } as ForumReplyWithDetails
        repliesMap.set(reply.id, replyWithDetails)
      })

      // Second pass: organize into threads
      replies?.forEach(reply => {
        const replyWithDetails = repliesMap.get(reply.id)!
        if (reply.parent_reply_id) {
          const parent = repliesMap.get(reply.parent_reply_id)
          if (parent) {
            parent.replies = parent.replies || []
            parent.replies.push(replyWithDetails)
          }
        } else {
          topLevelReplies.push(replyWithDetails)
        }
      })

      // Update view count
      const { data: postData } = await supabase
        .from('forum_posts')
        .select('view_count')
        .eq('id', postId)
        .single()
      
      if (postData) {
        await supabase
          .from('forum_posts')
          .update({
            view_count: (postData.view_count || 0) + 1
          })
          .eq('id', postId)
      }

      return {
        success: true,
        data: {
          ...post,
          replies: topLevelReplies
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
   * Create forum post
   */
  static async createPost(
    authorId: string,
    categoryId: string,
    title: string,
    content: string,
    tags: string[] = []
  ): Promise<ApiResponse<ForumPost>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      const { data, error } = await supabase
        .from('forum_posts')
        .insert({
          title,
          content,
          author_id: authorId,
          category_id: categoryId,
          tags,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      // Update category post count
      const { data: categoryData } = await supabase
        .from('forum_categories')
        .select('post_count')
        .eq('id', categoryId)
        .single()
      
      if (categoryData) {
        await supabase
          .from('forum_categories')
          .update({
            post_count: (categoryData.post_count || 0) + 1
          })
          .eq('id', categoryId)
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
   * Create forum reply
   */
  static async createReply(
    authorId: string,
    postId: string,
    content: string,
    parentReplyId?: string
  ): Promise<ApiResponse<ForumReply>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      const { data, error } = await supabase
        .from('forum_replies')
        .insert({
          post_id: postId,
          author_id: authorId,
          content,
          parent_reply_id: parentReplyId || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      // The trigger will automatically update the post reply count and last reply info

      return { success: true, data }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Update forum post
   */
  static async updatePost(
    postId: string,
    authorId: string,
    updates: {
      title?: string
      content?: string
      tags?: string[]
      is_solved?: boolean
    }
  ): Promise<ApiResponse<ForumPost>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      const { data, error } = await supabase
        .from('forum_posts')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', postId)
        .eq('author_id', authorId)
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
   * Delete forum post
   */
  static async deletePost(postId: string, authorId: string): Promise<ApiResponse<boolean>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      const { error } = await supabase
        .from('forum_posts')
        .delete()
        .eq('id', postId)
        .eq('author_id', authorId)

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
   * Search forum posts
   */
  static async searchPosts(
    query: string,
    categoryId?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<ApiResponse<PaginatedResponse<ForumPostWithDetails>>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      let dbQuery = supabase
        .from('forum_posts')
        .select(`
          *,
          author:profiles!forum_posts_author_id_fkey(
            id,
            username,
            full_name,
            avatar_url,
            role
          ),
          category:forum_categories(*)
        `, { count: 'exact' })

      // Text search
      dbQuery = dbQuery.or(`title.ilike.%${query}%,content.ilike.%${query}%`)

      if (categoryId) {
        dbQuery = dbQuery.eq('category_id', categoryId)
      }

      dbQuery = dbQuery.order('created_at', { ascending: false })

      // Pagination
      const offset = (page - 1) * limit
      dbQuery = dbQuery.range(offset, offset + limit - 1)

      const { data, error, count } = await dbQuery

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
   * Get user's forum posts
   */
  static async getUserPosts(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<ApiResponse<PaginatedResponse<ForumPostWithDetails>>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      const { data, error, count } = await supabase
        .from('forum_posts')
        .select(`
          *,
          author:profiles!forum_posts_author_id_fkey(
            id,
            username,
            full_name,
            avatar_url,
            role
          ),
          category:forum_categories(*)
        `, { count: 'exact' })
        .eq('author_id', userId)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

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
   * Mark reply as solution
   */
  static async markAsSolution(
    replyId: string,
    postId: string,
    postAuthorId: string
  ): Promise<ApiResponse<boolean>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      // First, unmark any existing solutions for this post
      await supabase
        .from('forum_replies')
        .update({ is_solution: false })
        .eq('post_id', postId)

      // Mark the new solution
      const { error: replyError } = await supabase
        .from('forum_replies')
        .update({ is_solution: true })
        .eq('id', replyId)

      if (replyError) {
        return { success: false, error: replyError.message }
      }

      // Mark the post as solved
      const { error: postError } = await supabase
        .from('forum_posts')
        .update({ is_solved: true })
        .eq('id', postId)
        .eq('author_id', postAuthorId)

      if (postError) {
        return { success: false, error: postError.message }
      }

      return { success: true, data: true }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

// Export convenience functions
export const getForumCategories = ForumAPI.getCategories
export const getForumPosts = ForumAPI.getPosts
export const getForumPost = ForumAPI.getPost
export const createForumPost = ForumAPI.createPost
export const createForumReply = ForumAPI.createReply
export const updateForumPost = ForumAPI.updatePost
export const deleteForumPost = ForumAPI.deletePost
export const searchForumPosts = ForumAPI.searchPosts
export const getUserForumPosts = ForumAPI.getUserPosts
export const markReplyAsSolution = ForumAPI.markAsSolution