'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Filter, 
  RotateCcw, 
  Grid3X3, 
  List, 
  Loader2,
  TrendingUp,
  Calendar,
  AlertTriangle,
  Newspaper
} from 'lucide-react'
import NewsCard from './NewsCard'
import type { NewsArticle, NewsCategory, NewsSource, PaginatedNewsResponse } from '@/lib/types/news'

interface NewsFeedProps {
  categories?: string[]
  sources?: string[]
  limit?: number
  showFilters?: boolean
  showSearch?: boolean
  showStats?: boolean
  variant?: 'grid' | 'list' | 'masonry'
  refreshInterval?: number
  className?: string
}

export default function NewsFeed({
  categories = [],
  sources = [],
  limit = 20,
  showFilters = true,
  showSearch = true,
  showStats = true,
  variant = 'grid',
  refreshInterval = 300000, // 5 minutes
  className = ''
}: NewsFeedProps) {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [allCategories, setAllCategories] = useState<NewsCategory[]>([])
  const [allSources, setAllSources] = useState<NewsSource[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>(categories)
  const [selectedSources, setSelectedSources] = useState<string[]>(sources)
  const [sortBy, setSortBy] = useState<'published_at' | 'view_count' | 'created_at'>('published_at')
  const [activeTab, setActiveTab] = useState('all')
  const [pagination, setPagination] = useState<PaginatedNewsResponse['pagination'] | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(variant === 'masonry' ? 'grid' : variant)
  const [stats, setStats] = useState<any>(null)

  const fetchArticles = useCallback(async (reset = false) => {
    try {
      if (reset) {
        setLoading(true)
      } else {
        setRefreshing(true)
      }

      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: reset ? '0' : (pagination?.page ? ((pagination.page - 1) * pagination.limit).toString() : '0'),
        sortBy,
        sortOrder: 'desc'
      })

      if (selectedCategories.length > 0) {
        params.append('categories', selectedCategories.join(','))
      }
      
      if (selectedSources.length > 0) {
        params.append('sources', selectedSources.join(','))
      }
      
      if (searchQuery) {
        params.append('search', searchQuery)
      }

      // Apply tab-specific filters
      switch (activeTab) {
        case 'breaking':
          params.append('breaking', 'true')
          break
        case 'trending':
          params.append('trending', 'true')
          break
        case 'featured':
          params.append('featured', 'true')
          break
      }

      const response = await fetch(`/api/news/articles?${params}`)
      const result = await response.json()

      if (result.success) {
        if (reset) {
          setArticles(result.data.articles)
        } else {
          setArticles(prev => [...prev, ...result.data.articles])
        }
        setPagination(result.data.pagination)
      } else {
        console.error('Failed to fetch articles:', result.error)
      }

    } catch (error) {
      console.error('Error fetching articles:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [limit, pagination?.page, pagination?.limit, sortBy, selectedCategories, selectedSources, searchQuery, activeTab])

  const fetchMetadata = useCallback(async () => {
    try {
      const [categoriesRes, sourcesRes, statsRes] = await Promise.all([
        fetch('/api/news/categories?includeStats=true'),
        fetch('/api/news/sources?includeStats=true'),
        showStats ? fetch('/api/news/stats') : Promise.resolve(null)
      ])

      const [categoriesData, sourcesData, statsData] = await Promise.all([
        categoriesRes.json(),
        sourcesRes.json(),
        statsRes?.json()
      ])

      if (categoriesData.success) {
        setAllCategories(categoriesData.data)
      }
      
      if (sourcesData.success) {
        setAllSources(sourcesData.data)
      }
      
      if (statsData?.success) {
        setStats(statsData.data)
      }

    } catch (error) {
      console.error('Error fetching metadata:', error)
    }
  }, [showStats])

  const handleRefresh = async () => {
    await fetchArticles(true)
  }

  const handleSearch = async () => {
    await fetchArticles(true)
  }

  const handleLoadMore = async () => {
    if (pagination?.hasNextPage) {
      await fetchArticles(false)
    }
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    // Reset and fetch with new tab filters
    setTimeout(() => fetchArticles(true), 100)
  }

  const handleCategoryFilter = (categoryId: string) => {
    const newCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId]
    
    setSelectedCategories(newCategories)
    setTimeout(() => fetchArticles(true), 100)
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedSources([])
    setSearchQuery('')
    setActiveTab('all')
    setTimeout(() => fetchArticles(true), 100)
  }

  // Initial load
  useEffect(() => {
    fetchMetadata()
    fetchArticles(true)
  }, [])

  // Auto-refresh
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(() => {
        fetchArticles(true)
      }, refreshInterval)

      return () => clearInterval(interval)
    }
  }, [refreshInterval, fetchArticles])

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-700 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Stats */}
      {showStats && stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Newspaper className="h-5 w-5 text-cyber-cyan" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.totalArticles}</p>
                <p className="text-sm text-gray-400">Total Articles</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-orange-400" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.trendingArticles}</p>
                <p className="text-sm text-gray-400">Trending</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.breakingNews}</p>
                <p className="text-sm text-gray-400">Breaking</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.recentArticles}</p>
                <p className="text-sm text-gray-400">Recent</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      {(showSearch || showFilters) && (
        <div className="space-y-4">
          {showSearch && (
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search news articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <Button onClick={handleSearch} variant="outline">
                <Search className="h-4 w-4" />
              </Button>
              <Button 
                onClick={handleRefresh} 
                variant="outline"
                disabled={refreshing}
              >
                {refreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RotateCcw className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}

          {showFilters && (
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-400">Filters:</span>
              </div>

              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-40 bg-gray-800 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published_at">Latest</SelectItem>
                  <SelectItem value="view_count">Most Popular</SelectItem>
                  <SelectItem value="created_at">Recently Added</SelectItem>
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

              {(selectedCategories.length > 0 || selectedSources.length > 0 || searchQuery) && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          )}

          {/* Category filters */}
          {allCategories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {allCategories.map((category) => (
                <Badge
                  key={category.id}
                  variant={selectedCategories.includes(category.id) ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-cyber-cyan/20"
                  onClick={() => handleCategoryFilter(category.id)}
                >
                  {category.name}
                  {(category as any).articleCount && (
                    <span className="ml-1 text-xs">({(category as any).articleCount})</span>
                  )}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800/50">
          <TabsTrigger value="all">All News</TabsTrigger>
          <TabsTrigger value="breaking">Breaking</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="featured">Featured</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {articles.length === 0 ? (
            <div className="text-center py-12">
              <Newspaper className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">No articles found</p>
              <Button onClick={clearFilters} variant="outline">
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Articles Grid/List */}
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }>
                <AnimatePresence>
                  {articles.map((article, index) => (
                    <NewsCard
                      key={article.id}
                      article={article}
                      variant={viewMode === 'list' ? 'list' : index === 0 && activeTab === 'all' ? 'featured' : 'default'}
                      showSource={true}
                      showCategory={true}
                      showActions={true}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {/* Load More */}
              {pagination?.hasNextPage && (
                <div className="text-center">
                  <Button onClick={handleLoadMore} variant="outline">
                    Load More Articles
                  </Button>
                </div>
              )}

              {/* Pagination Info */}
              {pagination && (
                <div className="text-center text-sm text-gray-400">
                  Showing {articles.length} of {pagination.total} articles
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}