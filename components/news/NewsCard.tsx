'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Calendar,
  Clock,
  Eye,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Share2,
  Zap,
  AlertTriangle,
  TrendingUp,
  Crown,
  User
} from 'lucide-react'
import Link from 'next/link'
import type { NewsArticle } from '@/lib/types/news'
import { useAuth } from '@/app/providers'
import { useSubscription } from '@/hooks/useSubscription'

interface NewsCardProps {
  article: NewsArticle
  variant?: 'default' | 'featured' | 'compact' | 'list'
  showSource?: boolean
  showCategory?: boolean
  showActions?: boolean
  onArticleClick?: (article: NewsArticle) => void
  onSourceClick?: (sourceId: string) => void
  className?: string
}

export default function NewsCard({
  article,
  variant = 'default',
  showSource = true,
  showCategory = true,
  showActions = true,
  onArticleClick,
  onSourceClick,
  className = ''
}: NewsCardProps) {
  const { user } = useAuth()
  const { canAccessPremiumResources } = useSubscription()
  const [isBookmarked, setIsBookmarked] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return 'Yesterday'
    return formatDate(dateString)
  }

  const getTrendingBadge = (viewCount: number) => {
    if (viewCount > 10000) return { text: 'Viral', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' }
    if (viewCount > 5000) return { text: 'Hot', color: 'bg-red-500/10 text-red-400 border-red-500/20' }
    if (viewCount > 1000) return { text: 'Trending', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' }
    if (viewCount > 500) return { text: 'Popular', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' }
    return null
  }

  const getSentimentColor = (score?: number) => {
    if (!score) return 'text-gray-400'
    if (score > 0.2) return 'text-green-400'
    if (score < -0.2) return 'text-red-400'
    return 'text-yellow-400'
  }

  const handleBookmark = async () => {
    // TODO: Implement bookmark functionality
    setIsBookmarked(!isBookmarked)
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: article.title,
        text: article.description,
        url: article.original_url
      })
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(article.original_url)
    }
  }

  const handleArticleClick = () => {
    if (onArticleClick) {
      onArticleClick(article)
    }
  }

  const trendingBadge = getTrendingBadge(article.view_count)
  const isRecent = new Date(article.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  const isPremium = false // TODO: Implement premium content logic

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`group cursor-pointer ${className}`}
        onClick={handleArticleClick}
      >
        <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-800/30 transition-colors">
          {article.thumbnail_url && (
            <img
              src={article.thumbnail_url}
              alt={article.title}
              className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
            />
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-1">
              <h4 className="text-sm font-medium text-white line-clamp-2 group-hover:text-cyber-cyan transition-colors">
                {article.title}
              </h4>
              {isPremium && <Crown className="h-3 w-3 text-yellow-400 flex-shrink-0 ml-2" />}
            </div>
            
            <p className="text-xs text-gray-400 line-clamp-1 mb-2">
              {article.description}
            </p>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-2">
                {showSource && article.source && (
                  <span>{article.source.name}</span>
                )}
                <span>•</span>
                <span>{formatTimeAgo(article.published_at || article.created_at)}</span>
              </div>
              
              {isRecent && (
                <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">
                  New
                </Badge>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  if (variant === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={className}
      >
        <Card className="bg-gray-800/50 border-gray-700 hover:border-cyber-cyan/50 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-start space-x-4">
              {article.thumbnail_url && (
                <img
                  src={article.thumbnail_url}
                  alt={article.title}
                  className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                />
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2 flex-wrap gap-1">
                    {article.is_breaking && (
                      <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Breaking
                      </Badge>
                    )}
                    {isRecent && (
                      <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
                        <Zap className="h-3 w-3 mr-1" />
                        New
                      </Badge>
                    )}
                    {trendingBadge && (
                      <Badge variant="outline" className={trendingBadge.color}>
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {trendingBadge.text}
                      </Badge>
                    )}
                    {showCategory && article.category && (
                      <Badge variant="outline" className="text-cyber-cyan border-cyber-cyan/30">
                        {article.category.name}
                      </Badge>
                    )}
                  </div>
                  {isPremium && <Crown className="h-4 w-4 text-yellow-400 flex-shrink-0" />}
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2 hover:text-cyber-cyan transition-colors cursor-pointer line-clamp-2">
                  {article.title}
                </h3>
                
                <p className="text-gray-400 mb-3 line-clamp-2">
                  {article.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    {showSource && article.source && (
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span 
                          className="hover:text-cyber-cyan cursor-pointer"
                          onClick={() => onSourceClick?.(article.source_id)}
                        >
                          {article.source.name}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(article.published_at || article.created_at)}</span>
                    </div>
                    
                    {article.read_time_minutes && (
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{article.read_time_minutes}m read</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>{article.view_count}</span>
                    </div>
                  </div>
                  
                  {showActions && (
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" onClick={handleBookmark}>
                        {isBookmarked ? (
                          <BookmarkCheck className="h-4 w-4 text-yellow-400" />
                        ) : (
                          <Bookmark className="h-4 w-4" />
                        )}
                      </Button>
                      
                      <Button variant="ghost" size="sm" onClick={handleShare}>
                        <Share2 className="h-4 w-4" />
                      </Button>
                      
                      <Button asChild size="sm">
                        <a href={article.original_url} target="_blank" rel="noopener noreferrer">
                          Read Article
                          <ExternalLink className="h-4 w-4 ml-1" />
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // Default variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card className={`bg-gray-800/50 border-gray-700 hover:border-cyber-cyan/50 transition-colors group ${
        variant === 'featured' ? 'border-cyber-cyan/30 bg-gradient-to-br from-cyan-900/10 to-blue-900/10' : ''
      }`}>
        {article.thumbnail_url && (
          <div className="relative overflow-hidden">
            <img
              src={article.thumbnail_url}
              alt={article.title}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {isPremium && (
              <div className="absolute top-2 right-2">
                <Crown className="h-5 w-5 text-yellow-400" />
              </div>
            )}
            {article.is_breaking && (
              <div className="absolute top-2 left-2">
                <Badge variant="outline" className="bg-red-500/90 text-white border-red-500">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Breaking
                </Badge>
              </div>
            )}
          </div>
        )}
        
        <CardHeader>
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2 flex-wrap gap-1">
              {isRecent && (
                <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
                  <Zap className="h-3 w-3 mr-1" />
                  New
                </Badge>
              )}
              {trendingBadge && (
                <Badge variant="outline" className={trendingBadge.color}>
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {trendingBadge.text}
                </Badge>
              )}
              {showCategory && article.category && (
                <Badge variant="outline" className="text-cyber-cyan border-cyber-cyan/30">
                  {article.category.name}
                </Badge>
              )}
            </div>
          </div>
          
          <CardTitle className="text-white line-clamp-2 hover:text-cyber-cyan transition-colors cursor-pointer">
            {article.title}
          </CardTitle>
          
          <CardDescription className="text-gray-300 line-clamp-3">
            {article.description}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              {showSource && article.source && (
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span 
                    className="hover:text-cyber-cyan cursor-pointer"
                    onClick={() => onSourceClick?.(article.source_id)}
                  >
                    {article.source.name}
                  </span>
                </div>
              )}
              
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(article.published_at || article.created_at)}</span>
              </div>
              
              {article.read_time_minutes && (
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{article.read_time_minutes}m read</span>
                </div>
              )}
              
              <div className="flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>{article.view_count}</span>
              </div>
            </div>
            
            {article.sentiment_score && (
              <div className={`text-sm ${getSentimentColor(article.sentiment_score)}`}>
                {article.sentiment_score > 0.2 ? '😊' : article.sentiment_score < -0.2 ? '😔' : '😐'}
              </div>
            )}
          </div>

          {showActions && (
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" onClick={handleBookmark}>
                  {isBookmarked ? (
                    <BookmarkCheck className="h-4 w-4 text-yellow-400" />
                  ) : (
                    <Bookmark className="h-4 w-4" />
                  )}
                </Button>
                
                <Button variant="ghost" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
              
              <Button asChild>
                <a href={article.original_url} target="_blank" rel="noopener noreferrer">
                  Read Article
                  <ExternalLink className="h-4 w-4 ml-1" />
                </a>
              </Button>
            </div>
          )}

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {article.tags.slice(0, 3).map((tag) => (
                <Badge key={tag.id} variant="outline" className="text-xs text-gray-400 border-gray-600">
                  {tag.tag_name}
                </Badge>
              ))}
              {article.tags.length > 3 && (
                <Badge variant="outline" className="text-xs text-gray-400 border-gray-600">
                  +{article.tags.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}