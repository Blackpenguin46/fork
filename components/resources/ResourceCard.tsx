'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookmarkButton } from '@/components/bookmarks/BookmarkButton'
import { 
  Clock, 
  Eye, 
  Heart, 
  Bookmark, 
  ExternalLink,
  Star,
  User,
  Calendar
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Database } from '@/types/supabase'

type Resource = Database['public']['Tables']['resources']['Row']

interface ResourceCardProps {
  resource: Resource
  showBookmark?: boolean
  showProgress?: boolean
  progress?: number
  className?: string
  variant?: 'default' | 'compact' | 'featured'
}

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  advanced: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  expert: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
}

const typeColors = {
  article: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  course: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  video: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
  tool: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  documentation: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
  community: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
  cheatsheet: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
  podcast: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300'
}

const typeIcons = {
  article: '📄',
  course: '🎓',
  video: '🎥',
  tool: '🛠️',
  documentation: '📚',
  community: '👥',
  cheatsheet: '📋',
  podcast: '🎧'
}

export function ResourceCard({ 
  resource, 
  showBookmark = true, 
  showProgress = false,
  progress = 0,
  className,
  variant = 'default'
}: ResourceCardProps) {
  const [imageError, setImageError] = useState(false)

  const formatTimeEstimate = (minutes: number | null) => {
    if (!minutes) return null
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const resourceUrl = resource.slug ? `/resource/${resource.slug}` : `/resource/${resource.id}`

  if (variant === 'compact') {
    return (
      <Card className={cn('hover:shadow-md transition-shadow', className)}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <span className="text-2xl">{typeIcons[resource.resource_type as keyof typeof typeIcons] || '📄'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <Badge 
                  variant="secondary" 
                  className={cn('text-xs', typeColors[resource.resource_type as keyof typeof typeColors])}
                >
                  {resource.resource_type}
                </Badge>
                {resource.difficulty_level && (
                  <Badge 
                    variant="outline" 
                    className={cn('text-xs', difficultyColors[resource.difficulty_level as keyof typeof difficultyColors])}
                  >
                    {resource.difficulty_level}
                  </Badge>
                )}
                {resource.is_premium && (
                  <Badge variant="default" className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500">
                    Premium
                  </Badge>
                )}
              </div>
              <Link href={resourceUrl} className="group">
                <h3 className="font-semibold text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2">
                  {resource.title}
                </h3>
              </Link>
              <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Eye className="h-3 w-3" />
                  <span>{resource.view_count}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Heart className="h-3 w-3" />
                  <span>{resource.like_count}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Bookmark className="h-3 w-3" />
                  <span>{resource.bookmark_count}</span>
                </div>
              </div>
            </div>
            {showBookmark && (
              <BookmarkButton resourceId={resource.id} size="sm" />
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (variant === 'featured') {
    return (
      <Card className={cn('overflow-hidden hover:shadow-lg transition-all duration-300 border-2 border-yellow-200 dark:border-yellow-800', className)}>
        <div className="relative">
          {resource.thumbnail_url && !imageError ? (
            <Image
              src={resource.thumbnail_url}
              alt={resource.title}
              width={400}
              height={200}
              className="w-full h-48 object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-6xl">
                {typeIcons[resource.resource_type as keyof typeof typeIcons] || '📄'}
              </span>
            </div>
          )}
          <div className="absolute top-2 left-2">
            <Badge className="bg-yellow-500 text-yellow-900 font-semibold">
              ⭐ Featured
            </Badge>
          </div>
          {showBookmark && (
            <div className="absolute top-2 right-2">
              <BookmarkButton resourceId={resource.id} />
            </div>
          )}
        </div>
        <CardHeader className="pb-2">
          <div className="flex items-center space-x-2 mb-2">
            <Badge 
              variant="secondary" 
              className={typeColors[resource.resource_type as keyof typeof typeColors]}
            >
              {resource.resource_type}
            </Badge>
            {resource.difficulty_level && (
              <Badge 
                variant="outline" 
                className={difficultyColors[resource.difficulty_level as keyof typeof difficultyColors]}
              >
                {resource.difficulty_level}
              </Badge>
            )}
            {resource.is_premium && (
              <Badge variant="default" className="bg-gradient-to-r from-yellow-400 to-orange-500">
                Premium
              </Badge>
            )}
          </div>
          <Link href={resourceUrl} className="group">
            <h3 className="font-bold text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2">
              {resource.title}
            </h3>
          </Link>
        </CardHeader>
        <CardContent className="pt-0">
          {resource.description && (
            <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
              {resource.description}
            </p>
          )}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
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
                  <span>{formatTimeEstimate(resource.estimated_time_minutes)}</span>
                </div>
              )}
            </div>
            {resource.rating > 0 && (
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{resource.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Default variant
  return (
    <Card className={cn('overflow-hidden hover:shadow-md transition-shadow', className)}>
      <div className="relative">
        {resource.thumbnail_url && !imageError ? (
          <Image
            src={resource.thumbnail_url}
            alt={resource.title}
            width={300}
            height={160}
            className="w-full h-40 object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
            <span className="text-4xl">
              {typeIcons[resource.resource_type as keyof typeof typeIcons] || '📄'}
            </span>
          </div>
        )}
        {resource.is_featured && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-yellow-500 text-yellow-900">
              ⭐ Featured
            </Badge>
          </div>
        )}
        {showBookmark && (
          <div className="absolute top-2 right-2">
            <BookmarkButton resourceId={resource.id} />
          </div>
        )}
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-2 mb-2">
          <Badge 
            variant="secondary" 
            className={typeColors[resource.resource_type as keyof typeof typeColors]}
          >
            {resource.resource_type}
          </Badge>
          {resource.difficulty_level && (
            <Badge 
              variant="outline" 
              className={difficultyColors[resource.difficulty_level as keyof typeof difficultyColors]}
            >
              {resource.difficulty_level}
            </Badge>
          )}
          {resource.is_premium && (
            <Badge variant="default" className="bg-gradient-to-r from-yellow-400 to-orange-500">
              Premium
            </Badge>
          )}
        </div>
        <Link href={resourceUrl} className="group">
          <h3 className="font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2">
            {resource.title}
          </h3>
        </Link>
      </CardHeader>
      
      <CardContent className="pt-0">
        {resource.description && (
          <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
            {resource.description}
          </p>
        )}
        
        {showProgress && progress > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-3">
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
                <span>{formatTimeEstimate(resource.estimated_time_minutes)}</span>
              </div>
            )}
          </div>
          {resource.rating > 0 && (
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{resource.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(resource.created_at)}</span>
          </div>
          {resource.url && (
            <Button variant="outline" size="sm" asChild>
              <Link href={resource.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-1" />
                Visit
              </Link>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}