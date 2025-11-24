/**
 * POST /api/sessions/start
 *
 * Start a new practice session
 */

import { NextRequest, NextResponse } from 'next/server'
import { validateAuth } from '@/lib/auth'
import { SessionService } from '@/services/session.service'

// ============================================================================
// Route Handler
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Validate authentication
    const userId = await validateAuth(request)

    // Start new session
    const result = await SessionService.startSession(userId)

    return NextResponse.json({
      data: result,
    })
  } catch (error) {
    console.error('Start session error:', error)

    const message = error instanceof Error ? error.message : 'Failed to start session'

    // Check for specific error messages
    const isConflict = message.includes('already have an active session')
    const isNotFound = message.includes('not found')

    return NextResponse.json(
      {
        error: {
          code: isConflict ? 'CONFLICT' : isNotFound ? 'NOT_FOUND' : 'INTERNAL_ERROR',
          message,
        },
      },
      { status: isConflict ? 409 : isNotFound ? 404 : 500 }
    )
  }
}
