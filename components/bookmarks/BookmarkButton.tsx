'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bookmark, BookmarkCheck, Plus, Heart } from 'lucide-react';
import { useAuth } from '@/app/providers';
import { BookmarkService } from '@/lib/services/bookmark-service';
import { toast } from 'react-hot-toast';

interface BookmarkButtonProps {
  resourceId: string;
  resourceTitle?: string;
  variant?: 'icon' | 'button' | 'heart';
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
  onBookmarkChange?: (isBookmarked: boolean) => void;
}

const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  resourceId,
  resourceTitle,
  variant = 'icon',
  size = 'md',
  showTooltip = true,
  className = '',
  onBookmarkChange
}) => {
  const { user } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showTooltipState, setShowTooltipState] = useState(false);

  const bookmarkService = new BookmarkService();

  useEffect(() => {
    if (user?.id && resourceId) {
      checkBookmarkStatus();
    }
  }, [user?.id, resourceId]);

  const checkBookmarkStatus = async () => {
    try {
      const bookmarked = await bookmarkService.isBookmarked(user!.id, resourceId);
      setIsBookmarked(bookmarked);
    } catch (error) {
      console.error('Error checking bookmark status:', error);
    }
  };

  const handleBookmarkToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user?.id) {
      toast.error('Please log in to bookmark content');
      return;
    }

    setIsLoading(true);

    try {
      if (isBookmarked) {
        // Find and remove bookmark
        const bookmarks = await bookmarkService.getBookmarks(user.id, { limit: 1000 });
        const bookmark = bookmarks.find(b => b.resourceId === resourceId);
        
        if (bookmark) {
          await bookmarkService.deleteBookmark(bookmark.id);
          setIsBookmarked(false);
          toast.success('Bookmark removed');
          onBookmarkChange?.(false);
        }
      } else {
        // Add bookmark
        await bookmarkService.addBookmark(user.id, {
          resourceId,
          title: resourceTitle
        });
        setIsBookmarked(true);
        toast.success('Added to bookmarks');
        onBookmarkChange?.(true);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast.error('Failed to update bookmark');
    } finally {
      setIsLoading(false);
    }
  };

  const getIcon = () => {
    if (variant === 'heart') {
      return isBookmarked ? (
        <Heart className={`${getSizeClass()} fill-red-500 text-red-500`} />
      ) : (
        <Heart className={`${getSizeClass()} text-gray-400 hover:text-red-500`} />
      );
    }

    return isBookmarked ? (
      <BookmarkCheck className={`${getSizeClass()} fill-cyan-500 text-cyan-500`} />
    ) : (
      <Bookmark className={`${getSizeClass()} text-gray-400 hover:text-cyan-500`} />
    );
  };

  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'w-4 h-4';
      case 'md': return 'w-5 h-5';
      case 'lg': return 'w-6 h-6';
      default: return 'w-5 h-5';
    }
  };

  const getButtonClass = () => {
    const baseClass = 'transition-all duration-200 disabled:opacity-50';
    
    switch (variant) {
      case 'button':
        return `${baseClass} flex items-center space-x-2 px-3 py-2 rounded-lg border ${
          isBookmarked 
            ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400' 
            : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-cyan-500/50 hover:text-cyan-400'
        }`;
      case 'heart':
        return `${baseClass} p-2 rounded-full hover:bg-red-500/10`;
      default:
        return `${baseClass} p-2 rounded-full hover:bg-cyan-500/10`;
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleBookmarkToggle}
        disabled={isLoading}
        className={`${getButtonClass()} ${className}`}
        onMouseEnter={() => showTooltip && setShowTooltipState(true)}
        onMouseLeave={() => setShowTooltipState(false)}
        aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
      >
        {isLoading ? (
          <div className={`${getSizeClass()} animate-spin rounded-full border-2 border-gray-400 border-t-cyan-500`} />
        ) : (
          <>
            {getIcon()}
            {variant === 'button' && (
              <span className="text-sm font-medium">
                {isBookmarked ? 'Bookmarked' : 'Bookmark'}
              </span>
            )}
          </>
        )}
      </motion.button>

      {/* Tooltip */}
      {showTooltip && showTooltipState && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50"
        >
          <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            {isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default BookmarkButton;