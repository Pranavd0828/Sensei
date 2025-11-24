/**
 * Authentication Service
 *
 * Handles user authentication, magic link generation, and token management.
 */

import { db } from '@/lib/db'
import {
  generateMagicLinkToken,
  generateSessionToken,
  verifyToken,
  generateMagicLink,
  getTokenExpiration,
} from '@/lib/auth'
import { User } from '@prisma/client'

// ============================================================================
// Types
// ============================================================================

export interface AuthResult {
  token: string
  user: {
    id: string
    email: string
    displayName: string | null
    level: number
    totalXp: number
  }
}

// ============================================================================
// Auth Service
// ============================================================================

export class AuthService {
  /**
   * Send magic link to user email
   * Creates user if doesn't exist, generates token, and sends email
   */
  static async sendMagicLink(email: string): Promise<{
    message: string
    expiresIn: string
    magicLink?: string // For development/testing
  }> {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format')
    }

    // Find or create user
    let user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!user) {
      // Create new user
      user = await db.user.create({
        data: {
          email: email.toLowerCase(),
          level: 1,
          totalXp: 0,
          bestStreak: 0,
        },
      })

      // Initialize streak for new user
      await db.streak.create({
        data: {
          userId: user.id,
          currentStreak: 0,
          bestStreak: 0,
          lastActivityDate: new Date().toISOString().split('T')[0],
        },
      })
    }

    // Generate magic link token
    const token = generateMagicLinkToken(user.id, user.email)

    // Store token in database
    await db.authToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt: getTokenExpiration(15), // 15 minutes
      },
    })

    // Generate magic link URL
    const magicLink = generateMagicLink(token)

    // In development, log the magic link to console
    if (process.env.NODE_ENV === 'development') {
      console.log('\n🔐 Magic Link Generated:')
      console.log(`   Email: ${email}`)
      console.log(`   Link: ${magicLink}`)
      console.log(`   Token: ${token}`)
      console.log(`   Expires: 15 minutes\n`)
    }

    // TODO: In production, send actual email via email service
    // await EmailService.sendMagicLink(email, magicLink)

    return {
      message: `Magic link sent to ${email}`,
      expiresIn: '15m',
      // Return link in development for testing
      ...(process.env.NODE_ENV === 'development' && { magicLink }),
    }
  }

  /**
   * Verify magic link token and issue session token
   */
  static async verifyMagicLink(token: string): Promise<AuthResult> {
    // Verify JWT token
    let payload
    try {
      payload = verifyToken(token)
    } catch (error) {
      throw new Error('Invalid or expired token')
    }

    // Check token type
    if (payload.type !== 'magic_link') {
      throw new Error('Invalid token type')
    }

    // Check if token exists in database and hasn't been used
    const authToken = await db.authToken.findUnique({
      where: { token },
    })

    if (!authToken) {
      throw new Error('Token not found')
    }

    if (authToken.usedAt) {
      throw new Error('Token has already been used')
    }

    if (authToken.expiresAt < new Date()) {
      throw new Error('Token has expired')
    }

    // Mark token as used
    await db.authToken.update({
      where: { token },
      data: { usedAt: new Date() },
    })

    // Get user
    const user = await db.user.findUnique({
      where: { id: payload.userId },
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Generate session token
    const sessionToken = generateSessionToken(user.id, user.email)

    return {
      token: sessionToken,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        level: user.level,
        totalXp: user.totalXp,
      },
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<User | null> {
    return db.user.findUnique({
      where: { id: userId },
    })
  }

  /**
   * Update user profile
   */
  static async updateProfile(
    userId: string,
    data: { displayName?: string; settings?: string }
  ): Promise<User> {
    return db.user.update({
      where: { id: userId },
      data,
    })
  }

  /**
   * Delete user account and all associated data
   */
  static async deleteAccount(userId: string): Promise<void> {
    // Delete user (cascading deletes will handle related records)
    await db.user.delete({
      where: { id: userId },
    })

    // Explicit cleanup of auth tokens (not cascaded)
    await db.authToken.deleteMany({
      where: { userId },
    })
  }

  /**
   * Cleanup expired tokens (maintenance task)
   */
  static async cleanupExpiredTokens(): Promise<number> {
    const result = await db.authToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    })

    return result.count
  }
}
