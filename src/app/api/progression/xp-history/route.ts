/**
 * GET /api/progression/xp-history
 *
 * Get user's XP history
 */

import { NextRequest, NextResponse } from 'next/server'
import { validateAuth } from '@/lib/auth'
import { ProgressionService } from '@/services/progression.service'

// ============================================================================
// Route Handler
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // Validate authentication
    const userId = await validateAuth(request)

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0

    // Get XP history
    const result = await ProgressionService.getXpHistory(userId, { limit, offset })

    return NextResponse.json({
      data: result,
    })
  } catch (error) {
    console.error('Get XP history error:', error)

    const message = error instanceof Error ? error.message : 'Failed to get XP history'

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
