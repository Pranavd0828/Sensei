/**
 * POST /api/auth/send-link
 *
 * Send magic link to user's email
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { AuthService } from '@/services/auth.service'

// ============================================================================
// Validation Schema
// ============================================================================

const SendLinkSchema = z.object({
  email: z.string().email('Invalid email format'),
})

// ============================================================================
// Route Handler
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const { email } = SendLinkSchema.parse(body)

    // Send magic link
    const result = await AuthService.sendMagicLink(email)

    return NextResponse.json({
      data: result,
    })
  } catch (error) {
    console.error('Send magic link error:', error)

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
    const message = error instanceof Error ? error.message : 'Failed to send magic link'

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
