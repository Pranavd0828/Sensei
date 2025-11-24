import * as api from '../api'

// Mock fetch
global.fetch = jest.fn()

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  describe('Auth APIs', () => {
    it('sendMagicLink should POST to /api/auth/send-link', async () => {
      const mockResponse = { data: { success: true } }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      await api.sendMagicLink('test@example.com')

      expect(global.fetch).toHaveBeenCalledWith('/api/auth/send-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com' }),
      })
    })

    it('verifyMagicLink should POST to /api/auth/verify', async () => {
      const mockResponse = { data: { token: 'test-token', user: { id: '1' } } }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await api.verifyMagicLink('magic-token')

      expect(global.fetch).toHaveBeenCalledWith('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: 'magic-token' }),
      })
      expect(result).toEqual({ token: 'test-token', user: { id: '1' } })
    })

    it('logout should POST to /api/auth/logout with auth header', async () => {
      localStorage.setItem('session_token', 'test-token')
      const mockResponse = { data: { success: true } }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      await api.logout()

      expect(global.fetch).toHaveBeenCalledWith('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
      })
    })
  })

  describe('Session APIs', () => {
    beforeEach(() => {
      localStorage.setItem('session_token', 'test-token')
    })

    it('startSession should POST to /api/sessions/start', async () => {
      const mockResponse = { data: { session: { id: 'session-1' } } }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await api.startSession()

      expect(global.fetch).toHaveBeenCalledWith('/api/sessions/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
      })
      expect(result).toEqual({ session: { id: 'session-1' } })
    })

    it('getSession should GET session by ID', async () => {
      const mockResponse = { data: { session: { id: 'session-1', overallScore: 85 } } }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await api.getSession('session-1')

      expect(global.fetch).toHaveBeenCalledWith('/api/sessions/session-1', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
      })
      expect(result).toEqual({ session: { id: 'session-1', overallScore: 85 } })
    })

    it('saveStep should POST step data', async () => {
      const stepData = { goalSentence: 'Test goal' }
      const mockResponse = { data: { success: true } }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      await api.saveStep('session-1', 1, stepData)

      expect(global.fetch).toHaveBeenCalledWith('/api/sessions/session-1/steps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify({ stepNumber: 1, stepData }),
      })
    })

    it('scoreSession should POST to score endpoint', async () => {
      const mockResponse = { data: { success: true } }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      await api.scoreSession('session-1')

      expect(global.fetch).toHaveBeenCalledWith('/api/sessions/session-1/score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
      })
    })

    it('getSessions should GET sessions list with optional status filter', async () => {
      const mockResponse = { data: { sessions: [] } }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      await api.getSessions('SCORED')

      const call = (global.fetch as jest.Mock).mock.calls[0]
      expect(call[0]).toContain('/api/sessions')
      expect(call[0]).toContain('status=SCORED')
    })
  })

  describe('Progression APIs', () => {
    beforeEach(() => {
      localStorage.setItem('session_token', 'test-token')
    })

    it('getProgressionStats should GET stats', async () => {
      const mockResponse = { data: { level: 5, totalXp: 1200, currentStreak: 3 } }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await api.getProgressionStats()

      expect(global.fetch).toHaveBeenCalledWith('/api/progression/stats', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
      })
      expect(result).toEqual({ level: 5, totalXp: 1200, currentStreak: 3 })
    })

    it('getXpHistory should GET XP history with limit', async () => {
      const mockResponse = { data: { history: [] } }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      await api.getXpHistory(10)

      expect(global.fetch).toHaveBeenCalledWith('/api/progression/xp-history?limit=10', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
      })
    })
  })

  describe('Error Handling', () => {
    it('should throw error when response is not ok', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: { message: 'Unauthorized' } }),
      })

      await expect(api.startSession()).rejects.toThrow('Unauthorized')
    })

    it('should handle response without error message', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      })

      await expect(api.startSession()).rejects.toThrow('Request failed')
    })

    it('should handle JSON parse errors', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => {
          throw new Error('Invalid JSON')
        },
      })

      await expect(api.startSession()).rejects.toThrow('Request failed')
    })
  })

  describe('User APIs', () => {
    it('getMe should return user from localStorage', async () => {
      const mockUser = { id: '1', email: 'test@example.com' }
      localStorage.setItem('user', JSON.stringify(mockUser))

      const result = await api.getMe()

      expect(result).toEqual(mockUser)
    })

    it('getMe should return null when no user in localStorage', async () => {
      const result = await api.getMe()

      expect(result).toBeNull()
    })

    it('deleteAccount should DELETE account with confirmation', async () => {
      localStorage.setItem('session_token', 'test-token')
      const mockResponse = { data: { success: true } }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      await api.deleteAccount()

      expect(global.fetch).toHaveBeenCalledWith('/api/account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify({ confirmation: 'DELETE' }),
      })
    })
  })
})
