import { db } from '@/lib/db'
import { ProgressionService } from './progression.service'

export interface AchievementResult {
    unlocked: boolean
    achievement: {
        id: string
        name: string
        description: string
        icon: string
        xpReward: number
    } | null
}

export class AchievementsService {
    /**
     * Check if user has unlocked any new achievements
     */
    static async checkAchievements(userId: string, event: string, metadata?: any): Promise<AchievementResult[]> {
        const results: AchievementResult[] = []

        // Get all achievements
        const allAchievements = await db.achievement.findMany()

        // Get user's unlocked achievements
        const userAchievements = await db.userAchievement.findMany({
            where: { userId },
            include: { achievement: true },
        })

        const unlockedIds = new Set(userAchievements.map((ua) => ua.achievementId))

        // Check each achievement
        for (const achievement of allAchievements) {
            if (unlockedIds.has(achievement.id)) continue

            let unlocked = false

            switch (achievement.code) {
                case 'FIRST_SESSION':
                    if (event === 'SESSION_COMPLETED') {
                        const sessionCount = await db.session.count({
                            where: { userId, status: 'COMPLETED' },
                        })
                        if (sessionCount >= 1) unlocked = true
                    }
                    break

                case 'STREAK_3':
                    if (event === 'STREAK_UPDATED') {
                        const streak = await db.streak.findUnique({ where: { userId } })
                        if (streak && streak.currentStreak >= 3) unlocked = true
                    }
                    break

                case 'STREAK_7':
                    if (event === 'STREAK_UPDATED') {
                        const streak = await db.streak.findUnique({ where: { userId } })
                        if (streak && streak.currentStreak >= 7) unlocked = true
                    }
                    break

                case 'XP_1000':
                    if (event === 'XP_AWARDED') {
                        const user = await db.user.findUnique({ where: { id: userId } })
                        if (user && user.totalXp >= 1000) unlocked = true
                    }
                    break
            }

            if (unlocked) {
                // Unlock achievement
                await db.userAchievement.create({
                    data: {
                        userId,
                        achievementId: achievement.id,
                    },
                })

                // Award XP for achievement
                await ProgressionService.awardXP(userId, achievement.xpReward, `Achievement Unlocked: ${achievement.name}`)

                results.push({
                    unlocked: true,
                    achievement,
                })
            }
        }

        return results
    }

    /**
     * Get all achievements for a user (locked and unlocked)
     */
    static async getUserAchievements(userId: string) {
        const allAchievements = await db.achievement.findMany({
            orderBy: { xpReward: 'asc' }
        })

        const userAchievements = await db.userAchievement.findMany({
            where: { userId },
        })

        const unlockedMap = new Map(userAchievements.map((ua) => [ua.achievementId, ua.unlockedAt]))

        return allAchievements.map((achievement) => ({
            ...achievement,
            unlocked: unlockedMap.has(achievement.id),
            unlockedAt: unlockedMap.get(achievement.id) || null,
        }))
    }

    /**
     * Seed default achievements (idempotent)
     */
    static async seedDefaults() {
        const defaults = [
            {
                code: 'FIRST_SESSION',
                name: 'First Steps',
                description: 'Complete your first practice session',
                icon: 'Footprints',
                xpReward: 100
            },
            {
                code: 'STREAK_3',
                name: 'Consistency is Key',
                description: 'Reach a 3-day streak',
                icon: 'Flame',
                xpReward: 300
            },
            {
                code: 'STREAK_7',
                name: 'Unstoppable',
                description: 'Reach a 7-day streak',
                icon: 'Zap',
                xpReward: 1000
            },
            {
                code: 'XP_1000',
                name: 'Rising Star',
                description: 'Earn 1000 total XP',
                icon: 'Star',
                xpReward: 500
            }
        ]

        for (const achievement of defaults) {
            await db.achievement.upsert({
                where: { code: achievement.code },
                update: achievement,
                create: achievement
            })
        }
    }
}
