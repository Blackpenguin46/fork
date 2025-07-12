import { NextRequest, NextResponse } from 'next/server'
import { NewsAggregationService } from '@/lib/services/news-aggregation'
import type { NewsAggregationOptions } from '@/lib/types/news'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const options: NewsAggregationOptions = {
      categories: searchParams.get('categories')?.split(',').filter(Boolean) || [],
      sources: searchParams.get('sources')?.split(',').filter(Boolean) || [],
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0'),
      sortBy: (searchParams.get('sortBy') as any) || 'published_at',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      featured: searchParams.get('featured') ? searchParams.get('featured') === 'true' : undefined,
      trending: searchParams.get('trending') ? searchParams.get('trending') === 'true' : undefined,
      breaking: searchParams.get('breaking') ? searchParams.get('breaking') === 'true' : undefined,
      moderationStatus: (searchParams.get('moderationStatus') as any) || 'approved',
      searchQuery: searchParams.get('search') || undefined
    }

    const result = await NewsAggregationService.getNewsArticles(options)

    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error in news articles API:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}