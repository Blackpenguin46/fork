import { NextRequest, NextResponse } from 'next/server'
import { NewsAggregationService } from '@/lib/services/news-aggregation'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret if provided (for security)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 })
    }

    console.log('Starting scheduled news feed synchronization...')
    
    const startTime = Date.now()
    const results = await NewsAggregationService.syncAllFeeds()
    const endTime = Date.now()
    
    const summary = {
      totalSources: results.length,
      successfulSources: results.filter(r => r.success).length,
      failedSources: results.filter(r => !r.success).length,
      totalNewArticles: results.reduce((sum, r) => sum + r.newArticleCount, 0),
      totalItemsProcessed: results.reduce((sum, r) => sum + r.itemCount, 0),
      processingTimeMs: endTime - startTime,
      syncedAt: new Date().toISOString(),
      results: results.map(r => ({
        source: r.source.name,
        success: r.success,
        newArticles: r.newArticleCount,
        totalItems: r.itemCount,
        error: r.error || null
      }))
    }

    console.log('Scheduled news sync completed:', {
      duration: `${summary.processingTimeMs}ms`,
      newArticles: summary.totalNewArticles,
      successRate: `${summary.successfulSources}/${summary.totalSources}`
    })

    return NextResponse.json({
      success: true,
      data: summary
    })

  } catch (error) {
    console.error('Error in scheduled news sync:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      syncedAt: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'News sync cron endpoint',
    description: 'Use POST to trigger news synchronization',
    usage: {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer <CRON_SECRET>' // Optional if CRON_SECRET is set
      }
    },
    schedule: 'Every 30 minutes via Vercel Cron'
  })
}