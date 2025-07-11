'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSearch } from '@/hooks/useSearch'
import { useAuth } from '@/app/providers'
import { useSubscription } from '@/hooks/useSubscription'
import ResourcesPage from '@/components/pages/ResourcesPage'
import AdvancedFilters from '@/components/search/AdvancedFilters'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Filter, 
  X, 
  SlidersHorizontal,
  Clock,
  Eye,
  Crown,
  BookOpen,
  Video,
  Users,
  Globe,
  FileText,
  Wrench,
  TrendingUp,
  Calendar
} from 'lucide-react'
import Link from 'next/link'

function SearchContent() {
  const { user } = useAuth()
  const { canAccessPremiumResources } = useSubscription()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const initialQuery = searchParams.get('q') || ''
  const initialType = searchParams.get('type') || ''
  const initialCategory = searchParams.get('category') || ''
  const initialDifficulty = searchParams.get('difficulty') || ''
  
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [searchInput, setSearchInput] = useState(initialQuery)

  const {
    filters,
    results,
    loading,
    error,
    hasSearched,
    totalResults,
    totalPages,
    currentPage,
    hasFilters,
    filtersCount,
    updateFilter,
    updateFilters,
    clearFilters,
    search,
    goToPage,
    nextPage,
    prevPage,
    hasNextPage,
    hasPrevPage
  } = useSearch({
    query: initialQuery,
    resourceTypes: initialType ? [initialType] : [],
    categories: initialCategory ? [initialCategory] : [],
    difficultyLevels: initialDifficulty ? [initialDifficulty] : []
  })

  useEffect(() => {
    // Update URL when filters change
    const params = new URLSearchParams()
    if (filters.query) params.set('q', filters.query)
    if (filters.resourceTypes?.length) params.set('type', filters.resourceTypes[0])
    if (filters.categories?.length) params.set('category', filters.categories[0])
    if (filters.difficultyLevels?.length) params.set('difficulty', filters.difficultyLevels[0])
    
    const newUrl = `/search${params.toString() ? '?' + params.toString() : ''}`
    if (window.location.pathname + window.location.search !== newUrl) {
      router.replace(newUrl, { scroll: false })
    }
  }, [filters, router])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilter('query', searchInput)
  }

  const handleAdvancedFilters = (newFilters: any) => {
    updateFilters(newFilters)
    setShowAdvancedFilters(false)
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

  return (
    <div className="min-h-screen bg-deep-space-blue pt-16">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Search Resources</h1>
          <p className="text-xl text-gray-300">
            Find cybersecurity learning materials, tools, and community resources
          </p>
        </div>

        {/* Search Form */}
        <Card className="bg-gray-800/50 border-gray-700 mb-8">
          <CardContent className="p-6">
            <form onSubmit={handleSearchSubmit} className="space-y-4">
              <div className="flex space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search for resources, courses, articles..."
                    className="pl-10 bg-gray-900 border-gray-600 text-white placeholder-gray-400 text-lg py-3"
                  />
                </div>
                <Button type="submit" size="lg" className="bg-cyber-cyan hover:bg-cyber-cyan/80">
                  <Search className="h-5 w-5 mr-2" />
                  Search
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => setShowAdvancedFilters(true)}
                  className="border-gray-600"
                >
                  <SlidersHorizontal className="h-5 w-5 mr-2" />
                  Filters
                  {filtersCount > 0 && (
                    <Badge variant="outline" className="ml-2 bg-cyber-cyan/10 text-cyber-cyan">
                      {filtersCount}
                    </Badge>
                  )}
                </Button>
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-400 self-center">Quick filters:</span>
                {['course', 'article', 'video', 'tool'].map((type) => (
                  <Button
                    key={type}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => updateFilter('resourceTypes', [type])}
                    className={`border-gray-600 ${
                      filters.resourceTypes?.includes(type)
                        ? 'bg-cyber-cyan/20 text-cyber-cyan border-cyber-cyan'
                        : ''
                    }`}
                  >
                    {getResourceIcon(type)}
                    <span className="ml-2 capitalize">{type}</span>
                  </Button>
                ))}
                
                {['beginner', 'intermediate', 'advanced'].map((level) => (
                  <Button
                    key={level}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => updateFilter('difficultyLevels', [level])}
                    className={`border-gray-600 ${
                      filters.difficultyLevels?.includes(level)
                        ? getDifficultyColor(level)
                        : ''
                    }`}
                  >
                    <span className="capitalize">{level}</span>
                  </Button>
                ))}

                {hasFilters && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear All
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Search Results Summary */}
        {hasSearched && (
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                {loading ? (
                  <p className="text-gray-400">Searching...</p>
                ) : error ? (
                  <p className="text-red-400">Error: {error}</p>
                ) : (
                  <p className="text-gray-400">
                    {totalResults > 0 ? (
                      <>
                        Found <span className="text-white font-medium">{totalResults.toLocaleString()}</span> results
                        {filters.query && (
                          <> for &ldquo;<span className="text-cyber-cyan">{filters.query}</span>&rdquo;</>
                        )}
                      </>
                    ) : (
                      <>No results found{filters.query && ` for "${filters.query}"`}</>
                    )}
                  </p>
                )}
              </div>
              
              {totalPages > 1 && (
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <span>Page {currentPage} of {totalPages}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Search Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-64 bg-gray-700 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-8 text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <Button onClick={() => search()} variant="outline">
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : !hasSearched ? (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-8 text-center">
              <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Start Your Search</h3>
              <p className="text-gray-400 mb-6">
                Enter keywords to find cybersecurity resources, courses, and tools
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="text-sm text-gray-400">Popular searches:</span>
                {['penetration testing', 'network security', 'ethical hacking', 'incident response'].map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setSearchInput(term)
                      updateFilter('query', term)
                    }}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-full text-sm text-gray-300 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : results.length === 0 ? (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-8 text-center">
              <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Results Found</h3>
              <p className="text-gray-400 mb-6">
                Try adjusting your search terms or filters
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={clearFilters} variant="outline">
                  Clear All Filters
                </Button>
                <Button asChild>
                  <Link href="/academy">Browse All Resources</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {results.map((resource) => (
                <Card key={resource.id} className="bg-gray-800/50 border-gray-700 hover:border-cyber-cyan/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="p-1 bg-cyber-cyan/10 rounded">
                          {getResourceIcon(resource.resource_type)}
                        </div>
                        <Badge variant="outline" className={getDifficultyColor(resource.difficulty_level)}>
                          {resource.difficulty_level}
                        </Badge>
                      </div>
                      {resource.is_premium && (
                        <Crown className="h-4 w-4 text-yellow-400" />
                      )}
                    </div>
                    
                    <CardTitle className="text-white line-clamp-2">
                      {resource.title}
                    </CardTitle>
                    
                    <p className="text-gray-400 text-sm line-clamp-3">
                      {resource.description}
                    </p>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        {resource.view_count && (
                          <div className="flex items-center space-x-1">
                            <Eye className="h-4 w-4" />
                            <span>{resource.view_count}</span>
                          </div>
                        )}
                        {resource.estimated_time_minutes && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{resource.estimated_time_minutes}m</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        asChild 
                        className="flex-1"
                        disabled={resource.is_premium && !canAccessPremiumResources}
                      >
                        <Link href={`/resources/${resource.slug}`}>
                          View Resource
                        </Link>
                      </Button>
                    </div>

                    {resource.is_premium && !canAccessPremiumResources && (
                      <p className="text-xs text-yellow-400 mt-2">
                        Premium resource - upgrade to access
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={prevPage}
                  disabled={!hasPrevPage}
                  className="border-gray-600"
                >
                  Previous
                </Button>
                
                <div className="flex items-center space-x-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, currentPage - 2) + i
                    if (pageNum > totalPages) return null
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === currentPage ? "default" : "outline"}
                        onClick={() => goToPage(pageNum)}
                        className={pageNum === currentPage ? "bg-cyber-cyan" : "border-gray-600"}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                
                <Button
                  variant="outline"
                  onClick={nextPage}
                  disabled={!hasNextPage}
                  className="border-gray-600"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Advanced Filters Modal */}
      <AdvancedFilters
        isOpen={showAdvancedFilters}
        onClose={() => setShowAdvancedFilters(false)}
        onApplyFilters={handleAdvancedFilters}
        initialFilters={filters}
      />
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-deep-space-blue pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse flex space-x-4 justify-center mb-4">
            <div className="rounded-full bg-slate-700 h-10 w-10"></div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-700 rounded w-40"></div>
              <div className="h-4 bg-slate-700 rounded w-32"></div>
            </div>
          </div>
          <div className="text-gray-400">Loading search...</div>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}