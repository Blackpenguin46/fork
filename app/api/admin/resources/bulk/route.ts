/**
 * Admin Bulk Resource Operations API
 * Handles bulk operations on resources for admin users
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { ResourceManagementService } from '@/lib/services/resource-management'
import { rateLimiters } from '@/lib/security/rate-limiter'

interface BulkOperationRequest {
  operation: 'publish' | 'unpublish' | 'delete' | 'makePremium' | 'makeFree' | 'updateCategory' | 'updateDifficulty'
  resourceIds: string[]
  data?: {
    categoryId?: string
    difficulty?: string
  }
}

export async function POST(request: NextRequest) {
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

    // Parse request body
    const body: BulkOperationRequest = await request.json()

    // Validate request
    if (!body.operation || !body.resourceIds || !Array.isArray(body.resourceIds)) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      )
    }

    if (body.resourceIds.length === 0) {
      return NextResponse.json(
        { error: 'No resources specified' },
        { status: 400 }
      )
    }

    if (body.resourceIds.length > 100) {
      return NextResponse.json(
        { error: 'Too many resources (max 100)' },
        { status: 400 }
      )
    }

    // Validate operation-specific data
    if (body.operation === 'updateCategory' && !body.data?.categoryId) {
      return NextResponse.json(
        { error: 'Category ID required for updateCategory operation' },
        { status: 400 }
      )
    }

    if (body.operation === 'updateDifficulty' && !body.data?.difficulty) {
      return NextResponse.json(
        { error: 'Difficulty level required for updateDifficulty operation' },
        { status: 400 }
      )
    }

    // Perform bulk operation
    const result = await ResourceManagementService.performBulkOperation(
      {
        resourceIds: body.resourceIds,
        operation: body.operation,
        data: body.data
      },
      user.id
    )

    // Log the bulk operation
    await supabase
      .from('admin_audit_log')
      .insert({
        admin_id: user.id,
        action: `bulk_${body.operation}`,
        resource_type: 'resources',
        resource_count: body.resourceIds.length,
        success_count: result.success,
        failure_count: result.failed,
        details: {
          operation: body.operation,
          resourceIds: body.resourceIds,
          data: body.data,
          errors: result.errors
        },
        created_at: new Date().toISOString()
      })

    return NextResponse.json({
      success: true,
      result: {
        processed: body.resourceIds.length,
        successful: result.success,
        failed: result.failed,
        errors: result.errors
      }
    })

  } catch (error) {
    console.error('Bulk operation error:', error)
    
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

    // Get resource statistics
    const stats = await ResourceManagementService.getResourceStats()

    return NextResponse.json({
      success: true,
      stats
    })

  } catch (error) {
    console.error('Get stats error:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}