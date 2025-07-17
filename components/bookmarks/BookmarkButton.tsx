'use client'

import { useState, useEffect } from 'react'
import { isBookmarked, addBookmark, removeBookmark } from '@/lib/api/bookmarks'
import { useAuth } from '@/app/providers'
import { useSubscription } from '@/hooks/useSubscription'
import { Button } from '@/components/ui/button'
import { Bookmark, BookmarkCheck, Crown, Loader2 } from 'lucide-react'

interface BookmarkButtonProps {
  resourceId: string
  resourceTitle?: string
  size?: 'sm' | 'default' | 'lg'
  variant?: 'default' | 'outline' | 'ghost'
  showText?: boolean
  className?: string
}

export default function BookmarkButton({
  resourceId,
  resourceTitle,
  size = 'default',
  variant = 'outline',
  showText = false,
  className = ''
}: BookmarkButtonProps) {
  const { user } = useAuth()
  const { canBookmarkResources } = useSubscription()
  
  const [bookmarked, setBookmarked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (!user?.id || !canBookmarkResources) {
        setChecking(false)
        return
      }

      try {
        const result = await isBookmarked(user.id, resourceId)
        if (result.success && result.data !== undefined) {
          setBookmarked(result.data)
        }
      } catch (error) {
        console.error('Error checking bookmark status:', error)
      } finally {
        setChecking(false)
      }
    }

    checkBookmarkStatus()
  }, [user?.id, resourceId, canBookmarkResources])

  const handleToggleBookmark = async () => {
    if (!user?.id) {
      return
    }

    if (!canBookmarkResources) {
      return
    }

    setLoading(true)

    try {
      if (bookmarked) {
        const result = await removeBookmark(user.id, resourceId)
        if (result.success) {
          setBookmarked(false)
        }
      } else {
        const result = await addBookmark(user.id, resourceId)
        if (result.success) {
          setBookmarked(true)
        }
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error)
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <Button
        size={size}
        variant={variant}
        disabled
        className={className}
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        {showText && <span className="ml-2">Loading...</span>}
      </Button>
    )
  }

  if (!canBookmarkResources) {
    return (
      <Button
        size={size}
        variant={variant}
        disabled
        className={`${className} opacity-50`}
        title="Upgrade to Pro to bookmark resources"
      >
        <Crown className="h-4 w-4 text-yellow-400" />
        {showText && <span className="ml-2">Pro Feature</span>}
      </Button>
    )
  }

  return (
    <Button
      size={size}
      variant={variant}
      onClick={handleToggleBookmark}
      disabled={loading}
      className={`${className} ${bookmarked ? 'text-yellow-400 border-yellow-400' : ''}`}
      title={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : bookmarked ? (
        <BookmarkCheck className="h-4 w-4" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
      {showText && (
        <span className="ml-2">
          {bookmarked ? 'Bookmarked' : 'Bookmark'}
        </span>
      )}
    </Button>
  )
}