/**
 * POST /api/sessions/:sessionId/score
 *
 * Score a completed session using Claude API
 */

import { NextRequest, NextResponse } from 'next/server'
import { validateAuth } from '@/lib/auth'
import { ScoringService } from '@/services/scoring.service'
import { ProgressionService } from '@/services/progression.service'
import { db } from '@/lib/db'

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

    // Verify session belongs to user
    const session = await db.session.findUnique({
      where: { id: params.sessionId },
    })

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

    if (session.userId !== userId) {
      return NextResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: 'Unauthorized',
          },
        },
        { status: 403 }
      )
    }

    if (session.status !== 'completed') {
      return NextResponse.json(
        {
          error: {
            code: 'CONFLICT',
            message: 'Session must be completed before scoring',
          },
        },
        { status: 409 }
      )
    }

    // Check if already scored
    if (session.overallScore !== null) {
      return NextResponse.json(
        {
          error: {
            code: 'CONFLICT',
            message: 'Session has already been scored',
          },
        },
        { status: 409 }
      )
    }

    // Score session
    const result = await ScoringService.scoreSession(params.sessionId)

    // Award XP and update streak
    const progression = await ProgressionService.processSessionCompletion(
      userId,
      params.sessionId,
      result.xpEarned
    )

    return NextResponse.json({
      data: {
        ...result,
        progression,
      },
    })
  } catch (error) {
    console.error('Score session error:', error)

    const message = error instanceof Error ? error.message : 'Failed to score session'
    const isNotFound = message.includes('not found')
    const isConflict = message.includes('must be completed') || message.includes('already been scored')

    return NextResponse.json(
      {
        error: {
          code: isNotFound ? 'NOT_FOUND' : isConflict ? 'CONFLICT' : 'INTERNAL_ERROR',
          message,
        },
      },
      { status: isNotFound ? 404 : isConflict ? 409 : 500 }
    )
  }
}
