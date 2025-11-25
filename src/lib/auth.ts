/**
 * Authentication Utilities
 *
 * JWT token generation, verification, and password hashing utilities.
 */

import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'

// ============================================================================
// Types
// ============================================================================

export interface JWTPayload {
  userId: string
  email: string
  type: 'magic_link' | 'session'
}

export interface SessionPayload {
  userId: string
  email: string
  iat: number
  exp: number
}

// ============================================================================
// Environment Variables
// ============================================================================

function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not defined')
  }
  return secret
}

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'
const MAGIC_LINK_EXPIRES_IN = process.env.MAGIC_LINK_EXPIRES_IN || '15m'

// ============================================================================
// JWT Functions
// ============================================================================

/**
 * Generate a magic link token (short-lived, 15 minutes)
 */
export function generateMagicLinkToken(userId: string, email: string): string {
  const payload: JWTPayload = {
    userId,
    email,
    type: 'magic_link',
  }
  return jwt.sign(payload, getJWTSecret(), { expiresIn: MAGIC_LINK_EXPIRES_IN } as any)
}

/**
 * Generate a session token (long-lived, 7 days)
 */
export function generateSessionToken(userId: string, email: string): string {
  const payload: JWTPayload = {
    userId,
    email,
    type: 'session',
  }
  return jwt.sign(payload, getJWTSecret(), { expiresIn: JWT_EXPIRES_IN } as any)
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, getJWTSecret())
    return decoded as JWTPayload
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired')
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token')
    }
    throw new Error('Token verification failed')
  }
}

/**
 * Extract user ID from Authorization header
 */
export function getUserIdFromRequest(request: NextRequest): string {
  const authHeader = request.headers.get('authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header')
  }

  const token = authHeader.substring(7) // Remove 'Bearer ' prefix

  try {
    const payload = verifyToken(token)

    // Only accept session tokens for API requests
    if (payload.type !== 'session') {
      throw new Error('Invalid token type')
    }

    return payload.userId
  } catch (error) {
    throw new Error('Unauthorized')
  }
}

/**
 * Middleware helper to validate auth and get user ID
 */
export async function validateAuth(request: NextRequest): Promise<string> {
  try {
    return getUserIdFromRequest(request)
  } catch (error) {
    throw new Error('Unauthorized')
  }
}

// ============================================================================
// Password Hashing (for future use if needed)
// ============================================================================

const SALT_ROUNDS = 12

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

/**
 * Compare a password with its hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// ============================================================================
// Magic Link Generation
// ============================================================================

/**
 * Generate a magic link URL
 */
export function generateMagicLink(token: string, baseUrl?: string): string {
  const url = baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return `${url}/auth/verify?token=${encodeURIComponent(token)}`
}

// ============================================================================
// Token Utilities
// ============================================================================

/**
 * Generate a random token string (for database storage)
 */
export function generateRandomToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Calculate token expiration date
 */
export function getTokenExpiration(minutes: number = 15): Date {
  return new Date(Date.now() + minutes * 60 * 1000)
}

// ============================================================================
// Error Classes
// ============================================================================

export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number = 401
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

export class TokenExpiredError extends AuthError {
  constructor() {
    super('Token has expired', 401)
    this.name = 'TokenExpiredError'
  }
}

export class InvalidTokenError extends AuthError {
  constructor() {
    super('Invalid token', 401)
    this.name = 'InvalidTokenError'
  }
}
