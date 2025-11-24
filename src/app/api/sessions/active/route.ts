/**
 * GET /api/sessions/active
 *
 * Get user's active session (if any)
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

    // Get active session
    const session = await SessionService.getActiveSession(userId)

    return NextResponse.json({
      data: { session },
    })
  } catch (error) {
    console.error('Get active session error:', error)

    const message = error instanceof Error ? error.message : 'Failed to get active session'

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
