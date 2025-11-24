/**
 * DELETE /api/account
 *
 * Delete user account and all associated data
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { validateAuth } from '@/lib/auth'
import { AuthService } from '@/services/auth.service'

// ============================================================================
// Validation Schema
// ============================================================================

const DeleteAccountSchema = z.object({
  confirmation: z.literal('DELETE', {
    errorMap: () => ({ message: 'Must type DELETE to confirm' }),
  }),
})

// ============================================================================
// Route Handler
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    // Validate authentication
    const userId = await validateAuth(request)

    // Parse and validate request body
    const body = await request.json()
    DeleteAccountSchema.parse(body)

    // Delete account
    await AuthService.deleteAccount(userId)

    // Return 204 No Content on success
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Delete account error:', error)

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Must type DELETE to confirm',
            details: error.errors,
          },
        },
        { status: 400 }
      )
    }

    // Handle auth errors
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid or expired session',
          },
        },
        { status: 401 }
      )
    }

    // Handle other errors
    const message = error instanceof Error ? error.message : 'Failed to delete account'

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
