/**
 * General Utility Functions
 *
 * Common utilities used throughout the application.
 */

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// ============================================================================
// Tailwind CSS Class Merging
// ============================================================================

/**
 * Merge Tailwind CSS classes with proper precedence
 * Used extensively with shadcn/ui components
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ============================================================================
// Date & Time Utilities
// ============================================================================

/**
 * Format a date to ISO date string (YYYY-MM-DD)
 */
export function toISODate(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * Get yesterday's date as ISO string
 */
export function getYesterday(): string {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return toISODate(yesterday)
}

/**
 * Get today's date as ISO string
 */
export function getToday(): string {
  return toISODate(new Date())
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: string | Date, date2: string | Date): boolean {
  const d1 = typeof date1 === 'string' ? date1 : toISODate(date1)
  const d2 = typeof date2 === 'string' ? date2 : toISODate(date2)
  return d1 === d2
}

/**
 * Format duration in milliseconds to human-readable string
 */
export function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)

  if (minutes === 0) {
    return `${seconds}s`
  }

  return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`
}

// ============================================================================
// String Utilities
// ============================================================================

/**
 * Capitalize first letter of a string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Truncate a string to a max length with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 3) + '...'
}

/**
 * Convert snake_case to Title Case
 */
export function snakeToTitle(str: string): string {
  return str
    .split('_')
    .map(word => capitalize(word))
    .join(' ')
}

// ============================================================================
// Number Utilities
// ============================================================================

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Format a number as a score (0-100)
 */
export function formatScore(score: number): string {
  return Math.round(clamp(score, 0, 100)).toString()
}

/**
 * Calculate percentage
 */
export function percentage(value: number, total: number): number {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

// ============================================================================
// JSON Utilities
// ============================================================================

/**
 * Safely parse JSON with fallback
 */
export function safeJSONParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T
  } catch {
    return fallback
  }
}

/**
 * Safely stringify JSON
 */
export function safeJSONStringify(obj: unknown): string {
  try {
    return JSON.stringify(obj)
  } catch {
    return '{}'
  }
}

// ============================================================================
// Array Utilities
// ============================================================================

/**
 * Shuffle an array (Fisher-Yates algorithm)
 */
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Get random element from array
 */
export function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

/**
 * Remove duplicates from array
 */
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array))
}

// ============================================================================
// Object Utilities
// ============================================================================

/**
 * Pick specific keys from an object
 */
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key]
    }
  })
  return result
}

/**
 * Omit specific keys from an object
 */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj }
  keys.forEach(key => {
    delete result[key]
  })
  return result
}

// ============================================================================
// Sleep Utility
// ============================================================================

/**
 * Sleep for a specified duration
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ============================================================================
// Error Utilities
// ============================================================================

/**
 * Get error message from unknown error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'An unknown error occurred'
}

/**
 * Format error for API response
 */
export function formatErrorResponse(error: unknown) {
  const message = getErrorMessage(error)

  // Check for specific error types
  if (error instanceof Error) {
    if (error.name === 'ZodError') {
      return {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: error,
      }
    }
    if (error.name === 'AuthError') {
      return {
        code: 'UNAUTHORIZED',
        message,
      }
    }
  }

  return {
    code: 'INTERNAL_ERROR',
    message,
  }
}

// ============================================================================
// Constants
// ============================================================================

export const STEP_NAMES = [
  'goal',
  'mission',
  'segments',
  'problems',
  'solutions',
  'metrics',
  'tradeoffs',
  'summary',
] as const

export type StepName = (typeof STEP_NAMES)[number]

export const OBJECTIVE_CATEGORIES = [
  'Growth',
  'Engagement',
  'Retention',
  'Monetization',
  'Cost',
  'Quality / Trust',
] as const

export type ObjectiveCategory = (typeof OBJECTIVE_CATEGORIES)[number]

// ============================================================================
// XP & Leveling Utilities
// ============================================================================

/**
 * Calculate XP required for a specific level
 * Formula: level^2 * 100
 */
export function xpForLevel(level: number): number {
  return level * level * 100
}

/**
 * Calculate level from total XP
 */
export function levelFromXP(totalXp: number): number {
  let level = 1
  while (xpForLevel(level + 1) <= totalXp) {
    level++
  }
  return level
}

/**
 * Calculate XP progress to next level
 */
export function xpProgress(totalXp: number): {
  currentLevel: number
  currentLevelXp: number
  nextLevelXp: number
  xpToNextLevel: number
  progressPercentage: number
} {
  const currentLevel = levelFromXP(totalXp)
  const currentLevelXp = xpForLevel(currentLevel)
  const nextLevelXp = xpForLevel(currentLevel + 1)
  const xpInCurrentLevel = totalXp - currentLevelXp
  const xpNeededForLevel = nextLevelXp - currentLevelXp
  const xpToNextLevel = nextLevelXp - totalXp

  return {
    currentLevel,
    currentLevelXp,
    nextLevelXp,
    xpToNextLevel,
    progressPercentage: Math.round((xpInCurrentLevel / xpNeededForLevel) * 100),
  }
}

/**
 * Calculate XP award based on score and difficulty
 */
export function calculateXP(overallScore: number, difficulty: number): number {
  const BASE_XP = 100
  const MIN_XP = 50

  const scoreMultiplier = overallScore / 100
  const xp = BASE_XP * difficulty * scoreMultiplier

  return Math.max(Math.round(xp), MIN_XP)
}
