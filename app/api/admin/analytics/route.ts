/**
 * Admin Analytics API
 * Provides comprehensive analytics data for the admin dashboard
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { ResourceManagementService } from '@/lib/services/resource-management'
import { SubscriptionManagementService } from '@/lib/services/subscription-management'
import { rateLimiters } from '@/lib/security/rate-limiter'

interface AnalyticsQuery {
  timeRange?: '7d' | '30d' | '90d' | '1y'
  metrics?: string[]
  includeDetails?: boolean
}

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimiters.admin.checkLimit(request)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Parse query parameters
    const url = new URL(request.url)
    const timeRange = (url.searchParams.get('timeRange') as AnalyticsQuery['timeRange']) || '30d'
    const metricsParam = url.searchParams.get('metrics')
    const metrics = metricsParam ? metricsParam.split(',') : ['all']
    const includeDetails = url.searchParams.get('includeDetails') === 'true'

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(startDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(startDate.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1)
        break
    }

    const analytics: any = {
      timeRange,
      generatedAt: new Date().toISOString()
    }

    // User Analytics
    if (metrics.includes('all') || metrics.includes('users')) {
      const { data: userStats } = await supabase
        .from('profiles')
        .select('id, created_at, subscription_tier, subscription_status, last_sign_in_at')
        .gte('created_at', startDate.toISOString())

      const totalUsers = userStats?.length || 0
      const activeUsers = userStats?.filter(u => 
        u.last_sign_in_at && new Date(u.last_sign_in_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length || 0

      const usersByTier = userStats?.reduce((acc, user) => {
        acc[user.subscription_tier || 'free'] = (acc[user.subscription_tier || 'free'] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      analytics.users = {
        total: totalUsers,
        active: activeUsers,
        byTier: usersByTier,
        growth: await calculateUserGrowth(supabase, startDate, endDate)
      }
    }

    // Resource Analytics
    if (metrics.includes('all') || metrics.includes('resources')) {
      const resourceStats = await ResourceManagementService.getResourceStats()
      const resourceReport = await ResourceManagementService.generateAnalyticsReport({ start: startDate, end: endDate })

      analytics.resources = {
        ...resourceStats,
        performance: resourceReport.performance,
        engagement: resourceReport.engagement
      }
    }

    // Subscription Analytics
    if (metrics.includes('all') || metrics.includes('subscriptions')) {
      const subscriptionAnalytics = await SubscriptionManagementService.getSubscriptionAnalytics()
      
      analytics.subscriptions = subscriptionAnalytics
    }

    // Learning Analytics
    if (metrics.includes('all') || metrics.includes('learning')) {
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('progress_percentage, time_spent_minutes, status, created_at')
        .gte('created_at', startDate.toISOString())

      const { data: enrollmentData } = await supabase
        .from('learning_path_enrollments')
        .select('id, created_at, completed_at')
        .gte('created_at', startDate.toISOString())

      const totalSessions = progressData?.length || 0
      const completedSessions = progressData?.filter(p => p.status === 'completed').length || 0
      const averageProgress = progressData?.reduce((sum, p) => sum + p.progress_percentage, 0) / totalSessions || 0
      const totalTimeSpent = progressData?.reduce((sum, p) => sum + (p.time_spent_minutes || 0), 0) || 0

      analytics.learning = {
        totalSessions,
        completedSessions,
        completionRate: totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0,
        averageProgress,
        totalTimeSpent,
        averageSessionTime: totalSessions > 0 ? totalTimeSpent / totalSessions : 0,
        enrollments: enrollmentData?.length || 0,
        completedPaths: enrollmentData?.filter(e => e.completed_at).length || 0
      }
    }

    // Community Analytics
    if (metrics.includes('all') || metrics.includes('community')) {
      const { data: forumPosts } = await supabase
        .from('forum_posts')
        .select('id, created_at, view_count, reply_count, like_count')
        .gte('created_at', startDate.toISOString())

      const { data: forumReplies } = await supabase
        .from('forum_replies')
        .select('id, created_at')
        .gte('created_at', startDate.toISOString())

      analytics.community = {
        totalPosts: forumPosts?.length || 0,
        totalReplies: forumReplies?.length || 0,
        totalViews: forumPosts?.reduce((sum, p) => sum + (p.view_count || 0), 0) || 0,
        totalLikes: forumPosts?.reduce((sum, p) => sum + (p.like_count || 0), 0) || 0,
        averageRepliesPerPost: forumPosts?.length ? 
          forumPosts.reduce((sum, p) => sum + (p.reply_count || 0), 0) / forumPosts.length : 0
      }
    }

    // System Performance
    if (metrics.includes('all') || metrics.includes('system')) {
      const { data: pageViews } = await supabase
        .from('page_views')
        .select('id, page_path, load_time, created_at')
        .gte('created_at', startDate.toISOString())

      const totalPageViews = pageViews?.length || 0
      const averageLoadTime = pageViews?.reduce((sum, pv) => sum + (pv.load_time || 0), 0) / totalPageViews || 0
      
      const topPages = pageViews?.reduce((acc, pv) => {
        acc[pv.page_path] = (acc[pv.page_path] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      analytics.system = {
        totalPageViews,
        averageLoadTime,
        topPages: Object.entries(topPages)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10)
          .map(([path, views]) => ({ path, views }))
      }
    }

    // Include detailed breakdowns if requested
    if (includeDetails) {
      analytics.details = {
        dailyBreakdown: await getDailyBreakdown(supabase, startDate, endDate),
        topPerformers: await getTopPerformers(supabase, startDate, endDate),
        trends: await getTrends(supabase, startDate, endDate)
      }
    }

    return NextResponse.json({
      success: true,
      analytics
    })

  } catch (error) {
    console.error('Analytics error:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function calculateUserGrowth(supabase: any, startDate: Date, endDate: Date) {
  const { data: currentPeriod } = await supabase
    .from('profiles')
    .select('id')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  const previousStart = new Date(startDate)
  const previousEnd = new Date(endDate)
  const periodLength = endDate.getTime() - startDate.getTime()
  
  previousStart.setTime(previousStart.getTime() - periodLength)
  previousEnd.setTime(previousEnd.getTime() - periodLength)

  const { data: previousPeriod } = await supabase
    .from('profiles')
    .select('id')
    .gte('created_at', previousStart.toISOString())
    .lte('created_at', previousEnd.toISOString())

  const currentCount = currentPeriod?.length || 0
  const previousCount = previousPeriod?.length || 0
  
  const growthRate = previousCount > 0 ? ((currentCount - previousCount) / previousCount) * 100 : 0

  return {
    current: currentCount,
    previous: previousCount,
    growthRate: Math.round(growthRate * 100) / 100
  }
}

async function getDailyBreakdown(supabase: any, startDate: Date, endDate: Date) {
  // Get daily user registrations
  const { data: dailyUsers } = await supabase
    .from('profiles')
    .select('created_at')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  // Get daily resource views
  const { data: dailyViews } = await supabase
    .from('page_views')
    .select('created_at')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  // Group by day
  const dailyData: Record<string, { users: number; views: number }> = {}
  
  // Initialize all days in range
  const currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    const dateKey = currentDate.toISOString().split('T')[0]
    dailyData[dateKey] = { users: 0, views: 0 }
    currentDate.setDate(currentDate.getDate() + 1)
  }

  // Count users by day
  dailyUsers?.forEach(user => {
    const dateKey = user.created_at.split('T')[0]
    if (dailyData[dateKey]) {
      dailyData[dateKey].users++
    }
  })

  // Count views by day
  dailyViews?.forEach(view => {
    const dateKey = view.created_at.split('T')[0]
    if (dailyData[dateKey]) {
      dailyData[dateKey].views++
    }
  })

  return Object.entries(dailyData).map(([date, data]) => ({
    date,
    ...data
  }))
}

async function getTopPerformers(supabase: any, startDate: Date, endDate: Date) {
  // Top resources by views
  const { data: topResources } = await supabase
    .from('resources')
    .select('id, title, view_count, rating')
    .eq('is_published', true)
    .order('view_count', { ascending: false })
    .limit(10)

  // Top contributors (users with most content)
  const { data: topContributors } = await supabase
    .from('profiles')
    .select(`
      id, 
      username, 
      full_name,
      resources!resources_author_fkey(count)
    `)
    .limit(10)

  return {
    resources: topResources || [],
    contributors: topContributors || []
  }
}

async function getTrends(supabase: any, startDate: Date, endDate: Date) {
  // Calculate trends for key metrics
  const midPoint = new Date((startDate.getTime() + endDate.getTime()) / 2)
  
  // First half vs second half comparison
  const { data: firstHalfUsers } = await supabase
    .from('profiles')
    .select('id')
    .gte('created_at', startDate.toISOString())
    .lt('created_at', midPoint.toISOString())

  const { data: secondHalfUsers } = await supabase
    .from('profiles')
    .select('id')
    .gte('created_at', midPoint.toISOString())
    .lte('created_at', endDate.toISOString())

  const userTrend = {
    firstHalf: firstHalfUsers?.length || 0,
    secondHalf: secondHalfUsers?.length || 0,
    trend: 'stable' as 'up' | 'down' | 'stable'
  }

  if (userTrend.secondHalf > userTrend.firstHalf * 1.1) {
    userTrend.trend = 'up'
  } else if (userTrend.secondHalf < userTrend.firstHalf * 0.9) {
    userTrend.trend = 'down'
  }

  return {
    users: userTrend
  }
}