'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ResourcesService, CategoriesService } from '@/lib/api'
import type { Resource, Category } from '@/lib/api'
import { useAuth } from '@/app/providers'
import { useSubscription } from '@/hooks/useSubscription'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  X, 
  Clock, 
  Eye, 
  Crown, 
  BookOpen, 
  Video, 
  Users, 
  Globe,
  FileText,
  Wrench,
  Loader2,
  TrendingUp,
  Filter,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

interface GlobalSearchProps {
  isOpen: boolean
  onClose: () => void
  defaultQuery?: string
  focusOnOpen?: boolean
}

interface SearchResult {
  id: string
  title: string
  description: string
  type: 'resource' | 'category' | 'suggestion'
  resource_type?: string
  difficulty_level?: string
  url?: string
  slug?: string
  is_premium?: boolean
  view_count?: number
  estimated_time_minutes?: number
  category_name?: string
}

export default function GlobalSearch({ 
  isOpen, 
  onClose, 
  defaultQuery = '', 
  focusOnOpen = true 
}: GlobalSearchProps) {
  const { user } = useAuth()
  const { canAccessPremiumResources } = useSubscription()
  
  const [query, setQuery] = useState(defaultQuery)
  const [results, setResults] = useState<SearchResult[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [showFilters, setShowFilters] = useState(false)
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('')
  
  const searchInputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && focusOnOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100)
    }
  }, [isOpen, focusOnOpen])

  useEffect(() => {
    if (query.length >= 2) {
      performSearch(query)
    } else {
      setResults([])
    }
  }, [query, typeFilter, difficultyFilter, performSearch])

  const performSearch = useCallback(async (searchQuery: string) => {
    try {
      setLoading(true)
      
      // Search resources
      const resourcesResult = await ResourcesService.getResources({
        searchQuery,
        resourceType: typeFilter || undefined,
        difficultyLevel: difficultyFilter || undefined,
        isPublished: true,
        limit: 10
      })

      // Search categories
      const categoriesResult = await CategoriesService.searchCategories(searchQuery)

      const searchResults: SearchResult[] = []

      // Add resource results
      if (resourcesResult.success && resourcesResult.data && resourcesResult.data.data) {
        searchResults.push(...resourcesResult.data.data.map(resource => ({
          id: resource.id,
          title: resource.title,
          description: resource.description,
          type: 'resource' as const,
          resource_type: resource.resource_type,
          difficulty_level: resource.difficulty_level,
          slug: resource.slug,
          is_premium: resource.is_premium,
          view_count: resource.view_count,
          estimated_time_minutes: resource.estimated_time_minutes,
          url: resource.url
        })))
      }

      // Add category results
      if (categoriesResult.success && categoriesResult.data) {
        searchResults.push(...categoriesResult.data.map(category => ({
          id: category.id,
          title: category.name,
          description: category.description || `Browse ${category.name} resources`,
          type: 'category' as const,
          slug: category.slug,
          category_name: category.name
        })))
      }

      // Add search suggestions
      if (searchQuery.length >= 3) {
        const suggestions = generateSearchSuggestions(searchQuery)
        searchResults.push(...suggestions)
      }

      setResults(searchResults)
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [typeFilter, difficultyFilter])

  const generateSearchSuggestions = (query: string): SearchResult[] => {
    const suggestions = [
      `${query} tutorials`,
      `${query} for beginners`,
      `${query} advanced guide`,
      `${query} tools`,
      `${query} courses`
    ]

    return suggestions.map((suggestion, index) => ({
      id: `suggestion-${index}`,
      title: suggestion,
      description: `Search for "${suggestion}"`,
      type: 'suggestion' as const
    }))
  }

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />
      case 'course':
        return <BookOpen className="h-4 w-4" />
      case 'article':
        return <FileText className="h-4 w-4" />
      case 'tool':
        return <Wrench className="h-4 w-4" />
      case 'community':
        return <Users className="h-4 w-4" />
      case 'documentation':
        return <Globe className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-500/10 text-green-400 border-green-500/20'
      case 'intermediate':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      case 'advanced':
        return 'bg-red-500/10 text-red-400 border-red-500/20'
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, -1))
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      const selectedResult = results[selectedIndex]
      if (selectedResult.type === 'resource') {
        window.location.href = `/resources/${selectedResult.slug}`
      } else if (selectedResult.type === 'category') {
        window.location.href = `/academy?category=${selectedResult.slug}`
      } else if (selectedResult.type === 'suggestion') {
        setQuery(selectedResult.title)
      }
    }
  }

  const clearSearch = () => {
    setQuery('')
    setResults([])
    setSelectedIndex(-1)
    setTypeFilter('')
    setDifficultyFilter('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
      <div className="w-full max-w-2xl mx-4">
        <Card className="bg-gray-900 border-gray-700 shadow-2xl">
          <CardContent className="p-0">
            {/* Search Header */}
            <div className="p-4 border-b border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  ref={searchInputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search resources, courses, articles..."
                  className="pl-10 pr-20 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-cyber-cyan"
                />
                <div className="absolute right-2 top-2 flex items-center space-x-1">
                  {query && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearSearch}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="h-6 w-6 p-0"
                  >
                    <Filter className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Quick Filters */}
              {showFilters && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-3 py-1 bg-gray-800 border border-gray-600 rounded text-sm text-white"
                  >
                    <option value="">All Types</option>
                    <option value="course">Courses</option>
                    <option value="article">Articles</option>
                    <option value="video">Videos</option>
                    <option value="tool">Tools</option>
                    <option value="community">Community</option>
                  </select>
                  
                  <select
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                    className="px-3 py-1 bg-gray-800 border border-gray-600 rounded text-sm text-white"
                  >
                    <option value="">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              )}
            </div>

            {/* Search Results */}
            <div ref={resultsRef} className="max-h-96 overflow-y-auto">
              {loading && (
                <div className="p-4 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-cyber-cyan" />
                  <p className="text-gray-400 mt-2">Searching...</p>
                </div>
              )}

              {!loading && query.length >= 2 && results.length === 0 && (
                <div className="p-4 text-center">
                  <p className="text-gray-400">No results found for &ldquo;{query}&rdquo;</p>
                  <p className="text-sm text-gray-500 mt-1">Try different keywords or check spelling</p>
                </div>
              )}

              {!loading && results.length > 0 && (
                <div className="py-2">
                  {results.map((result, index) => (
                    <div
                      key={result.id}
                      className={`px-4 py-3 hover:bg-gray-800 cursor-pointer transition-colors ${
                        index === selectedIndex ? 'bg-gray-800' : ''
                      }`}
                      onClick={() => {
                        if (result.type === 'resource') {
                          window.location.href = `/resources/${result.slug}`
                        } else if (result.type === 'category') {
                          window.location.href = `/academy?category=${result.slug}`
                        } else if (result.type === 'suggestion') {
                          setQuery(result.title)
                        }
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {result.type === 'resource' && (
                            <div className="p-1 bg-cyber-cyan/10 rounded">
                              {getResourceIcon(result.resource_type || '')}
                            </div>
                          )}
                          {result.type === 'category' && (
                            <div className="p-1 bg-purple-500/10 rounded">
                              <BookOpen className="h-4 w-4 text-purple-400" />
                            </div>
                          )}
                          {result.type === 'suggestion' && (
                            <div className="p-1 bg-gray-500/10 rounded">
                              <Search className="h-4 w-4 text-gray-400" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-white font-medium truncate">{result.title}</p>
                            <div className="flex items-center space-x-2 ml-2">
                              {result.type === 'resource' && result.difficulty_level && (
                                <Badge variant="outline" className={getDifficultyColor(result.difficulty_level)}>
                                  {result.difficulty_level}
                                </Badge>
                              )}
                              {result.is_premium && (
                                <Crown className="h-4 w-4 text-yellow-400" />
                              )}
                              <ArrowRight className="h-3 w-3 text-gray-400" />
                            </div>
                          </div>
                          
                          <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                            {result.description}
                          </p>

                          {result.type === 'resource' && (
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              {result.view_count && (
                                <div className="flex items-center space-x-1">
                                  <Eye className="h-3 w-3" />
                                  <span>{result.view_count}</span>
                                </div>
                              )}
                              {result.estimated_time_minutes && (
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{result.estimated_time_minutes}m</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Popular searches hint */}
              {!loading && query.length < 2 && (
                <div className="p-4">
                  <p className="text-gray-400 text-sm mb-3">Popular searches:</p>
                  <div className="flex flex-wrap gap-2">
                    {['penetration testing', 'network security', 'ethical hacking', 'cybersecurity basics', 'incident response'].map((term) => (
                      <button
                        key={term}
                        onClick={() => setQuery(term)}
                        className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-full text-sm text-gray-300 transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-700 px-4 py-3">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center space-x-4">
                  <span>↵ to select</span>
                  <span>↓↑ to navigate</span>
                  <span>esc to close</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-3 w-3" />
                  <span>Powered by AI</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}