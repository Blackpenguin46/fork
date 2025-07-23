import { supabase } from '@/lib/supabase'

export interface AnalyticsEvent {
  event_name: string
  user_id?: string
  session_id: string
  properties: Record<string, any>
  timestamp: string
  page_url?: string
  user_agent?: string
  ip_address?: string
}

export class AnalyticsService {
  private static sessionId: string | null = null

  /**
   * Initialize analytics session
   */
  static initSession(): string {
    if (typeof window === 'undefined') return 'server-session'
    
    if (!this.sessionId) {
      this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
    
    return this.sessionId
  }

  /**
   * Track an analytics event
   */
  static async trackEvent(
    eventName: string, 
    properties: Record<string, any> = {},
    userId?: string
  ): Promise<void> {
    try {
      if (!supabase) {
        console.warn('Analytics: Database not available')
        return
      }

      const sessionId = this.initSession()
      
      const event: Omit<AnalyticsEvent, 'id'> = {
        event_name: eventName,
        user_id: userId,
        session_id: sessionId,
        properties,
        timestamp: new Date().toISOString(),
        page_url: typeof window !== 'undefined' ? window.location.href : undefined,
        user_agent: typeof window !== 'undefined' ? navigator.userAgent : undefined
      }

      // Store in database (create analytics_events table if needed)
      const { error } = await supabase
        .from('analytics_events')
        .insert(event)

      if (error) {
        console.warn('Analytics: Failed to store event', error)
      }

    } catch (error) {
      console.warn('Analytics: Error tracking event', error)
    }
  }

  /**
   * Track page view
   */
  static async trackPageView(
    pagePath: string,
    pageTitle?: string,
    userId?: string
  ): Promise<void> {
    await this.trackEvent('page_view', {
      page_path: pagePath,
      page_title: pageTitle || document.title,
      referrer: typeof document !== 'undefined' ? document.referrer : undefined
    }, userId)
  }

  /**
   * Track dashboard section click
   */
  static async trackSectionClick(
    section: 'community' | 'insights' | 'academy',
    userId?: string
  ): Promise<void> {
    await this.trackEvent('section_click', {
      section,
      click_type: 'dashboard_card'
    }, userId)
  }

  /**
   * Track news article interaction
   */
  static async trackNewsInteraction(
    action: 'view' | 'click' | 'bookmark' | 'share',
    articleId: string,
    articleTitle?: string,
    userId?: string
  ): Promise<void> {
    await this.trackEvent('news_interaction', {
      action,
      article_id: articleId,
      article_title: articleTitle
    }, userId)
  }

  /**
   * Track search query
   */
  static async trackSearch(
    query: string,
    section?: string,
    resultsCount?: number,
    userId?: string
  ): Promise<void> {
    await this.trackEvent('search', {
      query,
      section,
      results_count: resultsCount
    }, userId)
  }

  /**
   * Track user engagement metrics
   */
  static async trackEngagement(
    action: 'scroll' | 'time_on_page' | 'interaction',
    value: number,
    context?: string,
    userId?: string
  ): Promise<void> {
    await this.trackEvent('engagement', {
      action,
      value,
      context
    }, userId)
  }

  /**
   * Get analytics summary (for admin dashboard)
   */
  static async getAnalyticsSummary(
    startDate: string,
    endDate: string
  ): Promise<{
    totalEvents: number
    uniqueUsers: number
    topEvents: Array<{ event_name: string; count: number }>
    topPages: Array<{ page_path: string; count: number }>
  } | null> {
    try {
      if (!supabase) return null

      const { data: events, error } = await supabase
        .from('analytics_events')
        .select('event_name, user_id, properties')
        .gte('timestamp', startDate)
        .lte('timestamp', endDate)

      if (error) {
        console.error('Analytics: Failed to fetch summary', error)
        return null
      }

      const totalEvents = events?.length || 0
      const uniqueUsers = new Set(events?.map(e => e.user_id).filter(Boolean)).size

      // Count events
      const eventCounts: Record<string, number> = {}
      const pageCounts: Record<string, number> = {}

      events?.forEach(event => {
        eventCounts[event.event_name] = (eventCounts[event.event_name] || 0) + 1
        
        if (event.event_name === 'page_view' && event.properties?.page_path) {
          const pagePath = event.properties.page_path
          pageCounts[pagePath] = (pageCounts[pagePath] || 0) + 1
        }
      })

      const topEvents = Object.entries(eventCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([event_name, count]) => ({ event_name, count }))

      const topPages = Object.entries(pageCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([page_path, count]) => ({ page_path, count }))

      return {
        totalEvents,
        uniqueUsers,
        topEvents,
        topPages
      }

    } catch (error) {
      console.error('Analytics: Error getting summary', error)
      return null
    }
  }
}

// Client-side analytics hook
export const useAnalytics = () => {
  const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    AnalyticsService.trackEvent(eventName, properties)
  }

  const trackPageView = (pagePath: string, pageTitle?: string) => {
    AnalyticsService.trackPageView(pagePath, pageTitle)
  }

  const trackSectionClick = (section: 'community' | 'insights' | 'academy') => {
    AnalyticsService.trackSectionClick(section)
  }

  const trackNewsInteraction = (
    action: 'view' | 'click' | 'bookmark' | 'share',
    articleId: string,
    articleTitle?: string
  ) => {
    AnalyticsService.trackNewsInteraction(action, articleId, articleTitle)
  }

  return {
    trackEvent,
    trackPageView,
    trackSectionClick,
    trackNewsInteraction
  }
}