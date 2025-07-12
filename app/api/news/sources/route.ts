import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Database not available'
      }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const includeStats = searchParams.get('includeStats') === 'true'

    let query = supabase
      .from('news_sources')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (category) {
      query = query.eq('category', category)
    }

    const { data: sources, error } = await query

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 400 })
    }

    // Optionally include article counts per source
    let sourcesWithStats = sources
    if (includeStats && sources) {
      const statsPromises = sources.map(async (source) => {
        const { count } = await supabase!
          .from('news_articles')
          .select('id', { count: 'exact', head: true })
          .eq('source_id', source.id)
          .eq('moderation_status', 'approved')

        return {
          ...source,
          articleCount: count || 0
        }
      })

      sourcesWithStats = await Promise.all(statsPromises)
    }

    return NextResponse.json({
      success: true,
      data: sourcesWithStats
    })

  } catch (error) {
    console.error('Error in news sources API:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}