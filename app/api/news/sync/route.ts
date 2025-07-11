import { NextRequest, NextResponse } from 'next/server'
import { NewsAggregationService } from '@/lib/services/news-aggregation'

export async function POST(request: NextRequest) {
  try {
    console.log('Starting news feed synchronization...')
    
    const results = await NewsAggregationService.syncAllFeeds()
    
    const summary = {
      totalSources: results.length,
      successfulSources: results.filter(r => r.success).length,
      failedSources: results.filter(r => !r.success).length,
      totalNewArticles: results.reduce((sum, r) => sum + r.newArticleCount, 0),
      totalItemsProcessed: results.reduce((sum, r) => sum + r.itemCount, 0),
      syncedAt: new Date().toISOString(),
      results: results.map(r => ({
        source: r.source.name,
        success: r.success,
        newArticles: r.newArticleCount,
        totalItems: r.itemCount,
        error: r.error
      }))
    }

    console.log('News sync completed:', summary)

    return NextResponse.json({
      success: true,
      data: summary
    })

  } catch (error) {
    console.error('Error in news sync API:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'News sync endpoint. Use POST to trigger synchronization.',
    endpoints: {
      sync: 'POST /api/news/sync',
      articles: 'GET /api/news/articles',
      stats: 'GET /api/news/stats'
    }
  })
}