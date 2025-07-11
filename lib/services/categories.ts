import { supabase } from '@/lib/supabase'
import type { Category, ApiResponse, PaginatedResponse } from '@/lib/types/database'

export class CategoriesService {
  
  /**
   * Get all active categories with optional filtering
   */
  static async getCategories(params?: {
    parentId?: string | null
    isActive?: boolean
    limit?: number
    page?: number
  }): Promise<ApiResponse<PaginatedResponse<Category>>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      let query = supabase
        .from('categories')
        .select('*', { count: 'exact' })
        .order('sort_order', { ascending: true })

      // Apply filters
      if (params?.parentId !== undefined) {
        if (params.parentId === null) {
          query = query.is('parent_category_id', null)
        } else {
          query = query.eq('parent_category_id', params.parentId)
        }
      }

      if (params?.isActive !== undefined) {
        query = query.eq('is_active', params.isActive)
      }

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
   * Get a single category by ID or slug
   */
  static async getCategory(identifier: string): Promise<ApiResponse<Category>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      // Try to get by ID first, then by slug
      let { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', identifier)
        .maybeSingle()

      if (!data && !error) {
        // Try by slug
        const result = await supabase
          .from('categories')
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
        return { success: false, error: 'Category not found' }
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
   * Get categories with their subcategories
   */
  static async getCategoriesWithChildren(): Promise<ApiResponse<Category[]>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (error) {
        return { success: false, error: error.message }
      }

      // Group categories by parent
      const categoriesMap = new Map<string, Category & { children?: Category[] }>()
      const rootCategories: (Category & { children?: Category[] })[] = []

      // First pass: create map and identify root categories
      data?.forEach(category => {
        const categoryWithChildren = { ...category, children: [] }
        categoriesMap.set(category.id, categoryWithChildren)
        
        if (!category.parent_category_id) {
          rootCategories.push(categoryWithChildren)
        }
      })

      // Second pass: assign children to parents
      data?.forEach(category => {
        if (category.parent_category_id) {
          const parent = categoriesMap.get(category.parent_category_id)
          if (parent) {
            parent.children?.push(category)
          }
        }
      })

      return { success: true, data: rootCategories }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Search categories by name or description
   */
  static async searchCategories(query: string): Promise<ApiResponse<Category[]>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .limit(10)

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