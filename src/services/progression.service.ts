/**
 * Progression Service
 *
 * Handles XP, levels, and streak management
 */

import { db } from '@/lib/db'
import { xpForLevel } from '@/lib/utils'
import { AchievementsService } from './achievements.service'

// ============================================================================
// Types
// ============================================================================

export interface XpResult {
  xpEarned: number
  totalXp: number
  levelUp: boolean
  previousLevel: number
  newLevel: number
  xpToNextLevel: number
}

export interface StreakResult {
  currentStreak: number
  bestStreak: number
  streakUpdated: boolean
}

// ============================================================================
// Progression Service
// ============================================================================

export class ProgressionService {
  /**
   * Award XP to a user after completing a session
   */
  static async awardXP(userId: string, xpAmount: number, reason: string): Promise<XpResult> {
    // Get current user state
    const user = await db.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new Error('User not found')
    }

    const previousLevel = user.level
    const previousXp = user.totalXp
    const newTotalXp = previousXp + xpAmount

    // Calculate new level
    let newLevel = previousLevel
    let levelUp = false

    // Check if user leveled up (possibly multiple times)
    while (newTotalXp >= xpForLevel(newLevel + 1)) {
      newLevel++
      levelUp = true
    }

    // Update user
    await db.user.update({
      where: { id: userId },
      data: {
        totalXp: newTotalXp,
        level: newLevel,
      },
    })

    // Record XP event
    await db.xpEvent.create({
      data: {
        userId,
        amount: xpAmount,
        reason,
      },
    })

    // Calculate XP needed for next level
    const xpToNextLevel = xpForLevel(newLevel + 1) - newTotalXp

    return {
      xpEarned: xpAmount,
      totalXp: newTotalXp,
      levelUp,
      previousLevel,
      newLevel,
      xpToNextLevel,
    }
  }

  /**
   * Update user's streak after completing a session
   */
  static async updateStreak(userId: string): Promise<StreakResult> {
    const today = new Date().toISOString().split('T')[0]

    // Get current streak
    let streak = await db.streak.findUnique({
      where: { userId },
    })

    // Create streak if it doesn't exist
    if (!streak) {
      streak = await db.streak.create({
        data: {
          userId,
          currentStreak: 1,
          bestStreak: 1,
          lastActivityDate: today,
        },
      })

      return {
        currentStreak: 1,
        bestStreak: 1,
        streakUpdated: true,
      }
    }

    const lastActivityDate = streak.lastActivityDate

    // Check if already practiced today
    if (lastActivityDate === today) {
      return {
        currentStreak: streak.currentStreak,
        bestStreak: streak.bestStreak,
        streakUpdated: false,
      }
    }

    // Calculate days difference
    const lastDate = new Date(lastActivityDate)
    const todayDate = new Date(today)
    const daysDiff = Math.floor(
      (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    let newCurrentStreak: number
    let newBestStreak: number
    let streakUpdated = true

    if (daysDiff === 1) {
      // Consecutive day - increment streak
      newCurrentStreak = streak.currentStreak + 1
      newBestStreak = Math.max(streak.bestStreak, newCurrentStreak)
    } else {
      // Streak broken - reset to 1
      newCurrentStreak = 1
      newBestStreak = streak.bestStreak
    }

    // Update streak
    await db.streak.update({
      where: { userId },
      data: {
        currentStreak: newCurrentStreak,
        bestStreak: newBestStreak,
        lastActivityDate: today,
      },
    })

    // Also update user's best streak
    await db.user.update({
      where: { id: userId },
      data: {
        bestStreak: newBestStreak,
      },
    })

    return {
      currentStreak: newCurrentStreak,
      bestStreak: newBestStreak,
      streakUpdated,
    }
  }

  /**
   * Get user's XP history
   */
  static async getXpHistory(
    userId: string,
    options?: {
      limit?: number
      offset?: number
    }
  ): Promise<{
    events: Array<{
      id: string
      amount: number
      reason: string
      createdAt: Date
    }>
    total: number
  }> {
    const where = { userId }

    const [events, total] = await Promise.all([
      db.xpEvent.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        take: options?.limit ?? 20,
        skip: options?.offset ?? 0,
      }),
      db.xpEvent.count({ where }),
    ])

    return { events, total }
  }

  /**
   * Get user's streak information
   */
  static async getStreak(userId: string): Promise<StreakResult | null> {
    const streak = await db.streak.findUnique({
      where: { userId },
    })

    if (!streak) {
      return null
    }

    return {
      currentStreak: streak.currentStreak,
      bestStreak: streak.bestStreak,
      streakUpdated: false,
    }
  }

  /**
   * Get user's progression stats
   */
  static async getProgressionStats(userId: string): Promise<{
    level: number
    totalXp: number
    xpToNextLevel: number
    currentStreak: number
    bestStreak: number
    sessionsCompleted: number
    averageScore: number | null
  }> {
    const user = await db.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new Error('User not found')
    }

    const streak = await db.streak.findUnique({
      where: { userId },
    })

    const sessions = await db.session.findMany({
      where: {
        userId,
        status: 'COMPLETED',
      },
    })

    const sessionsCompleted = sessions.length
    const scoredSessions = sessions.filter((s) => s.overallScore !== null)
    const averageScore =
      scoredSessions.length > 0
        ? scoredSessions.reduce((sum, s) => sum + (s.overallScore || 0), 0) / scoredSessions.length
        : null

    const xpToNextLevel = xpForLevel(user.level + 1) - user.totalXp

    return {
      level: user.level,
      totalXp: user.totalXp,
      xpToNextLevel,
      currentStreak: streak?.currentStreak || 0,
      bestStreak: streak?.bestStreak || 0,
      sessionsCompleted,
      averageScore: averageScore ? Math.round(averageScore) : null,
    }
  }

  /**
   * Get leaderboard data
   */
  static async getLeaderboard(options?: {
    metric?: 'xp' | 'streak'
    limit?: number
  }): Promise<
    Array<{
      userId: string
      email: string
      displayName: string | null
      level: number
      totalXp: number
      bestStreak: number
      rank: number
    }>
  > {
    const metric = options?.metric || 'xp'
    const limit = options?.limit || 10

    const users = await db.user.findMany({
      orderBy:
        metric === 'xp'
          ? [{ totalXp: 'desc' }, { level: 'desc' }]
          : [{ bestStreak: 'desc' }, { totalXp: 'desc' }],
      take: limit,
      select: {
        id: true,
        email: true,
        displayName: true,
        level: true,
        totalXp: true,
        bestStreak: true,
      },
    })

    return users.map((user, index) => ({
      userId: user.id,
      email: user.email,
      displayName: user.displayName,
      level: user.level,
      totalXp: user.totalXp,
      bestStreak: user.bestStreak,
      rank: index + 1,
    }))
  }

  /**
   * Award XP after scoring a session
   * This is called automatically after a session is scored
   */
  static async processSessionCompletion(
    userId: string,
    sessionId: string,
    xpEarned: number
  ): Promise<{
    xpResult: XpResult
    streakResult: StreakResult
  }> {
    // Award XP
    const xpResult = await this.awardXP(userId, xpEarned, `Completed session ${sessionId}`)

    // Update streak
    const streakResult = await this.updateStreak(userId)

    // Check for achievements
    await AchievementsService.checkAchievements(userId, 'SESSION_COMPLETED')
    await AchievementsService.checkAchievements(userId, 'XP_AWARDED')
    if (streakResult.streakUpdated) {
      await AchievementsService.checkAchievements(userId, 'STREAK_UPDATED')
    }

    return {
      xpResult,
      streakResult,
    }
  }
}
