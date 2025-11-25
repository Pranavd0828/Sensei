/**
 * API Client
 * Handles all API requests with authentication
 */

const API_BASE = ''

function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('session_token') : null
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Request failed' } }))
    throw new Error(error.error?.message || 'Request failed')
  }
  const data = await response.json()
  return data.data
}

// ============================================================================
// Auth APIs
// ============================================================================

export async function sendMagicLink(email: string) {
  const response = await fetch(`${API_BASE}/api/auth/send-link`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  return handleResponse(response)
}

export async function verifyMagicLink(token: string) {
  const response = await fetch(`${API_BASE}/api/auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  })
  return handleResponse(response)
}

export async function logout() {
  const response = await fetch(`${API_BASE}/api/auth/logout`, {
    method: 'POST',
    headers: getAuthHeaders(),
  })
  return handleResponse(response)
}

// ============================================================================
// User APIs
// ============================================================================

export async function getMe() {
  const response = await fetch(`${API_BASE}/api/user/me`, {
    headers: getAuthHeaders(),
  })
  return handleResponse(response)
}

export async function deleteAccount() {
  const response = await fetch(`${API_BASE}/api/account`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    body: JSON.stringify({ confirmation: 'DELETE' }),
  })
  return handleResponse(response)
}

export async function updateProfile(displayName: string) {
  const response = await fetch(`${API_BASE}/api/account`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ displayName }),
  })
  return handleResponse(response)
}

// ============================================================================
// Session APIs
// ============================================================================

export async function startSession() {
  const response = await fetch(`${API_BASE}/api/sessions/start`, {
    method: 'POST',
    headers: getAuthHeaders(),
  })
  return handleResponse(response)
}

export async function getActiveSession() {
  const response = await fetch(`${API_BASE}/api/sessions/active`, {
    headers: getAuthHeaders(),
  })
  return handleResponse(response)
}

export async function getSession(sessionId: string) {
  const response = await fetch(`${API_BASE}/api/sessions/${sessionId}`, {
    headers: getAuthHeaders(),
  })
  return handleResponse(response)
}

export async function saveStep(sessionId: string, stepNumber: number, stepData: any) {
  const response = await fetch(`${API_BASE}/api/sessions/${sessionId}/steps`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ stepNumber, stepData }),
  })
  return handleResponse(response)
}

export async function completeSession(sessionId: string) {
  const response = await fetch(`${API_BASE}/api/sessions/${sessionId}/complete`, {
    method: 'POST',
    headers: getAuthHeaders(),
  })
  return handleResponse(response)
}

export async function scoreSession(sessionId: string) {
  const response = await fetch(`${API_BASE}/api/sessions/${sessionId}/score`, {
    method: 'POST',
    headers: getAuthHeaders(),
  })
  return handleResponse(response)
}

export async function getSessions(status?: string) {
  const url = new URL(`${API_BASE}/api/sessions`, window.location.origin)
  if (status) url.searchParams.set('status', status)

  const response = await fetch(url.toString(), {
    headers: getAuthHeaders(),
  })
  return handleResponse(response)
}

export async function deleteSession(sessionId: string) {
  const response = await fetch(`${API_BASE}/api/sessions/${sessionId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  return handleResponse(response)
}

// ============================================================================
// Progression APIs
// ============================================================================

export async function getProgressionStats() {
  const response = await fetch(`${API_BASE}/api/progression/stats`, {
    headers: getAuthHeaders(),
  })
  return handleResponse(response)
}

export async function getXpHistory(limit = 20) {
  const response = await fetch(`${API_BASE}/api/progression/xp-history?limit=${limit}`, {
    headers: getAuthHeaders(),
  })
  return handleResponse(response)
}

export async function getLeaderboard(metric: 'xp' | 'streak' = 'xp', limit = 10) {
  const response = await fetch(`${API_BASE}/api/leaderboard?metric=${metric}&limit=${limit}`, {
    headers: getAuthHeaders(),
  })
  return handleResponse(response)
}
