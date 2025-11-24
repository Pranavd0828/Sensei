/**
 * POST /api/sessions/:sessionId/steps
 *
 * Save step data and advance to next step
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { validateAuth } from '@/lib/auth'
import { SessionService } from '@/services/session.service'

// ============================================================================
// Validation Schema
// ============================================================================

const SaveStepSchema = z.object({
  stepNumber: z.number().int().min(1).max(8),
  stepData: z.unknown(), // Will be validated by the step schema
})

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

    // Parse and validate request body
    const body = await request.json()
    const { stepNumber, stepData } = SaveStepSchema.parse(body)

    // Save step
    const result = await SessionService.saveStep(
      params.sessionId,
      userId,
      stepNumber,
      stepData
    )

    return NextResponse.json({
      data: result,
    })
  } catch (error) {
    console.error('Save step error:', error)

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            details: error.errors,
          },
        },
        { status: 400 }
      )
    }

    // Handle other errors
    const message = error instanceof Error ? error.message : 'Failed to save step'
    const isUnauthorized = message.includes('Unauthorized')
    const isNotFound = message.includes('not found')
    const isConflict = message.includes('Expected step')

    return NextResponse.json(
      {
        error: {
          code: isUnauthorized
            ? 'FORBIDDEN'
            : isNotFound
              ? 'NOT_FOUND'
              : isConflict
                ? 'CONFLICT'
                : 'VALIDATION_ERROR',
          message,
        },
      },
      {
        status: isUnauthorized ? 403 : isNotFound ? 404 : isConflict ? 409 : 400,
      }
    )
  }
}
