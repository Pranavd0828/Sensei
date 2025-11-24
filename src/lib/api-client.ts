/**
 * API Client
 *
 * Frontend helper for making API requests with proper error handling.
 */

import { API_ROUTES, ERROR_CODES } from './constants'

// ============================================================================
// Types
// ============================================================================

export interface APIResponse<T = unknown> {
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
  meta?: {
    timestamp?: string
    requestId?: string
  }
}

export interface APIError extends Error {
  code: string
  statusCode: number
  details?: unknown
}

// ============================================================================
// API Client Class
// ============================================================================

class APIClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string = '') {
    this.baseURL = baseURL
  }

  /**
   * Set authentication token
   */
  setToken(token: string | null) {
    this.token = token
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('sensei_auth_token', token)
      } else {
        localStorage.removeItem('sensei_auth_token')
      }
    }
  }

  /**
   * Get authentication token
   */
  getToken(): string | null {
    if (this.token) return this.token

    if (typeof window !== 'undefined') {
      return localStorage.getItem('sensei_auth_token')
    }

    return null
  }

  /**
   * Make an API request
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const token = this.getToken()

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      const data: APIResponse<T> = await response.json()

      if (!response.ok) {
        const error = new Error(data.error?.message || 'Request failed') as APIError
        error.code = data.error?.code || ERROR_CODES.INTERNAL_ERROR
        error.statusCode = response.status
        error.details = data.error?.details
        throw error
      }

      return data.data as T
    } catch (error) {
      if (error instanceof Error && 'code' in error) {
        throw error
      }

      // Network or other errors
      const apiError = new Error('Network error') as APIError
      apiError.code = ERROR_CODES.INTERNAL_ERROR
      apiError.statusCode = 500
      throw apiError
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
    })
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    })
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const apiClient = new APIClient()

// ============================================================================
// Typed API Methods
// ============================================================================

export const api = {
  // Auth
  auth: {
    sendMagicLink: (email: string) =>
      apiClient.post<{ message: string; expiresIn: string }>(API_ROUTES.AUTH.SEND_LINK, {
        email,
      }),
    verify: (token: string) =>
      apiClient.post<{ token: string; user: unknown }>(API_ROUTES.AUTH.VERIFY, { token }),
    logout: () => apiClient.post(API_ROUTES.AUTH.LOGOUT),
  },

  // Sessions
  sessions: {
    start: () => apiClient.post<{ sessionId: string; prompt: unknown }>(API_ROUTES.SESSIONS.START),
    complete: (sessionId: string, userInputs: unknown) =>
      apiClient.post<unknown>(API_ROUTES.SESSIONS.COMPLETE, { sessionId, userInputs }),
    list: (params?: { page?: number; pageSize?: number; status?: string }) => {
      const query = new URLSearchParams(params as Record<string, string>).toString()
      return apiClient.get<{ sessions: unknown[]; pagination: unknown }>(
        `${API_ROUTES.SESSIONS.LIST}${query ? `?${query}` : ''}`
      )
    },
    getById: (id: string) => apiClient.get<unknown>(API_ROUTES.SESSIONS.DETAIL(id)),
  },

  // Progress
  progress: {
    get: () => apiClient.get<unknown>(API_ROUTES.PROGRESS),
  },

  // Account
  account: {
    delete: (confirmation: string) => apiClient.delete(API_ROUTES.ACCOUNT, {
      body: JSON.stringify({ confirmation }),
    }),
  },
}

// ============================================================================
// Error Handling Utilities
// ============================================================================

/**
 * Check if error is an API error
 */
export function isAPIError(error: unknown): error is APIError {
  return error instanceof Error && 'code' in error && 'statusCode' in error
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (isAPIError(error)) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'An unexpected error occurred'
}

/**
 * Check if error is auth-related
 */
export function isAuthError(error: unknown): boolean {
  if (!isAPIError(error)) return false
  return (
    error.code === ERROR_CODES.UNAUTHORIZED ||
    error.code === ERROR_CODES.TOKEN_EXPIRED ||
    error.code === ERROR_CODES.INVALID_TOKEN
  )
}

/**
 * Handle API error (logout on auth errors)
 */
export function handleAPIError(error: unknown) {
  if (isAuthError(error)) {
    // Clear token and redirect to login
    apiClient.setToken(null)
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login'
    }
  }
}
