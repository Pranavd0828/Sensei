/**
 * POST /api/auth/logout
 *
 * Logout user (stateless, just confirms action)
 */

import { NextRequest, NextResponse } from 'next/server'
import { validateAuth } from '@/lib/auth'

// ============================================================================
// Route Handler
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Validate that user is authenticated
    // This will throw if token is invalid
    await validateAuth(request)

    // For JWT-based auth, logout is handled client-side
    // Server just confirms the action
    return NextResponse.json({
      data: {
        message: 'Logged out successfully',
      },
    })
  } catch (error) {
    console.error('Logout error:', error)

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
}
