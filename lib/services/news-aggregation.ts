import Parser from 'rss-parser'
import { supabase } from '@/lib/supabase'
import type { 
  NewsSource, 
  NewsArticle, 
  RSSFeedItem, 
  FeedFetchResult, 
  BulkProcessingResult,
  NewsAggregationOptions,
  PaginatedNewsResponse,
  ContentAnalysis,
  ApiResponse
} from '@/lib/types/news'

export class NewsAggregationService {
  private static parser = new Parser({
    timeout: 30000,
    headers: {
      'User-Agent': 'CybernexAcademy/1.0 (+https://cybernexacademy.com)',
    },
  })

  /**
   * Fetch and process RSS feed from a source
   */
  static async fetchFeedFromSource(source: NewsSource): Promise<FeedFetchResult> {
    const startTime = Date.now()
    
    try {
      if (!supabase) {
        return {
          success: false,
          itemCount: 0,
          newArticleCount: 0,
          error: 'Database not available',
          source,
          fetchedAt: new Date().toISOString()
        }
      }

      // Update last fetch attempt
      await supabase
        .from('news_sources')
        .update({ 
          last_fetched_at: new Date().toISOString() 
        })
        .eq('id', source.id)

      console.log(`Fetching RSS feed from ${source.name}: ${source.feed_url}`)
      
      const feed = await this.parser.parseURL(source.feed_url)
      const articles = await this.processFeedItems(feed.items || [], source)
      
      const newArticleCount = articles.filter(a => a.isNew).length

      // Update successful fetch
      await supabase
        .from('news_sources')
        .update({ 
          last_successful_fetch_at: new Date().toISOString(),
          error_count: 0,
          last_error: null
        })
        .eq('id', source.id)

      const processingTime = Date.now() - startTime
      console.log(`Successfully processed ${feed.items?.length || 0} items from ${source.name} in ${processingTime}ms. ${newArticleCount} new articles.`)

      return {
        success: true,
        itemCount: feed.items?.length || 0,
        newArticleCount,
        source,
        fetchedAt: new Date().toISOString()
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error(`Error fetching feed from ${source.name}:`, errorMessage)

      // Update error count
      if (supabase) {
        await supabase
          .from('news_sources')
          .update({ 
            error_count: (source.error_count || 0) + 1,
            last_error: errorMessage
          })
          .eq('id', source.id)
      }

      return {
        success: false,
        itemCount: 0,
        newArticleCount: 0,
        error: errorMessage,
        source,
        fetchedAt: new Date().toISOString()
      }
    }
  }

  /**
   * Process RSS feed items into news articles
   */
  private static async processFeedItems(items: any[], source: NewsSource): Promise<BulkProcessingResult['results']> {
    if (!supabase) return []

    const results = []

    for (const item of items) {
      try {
        const article = await this.processRSSItem(item, source)
        if (article) {
          results.push(article)
        }
      } catch (error) {
        console.error(`Error processing item from ${source.name}:`, error)
      }
    }

    return results
  }

  /**
   * Process individual RSS item into news article
   */
  private static async processRSSItem(item: any, source: NewsSource): Promise<{ article: NewsArticle; isNew: boolean; isDuplicate: boolean } | null> {
    if (!supabase) return null

    try {
      // Extract data from RSS item
      const title = this.cleanText(item.title || '')
      const description = this.cleanText(item.description || item.summary || '')
      const content = this.cleanText(item.content || item['content:encoded'] || '')
      const originalUrl = item.link || item.guid || ''
      const guid = item.guid || item.link || ''
      const publishedAt = item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString()
      const author = item.author || item.creator || item['dc:creator'] || ''

      if (!title || !originalUrl) {
        console.warn('Skipping item with missing title or URL')
        return null
      }

      // Check for duplicates
      const { data: existingArticle } = await supabase
        .from('news_articles')
        .select('id')
        .eq('source_id', source.id)
        .eq('guid', guid)
        .maybeSingle()

      if (existingArticle) {
        return {
          article: existingArticle as NewsArticle,
          isNew: false,
          isDuplicate: true
        }
      }

      // Analyze content
      const analysis = this.analyzeContent(title, description, content)

      // Extract image URL
      const imageUrl = this.extractImageUrl(item)

      // Create article object
      const articleData = {
        source_id: source.id,
        title,
        description,
        content: content || description,
        excerpt: this.generateExcerpt(content || description, 200),
        author,
        original_url: originalUrl,
        guid,
        published_at: publishedAt,
        image_url: imageUrl,
        thumbnail_url: imageUrl,
        keywords: analysis.extractedKeywords,
        sentiment_score: analysis.sentimentScore,
        read_time_minutes: analysis.readTimeMinutes,
        is_trending: analysis.isTrending,
        is_breaking: analysis.isBreaking,
        moderation_status: 'approved' as const // Auto-approve for now
      }

      // Insert article
      const { data: newArticle, error } = await supabase
        .from('news_articles')
        .insert(articleData)
        .select()
        .single()

      if (error) {
        console.error('Error inserting article:', error)
        return null
      }

      // Add suggested tags
      if (analysis.suggestedTags.length > 0) {
        const tagData = analysis.suggestedTags.map(tag => ({
          article_id: newArticle.id,
          tag_name: tag.tag,
          confidence_score: tag.confidence
        }))

        await supabase
          .from('news_article_tags')
          .insert(tagData)
      }

      return {
        article: newArticle,
        isNew: true,
        isDuplicate: false
      }

    } catch (error) {
      console.error('Error processing RSS item:', error)
      return null
    }
  }

  /**
   * Analyze article content for metadata
   */
  private static analyzeContent(title: string, description: string, content: string): ContentAnalysis {
    const text = `${title} ${description} ${content}`.toLowerCase()
    
    // Calculate read time (average 200 words per minute)
    const wordCount = text.split(/\s+/).length
    const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200))

