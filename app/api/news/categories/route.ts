import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Database not available'
      }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const includeStats = searchParams.get('includeStats') === 'true'

    let query = supabase
      .from('news_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    const { data: categories, error } = await query

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 400 })
    }

    // Optionally include article counts per category
    let categoriesWithStats = categories
    if (includeStats && categories) {
      const statsPromises = categories.map(async (category) => {
        const { count } = await supabase!
          .from('news_articles')
          .select('id', { count: 'exact', head: true })
          .eq('category_id', category.id)
          .eq('moderation_status', 'approved')

        return {
          ...category,
          articleCount: count || 0
        }
      })

      categoriesWithStats = await Promise.all(statsPromises)
    }

    return NextResponse.json({
      success: true,
      data: categoriesWithStats
    })

  } catch (error) {
    console.error('Error in news categories API:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}