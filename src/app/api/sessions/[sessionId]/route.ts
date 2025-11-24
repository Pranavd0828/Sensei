/**
 * GET /api/sessions/:sessionId
 * DELETE /api/sessions/:sessionId
 *
 * Get or delete a specific session
 */

import { NextRequest, NextResponse } from 'next/server'
import { validateAuth } from '@/lib/auth'
import { SessionService } from '@/services/session.service'

// ============================================================================
// Route Handler - GET
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    // Validate authentication
    const userId = await validateAuth(request)

    // Get session
    const session = await SessionService.getSession(params.sessionId, userId)

    if (!session) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Session not found',
          },
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      data: { session },
    })
  } catch (error) {
    console.error('Get session error:', error)

    const message = error instanceof Error ? error.message : 'Failed to get session'
    const isUnauthorized = message.includes('Unauthorized')

    return NextResponse.json(
      {
        error: {
          code: isUnauthorized ? 'FORBIDDEN' : 'INTERNAL_ERROR',
          message,
        },
      },
      { status: isUnauthorized ? 403 : 500 }
    )
  }
}

// ============================================================================
// Route Handler - DELETE
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    // Validate authentication
    const userId = await validateAuth(request)

    // Delete session
    await SessionService.deleteSession(params.sessionId, userId)

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Delete session error:', error)

    const message = error instanceof Error ? error.message : 'Failed to delete session'
    const isUnauthorized = message.includes('Unauthorized')
    const isNotFound = message.includes('not found')
    const isConflict = message.includes('Cannot delete')

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