    // Simple sentiment analysis (can be enhanced with AI)
    const positiveWords = ['secure', 'protection', 'safe', 'successful', 'improved', 'updated', 'fixed']
    const negativeWords = ['breach', 'attack', 'vulnerability', 'hack', 'exploit', 'malware', 'threat', 'risk']
    
    let sentimentScore = 0
    positiveWords.forEach(word => {
      if (text.includes(word)) sentimentScore += 0.1
    })
    negativeWords.forEach(word => {
      if (text.includes(word)) sentimentScore -= 0.1
    })
    sentimentScore = Math.max(-1, Math.min(1, sentimentScore))

    // Extract keywords
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'a', 'an', 'this', 'that', 'these', 'those']
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.includes(word))
    
    const wordFreq: Record<string, number> = {}
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1
    })
    
    const extractedKeywords = Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word)

    // Detect trending/breaking indicators
    const trendingKeywords = ['breaking', 'urgent', 'alert', 'critical', 'major', 'massive']
    const breakingKeywords = ['breaking', 'urgent', 'alert', 'just in', 'developing']
    
    const isTrending = trendingKeywords.some(keyword => text.includes(keyword))
    const isBreaking = breakingKeywords.some(keyword => text.includes(keyword))

    // Generate suggested tags
    const cybersecurityTags = [
      'malware', 'ransomware', 'phishing', 'apt', 'zero-day', 'vulnerability',
      'breach', 'incident', 'threat-intelligence', 'compliance', 'privacy',
      'encryption', 'authentication', 'firewall', 'endpoint', 'cloud-security'
    ]
    
    const suggestedTags = cybersecurityTags
      .filter(tag => text.includes(tag.replace('-', ' ')) || text.includes(tag))
      .map(tag => ({
        tag,
        confidence: 0.8
      }))
      .slice(0, 5)

    return {
      readTimeMinutes,
      sentimentScore,
      extractedKeywords,
      suggestedTags,
      isTrending,
      isBreaking
    }
  }

  /**
   * Extract image URL from RSS item
   */
  private static extractImageUrl(item: any): string | null {
    // Try different possible image fields
    if (item.enclosure?.type?.startsWith('image/')) {
      return item.enclosure.url
    }
    
    if (item.image?.url) {
      return item.image.url
    }
    
    if (item.thumbnail) {
      return item.thumbnail
    }
    
    // Try to extract from content
    const content = item.content || item.description || ''
    const imgMatch = content.match(/<img[^>]+src="([^"]+)"/i)
    if (imgMatch) {
      return imgMatch[1]
    }
    
    return null
  }

  /**
   * Generate article excerpt
   */
  private static generateExcerpt(text: string, maxLength: number): string {
    if (!text) return ''
    
    // Remove HTML tags
    const cleanText = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    
    if (cleanText.length <= maxLength) {
      return cleanText
    }
    
    // Find last complete sentence within limit
    const truncated = cleanText.substring(0, maxLength)
    const lastSentence = truncated.lastIndexOf('.')
    
    if (lastSentence > maxLength * 0.7) {
      return truncated.substring(0, lastSentence + 1)
    }
    
    // Otherwise cut at word boundary
    const lastSpace = truncated.lastIndexOf(' ')
    return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...'
  }

  /**
   * Clean HTML and unwanted characters from text
   */
  private static cleanText(text: string): string {
    if (!text) return ''
    
    return text
      .replace(/<[^>]*>/g, ' ') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
      .replace(/&amp;/g, '&') // Decode HTML entities
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim()
  }

  /**
   * Fetch all active sources and update their feeds
   */
  static async syncAllFeeds(): Promise<FeedFetchResult[]> {
    try {
      if (!supabase) {
        throw new Error('Database not available')
      }

      const { data: sources, error } = await supabase
        .from('news_sources')
        .select('*')
        .eq('is_active', true)
        .order('last_fetched_at', { ascending: true, nullsFirst: true })

      if (error) {
        throw new Error(`Failed to fetch sources: ${error.message}`)
      }

      const results: FeedFetchResult[] = []
      
      // Process sources in parallel (but with some delay to be respectful)
      const BATCH_SIZE = 3
      const DELAY_BETWEEN_BATCHES = 2000

      for (let i = 0; i < sources.length; i += BATCH_SIZE) {
        const batch = sources.slice(i, i + BATCH_SIZE)
        
        const batchPromises = batch.map(source => 
          this.fetchFeedFromSource(source as NewsSource)
        )
        
        const batchResults = await Promise.allSettled(batchPromises)
        
        batchResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            results.push(result.value)
          } else {
            console.error(`Failed to fetch from ${batch[index].name}:`, result.reason)
            results.push({
              success: false,
              itemCount: 0,
              newArticleCount: 0,
              error: result.reason?.message || 'Unknown error',
              source: batch[index] as NewsSource,
              fetchedAt: new Date().toISOString()
            })
          }
        })
        
        // Delay between batches
        if (i + BATCH_SIZE < sources.length) {
          await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES))
        }
      }

      return results

    } catch (error) {
      console.error('Error syncing feeds:', error)
      throw error
    }
  }

  /**
   * Get paginated news articles with filtering
   */
  static async getNewsArticles(options: NewsAggregationOptions = {}): Promise<ApiResponse<PaginatedNewsResponse>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      const {
        categories = [],
        sources = [],
        limit = 20,
        offset = 0,
        sortBy = 'published_at',
        sortOrder = 'desc',
        dateFrom,
        dateTo,
        featured,
        trending,
        breaking,
        moderationStatus = 'approved',
        searchQuery
      } = options

      let query = supabase
        .from('news_articles')
        .select(`
          *,
          source:news_sources(*),
          category:news_categories(*),
          tags:news_article_tags(*)
        `, { count: 'exact' })
        .eq('moderation_status', moderationStatus)

      // Apply filters
      if (categories.length > 0) {
        query = query.in('category_id', categories)
      }
      
      if (sources.length > 0) {
        query = query.in('source_id', sources)
      }
      
      if (dateFrom) {
        query = query.gte('published_at', dateFrom)
      }
      
      if (dateTo) {
        query = query.lte('published_at', dateTo)
      }
      
      if (featured !== undefined) {
        query = query.eq('is_featured', featured)
      }
      
      if (trending !== undefined) {
        query = query.eq('is_trending', trending)
      }
      
      if (breaking !== undefined) {
        query = query.eq('is_breaking', breaking)
      }
      
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
      }

      // Apply sorting and pagination
      query = query
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range(offset, offset + limit - 1)

      const { data: articles, error, count } = await query

      if (error) {
        return { success: false, error: error.message }
      }

      const totalPages = Math.ceil((count || 0) / limit)
      const currentPage = Math.floor(offset / limit) + 1

      return {
        success: true,
        data: {
          articles: articles || [],
          pagination: {
            total: count || 0,
            page: currentPage,
            limit,
            totalPages,
            hasNextPage: currentPage < totalPages,
            hasPrevPage: currentPage > 1
          }
        }
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Get news statistics
   */
  static async getNewsStats(): Promise<ApiResponse<any>> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database not available' }
      }

      const [
        totalResult,
        categoryResult,
        sourceResult,
        recentResult,
        featuredResult,
        trendingResult,
        breakingResult
      ] = await Promise.all([
        // Total articles
        supabase
          .from('news_articles')
          .select('id', { count: 'exact', head: true })
          .eq('moderation_status', 'approved'),
        
        // By category
        supabase
          .from('news_articles')
          .select('category:news_categories(name)', { count: 'exact' })
          .eq('moderation_status', 'approved'),
        
        // By source
        supabase
          .from('news_articles')
          .select('source:news_sources(name)', { count: 'exact' })
          .eq('moderation_status', 'approved'),
        
        // Recent (last 24 hours)
        supabase
          .from('news_articles')
          .select('id', { count: 'exact', head: true })
          .eq('moderation_status', 'approved')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
        
        // Featured
        supabase
          .from('news_articles')
          .select('id', { count: 'exact', head: true })
          .eq('moderation_status', 'approved')
          .eq('is_featured', true),
        
        // Trending
        supabase
          .from('news_articles')
          .select('id', { count: 'exact', head: true })
          .eq('moderation_status', 'approved')
          .eq('is_trending', true),
        
        // Breaking
        supabase
          .from('news_articles')
          .select('id', { count: 'exact', head: true })
          .eq('moderation_status', 'approved')
          .eq('is_breaking', true)
      ])

      const stats = {
        totalArticles: totalResult.count || 0,
        recentArticles: recentResult.count || 0,
        featuredArticles: featuredResult.count || 0,
        trendingArticles: trendingResult.count || 0,
        breakingNews: breakingResult.count || 0,
        lastUpdated: new Date().toISOString()
      }

      return { success: true, data: stats }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}