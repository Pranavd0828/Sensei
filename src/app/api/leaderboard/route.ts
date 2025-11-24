/**
 * GET /api/leaderboard
 *
 * Get leaderboard data
 */

import { NextRequest, NextResponse } from 'next/server'
import { ProgressionService } from '@/services/progression.service'

// ============================================================================
// Route Handler
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const metric = searchParams.get('metric') as 'xp' | 'streak' | null
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10

    // Get leaderboard
    const leaderboard = await ProgressionService.getLeaderboard({
      metric: metric || 'xp',
      limit,
    })

    return NextResponse.json({
      data: { leaderboard },
    })
  } catch (error) {
    console.error('Get leaderboard error:', error)

    const message = error instanceof Error ? error.message : 'Failed to get leaderboard'

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
