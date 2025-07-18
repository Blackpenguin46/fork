/**
 * Auto-Publish Resources API
 * Automatically publishes resources that meet quality criteria
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { ResourceManagementService } from '@/lib/services/resource-management'
import { rateLimiters } from '@/lib/security/rate-limiter'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - stricter for auto-publish
    const rateLimitResult = await rateLimiters.api.checkLimit(request)
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

    // Parse request body for options
    const body = await request.json().catch(() => ({}))
    const options = {
      dryRun: body.dryRun || false,
      maxResources: body.maxResources || 50,
      skipValidation: body.skipValidation || false
    }

    if (options.dryRun) {
      // Dry run - just return what would be published
      const { data: unpublishedResources, error } = await supabase
        .from('resources')
        .select(`
          id,
          title,
          description,
          content_url,
          resource_type,
          difficulty_level,
          category_id,
          tags,
          estimated_read_time,
          created_at
        `)
        .eq('is_published', false)
        .not('is_deleted', 'eq', true)
        .limit(options.maxResources)

      if (error) {
        throw new Error(`Failed to get unpublished resources: ${error.message}`)
      }

      const qualifiedResources = []
      const unqualifiedResources = []

      for (const resource of unpublishedResources || []) {
        const validation = ResourceManagementService.validateResource(resource)
        
        if (validation.isValid && validation.warnings.length <= 2) {
          qualifiedResources.push({
            id: resource.id,
            title: resource.title,
            validation
          })
        } else {
          unqualifiedResources.push({
            id: resource.id,
            title: resource.title,
            validation
          })
        }
      }

      return NextResponse.json({
        success: true,
        dryRun: true,
        summary: {
          totalUnpublished: unpublishedResources?.length || 0,
          qualified: qualifiedResources.length,
          unqualified: unqualifiedResources.length
        },
        qualifiedResources,
        unqualifiedResources
      })
    }

    // Actual auto-publish operation
    const result = await ResourceManagementService.autoPublishQualifiedResources(user.id)

    // Log the auto-publish operation
    await supabase
      .from('admin_audit_log')
      .insert({
        admin_id: user.id,
        action: 'auto_publish_resources',
        resource_type: 'resources',
        resource_count: result.published + result.skipped,
        success_count: result.published,
        failure_count: result.skipped,
        details: {
          published: result.published,
          skipped: result.skipped,
          errors: result.errors,
          options
        },
        created_at: new Date().toISOString()
      })

    return NextResponse.json({
      success: true,
      result: {
        published: result.published,
        skipped: result.skipped,
        errors: result.errors
      },
      message: `Successfully published ${result.published} resources. ${result.skipped} resources were skipped.`
    })

  } catch (error) {
    console.error('Auto-publish error:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimiters.api.checkLimit(request)
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

    // Get resources that need review
    const resourcesNeedingReview = await ResourceManagementService.getResourcesNeedingReview()

    // Get basic stats
    const stats = await ResourceManagementService.getResourceStats()

    return NextResponse.json({
      success: true,
      stats: {
        totalUnpublished: stats.unpublished,
        needsReview: stats.needsReview,
        recentlyAdded: stats.recentlyAdded
      },
      resourcesNeedingReview: resourcesNeedingReview.slice(0, 10).map(resource => ({
        id: resource.id,
        title: resource.title,
        created_at: resource.created_at,
        resource_type: resource.resource_type,
        difficulty_level: resource.difficulty_level
      }))
    })

  } catch (error) {
    console.error('Get auto-publish info error:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}