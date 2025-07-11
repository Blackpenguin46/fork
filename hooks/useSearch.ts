'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { ResourcesService } from '@/lib/api'
import type { Resource, PaginatedResponse } from '@/lib/api'

interface SearchFilters {
  query?: string
  categories?: string[]
  tags?: string[]
  resourceTypes?: string[]
  difficultyLevels?: string[]
  isPremium?: boolean
  dateRange?: {
    start: string
    end: string
  }
  estimatedTimeRange?: {
    min: number
    max: number
  }
  sortBy?: 'created_at' | 'updated_at' | 'view_count' | 'like_count' | 'title' | 'difficulty_level'
  sortOrder?: 'asc' | 'desc'
}

interface SearchOptions {
  page?: number
  limit?: number
  autoSearch?: boolean
  debounceMs?: number
}

interface SearchState {
  results: PaginatedResponse<Resource> | null
  loading: boolean
  error: string | null
  hasSearched: boolean
}

export function useSearch(initialFilters: SearchFilters = {}, options: SearchOptions = {}) {
  const {
    page = 1,
    limit = 12,
    autoSearch = true,
    debounceMs = 300
  } = options

  const [filters, setFilters] = useState<SearchFilters>(initialFilters)
  const [searchState, setSearchState] = useState<SearchState>({
    results: null,
    loading: false,
    error: null,
    hasSearched: false
  })
  const [currentPage, setCurrentPage] = useState(page)

  // Debounced search function
  const performSearch = useCallback(async (searchFilters: SearchFilters, pageNum: number = 1) => {
    try {
      setSearchState(prev => ({ ...prev, loading: true, error: null }))

      const result = await ResourcesService.getResources({
        searchQuery: searchFilters.query,
        resourceType: searchFilters.resourceTypes?.length ? searchFilters.resourceTypes[0] : undefined,
        categoryId: searchFilters.categories?.length ? searchFilters.categories[0] : undefined,
        difficultyLevel: searchFilters.difficultyLevels?.length ? searchFilters.difficultyLevels[0] : undefined,
        isPremium: searchFilters.isPremium,
        isPublished: true,
        sortBy: (['created_at', 'updated_at', 'title', 'view_count', 'like_count'].includes(searchFilters.sortBy || '') ? searchFilters.sortBy : 'created_at') as 'created_at' | 'updated_at' | 'title' | 'view_count' | 'like_count',
        sortOrder: searchFilters.sortOrder || 'desc',
        page: pageNum,
        limit
      })

      if (result.success && result.data) {
        setSearchState({
          results: result.data,
          loading: false,
          error: null,
          hasSearched: true
        })
      } else {
        setSearchState({
          results: null,
          loading: false,
          error: result.error || 'Search failed',
          hasSearched: true
        })
      }
    } catch (error) {
      setSearchState({
        results: null,
        loading: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        hasSearched: true
      })
    }
  }, [limit])

  // Debounced search effect
  useEffect(() => {
    if (!autoSearch) return

    const timeoutId = setTimeout(() => {
      performSearch(filters, currentPage)
    }, debounceMs)

    return () => clearTimeout(timeoutId)
  }, [filters, currentPage, performSearch, autoSearch, debounceMs])

  // Update individual filter values
  const updateFilter = useCallback((key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1) // Reset to first page when filters change
  }, [])

  // Update multiple filters at once
  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setCurrentPage(1)
  }, [])

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({})
    setCurrentPage(1)
  }, [])

  // Manual search trigger
  const search = useCallback((customFilters?: SearchFilters) => {
    const searchFilters = customFilters || filters
    performSearch(searchFilters, currentPage)
  }, [filters, currentPage, performSearch])

  // Reset search state
  const resetSearch = useCallback(() => {
    setSearchState({
      results: null,
      loading: false,
      error: null,
      hasSearched: false
    })
  }, [])

  // Pagination helpers
  const goToPage = useCallback((pageNum: number) => {
    setCurrentPage(pageNum)
  }, [])

  const nextPage = useCallback(() => {
    if (searchState.results && currentPage < searchState.results.totalPages) {
      setCurrentPage(prev => prev + 1)
    }
  }, [searchState.results, currentPage])

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1)
    }
  }, [currentPage])

  // Computed values
  const hasFilters = useMemo(() => {
    return Object.values(filters).some(value => {
      if (Array.isArray(value)) return value.length > 0
      return value !== undefined && value !== null && value !== ''
    })
  }, [filters])

  const totalResults = searchState.results?.count || 0
  const hasResults = totalResults > 0
  const hasNextPage = searchState.results ? currentPage < searchState.results.totalPages : false
  const hasPrevPage = currentPage > 1

  const filtersCount = useMemo(() => {
    let count = 0
    Object.entries(filters).forEach(([key, value]) => {
      if (key === 'query' && value) count++
      else if (Array.isArray(value) && value.length > 0) count += value.length
      else if (value !== undefined && value !== null && value !== '') count++
    })
    return count
  }, [filters])

  return {
    // State
    filters,
    results: searchState.results?.data || [],
    loading: searchState.loading,
    error: searchState.error,
    hasSearched: searchState.hasSearched,
    currentPage,
    totalResults,
    totalPages: searchState.results?.totalPages || 0,
    
    // Computed values
    hasFilters,
    hasResults,
    hasNextPage,
    hasPrevPage,
    filtersCount,
    
    // Actions
    updateFilter,
    updateFilters,
    clearFilters,
    search,
    resetSearch,
    
    // Pagination
    goToPage,
    nextPage,
    prevPage,
    
    // Pagination info
    pagination: {
      currentPage,
      totalPages: searchState.results?.totalPages || 0,
      totalResults,
      hasNextPage,
      hasPrevPage,
      perPage: limit
    }
  }
}

// Hook for search suggestions
export function useSearchSuggestions(query: string, limit: number = 5) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([])
      return
    }

    const generateSuggestions = async () => {
      setLoading(true)
      
      // Simulate API call for suggestions
      // In a real app, this would call a search suggestions API
      const mockSuggestions = [
        `${query} basics`,
        `${query} advanced`,
        `${query} tutorial`,
        `${query} guide`,
        `${query} tools`
      ].slice(0, limit)

      setSuggestions(mockSuggestions)
      setLoading(false)
    }

    const timeoutId = setTimeout(generateSuggestions, 200)
    return () => clearTimeout(timeoutId)
  }, [query, limit])

  return { suggestions, loading }
}

// Hook for popular searches
export function usePopularSearches(limit: number = 10) {
  const [popularSearches, setPopularSearches] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock popular searches - in a real app, this would come from analytics
    const mockPopularSearches = [
      'penetration testing',
      'network security',
      'ethical hacking',
      'cybersecurity basics',
      'incident response',
      'malware analysis',
      'security frameworks',
      'vulnerability assessment',
      'digital forensics',
      'social engineering'
    ].slice(0, limit)

    setPopularSearches(mockPopularSearches)
    setLoading(false)
  }, [limit])

  return { popularSearches, loading }
}