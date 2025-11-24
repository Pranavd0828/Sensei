/**
 * GET /api/progression/stats
 *
 * Get user's progression statistics
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

    // Get progression stats
    const stats = await ProgressionService.getProgressionStats(userId)

    return NextResponse.json({
      data: stats,
    })
  } catch (error) {
    console.error('Get progression stats error:', error)

    const message = error instanceof Error ? error.message : 'Failed to get progression stats'

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
