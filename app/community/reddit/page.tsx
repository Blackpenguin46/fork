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
import { 
  Users, 
  Search, 
  Clock, 
  Eye, 
  Heart, 
  Crown,
  ExternalLink,
  Grid3X3,
  List,
  ChevronRight,
  Home,
  MessageSquare
} from 'lucide-react'
import Link from 'next/link'
import BookmarkButton from '@/components/bookmarks/BookmarkButton'

const difficultyColors = {
  beginner: 'bg-green-500/10 text-green-400 border-green-500/20',
  intermediate: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  advanced: 'bg-red-500/10 text-red-400 border-red-500/20'
}

export default function CommunityRedditPage() {
  const { user } = useAuth()
  const { canAccessPremiumResources } = useSubscription() || { canAccessPremiumResources: false }
  
  const [resources, setResources] = useState<PaginatedResponse<Resource> | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [premiumFilter, setPremiumFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'created_at' | 'view_count' | 'like_count' | 'title'>('created_at')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [currentPage, setCurrentPage] = useState(1)
  
  const pageSize = 24

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true)
        
        const result = await ResourcesService.getResources({
          resourceType: 'community',
          difficultyLevel: selectedDifficulty === 'all' ? undefined : selectedDifficulty,
          isPremium: premiumFilter === 'all' ? undefined : premiumFilter === 'premium',
          isPublished: true,
          searchQuery: searchQuery || undefined,
          sortBy,
          sortOrder: 'desc',
          page: currentPage,
          limit: pageSize
        })

        if (result.success && result.data) {
          setResources(result.data)
        }
      } catch (error) {
        console.error('Error fetching Reddit communities:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchResources()
  }, [selectedDifficulty, premiumFilter, sortBy, searchQuery, currentPage])

  const getDifficultyColor = (level: string) => {
    return difficultyColors[level as keyof typeof difficultyColors] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'
  }

  const resetFilters = () => {
    setSearchQuery('')
    setSelectedDifficulty('all')
    setPremiumFilter('all')
    setSortBy('created_at')
    setCurrentPage(1)
  }

  return (
    <div className="min-h-screen bg-deep-space-blue pt-16">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center space-x-2 text-sm text-gray-400 mb-6">
          <Link href="/" className="hover:text-cyber-cyan transition-colors">
            <Home className="h-4 w-4" />
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/community" className="hover:text-cyber-cyan transition-colors">
            Community
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-white">Reddit</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-orange-500/10 border-orange-500/20 border rounded-lg">
              <Users className="h-8 w-8 text-orange-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Reddit Communities</h1>
              <p className="text-xl text-gray-300 mt-2">Join cybersecurity subreddits for discussions, news, and community support</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <span>{resources?.count || 0} Reddit communities</span>
            <Badge variant="outline" className="text-orange-400 border-orange-500/20">
              Community
            </Badge>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search Reddit communities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white"
            />
          </div>

          {/* Filter Row */}
          <div className="flex flex-wrap gap-4 items-center">
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-48 bg-gray-800 border-gray-700">
                <SelectValue placeholder="Difficulty Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>

            <Select value={premiumFilter} onValueChange={setPremiumFilter}>
              <SelectTrigger className="w-48 bg-gray-800 border-gray-700">
                <SelectValue placeholder="Access Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Communities</SelectItem>
                <SelectItem value="free">Free Only</SelectItem>
                <SelectItem value="premium">Premium Only</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-48 bg-gray-800 border-gray-700">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Newest</SelectItem>
                <SelectItem value="title">Alphabetical</SelectItem>
                <SelectItem value="view_count">Most Viewed</SelectItem>
                <SelectItem value="like_count">Most Liked</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            <Button variant="outline" onClick={resetFilters}>
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-6`}>
            {[...Array(12)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-64 bg-gray-700 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : !resources?.data?.length ? (
          <div className="text-center py-12">
            <div className="p-4 bg-orange-500/10 rounded-lg inline-block mb-4">
              <Users className="h-12 w-12 text-orange-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Reddit communities found</h3>
            <p className="text-gray-400 mb-4">
              {searchQuery ? 'Try adjusting your search or filters' : 'No Reddit communities are available yet'}
            </p>
            <Button onClick={resetFilters} variant="outline">
              Clear Filters
            </Button>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-gray-400">
                Showing {resources.data.length} of {resources.count} Reddit communities
                {searchQuery && ` for "${searchQuery}"`}
              </p>
            </div>

            {/* Resource Grid/List */}
            <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-6 mb-8`}>
              {resources.data.map((resource) => (
                <Card key={resource.id} className="bg-gray-800/50 border-gray-700 hover:border-orange-500/50 transition-colors group">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-orange-400" />
                        <Badge variant="outline" className={getDifficultyColor(resource.difficulty_level)}>
                          {resource.difficulty_level}
                        </Badge>
                      </div>
                      {resource.is_premium && (
                        <Crown className="h-4 w-4 text-yellow-400" />
                      )}
                    </div>
                    
                    <CardTitle className="text-white line-clamp-2 group-hover:text-orange-400 transition-colors">
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
                          <span>{resource.view_count || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Heart className="h-4 w-4" />
                          <span>{resource.like_count || 0}</span>
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
                        <Link href={`/resource/${resource.slug}`}>
                          View Details
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
                        Premium community - upgrade to access
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {resources.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                <div className="flex items-center space-x-2">
                  {Array.from({ length: Math.min(5, resources.totalPages) }, (_, i) => {
                    const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i
                    if (pageNum > resources.totalPages) return null
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === currentPage ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                
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

        {/* Quick Links to Other Community Sections */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Explore Other Community Platforms</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Link href="/community/discord" className="group">
              <div className="flex items-center space-x-2 p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors">
                <MessageSquare className="h-4 w-4 text-indigo-400" />
                <span className="text-sm text-white group-hover:text-indigo-400 transition-colors">Discord</span>
              </div>
            </Link>
            
            <Link href="/community/forums" className="group">
              <div className="flex items-center space-x-2 p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors">
                <Users className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-white group-hover:text-blue-400 transition-colors">Forums</span>
              </div>
            </Link>
            
            <Link href="/community/skool" className="group">
              <div className="flex items-center space-x-2 p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors">
                <Users className="h-4 w-4 text-purple-400" />
                <span className="text-sm text-white group-hover:text-purple-400 transition-colors">Skool</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}