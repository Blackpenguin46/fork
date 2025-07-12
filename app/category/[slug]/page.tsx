'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ResourcesService, CategoriesService } from '@/lib/api'
import type { Resource, Category, PaginatedResponse } from '@/lib/api'
import { useAuth } from '@/app/providers'
import { useSubscription } from '@/hooks/useSubscription'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  BookOpen, 
  Play, 
  FileText, 
  Wrench, 
  Users, 
  Podcast, 
  Video,
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
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import BookmarkButton from '@/components/bookmarks/BookmarkButton'

const resourceTypeIcons = {
  course: BookOpen,
  article: FileText,
  video: Video,
  tool: Wrench,
  community: Users,
  podcast: Podcast,
  documentation: FileText,
  cheatsheet: FileText
}

const difficultyColors = {
  beginner: 'bg-green-500/10 text-green-400 border-green-500/20',
  intermediate: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  advanced: 'bg-red-500/10 text-red-400 border-red-500/20'
}

export default function CategoryPage() {
  const params = useParams()
  const { user } = useAuth()
  const { canAccessPremiumResources } = useSubscription() || { canAccessPremiumResources: false }
  
  const [category, setCategory] = useState<Category | null>(null)
  const [subcategories, setSubcategories] = useState<Category[]>([])
  const [resources, setResources] = useState<PaginatedResponse<Resource> | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [premiumFilter, setPremiumFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'created_at' | 'view_count' | 'like_count' | 'title'>('created_at')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [currentPage, setCurrentPage] = useState(1)
  
  const pageSize = 24
  const categorySlug = params.slug as string

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true)
        
        const [categoryResult, subcategoriesResult, resourcesResult] = await Promise.allSettled([
          CategoriesService.getCategory(categorySlug),
          CategoriesService.getCategories({ parentId: categorySlug }),
          ResourcesService.getResources({
            categoryId: categorySlug,
            resourceType: selectedType === 'all' ? undefined : selectedType,
            difficultyLevel: selectedDifficulty === 'all' ? undefined : selectedDifficulty,
            isPremium: premiumFilter === 'all' ? undefined : premiumFilter === 'premium',
            isPublished: true,
            searchQuery: searchQuery || undefined,
            sortBy,
            sortOrder: 'desc',
            page: currentPage,
            limit: pageSize
          })
        ])

        if (categoryResult.status === 'fulfilled' && categoryResult.value.success && categoryResult.value.data) {
          setCategory(categoryResult.value.data)
        }

        if (subcategoriesResult.status === 'fulfilled' && subcategoriesResult.value.success) {
          setSubcategories(subcategoriesResult.value.data?.data || [])
        }

        if (resourcesResult.status === 'fulfilled' && resourcesResult.value.success && resourcesResult.value.data) {
          setResources(resourcesResult.value.data)
        }
      } catch (error) {
        console.error('Error fetching category data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategoryData()
  }, [categorySlug, selectedType, selectedDifficulty, premiumFilter, sortBy, searchQuery, currentPage])

  const resourceTypes = [
    { value: 'all', label: 'All Types', icon: Grid3X3 },
    { value: 'course', label: 'Courses', icon: BookOpen },
    { value: 'article', label: 'Articles', icon: FileText },
    { value: 'video', label: 'Videos', icon: Video },
    { value: 'tool', label: 'Tools', icon: Wrench },
    { value: 'community', label: 'Communities', icon: Users },
    { value: 'podcast', label: 'Podcasts', icon: Podcast },
    { value: 'documentation', label: 'Documentation', icon: FileText },
    { value: 'cheatsheet', label: 'Cheat Sheets', icon: FileText }
  ]

  const getResourceIcon = (type: string) => {
    const IconComponent = resourceTypeIcons[type as keyof typeof resourceTypeIcons] || FileText
    return <IconComponent className="h-4 w-4" />
  }

  const getDifficultyColor = (level: string) => {
    return difficultyColors[level as keyof typeof difficultyColors] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'
  }

  const resetFilters = () => {
    setSearchQuery('')
    setSelectedType('all')
    setSelectedDifficulty('all')
    setPremiumFilter('all')
    setSortBy('created_at')
    setCurrentPage(1)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-deep-space-blue pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-64 mb-4"></div>
            <div className="h-6 bg-gray-700 rounded w-96 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-deep-space-blue pt-16">
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Category Not Found</h1>
          <p className="text-gray-400 mb-6">The category you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/resources">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Resources
            </Button>
          </Link>
        </div>
      </div>
    )
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
          <Link href="/resources" className="hover:text-cyber-cyan transition-colors">
            Resources
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-white">{category.name}</span>
        </div>

        {/* Category Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-cyber-cyan/20 rounded-lg">
              <BookOpen className="h-8 w-8 text-cyber-cyan" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">{category.name}</h1>
              {category.description && (
                <p className="text-xl text-gray-300 mt-2">{category.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <span>{resources?.count || 0} resources</span>
            {subcategories.length > 0 && (
              <span>{subcategories.length} subcategories</span>
            )}
          </div>
        </div>

        {/* Subcategories */}
        {subcategories.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Subcategories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subcategories.map((subcategory) => (
                <Link 
                  key={subcategory.id} 
                  href={`/category/${subcategory.slug}`}
                  className="group"
                >
                  <Card className="bg-gray-800/50 border-gray-700 hover:border-cyber-cyan/50 transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="p-2 bg-gray-700/50 rounded-lg group-hover:bg-cyber-cyan/20 transition-colors">
                            <BookOpen className="h-4 w-4 text-gray-400 group-hover:text-cyber-cyan" />
                          </div>
                          <div>
                            <CardTitle className="text-white text-sm group-hover:text-cyber-cyan transition-colors">
                              {subcategory.name}
                            </CardTitle>
                            {subcategory.description && (
                              <CardDescription className="text-xs text-gray-400 mt-1">
                                {subcategory.description}
                              </CardDescription>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-cyber-cyan group-hover:translate-x-1 transition-all" />
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder={`Search in ${category.name}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white"
            />
          </div>

          {/* Filter Row */}
          <div className="flex flex-wrap gap-4 items-center">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-48 bg-gray-800 border-gray-700">
                <SelectValue placeholder="Resource Type" />
              </SelectTrigger>
              <SelectContent>
                {resourceTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center space-x-2">
                      <type.icon className="h-4 w-4" />
                      <span>{type.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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
                <SelectItem value="all">All Resources</SelectItem>
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
        {!resources?.data?.length ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">No resources found in this category</p>
            <Button onClick={resetFilters} variant="outline">
              Clear Filters
            </Button>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-gray-400">
                Showing {resources.data.length} of {resources.count} resources in {category.name}
                {searchQuery && ` for "${searchQuery}"`}
              </p>
            </div>

            {/* Resource Grid/List */}
            <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-6 mb-8`}>
              {resources.data.map((resource) => (
                <Card key={resource.id} className="bg-gray-800/50 border-gray-700 hover:border-cyber-cyan/50 transition-colors group">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {getResourceIcon(resource.resource_type)}
                        <Badge variant="outline" className={getDifficultyColor(resource.difficulty_level)}>
                          {resource.difficulty_level}
                        </Badge>
                      </div>
                      {resource.is_premium && (
                        <Crown className="h-4 w-4 text-yellow-400" />
                      )}
                    </div>
                    
                    <CardTitle className="text-white line-clamp-2 group-hover:text-cyber-cyan transition-colors">
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
      </div>
    </div>
  )
}