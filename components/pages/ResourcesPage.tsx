'use client'

import { useState, useEffect } from 'react'
import { ResourcesService } from '@/lib/api'
import type { Resource, PaginatedResponse } from '@/lib/api'
import { useAuth } from '@/app/providers'
import { useSubscription } from '@/hooks/useSubscription'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Clock, ExternalLink, Star, Eye, Heart, Crown, Search, Filter } from 'lucide-react'
import Link from 'next/link'
import BookmarkButton from '@/components/bookmarks/BookmarkButton'

interface ResourcesPageProps {
  resourceType?: string
  categoryId?: string
  showPremiumOnly?: boolean
}

export default function ResourcesPage({ 
  resourceType, 
  categoryId, 
  showPremiumOnly = false 
}: ResourcesPageProps) {
  const { user } = useAuth()
  const { canAccessPremiumResources, loading: subscriptionLoading } = useSubscription()
  
  const [resources, setResources] = useState<PaginatedResponse<Resource> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>(resourceType || '')
  const [premiumFilter, setPremiumFilter] = useState<boolean | undefined>(showPremiumOnly ? true : undefined)
  const [sortBy, setSortBy] = useState<'created_at' | 'view_count' | 'like_count'>('created_at')
  
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 12

  const fetchResources = async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await ResourcesService.getResources({
        resourceType: typeFilter || undefined,
        difficultyLevel: difficultyFilter || undefined,
        isPremium: premiumFilter,
        isPublished: true,
        searchQuery: searchQuery || undefined,
        sortBy,
        sortOrder: 'desc',
        page: currentPage,
        limit: pageSize
      })

      if (result.success && result.data) {
        setResources(result.data)
      } else {
        setError(result.error || 'Failed to load resources')
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Error fetching resources:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResources()
  }, [currentPage, searchQuery, difficultyFilter, typeFilter, premiumFilter, sortBy])

  useEffect(() => {
    setCurrentPage(1) // Reset to first page when filters change
  }, [searchQuery, difficultyFilter, typeFilter, premiumFilter, sortBy])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
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

  const getResourceTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return '🎥'
      case 'article':
        return '📄'
      case 'course':
        return '📚'
      case 'tool':
        return '🔧'
      case 'community':
        return '👥'
      case 'documentation':
        return '📖'
      default:
        return '📋'
    }
  }

  if (subscriptionLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-4">
          {resourceType ? `${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)} Resources` : 'Resources'}
        </h1>
        <p className="text-gray-400">
          Discover cybersecurity learning materials, tools, and community resources
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white"
          />
        </div>

        {/* Filter Row */}
        <div className="flex flex-wrap gap-4">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48 bg-gray-800 border-gray-700">
              <SelectValue placeholder="Resource Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="course">Courses</SelectItem>
              <SelectItem value="article">Articles</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
              <SelectItem value="tool">Tools</SelectItem>
              <SelectItem value="community">Community</SelectItem>
              <SelectItem value="documentation">Documentation</SelectItem>
            </SelectContent>
          </Select>

          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-48 bg-gray-800 border-gray-700">
              <SelectValue placeholder="Difficulty Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>

          <Select 
            value={premiumFilter === undefined ? '' : premiumFilter.toString()} 
            onValueChange={(value) => setPremiumFilter(value === '' ? undefined : value === 'true')}
          >
            <SelectTrigger className="w-48 bg-gray-800 border-gray-700">
              <SelectValue placeholder="Access Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Resources</SelectItem>
              <SelectItem value="false">Free Resources</SelectItem>
              <SelectItem value="true">Premium Resources</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-48 bg-gray-800 border-gray-700">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Newest</SelectItem>
              <SelectItem value="view_count">Most Viewed</SelectItem>
              <SelectItem value="like_count">Most Liked</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-64 bg-gray-700 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={fetchResources} variant="outline">
            Try Again
          </Button>
        </div>
      ) : !resources?.data?.length ? (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">No resources found matching your criteria</p>
          <Button onClick={() => {
            setSearchQuery('')
            setDifficultyFilter('')
            setTypeFilter('')
            setPremiumFilter(undefined)
          }} variant="outline">
            Clear Filters
          </Button>
        </div>
      ) : (
        <>
          {/* Resource Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {resources.data.map((resource) => (
              <Card key={resource.id} className="bg-gray-800 border-gray-700 hover:border-cyber-cyan/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{getResourceTypeIcon(resource.resource_type)}</span>
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
                  
                  <CardDescription className="text-gray-400 line-clamp-3">
                    {resource.description}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{resource.view_count}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="h-4 w-4" />
                        <span>{resource.like_count}</span>
                      </div>
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
                    
                    <BookmarkButton
                      resourceId={resource.id}
                      resourceTitle={resource.title}
                      size="sm"
                    />
                    
                    {resource.url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={resource.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
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
          {resources.totalPages > 1 && (
            <div className="flex justify-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              <span className="flex items-center px-4 text-gray-400">
                Page {currentPage} of {resources.totalPages}
              </span>
              
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(resources.totalPages, prev + 1))}
                disabled={currentPage === resources.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}