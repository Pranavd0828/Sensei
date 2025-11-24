/**
 * POST /api/auth/verify
 *
 * Verify magic link token and issue session token
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { AuthService } from '@/services/auth.service'

// ============================================================================
// Validation Schema
// ============================================================================

const VerifyTokenSchema = z.object({
  token: z.string().min(1, 'Token is required'),
})

// ============================================================================
// Route Handler
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const { token } = VerifyTokenSchema.parse(body)

    // Verify token and get session
    const result = await AuthService.verifyMagicLink(token)

    return NextResponse.json({
      data: result,
    })
  } catch (error) {
    console.error('Verify token error:', error)

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

    // Handle auth errors
    const message = error instanceof Error ? error.message : 'Token verification failed'

    // Check for specific error messages
    const isAuthError =
      message.includes('expired') ||
      message.includes('invalid') ||
      message.includes('not found') ||
      message.includes('already been used')

    return NextResponse.json(
      {
        error: {
          code: isAuthError ? 'UNAUTHORIZED' : 'INTERNAL_ERROR',
          message,
        },
      },
      { status: isAuthError ? 401 : 500 }
    )
  }
}
