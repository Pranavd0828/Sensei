'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  displayName: string | null
  level: number
  totalXp: number
}

interface ProgressionStats {
  level: number
  totalXp: number
  xpToNextLevel: number
  currentStreak: number
  bestStreak: number
  sessionsCompleted: number
  averageScore: number | null
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<ProgressionStats | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('session_token')
    const storedUser = localStorage.getItem('user')

    if (!token || !storedUser) {
      router.push('/')
      return
    }

    setUser(JSON.parse(storedUser))
    fetchStats(token)
  }, [router])

  const fetchStats = async (token: string) => {
    try {
      const response = await fetch('/api/progression/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error('Failed to fetch stats')

      const data = await response.json()
      setStats(data.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartSession = async () => {
    const token = localStorage.getItem('session_token')
    if (!token) return

    try {
      const response = await fetch('/api/sessions/start', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error('Failed to start session')

      const data = await response.json()
      router.push(`/session/${data.data.session.id}`)
    } catch (error) {
      console.error('Error starting session:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('session_token')
    localStorage.removeItem('user')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  const xpProgress = stats ? ((stats.totalXp - (stats.totalXp - stats.xpToNextLevel)) / (stats.level * stats.level * 100)) * 100 : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-xl bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold text-gradient">Sensei</div>
              <div className="hidden sm:block text-muted-foreground">
                Welcome back, {user?.displayName || user?.email?.split('@')[0]}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-8 animate-slide-down">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Ready to Level Up? 🚀
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Practice product sense and get AI-powered feedback
          </p>
          <button
            onClick={handleStartSession}
            className="btn-primary text-lg px-8 py-4 animate-pulse-glow"
          >
            Start New Practice Session
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Level Card */}
          <div className="card-glass p-6 rounded-2xl animate-scale-in hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Level
              </h3>
              <div className="text-3xl">🏆</div>
            </div>
            <div className="text-4xl font-bold text-gradient mb-1">
              {stats?.level || 1}
            </div>
            <div className="flex items-center gap-2 mt-3">
              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-500"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              {stats?.xpToNextLevel || 0} XP to next level
            </div>
          </div>

          {/* XP Card */}
          <div className="card-glass p-6 rounded-2xl animate-scale-in hover:scale-105 transition-transform delay-75">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Total XP
              </h3>
              <div className="text-3xl">⚡</div>
            </div>
            <div className="text-4xl font-bold text-gradient mb-1">
              {stats?.totalXp?.toLocaleString() || 0}
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Experience points earned
            </div>
          </div>

          {/* Streak Card */}
          <div className="card-glass p-6 rounded-2xl animate-scale-in hover:scale-105 transition-transform delay-150">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Current Streak
              </h3>
              <div className="text-3xl">🔥</div>
            </div>
            <div className="text-4xl font-bold text-gradient mb-1">
              {stats?.currentStreak || 0}
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Best: {stats?.bestStreak || 0} days
            </div>
          </div>

          {/* Sessions Card */}
          <div className="card-glass p-6 rounded-2xl animate-scale-in hover:scale-105 transition-transform delay-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Sessions
              </h3>
              <div className="text-3xl">📊</div>
            </div>
            <div className="text-4xl font-bold text-gradient mb-1">
              {stats?.sessionsCompleted || 0}
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Avg score: {stats?.averageScore || 'N/A'}
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="card-glass p-6 rounded-2xl animate-slide-up">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span>Recent Activity</span>
              <span className="text-2xl">📈</span>
            </h2>
            <div className="space-y-4">
              {stats?.sessionsCompleted === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-lg mb-2">No sessions yet</p>
                  <p className="text-sm">Start your first practice session to see your progress here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-xl">✓</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Practice Session Completed</div>
                      <div className="text-sm text-muted-foreground">
                        Score: {stats?.averageScore || 0}/100
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tips & Motivation */}
          <div className="card-glass p-6 rounded-2xl animate-slide-up delay-75">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span>Keep Growing</span>
              <span className="text-2xl">💡</span>
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <h3 className="font-semibold mb-2">Practice Daily</h3>
                <p className="text-sm text-muted-foreground">
                  Consistent practice builds strong product sense. Try to complete at least one session per day to maintain your streak!
                </p>
              </div>
              <div className="p-4 bg-secondary/30 rounded-lg">
                <h3 className="font-semibold mb-2">Focus on Depth</h3>
                <p className="text-sm text-muted-foreground">
                  Take your time to think deeply about each step. Quality analysis leads to better scores and real skill improvement.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        {stats && stats.sessionsCompleted === 0 && (
          <div className="mt-8 card-glass p-8 rounded-2xl text-center animate-scale-in">
            <div className="text-5xl mb-4">🎯</div>
            <h2 className="text-3xl font-bold mb-4">Start Your Journey</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              You're just one session away from leveling up your product sense. Each practice session is carefully designed to challenge and improve your PM skills.
            </p>
            <button
              onClick={handleStartSession}
              className="btn-primary text-lg px-8 py-4"
            >
              Begin First Session
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
