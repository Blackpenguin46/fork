// Main API service that exports all backend services
export { CategoriesService } from '@/lib/services/categories'
export { ResourcesService } from '@/lib/services/resources'
export { UserProgressService } from '@/lib/services/user-progress'
export { ProfilesService } from '@/lib/services/profiles'
export { BookmarksService } from '@/lib/services/bookmarks'
export { TagsService } from '@/lib/services/tags'
export { LearningPathsService } from '@/lib/services/learning-paths'

// Re-export types for easy access
export type {
  Profile,
  Category,
  Resource,
  Tag,
  LearningPath,
  UserProgress,
  Subscription,
  Bookmark,
  Meeting,
  Achievement,
  UserAchievement,
  Notification,
  PaginatedResponse,
  ApiResponse
} from '@/lib/types/database'

// Export learning path specific types
export type { LearningPathResource } from '@/lib/types/learning-paths'

// Common API utilities
export class ApiUtils {
  /**
   * Format pagination params for API calls
   */
  static formatPaginationParams(page: number = 1, limit: number = 20) {
    return {
      page: Math.max(1, page),
      limit: Math.min(100, Math.max(1, limit))
    }
  }

  /**
   * Create paginated response structure
   */
  static createPaginatedResponse<T>(
    data: T[],
    count: number,
    page: number,
    limit: number
  ) {
    const totalPages = Math.ceil(count / limit)
    
    return {
      data,
      count,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    }
  }

  /**
   * Sanitize search query
   */
  static sanitizeSearchQuery(query: string): string {
    return query
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
      .substring(0, 100) // Limit length
  }

  /**
   * Validate pagination parameters
   */
  static validatePagination(page?: number, limit?: number): {
    page: number
    limit: number
    error?: string
  } {
    const validatedPage = Math.max(1, page || 1)
    const validatedLimit = Math.min(100, Math.max(1, limit || 20))

    if (page && page < 1) {
      return { page: validatedPage, limit: validatedLimit, error: 'Page must be >= 1' }
    }

    if (limit && (limit < 1 || limit > 100)) {
      return { page: validatedPage, limit: validatedLimit, error: 'Limit must be between 1 and 100' }
    }

    return { page: validatedPage, limit: validatedLimit }
  }

  /**
   * Handle API errors consistently
   */
  static handleError(error: unknown): { success: false; error: string } {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    
    if (typeof error === 'string') {
      return { success: false, error }
    }

    return { success: false, error: 'An unknown error occurred' }
  }

  /**
   * Create success response
   */
  static success<T>(data: T): { success: true; data: T } {
    return { success: true, data }
  }

  /**
   * Create error response
   */
  static error(message: string): { success: false; error: string } {
    return { success: false, error: message }
  }
}