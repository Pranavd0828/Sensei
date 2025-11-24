/**
 * Application Constants
 *
 * Centralized constants used throughout the application.
 */

// ============================================================================
// API Response Codes
// ============================================================================

export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',
} as const

// ============================================================================
// Session & Step Constants
// ============================================================================

export const SESSION_STATUS = {
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  ABANDONED: 'abandoned',
} as const

export const STEP_NAMES = {
  GOAL: 'goal',
  MISSION: 'mission',
  SEGMENTS: 'segments',
  PROBLEMS: 'problems',
  SOLUTIONS: 'solutions',
  METRICS: 'metrics',
  TRADEOFFS: 'tradeoffs',
  SUMMARY: 'summary',
} as const

export const TOTAL_STEPS = 8

// ============================================================================
// Objective Categories
// ============================================================================

export const OBJECTIVES = {
  GROWTH: 'Growth',
  ENGAGEMENT: 'Engagement',
  RETENTION: 'Retention',
  MONETIZATION: 'Monetization',
  COST: 'Cost',
  QUALITY_TRUST: 'Quality / Trust',
} as const

// ============================================================================
// Difficulty Levels
// ============================================================================

export const DIFFICULTY = {
  EASY: 1,
  MEDIUM: 2,
  HARD: 3,
} as const

export const DIFFICULTY_LABELS = {
  [DIFFICULTY.EASY]: 'Easy',
  [DIFFICULTY.MEDIUM]: 'Medium',
  [DIFFICULTY.HARD]: 'Hard',
} as const

// ============================================================================
// Scoring Constants
// ============================================================================

export const SCORE_RANGE = {
  MIN_STEP: 0,
  MAX_STEP: 5,
  MIN_OVERALL: 0,
  MAX_OVERALL: 100,
} as const

export const SCORING_STATUS = {
  SUCCESS: 'success',
  FALLBACK: 'fallback',
  ERROR: 'error',
} as const

// ============================================================================
// XP & Leveling Constants
// ============================================================================

export const XP_CONFIG = {
  BASE_XP: 100,
  MIN_XP: 50,
  LEVEL_FORMULA: (level: number) => level * level * 100,
} as const

// ============================================================================
// Streak Constants
// ============================================================================

export const STREAK_CONFIG = {
  FREEZE_COST: 100, // XP cost for streak freeze (future feature)
  MAX_FREEZES_PER_MONTH: 2, // Max freezes allowed (future feature)
} as const

// ============================================================================
// Auth Constants
// ============================================================================

export const AUTH_CONFIG = {
  MAGIC_LINK_EXPIRY_MINUTES: 15,
  SESSION_EXPIRY_DAYS: 7,
  SALT_ROUNDS: 12,
} as const

// ============================================================================
// LLM Constants
// ============================================================================

export const LLM_CONFIG = {
  MODEL: 'claude-3-5-sonnet-20241022',
  MAX_TOKENS: 2000,
  TEMPERATURE: 0.7,
  TIMEOUT_MS: 10000,
} as const

// ============================================================================
// Pagination Constants
// ============================================================================

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const

// ============================================================================
// Validation Constants
// ============================================================================

export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MIN_GOAL_LENGTH: 10,
  MIN_MISSION_ALIGNMENT_LENGTH: 10,
  MIN_SEGMENT_LENGTH: 5,
  MAX_SEGMENTS: 3,
  MIN_PROBLEMS: 1,
  MAX_PROBLEMS: 3,
  MIN_SUMMARY_SENTENCES: 3,
  MAX_SUMMARY_LENGTH: 1000,
} as const

// ============================================================================
// Email Template Constants
// ============================================================================

export const EMAIL_SUBJECTS = {
  MAGIC_LINK: 'Your Sensei login link',
  WELCOME: 'Welcome to Sensei!',
  LEVEL_UP: 'You leveled up!',
} as const

// ============================================================================
// localStorage Keys
// ============================================================================

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'sensei_auth_token',
  CURRENT_SESSION: 'sensei_current_session',
  SESSION_ANSWERS: 'sensei_session_answers',
  THEME: 'sensei_theme',
  MOTION_PREFERENCE: 'sensei_motion',
} as const

// ============================================================================
// API Routes
// ============================================================================

export const API_ROUTES = {
  AUTH: {
    SEND_LINK: '/api/auth/send-link',
    VERIFY: '/api/auth/verify',
    LOGOUT: '/api/auth/logout',
  },
  SESSIONS: {
    START: '/api/sessions/start',
    COMPLETE: '/api/sessions/complete',
    LIST: '/api/sessions',
    DETAIL: (id: string) => `/api/sessions/${id}`,
  },
  PROGRESS: '/api/progress',
  ACCOUNT: '/api/account',
} as const

// ============================================================================
// App Routes
// ============================================================================

export const APP_ROUTES = {
  HOME: '/',
  AUTH: {
    LOGIN: '/auth/login',
    VERIFY: '/auth/verify',
  },
  DASHBOARD: '/home',
  SESSION: {
    STEPS: '/session/steps',
    STEP: (stepNumber: number) => `/session/steps/${stepNumber}`,
    RESULTS: (sessionId: string) => `/session/${sessionId}/results`,
  },
  PROGRESS: '/progress',
  SETTINGS: '/settings',
} as const

// ============================================================================
// Time Constants (in milliseconds)
// ============================================================================

export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
} as const

// ============================================================================
// Feature Flags (for MVP)
// ============================================================================

export const FEATURE_FLAGS = {
  ENABLE_FALLBACK_SCORING: true,
  ENABLE_STEP_BACKWARD_NAVIGATION: true,
  ENABLE_STREAKS: true,
  ENABLE_XP: true,
  ENABLE_ANALYTICS: false, // Disable until we add analytics
} as const
