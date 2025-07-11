// News Feed System Types

export interface NewsSource {
  id: string
  name: string
  description?: string
  feed_url: string
  website_url?: string
  category: string
  is_active: boolean
  last_fetched_at?: string
  last_successful_fetch_at?: string
  fetch_interval_minutes: number
  error_count: number
  last_error?: string
  created_at: string
  updated_at: string
}

export interface NewsCategory {
  id: string
  name: string
  slug: string
  description?: string
  icon_name?: string
  color_scheme: string
  keywords: string[]
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface NewsArticle {
  id: string
  source_id: string
  category_id?: string
  title: string
  slug?: string
  description?: string
  content?: string
  excerpt?: string
  author?: string
  original_url: string
  guid?: string
  published_at?: string
  image_url?: string
  thumbnail_url?: string
  keywords: string[]
  sentiment_score?: number
  read_time_minutes?: number
  view_count: number
  like_count: number
  share_count: number
  is_featured: boolean
  is_trending: boolean
  is_breaking: boolean
  moderation_status: 'pending' | 'approved' | 'rejected'
  moderated_at?: string
  moderated_by?: string
  created_at: string
  updated_at: string
  
  // Joined data
  source?: NewsSource
  category?: NewsCategory
  tags?: NewsArticleTag[]
}

export interface NewsArticleTag {
  id: string
  article_id: string
  tag_name: string
  confidence_score: number
  created_at: string
}

export interface RSSFeedItem {
  title: string
  description?: string
  content?: string
  link: string
  guid?: string
  pubDate?: string
  author?: string
  categories?: string[]
  enclosure?: {
    url: string
    type: string
    length?: number
  }
}

export interface FeedFetchResult {
  success: boolean
  itemCount: number
  newArticleCount: number
  error?: string
  source: NewsSource
  fetchedAt: string
}

export interface NewsAggregationOptions {
  categories?: string[]
  sources?: string[]
  limit?: number
  offset?: number
  sortBy?: 'published_at' | 'created_at' | 'view_count' | 'like_count'
  sortOrder?: 'asc' | 'desc'
  dateFrom?: string
  dateTo?: string
  featured?: boolean
  trending?: boolean
  breaking?: boolean
  moderationStatus?: 'pending' | 'approved' | 'rejected'
  searchQuery?: string
}

export interface NewsStats {
  totalArticles: number
  articlesByCategory: Record<string, number>
  articlesBySource: Record<string, number>
  recentArticles: number
  featuredArticles: number
  trendingArticles: number
  breakingNews: number
  lastUpdated: string
}

export interface PaginatedNewsResponse {
  articles: NewsArticle[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  stats?: NewsStats
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// RSS Parser types (extending rss-parser)
export interface ParsedFeed {
  title: string
  description?: string
  link?: string
  language?: string
  lastBuildDate?: string
  items: RSSFeedItem[]
}

// Feed processing types
export interface ArticleProcessingResult {
  article: NewsArticle
  isNew: boolean
  isDuplicate: boolean
  processingNotes?: string[]
}

export interface BulkProcessingResult {
  totalProcessed: number
  newArticles: number
  duplicates: number
  errors: number
  results: ArticleProcessingResult[]
  processingTime: number
}

// Content analysis types
export interface ContentAnalysis {
  readTimeMinutes: number
  sentimentScore: number
  extractedKeywords: string[]
  suggestedTags: Array<{
    tag: string
    confidence: number
  }>
  isTrending: boolean
  isBreaking: boolean
}

// Admin management types
export interface SourceManagement {
  source: NewsSource
  stats: {
    totalArticles: number
    recentFetches: number
    successRate: number
    avgFetchTime: number
    lastError?: string
  }
}

export interface FeedSyncOptions {
  sourceIds?: string[]
  forceRefresh?: boolean
  categories?: string[]
  maxArticlesPerSource?: number
  skipDuplicateCheck?: boolean
}

// UI Component types
export interface NewsCardProps {
  article: NewsArticle
  variant?: 'default' | 'featured' | 'compact' | 'list'
  showSource?: boolean
  showCategory?: boolean
  showActions?: boolean
  onArticleClick?: (article: NewsArticle) => void
  onSourceClick?: (source: NewsSource) => void
}

export interface NewsFeedProps {
  categories?: string[]
  sources?: string[]
  limit?: number
  showFilters?: boolean
  showSearch?: boolean
  showStats?: boolean
  variant?: 'grid' | 'list' | 'masonry'
  refreshInterval?: number
}

export interface NewsFilters {
  categories: string[]
  sources: string[]
  dateRange: {
    from?: string
    to?: string
  }
  sortBy: string
  sortOrder: 'asc' | 'desc'
  showFeatured: boolean
  showTrending: boolean
  showBreaking: boolean
}