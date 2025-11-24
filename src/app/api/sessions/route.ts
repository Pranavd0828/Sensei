/**
 * GET /api/sessions
 *
 * Get user's sessions with optional filtering
 */

import { NextRequest, NextResponse } from 'next/server'
import { validateAuth } from '@/lib/auth'
import { SessionService } from '@/services/session.service'

// ============================================================================
// Route Handler
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // Validate authentication
    const userId = await validateAuth(request)

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as 'IN_PROGRESS' | 'COMPLETED' | null
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0

    // Get sessions
    const result = await SessionService.getUserSessions(userId, {
      ...(status && { status }),
      limit,
      offset,
    })

    return NextResponse.json({
      data: result,
    })
  } catch (error) {
    console.error('Get sessions error:', error)

    const message = error instanceof Error ? error.message : 'Failed to get sessions'

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message,
        },
      },
      { status: 500 }
    )
  }
}
