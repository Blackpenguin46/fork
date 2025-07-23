'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  AlertTriangle, 
  Shield, 
  Eye, 
  Clock, 
  ExternalLink,
  Zap,
  Target,
  Bug,
  Activity,
  RefreshCw,
  Rss,
  TrendingUp
} from 'lucide-react'
import type { NewsArticle } from '@/lib/types/news'

interface LiveNewsFeedProps {
  maxItems?: number
  autoRefresh?: boolean
  refreshInterval?: number
  showSeverityFilter?: boolean
  compact?: boolean
  className?: string
}

export default function LiveNewsFeed({
  maxItems = 10,
  autoRefresh = true,
  refreshInterval = 300000, // 5 minutes
  showSeverityFilter = true,
  compact = false,
  className = ''
}: LiveNewsFeedProps) {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [severityFilter, setSeverityFilter] = useState<string>('all')

  const fetchLatestNews = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const params = new URLSearchParams({
        limit: maxItems.toString(),
        sortBy: 'published_at',
        sortOrder: 'desc',
        moderationStatus: 'approved'
      })

      // Add severity filter if not 'all'
      if (severityFilter !== 'all') {
        // Map severity to categories or use breaking/trending flags
        switch (severityFilter) {
          case 'critical':
            params.append('breaking', 'true')
            break
          case 'high':
            params.append('trending', 'true')
            break
        }
      }

      const response = await fetch(`/api/news/articles?${params}`)
      const result = await response.json()

      if (result.success && result.data?.articles) {
        setArticles(result.data.articles)
        setLastUpdated(new Date())
      } else {
        console.error('Failed to fetch news:', result.error)
      }

    } catch (error) {
      console.error('Error fetching live news:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [maxItems, severityFilter])

  const handleRefresh = () => {
    fetchLatestNews(true)
  }

  // Initial load
  useEffect(() => {
    fetchLatestNews()
  }, [fetchLatestNews])

  // Auto-refresh
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(() => {
        fetchLatestNews(true)
      }, refreshInterval)

      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval, fetchLatestNews])

  const getSeverityFromArticle = (article: NewsArticle): 'critical' | 'high' | 'medium' | 'low' => {
    // Determine severity based on article properties
    if (article.is_breaking) return 'critical'
    if (article.is_trending) return 'high'
    if (article.is_featured) return 'medium'
    return 'low'
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/10 text-red-400 border-red-500/20'
      case 'high':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20'
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      case 'low':
        return 'bg-green-500/10 text-green-400 border-green-500/20'
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4" />
      case 'high':
        return <Zap className="h-4 w-4" />
      case 'medium':
        return <Target className="h-4 w-4" />
      case 'low':
        return <Shield className="h-4 w-4" />
      default:
        return <Eye className="h-4 w-4" />
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const extractCVEFromContent = (article: NewsArticle): string | null => {
    const text = `${article.title} ${article.description || ''}`
    const cveMatch = text.match(/CVE-\d{4}-\d{4,}/i)
    return cveMatch ? cveMatch[0] : null
  }

  if (loading) {
    return (
      <Card className={`bg-gray-800/50 border-gray-700 ${className}`}>
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Activity className="h-5 w-5 text-cyber-cyan animate-pulse" />
            <span>Live Threat Feed</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`bg-gray-800/50 border-gray-700 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center space-x-2">
            <div className="relative">
              <Activity className="h-5 w-5 text-cyber-cyan" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            </div>
            <span>Live Threat Feed</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            {lastUpdated && (
              <span className="text-xs text-gray-400">
                Updated {formatTimeAgo(lastUpdated.toISOString())}
              </span>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRefresh}
              disabled={refreshing}
              className="text-gray-400 hover:text-white"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        
        {showSeverityFilter && (
          <div className="flex items-center space-x-2 mt-2">
            <span className="text-sm text-gray-400">Filter:</span>
            {['all', 'critical', 'high', 'medium', 'low'].map((severity) => (
              <Button
                key={severity}
                size="sm"
                variant={severityFilter === severity ? 'default' : 'ghost'}
                onClick={() => setSeverityFilter(severity)}
                className="text-xs"
              >
                {severity === 'all' ? 'All' : severity.charAt(0).toUpperCase() + severity.slice(1)}
              </Button>
            ))}
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {articles.length === 0 ? (
          <div className="text-center py-8">
            <Rss className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">No recent threat intelligence</p>
            <p className="text-sm text-gray-500">Check back soon for updates</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {articles.map((article, index) => {
                const severity = getSeverityFromArticle(article)
                const cveId = extractCVEFromContent(article)
                
                return (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg border transition-colors hover:border-cyber-cyan/30 ${
                      compact ? 'bg-gray-700/20' : 'bg-gray-700/30'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={getSeverityColor(severity)}>
                          <div className="flex items-center space-x-1">
                            {getSeverityIcon(severity)}
                            <span className="text-xs">{severity.toUpperCase()}</span>
                          </div>
                        </Badge>
                        
                        {article.source && (
                          <Badge variant="outline" className="text-xs">
                            {typeof article.source === 'string' ? article.source : article.source.name}
                          </Badge>
                        )}
                        
                        {cveId && (
                          <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/20">
                            {cveId}
                          </Badge>
                        )}
                        
                        {article.is_breaking && (
                          <Badge className="text-xs bg-red-500/20 text-red-400 border-red-500/30">
                            BREAKING
                          </Badge>
                        )}
                      </div>
                      
                      <span className="text-xs text-gray-400">
                        {formatTimeAgo(article.published_at || article.created_at)}
                      </span>
                    </div>

                    <h4 className={`text-white font-medium mb-2 ${compact ? 'text-sm' : 'text-base'} line-clamp-2`}>
                      {article.title}
                    </h4>
                    
                    {article.description && !compact && (
                      <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                        {article.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        {article.author && (
                          <span>by {article.author}</span>
                        )}
                        {article.read_time_minutes && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{article.read_time_minutes}m read</span>
                          </div>
                        )}
                        {article.view_count > 0 && (
                          <div className="flex items-center space-x-1">
                            <Eye className="h-3 w-3" />
                            <span>{article.view_count} views</span>
                          </div>
                        )}
                      </div>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        asChild
                        className="text-cyber-cyan hover:text-white"
                      >
                        <a 
                          href={article.original_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1"
                        >
                          <span className="text-xs">Read</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
            
            {articles.length >= maxItems && (
              <div className="text-center pt-4">
                <Button variant="outline" size="sm" asChild>
                  <a href="/insights/cybersecurity-news">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View All News
                  </a>
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}