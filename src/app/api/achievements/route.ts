import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { AchievementsService } from '@/services/achievements.service'
import { verifyToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
    try {
        const token = req.headers.get('authorization')?.split(' ')[1]

        if (!token) {
            return NextResponse.json(
                { error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
                { status: 401 }
            )
        }

        const decoded = verifyToken(token)

        if (!decoded) {
            return NextResponse.json(
                { error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
                { status: 401 }
            )
        }

        const achievements = await AchievementsService.getUserAchievements(decoded.userId)

        return NextResponse.json({
            achievements,
        })
    } catch (error) {
        console.error('Error fetching achievements:', error)
        return NextResponse.json(
            { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
            { status: 500 }
        )
    }
}
