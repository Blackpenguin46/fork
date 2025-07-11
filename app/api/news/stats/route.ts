import { NextResponse } from 'next/server'
import { NewsAggregationService } from '@/lib/services/news-aggregation'

export async function GET() {
  try {
    const result = await NewsAggregationService.getNewsStats()

    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error in news stats API:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}