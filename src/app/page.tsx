'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import AppLayout from '@/components/layout/AppLayout'
import * as api from '@/lib/api'

interface User {
  id: string
  email: string
  displayName: string | null
  level: number
  totalXp: number
}

interface Stats {
  level: number
  totalXp: number
  xpToNextLevel: number
  currentStreak: number
  bestStreak: number
  sessionsCompleted: number
  averageScore: number | null
}

interface Session {
  id: string
  status: string
  prompt: {
    name: string
    company: string
    surface: string
    difficulty: number
  }
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [activeSession, setActiveSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [startingSession, setStartingSession] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('session_token')
    const storedUser = localStorage.getItem('user')

    if (!token || !storedUser) {
      router.push('/login')
      return
    }

    const userData = JSON.parse(storedUser)
    setUser(userData)

    await Promise.all([
      loadStats(),
      loadActiveSession(),
    ])

    setLoading(false)
  }

  const loadStats = async () => {
    try {
      const data = await api.getProgressionStats()
      setStats(data as Stats)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const loadActiveSession = async () => {
    try {
      const data: any = await api.getActiveSession()
      if (data.session) {
        setActiveSession(data.session)
      }
    } catch (error) {
      console.error('Error loading active session:', error)
    }
  }

  const handleStartSession = async () => {
    setStartingSession(true)
    try {
      const result: any = await api.startSession()
      router.push(`/session/${result.session.id}`)
    } catch (error) {
      console.error('Error starting session:', error)
      alert(error instanceof Error ? error.message : 'Failed to start session')
    } finally {
      setStartingSession(false)
    }
  }

  const handleContinueSession = () => {
    if (activeSession) {
      router.push(`/session/${activeSession.id}`)
    }
  }

  const getDisplayName = () => {
    if (user?.displayName) return user.displayName
    if (user?.email) return user.email.split('@')[0]
    return 'there'
  }

  const xpProgress = stats
    ? (stats.totalXp / (stats.totalXp + stats.xpToNextLevel)) * 100
    : 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF6B00]"></div>
      </div>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Hero section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl sm:text-5xl font-bold mb-2">
            Hey {getDisplayName()}! 👋
          </h1>
          <p className="text-lg text-muted-foreground">
            Make structured, product style thinking a daily habit
          </p>
        </motion.div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Challenge - Takes 2 columns on large screens */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="card-premium p-8 h-full">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-3xl">🎯</span>
                <h2 className="text-2xl font-bold">Today's Challenge</h2>
              </div>

              {activeSession ? (
                <div>
                  <div className="mb-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FF6B00]/10 rounded-full text-sm mb-3">
                      <span className="w-2 h-2 bg-[#FF6B00] rounded-full animate-pulse"></span>
                      <span className="text-[#FF9A3D] font-medium">Session in progress</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      {activeSession.prompt.name}
                    </h3>
                    <p className="text-muted-foreground">
                      {activeSession.prompt.company} • {activeSession.prompt.surface}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleContinueSession}
                      className="btn-primary flex-1 glow-orange-soft"
                    >
                      Continue session
                    </button>
                    <button
                      onClick={() => router.push('/progress')}
                      className="btn-secondary"
                    >
                      View progress
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-lg mb-6 text-muted-foreground">
                    Start a new practice session and improve your product thinking skills with AI-powered feedback
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleStartSession}
                      disabled={startingSession}
                      className="btn-primary flex-1 glow-orange disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {startingSession ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg
                            className="animate-spin h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Starting...
                        </span>
                      ) : (
                        'Start session'
                      )}
                    </button>
                    {stats && stats.sessionsCompleted > 0 && (
                      <button
                        onClick={() => router.push('/progress')}
                        className="btn-secondary"
                      >
                        View progress
                      </button>
                    )}
                  </div>

                  {stats && stats.sessionsCompleted === 0 && (
                    <div className="mt-6 p-4 bg-[#B5E550]/5 border border-[#B5E550]/20 rounded-xl">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-semibold text-[#B5E550]">First time?</span> Each session takes 15-20 minutes and helps you practice real-world product thinking.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* Progress snapshot */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Level & XP */}
            <div className="card-premium p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Progress</h3>
                <span className="text-2xl">🏆</span>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-bold text-gradient-orange">
                    Level {stats?.level || 1}
                  </span>
                  <span className="text-muted-foreground">
                    ({stats?.totalXp.toLocaleString() || 0} XP)
                  </span>
                </div>

                <div className="progress-bar mb-1">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${xpProgress}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="progress-fill"
                  />
                </div>

                <p className="text-xs text-muted-foreground">
                  {stats?.xpToNextLevel.toLocaleString() || 0} XP to next level
                </p>
              </div>

              {stats && stats.currentStreak > 0 && (
                <div className="pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Streak</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xl">🔥</span>
                      <span className="text-lg font-bold text-[#B5E550]">
                        {stats.currentStreak} days
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {stats && stats.sessionsCompleted > 0 && (
                <div className="pt-4 border-t border-white/5 mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Average score</span>
                    <span className="font-semibold text-[#FF9A3D]">
                      {stats.averageScore || 'N/A'}/100
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-muted-foreground">Sessions completed</span>
                    <span className="font-semibold">{stats.sessionsCompleted}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick links */}
            <div className="card-premium p-6">
              <h3 className="font-semibold mb-4">Quick links</h3>
              <div className="space-y-2">
                <button
                  onClick={() => router.push('/progress')}
                  className="w-full text-left px-4 py-3 rounded-xl hover:bg-card transition-colors flex items-center justify-between group"
                >
                  <span>View progress</span>
                  <svg
                    className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <button
                  onClick={() => router.push('/settings')}
                  className="w-full text-left px-4 py-3 rounded-xl hover:bg-card transition-colors flex items-center justify-between group"
                >
                  <span>Settings</span>
                  <svg
                    className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  )
}
