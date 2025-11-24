/**
 * POST /api/sessions/:sessionId/complete
 *
 * Complete a session (marks it ready for scoring)
 */

import { NextRequest, NextResponse } from 'next/server'
import { validateAuth } from '@/lib/auth'
import { SessionService } from '@/services/session.service'

// ============================================================================
// Route Handler
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    // Validate authentication
    const userId = await validateAuth(request)

    // Complete session
    const session = await SessionService.completeSession(params.sessionId, userId)

    return NextResponse.json({
      data: { session },
    })
  } catch (error) {
    console.error('Complete session error:', error)

    const message = error instanceof Error ? error.message : 'Failed to complete session'
    const isUnauthorized = message.includes('Unauthorized')
    const isNotFound = message.includes('not found')
    const isConflict = message.includes('not in progress') || message.includes('must be completed')

    return NextResponse.json(
      {
        error: {
          code: isUnauthorized
            ? 'FORBIDDEN'
            : isNotFound
              ? 'NOT_FOUND'
              : isConflict
                ? 'CONFLICT'
                : 'INTERNAL_ERROR',
          message,
        },
      },
      {
        status: isUnauthorized ? 403 : isNotFound ? 404 : isConflict ? 409 : 500,
      }
    )
  }
}
