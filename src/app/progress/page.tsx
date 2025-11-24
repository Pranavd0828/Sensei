'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import * as api from '@/lib/api'

interface Session {
  id: string
  createdAt: string
  overallScore: number
  prompt: {
    name: string
    company: string
  }
}

interface StepAverage {
  stepName: string
  avgScore: number
}

export default function ProgressPage() {
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [stepAverages, setStepAverages] = useState<StepAverage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProgress()
  }, [])

  const loadProgress = async () => {
    try {
      const [statsData, sessionsData] = await Promise.all([
        api.getProgressionStats(),
        api.getSessions('SCORED')
      ])

      setStats(statsData)
      setSessions(sessionsData.sessions || [])

      // Calculate step averages
      const stepScores: Record<string, number[]> = {}
      sessionsData.sessions?.forEach((session: any) => {
        if (session.scoringJson) {
          const scoring = JSON.parse(session.scoringJson)
          scoring.stepScores?.forEach((step: any) => {
            if (!stepScores[step.stepName]) stepScores[step.stepName] = []
            stepScores[step.stepName].push(step.score)
          })
        }
      })

      const averages: StepAverage[] = Object.entries(stepScores).map(([name, scores]) => ({
        stepName: name,
        avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      }))

      setStepAverages(averages)
    } catch (error) {
      console.error('Error loading progress:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF6B00]"></div>
      </div>
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-[#B5E550]'
    if (score >= 60) return 'text-[#FF9A3D]'
    return 'text-[#FF6B00]'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const averageScore = sessions.length > 0
    ? Math.round(sessions.reduce((sum, s) => sum + s.overallScore, 0) / sessions.length)
    : 0

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Your Progress</h1>
          <p className="text-muted-foreground">Track your growth and performance</p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <div className="card-premium p-6">
            <div className="text-4xl mb-2">🏆</div>
            <div className="text-3xl font-bold text-[#FF6B00]">
              Level {stats?.level || 1}
            </div>
            <div className="text-sm text-muted-foreground">Current Level</div>
          </div>

          <div className="card-premium p-6">
            <div className="text-4xl mb-2">⚡</div>
            <div className="text-3xl font-bold text-[#B5E550]">
              {stats?.xp || 0}
            </div>
            <div className="text-sm text-muted-foreground">Total XP</div>
          </div>

          <div className="card-premium p-6">
            <div className="text-4xl mb-2">🔥</div>
            <div className="text-3xl font-bold text-[#FF9A3D]">
              {stats?.currentStreak || 0}
            </div>
            <div className="text-sm text-muted-foreground">Day Streak</div>
          </div>

          <div className="card-premium p-6">
            <div className="text-4xl mb-2">📊</div>
            <div className={`text-3xl font-bold ${getScoreColor(averageScore)}`}>
              {averageScore}
            </div>
            <div className="text-sm text-muted-foreground">Avg Score</div>
          </div>
        </motion.div>

        {/* Score Trend Chart */}
        {sessions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-premium p-6 mb-8"
          >
            <h2 className="text-xl font-bold mb-6">Score Trend</h2>
            <div className="relative h-48">
              {/* Simple bar chart */}
              <div className="flex items-end justify-between h-full gap-2">
                {sessions.slice(-10).map((session, index) => {
                  const height = `${session.overallScore}%`
                  return (
                    <motion.div
                      key={session.id}
                      initial={{ height: 0 }}
                      animate={{ height }}
                      transition={{ duration: 0.5, delay: 0.3 + index * 0.05 }}
                      className="flex-1 bg-gradient-to-t from-[#FF6B00] to-[#FF9A3D] rounded-t-lg min-w-0 relative group cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => router.push(`/session/${session.id}/results`)}
                    >
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <div className="bg-card border border-white/10 rounded-lg px-3 py-2 text-xs whitespace-nowrap shadow-xl">
                          <div className="font-semibold">{session.overallScore}</div>
                          <div className="text-muted-foreground">{formatDate(session.createdAt)}</div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              {/* Y-axis labels */}
              <div className="absolute -left-8 top-0 bottom-0 flex flex-col justify-between text-xs text-muted-foreground">
                <span>100</span>
                <span>75</span>
                <span>50</span>
                <span>25</span>
                <span>0</span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground text-center mt-4">
              Last {Math.min(sessions.length, 10)} sessions
            </div>
          </motion.div>
        )}

        {/* Step Averages */}
        {stepAverages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card-premium p-6 mb-8"
          >
            <h2 className="text-xl font-bold mb-6">Average by Step</h2>
            <div className="space-y-4">
              {stepAverages.map((step, index) => (
                <motion.div
                  key={step.stepName}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium capitalize">{step.stepName}</span>
                    <span className={`font-bold ${getScoreColor(step.avgScore)}`}>
                      {step.avgScore}
                    </span>
                  </div>
                  <div className="h-2 bg-card rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${step.avgScore}%` }}
                      transition={{ duration: 0.8, delay: 0.5 + index * 0.05 }}
                      className="h-full bg-gradient-to-r from-[#FF6B00] to-[#FF9A3D] rounded-full"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recent Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xl font-bold mb-4">Recent Sessions</h2>
          {sessions.length === 0 ? (
            <div className="card-premium p-12 text-center">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-muted-foreground mb-4">No completed sessions yet</p>
              <button
                onClick={() => router.push('/')}
                className="btn-primary"
              >
                Start your first session
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  onClick={() => router.push(`/session/${session.id}/results`)}
                  className="card-premium p-6 cursor-pointer hover:scale-[1.02] transition-transform"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-semibold">{session.prompt.company}</div>
                      <div className="text-sm text-muted-foreground">
                        {session.prompt.name}
                      </div>
                    </div>
                    <div className={`text-2xl font-bold ${getScoreColor(session.overallScore)}`}>
                      {session.overallScore}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(session.createdAt)}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
