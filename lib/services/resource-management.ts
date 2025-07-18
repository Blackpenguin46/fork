/**
 * Comprehensive Resource Management Service
 * Handles all resource-related operations including publishing, categorization, and analytics
 */

import { createClient } from '@supabase/supabase-js'
import type { Resource } from '@/lib/api'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface ResourceFilters {
  search?: string
  category?: string
  type?: string
  difficulty?: string
  isPublished?: boolean
  isPremium?: boolean
  author?: string
  dateRange?: {
    start: Date
    end: Date
  }
}

export interface ResourceStats {
  total: number
  published: number
  unpublished: number
  premium: number
  byType: Record<string, number>
  byDifficulty: Record<string, number>
  byCategory: Record<string, number>
  recentlyAdded: number
  needsReview: number
}

export interface BulkOperation {
  resourceIds: string[]
  operation: 'publish' | 'unpublish' | 'delete' | 'makePremium' | 'makeFree' | 'updateCategory' | 'updateDifficulty'
  data?: any
}

export interface ResourceValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export class ResourceManagementService {
  /**
   * Get comprehensive resource statistics
   */
  static async getResourceStats(): Promise<ResourceStats> {
    const { data: resources, error } = await supabase
      .from('resources')
      .select('id, resource_type, difficulty_level, category_id, is_published, is_premium, created_at')

    if (error) {
      throw new Error(`Failed to get resource stats: ${error.message}`)
    }

    const total = resources.length
    const published = resources.filter(r => r.is_published).length
    const unpublished = resources.filter(r => !r.is_published).length
    const premium = resources.filter(r => r.is_premium).length

    // Group by type
    const byType = resources.reduce((acc, resource) => {
      acc[resource.resource_type] = (acc[resource.resource_type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Group by difficulty
    const byDifficulty = resources.reduce((acc, resource) => {
      acc[resource.difficulty_level] = (acc[resource.difficulty_level] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Group by category (would need to join with categories table)
    const byCategory = {} // Simplified for now

    // Recently added (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const recentlyAdded = resources.filter(r => 
      new Date(r.created_at) > sevenDaysAgo
    ).length

    // Resources that need review (unpublished for more than 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const needsReview = resources.filter(r => 
      !r.is_published && new Date(r.created_at) < thirtyDaysAgo
    ).length

    return {
      total,
      published,
      unpublished,
      premium,
      byType,
      byDifficulty,
      byCategory,
      recentlyAdded,
      needsReview
    }
  }

  /**
   * Get filtered resources with pagination
   */
  static async getFilteredResources(
    filters: ResourceFilters,
    page: number = 1,
    limit: number = 50
  ): Promise<{
    resources: Resource[]
    total: number
    hasMore: boolean
  }> {
    let query = supabase
      .from('resources')
      .select(`
        *,
        categories(name, slug),
        profiles!resources_author_fkey(username, full_name)
      `)

    // Apply filters
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    if (filters.category) {
      query = query.eq('category_id', filters.category)
    }

    if (filters.type) {
      query = query.eq('resource_type', filters.type)
    }

    if (filters.difficulty) {
      query = query.eq('difficulty_level', filters.difficulty)
    }

    if (filters.isPublished !== undefined) {
      query = query.eq('is_published', filters.isPublished)
    }

    if (filters.isPremium !== undefined) {
      query = query.eq('is_premium', filters.isPremium)
    }

    if (filters.author) {
      query = query.eq('author', filters.author)
    }

    if (filters.dateRange) {
      query = query
        .gte('created_at', filters.dateRange.start.toISOString())
        .lte('created_at', filters.dateRange.end.toISOString())
    }

    // Get total count - create a fresh query
    let countQuery = supabase.from('resources').select('*', { count: 'exact', head: true })
    
    if (filters.category) {
      countQuery = countQuery.eq('category_id', filters.category)
    }
    if (filters.type) {
      countQuery = countQuery.eq('resource_type', filters.type)
    }
    if (filters.difficulty) {
      countQuery = countQuery.eq('difficulty_level', filters.difficulty)
    }
    if (filters.isPremium !== undefined) {
      countQuery = countQuery.eq('is_premium', filters.isPremium)
    }
    if (filters.search) {
      countQuery = countQuery.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }
    
    const { count } = await countQuery

    // Apply pagination
    const offset = (page - 1) * limit
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: resources, error } = await query

    if (error) {
      throw new Error(`Failed to get filtered resources: ${error.message}`)
    }

    return {
      resources: resources || [],
      total: count || 0,
      hasMore: (count || 0) > offset + limit
    }
  }

  /**
   * Validate resource before publishing
   */
  static validateResource(resource: Partial<Resource>): ResourceValidation {
    const errors: string[] = []
    const warnings: string[] = []

    // Required fields
    if (!resource.title?.trim()) {
      errors.push('Title is required')
    }

    if (!resource.description?.trim()) {
      errors.push('Description is required')
    }

    if (!resource.url?.trim()) {
      errors.push('Content URL is required')
    }

    if (!resource.resource_type) {
      errors.push('Resource type is required')
    }

    if (!resource.difficulty_level) {
      errors.push('Difficulty level is required')
    }

    if (!resource.category_id) {
      errors.push('Category is required')
    }

    // Validation rules
    if (resource.title && resource.title.length < 10) {
      warnings.push('Title should be at least 10 characters long')
    }

    if (resource.description && resource.description.length < 50) {
      warnings.push('Description should be at least 50 characters long')
    }

    if (resource.url && !this.isValidUrl(resource.url)) {
      errors.push('Content URL is not valid')
    }

    // Tags validation removed as it's not part of the Resource type

    if (!resource.estimated_time_minutes) {
      warnings.push('Estimated read time helps users plan their learning')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Publish a single resource
   */
  static async publishResource(resourceId: string, publisherId: string): Promise<void> {
    // Get resource details
    const { data: resource, error: fetchError } = await supabase
      .from('resources')
      .select('*')
      .eq('id', resourceId)
      .single()

    if (fetchError || !resource) {
      throw new Error(`Resource not found: ${resourceId}`)
    }

    // Validate resource
    const validation = this.validateResource(resource)
    if (!validation.isValid) {
      throw new Error(`Resource validation failed: ${validation.errors.join(', ')}`)
    }

    // Update resource
    const { error: updateError } = await supabase
      .from('resources')
      .update({
        is_published: true,
        published_at: new Date().toISOString(),
        published_by: publisherId,
        updated_at: new Date().toISOString()
      })
      .eq('id', resourceId)

    if (updateError) {
      throw new Error(`Failed to publish resource: ${updateError.message}`)
    }

    // Update search vector for full-text search
    await this.updateResourceSearchVector(resourceId)

    // Log the action
    await this.logResourceAction(resourceId, 'published', publisherId)
  }

  /**
   * Unpublish a resource
   */
  static async unpublishResource(resourceId: string, unpublisherId: string): Promise<void> {
    const { error } = await supabase
      .from('resources')
      .update({
        is_published: false,
        unpublished_at: new Date().toISOString(),
        unpublished_by: unpublisherId,
        updated_at: new Date().toISOString()
      })
      .eq('id', resourceId)

    if (error) {
      throw new Error(`Failed to unpublish resource: ${error.message}`)
    }

    await this.logResourceAction(resourceId, 'unpublished', unpublisherId)
  }

  /**
   * Perform bulk operations on resources
   */
  static async performBulkOperation(operation: BulkOperation, operatorId: string): Promise<{
    success: number
    failed: number
    errors: string[]
  }> {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    }

    for (const resourceId of operation.resourceIds) {
      try {
        switch (operation.operation) {
          case 'publish':
            await this.publishResource(resourceId, operatorId)
            break

          case 'unpublish':
            await this.unpublishResource(resourceId, operatorId)
            break

          case 'delete':
            await this.deleteResource(resourceId, operatorId)
            break

          case 'makePremium':
            await this.updateResourcePremiumStatus(resourceId, true, operatorId)
            break

          case 'makeFree':
            await this.updateResourcePremiumStatus(resourceId, false, operatorId)
            break

          case 'updateCategory':
            await this.updateResourceCategory(resourceId, operation.data.categoryId, operatorId)
            break

          case 'updateDifficulty':
            await this.updateResourceDifficulty(resourceId, operation.data.difficulty, operatorId)
            break

          default:
            throw new Error(`Unknown operation: ${operation.operation}`)
        }

        results.success++
      } catch (error) {
        results.failed++
        results.errors.push(`Resource ${resourceId}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    return results
  }

  /**
   * Update resource premium status
   */
  static async updateResourcePremiumStatus(
    resourceId: string, 
    isPremium: boolean, 
    operatorId: string
  ): Promise<void> {
    const { error } = await supabase
      .from('resources')
      .update({
        is_premium: isPremium,
        updated_at: new Date().toISOString()
      })
      .eq('id', resourceId)

    if (error) {
      throw new Error(`Failed to update premium status: ${error.message}`)
    }

    await this.logResourceAction(
      resourceId, 
      isPremium ? 'made_premium' : 'made_free', 
      operatorId
    )
  }

  /**
   * Update resource category
   */
  static async updateResourceCategory(
    resourceId: string, 
    categoryId: string, 
    operatorId: string
  ): Promise<void> {
    const { error } = await supabase
      .from('resources')
      .update({
        category_id: categoryId,
        updated_at: new Date().toISOString()
      })
      .eq('id', resourceId)

    if (error) {
      throw new Error(`Failed to update category: ${error.message}`)
    }

    await this.logResourceAction(resourceId, 'category_updated', operatorId)
  }

  /**
   * Update resource difficulty
   */
  static async updateResourceDifficulty(
    resourceId: string, 
    difficulty: string, 
    operatorId: string
  ): Promise<void> {
    const { error } = await supabase
      .from('resources')
      .update({
        difficulty_level: difficulty,
        updated_at: new Date().toISOString()
      })
      .eq('id', resourceId)

    if (error) {
      throw new Error(`Failed to update difficulty: ${error.message}`)
    }

    await this.logResourceAction(resourceId, 'difficulty_updated', operatorId)
  }

  /**
   * Delete a resource (soft delete)
   */
  static async deleteResource(resourceId: string, operatorId: string): Promise<void> {
    const { error } = await supabase
      .from('resources')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        deleted_by: operatorId,
        updated_at: new Date().toISOString()
      })
      .eq('id', resourceId)

    if (error) {
      throw new Error(`Failed to delete resource: ${error.message}`)
    }

    await this.logResourceAction(resourceId, 'deleted', operatorId)
  }

  /**
   * Get resources that need review
   */
  static async getResourcesNeedingReview(): Promise<Resource[]> {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: resources, error } = await supabase
      .from('resources')
      .select(`
        *,
        categories(name, slug),
        profiles!resources_author_fkey(username, full_name)
      `)
      .eq('is_published', false)
      .lt('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true })

    if (error) {
      throw new Error(`Failed to get resources needing review: ${error.message}`)
    }

    return resources || []
  }

  /**
   * Auto-publish resources that meet criteria
   */
  static async autoPublishQualifiedResources(operatorId: string): Promise<{
    published: number
    skipped: number
    errors: string[]
  }> {
    const results = {
      published: 0,
      skipped: 0,
      errors: [] as string[]
    }

    // Get unpublished resources
    const { data: resources, error } = await supabase
      .from('resources')
      .select('*')
      .eq('is_published', false)
      .not('is_deleted', 'eq', true)

    if (error) {
      throw new Error(`Failed to get unpublished resources: ${error.message}`)
    }

    for (const resource of resources || []) {
      try {
        const validation = this.validateResource(resource)
        
        // Auto-publish if validation passes and no critical warnings
        if (validation.isValid && validation.warnings.length <= 2) {
          await this.publishResource(resource.id, operatorId)
          results.published++
        } else {
          results.skipped++
        }
      } catch (error) {
        results.errors.push(`Resource ${resource.id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        results.skipped++
      }
    }

    return results
  }

  /**
   * Generate resource analytics report
   */
  static async generateAnalyticsReport(dateRange?: { start: Date; end: Date }): Promise<{
    overview: ResourceStats
    performance: {
      topViewed: Array<{ id: string; title: string; views: number }>
      topRated: Array<{ id: string; title: string; rating: number }>
      trending: Array<{ id: string; title: string; growth: number }>
    }
    engagement: {
      averageTimeSpent: number
      completionRate: number
      bookmarkRate: number
    }
  }> {
    const overview = await this.getResourceStats()

    // Get performance metrics
    const { data: topViewed } = await supabase
      .from('resources')
      .select('id, title, view_count')
      .eq('is_published', true)
      .order('view_count', { ascending: false })
      .limit(10)

    const { data: topRated } = await supabase
      .from('resources')
      .select('id, title, rating')
      .eq('is_published', true)
      .order('rating', { ascending: false })
      .limit(10)

    // Calculate engagement metrics (simplified)
    const { data: progressData } = await supabase
      .from('user_progress')
      .select('progress_percentage, time_spent_minutes')

    const averageTimeSpent = progressData && progressData.length > 0 
      ? progressData.reduce((sum, p) => sum + (p.time_spent_minutes || 0), 0) / progressData.length 
      : 0
    const completionRate = progressData && progressData.length > 0 
      ? (progressData.filter(p => p.progress_percentage >= 100).length / progressData.length) * 100 
      : 0

    const { count: totalBookmarks } = await supabase
      .from('user_bookmarks')
      .select('*', { count: 'exact' })

    const bookmarkRate = (totalBookmarks || 0) / overview.total * 100

    return {
      overview,
      performance: {
        topViewed: topViewed?.map(r => ({ id: r.id, title: r.title, views: r.view_count || 0 })) || [],
        topRated: topRated?.map(r => ({ id: r.id, title: r.title, rating: r.rating || 0 })) || [],
        trending: [] // Would require more complex analytics
      },
      engagement: {
        averageTimeSpent,
        completionRate,
        bookmarkRate
      }
    }
  }

  /**
   * Update resource search vector for full-text search
   */
  private static async updateResourceSearchVector(resourceId: string): Promise<void> {
    const { error } = await supabase.rpc('update_resource_search_vector', {
      resource_id: resourceId
    })

    if (error) {
      console.error('Failed to update search vector:', error)
    }
  }

  /**
   * Log resource action for audit trail
   */
  private static async logResourceAction(
    resourceId: string, 
    action: string, 
    operatorId: string
  ): Promise<void> {
    const { error } = await supabase
      .from('resource_audit_log')
      .insert({
        resource_id: resourceId,
        action,
        operator_id: operatorId,
        timestamp: new Date().toISOString()
      })

    if (error) {
      console.error('Failed to log resource action:', error)
    }
  }

  /**
   * Validate URL format
   */
  private static isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }
}