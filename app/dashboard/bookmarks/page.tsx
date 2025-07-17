'use client'

import { useState, useEffect } from 'react'
import { BookmarksService } from '@/lib/api'
import type { Bookmark, Resource, BookmarkCollection } from '@/lib/api'
import { useAuth } from '@/app/providers'
import { useSubscription } from '@/hooks/useSubscription'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Bookmark as BookmarkIcon, 
  Search, 
  Filter, 
  Clock, 
  Eye, 
  ExternalLink,
  X,
  Crown,
  Calendar,
  TrendingUp,
  BookOpen,
  Video,
  Users,
  Globe,
  Plus,
  Folder,
  Grid,
  List,
  Star,
  Archive,
  Tag,
  SortAsc,
  SortDesc
} from 'lucide-react'
import Link from 'next/link'
import BookmarkButton from '@/components/bookmarks/BookmarkButton'
import { motion } from 'framer-motion'

export default function BookmarksPage() {
  const { user } = useAuth()
  const { canBookmarkResources } = useSubscription()
  
  const [bookmarksData, setBookmarksData] = useState<{
    bookmarks: Bookmark[]
    resources: Resource[]
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 12

  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!user?.id || !canBookmarkResources) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const result = await BookmarksService.getUserBookmarks(user.id, {
          page: currentPage,
          limit: pageSize
        })

        if (result.success && result.data) {
          setBookmarksData(result.data)
        }
      } catch (error) {
        console.error('Error fetching bookmarks:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBookmarks()
  }, [user?.id, canBookmarkResources, currentPage])

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />
      case 'course':
        return <BookOpen className="h-4 w-4" />
      case 'community':
        return <Users className="h-4 w-4" />
      case 'tool':
        return <Globe className="h-4 w-4" />
      default:
        return <BookmarkIcon className="h-4 w-4" />
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

  const filteredResources = bookmarksData?.resources.filter(resource => {
    const matchesSearch = !searchQuery || 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesType = !typeFilter || resource.resource_type === typeFilter
    const matchesDifficulty = !difficultyFilter || resource.difficulty_level === difficultyFilter
    
    return matchesSearch && matchesType && matchesDifficulty
  }) || []

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (!canBookmarkResources) {
    return (
      <div className="min-h-screen bg-deep-space-blue pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <Crown className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-4">Premium Feature</h1>
            <p className="text-gray-400 mb-6">
              Bookmarks are available with a Pro subscription. Upgrade to save your favorite resources.
            </p>
            <Button asChild>
              <Link href="/pricing">
                Upgrade to Pro
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-deep-space-blue pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-700 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-deep-space-blue pt-16">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <BookmarkIcon className="h-8 w-8 text-cyber-cyan" />
            <h1 className="text-4xl font-bold text-white">My Bookmarks</h1>
          </div>
          <p className="text-xl text-gray-300 mb-6">
            Your saved cybersecurity resources and learning materials
          </p>
          
          {/* Stats */}
          {bookmarksData && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <BookmarkIcon className="h-5 w-5 text-cyber-cyan" />
                    <div>
                      <p className="text-2xl font-bold text-white">{bookmarksData.bookmarks.length}</p>
                      <p className="text-sm text-gray-400">Total Bookmarks</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5 text-green-400" />
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {bookmarksData.resources.filter(r => r.resource_type === 'course').length}
                      </p>
                      <p className="text-sm text-gray-400">Courses</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Video className="h-5 w-5 text-blue-400" />
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {bookmarksData.resources.filter(r => r.resource_type === 'video').length}
                      </p>
                      <p className="text-sm text-gray-400">Videos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-5 w-5 text-purple-400" />
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {bookmarksData.resources.filter(r => r.resource_type === 'tool').length}
                      </p>
                      <p className="text-sm text-gray-400">Tools</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search bookmarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48 bg-gray-800 border-gray-700">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="course">Courses</SelectItem>
                <SelectItem value="article">Articles</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
                <SelectItem value="tool">Tools</SelectItem>
                <SelectItem value="community">Community</SelectItem>
              </SelectContent>
            </Select>

            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-48 bg-gray-800 border-gray-700">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>

            {(searchQuery || typeFilter || difficultyFilter) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('')
                  setTypeFilter('')
                  setDifficultyFilter('')
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Bookmarks Grid */}
        {filteredResources.length === 0 ? (
          <div className="text-center py-12">
            <BookmarkIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {bookmarksData?.bookmarks.length === 0 ? 'No bookmarks yet' : 'No bookmarks match your filters'}
            </h3>
            <p className="text-gray-400 mb-6">
              {bookmarksData?.bookmarks.length === 0 
                ? 'Start exploring and bookmark resources you want to save for later.'
                : 'Try adjusting your search or filters.'
              }
            </p>
            <div className="flex space-x-3 justify-center">
              <Button asChild>
                <Link href="/academy">Browse Academy</Link>
              </Button>
              {bookmarksData?.bookmarks && bookmarksData.bookmarks.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('')
                    setTypeFilter('')
                    setDifficultyFilter('')
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => {
              const bookmark = bookmarksData?.bookmarks.find(b => b.resource_id === resource.id)
              
              return (
                <Card key={resource.id} className="bg-gray-800/50 border-gray-700 hover:border-cyber-cyan/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {getResourceIcon(resource.resource_type)}
                        <Badge variant="outline" className={getDifficultyColor(resource.difficulty_level)}>
                          {resource.difficulty_level}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <BookmarkButton
                          resourceId={resource.id}
                          resourceTitle={resource.title}
                          size="sm"
                        />
                      </div>
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
                        {resource.estimated_time_minutes && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{resource.estimated_time_minutes}m</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>{resource.view_count}</span>
                        </div>
                        {bookmark && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(bookmark.created_at)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button asChild className="flex-1">
                        <Link href={`/resources/${resource.slug}`}>
                          View Resource
                        </Link>
                      </Button>
                      
                      {resource.url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={resource.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}