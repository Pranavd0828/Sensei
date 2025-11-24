'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import * as api from '@/lib/api'

interface StepScore {
  stepName: string
  score: number
  feedback: string
  strengths: string[]
  improvements: string[]
}

interface SessionResult {
  session: {
    id: string
    overallScore: number
    scoringJson: string
    prompt: {
      name: string
      company: string
    }
  }
}

export default function ResultsPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string

  const [result, setResult] = useState<SessionResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [animatedScore, setAnimatedScore] = useState(0)

  useEffect(() => {
    loadResults()
  }, [])

  const loadResults = async () => {
    try {
      const data: any = await api.getSession(sessionId)
      setResult(data)

      // Animate score counting up
      const finalScore = data.session.overallScore
      let current = 0
      const increment = finalScore / 50
      const timer = setInterval(() => {
        current += increment
        if (current >= finalScore) {
          setAnimatedScore(finalScore)
          clearInterval(timer)
        } else {
          setAnimatedScore(Math.floor(current))
        }
      }, 20)

      // Check for level up from localStorage (would be set by progression)
      const levelUp = localStorage.getItem(`levelup_${sessionId}`)
      if (levelUp) {
        setTimeout(() => setShowLevelUp(true), 2000)
      }
    } catch (error) {
      console.error('Error loading results:', error)
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

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">Results not found</p>
          <button onClick={() => router.push('/')} className="btn-primary">Go home</button>
        </div>
      </div>
    )
  }

  const { session } = result
  const scoringData = session.scoringJson ? JSON.parse(session.scoringJson) : null
  const stepScores: StepScore[] = scoringData?.stepScores || []
  const xpEarned = 150 // Mock - would come from API

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-[#B5E550]'
    if (score >= 60) return 'text-[#FF9A3D]'
    return 'text-[#FF6B00]'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Exceptional'
    if (score >= 80) return 'Strong'
    if (score >= 70) return 'Good'
    if (score >= 60) return 'Adequate'
    return 'Needs Work'
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.push('/')}
            className="text-muted-foreground hover:text-foreground mb-4 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to home
          </button>
          <h1 className="text-3xl font-bold">Session Complete! 🎉</h1>
          <p className="text-muted-foreground mt-2">{session.prompt.company} • {session.prompt.name}</p>
        </motion.div>

        {/* Big score reveal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="card-premium p-12 text-center mb-8"
        >
          <div className="mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.4, duration: 0.8 }}
              className="inline-block"
            >
              <svg className="w-32 h-32 mx-auto" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="#2C2C2C"
                  strokeWidth="8"
                />
                <motion.circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="url(#scoreGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 54}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 54 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 54 * (1 - session.overallScore / 100) }}
                  transition={{ duration: 1.5, delay: 0.6, ease: 'easeOut' }}
                  transform="rotate(-90 60 60)"
                />
                <text
                  x="60"
                  y="60"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={`text-4xl font-bold ${getScoreColor(session.overallScore)}`}
                  fill="currentColor"
                >
                  {animatedScore}
                </text>
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FF6B00" />
                    <stop offset="100%" stopColor="#FF9A3D" />
                  </linearGradient>
                </defs>
              </svg>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <h2 className="text-3xl font-bold mb-2">{getScoreLabel(session.overallScore)}</h2>
            <p className="text-muted-foreground">Overall Score: {session.overallScore}/100</p>
          </motion.div>

          {/* XP Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', delay: 1.2, duration: 0.6 }}
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-[#B5E550]/10 border border-[#B5E550]/20 rounded-full"
          >
            <span className="text-2xl">⚡</span>
            <span className="text-xl font-bold text-[#B5E550]">+{xpEarned} XP</span>
          </motion.div>
        </motion.div>

        {/* Step scores breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mb-8"
        >
          <h3 className="text-2xl font-bold mb-4">Step-by-Step Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stepScores.map((step, index) => (
              <motion.div
                key={step.stepName}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 + index * 0.1 }}
                className="card-premium p-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold capitalize">{step.stepName}</h4>
                  <div className={`text-2xl font-bold ${getScoreColor(step.score)}`}>
                    {step.score}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{step.feedback}</p>
                {step.strengths.length > 0 && (
                  <div className="mb-2">
                    <div className="text-xs font-medium text-[#B5E550] mb-1">Strengths:</div>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {step.strengths.map((s, i) => (
                        <li key={i}>• {s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {step.improvements.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-[#FF9A3D] mb-1">Improvements:</div>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {step.improvements.map((s, i) => (
                        <li key={i}>• {s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button
            onClick={() => router.push('/')}
            className="btn-primary flex-1"
          >
            Start another session
          </button>
          <button
            onClick={() => router.push('/progress')}
            className="btn-secondary flex-1"
          >
            View progress
          </button>
        </motion.div>

        {/* Level up modal */}
        <AnimatePresence>
          {showLevelUp && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowLevelUp(false)}
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="card-premium p-12 text-center max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="text-8xl mb-6"
                >
                  🏆
                </motion.div>
                <h2 className="text-4xl font-bold mb-4 text-gradient-orange">Level Up!</h2>
                <p className="text-xl text-muted-foreground mb-6">
                  You've reached Level 2
                </p>
                <button
                  onClick={() => setShowLevelUp(false)}
                  className="btn-primary px-8"
                >
                  Awesome!
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
