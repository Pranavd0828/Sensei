'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import * as api from '@/lib/api'

// Step components
import Step1Goal from '@/components/session/Step1Goal'
import Step2Mission from '@/components/session/Step2Mission'
import Step3Segments from '@/components/session/Step3Segments'
import Step4Problems from '@/components/session/Step4Problems'
import Step5Solutions from '@/components/session/Step5Solutions'
import Step6Metrics from '@/components/session/Step6Metrics'
import Step7Tradeoffs from '@/components/session/Step7Tradeoffs'
import Step8Summary from '@/components/session/Step8Summary'

interface Session {
  id: string
  status: string
  prompt: {
    id: string
    name: string
    company: string
    surface: string
    objective: string
    difficulty: number
    promptText: string
    constraint: string
  }
  steps: Array<{
    id: string
    stepName: string
    userInput: string
  }>
}

const STEP_INFO = [
  { number: 1, name: 'Goal', description: 'Define the objective' },
  { number: 2, name: 'Mission', description: 'Align to company mission' },
  { number: 3, name: 'Segments', description: 'Identify user segments' },
  { number: 4, name: 'Problems', description: 'Prioritize key problems' },
  { number: 5, name: 'Solutions', description: 'Design V0, V1, V2' },
  { number: 6, name: 'Metrics', description: 'Define success metrics' },
  { number: 7, name: 'Tradeoffs', description: 'Consider risks' },
  { number: 8, name: 'Summary', description: 'Review and reflect' },
]

export default function SessionPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string

  const [session, setSession] = useState<Session | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [stepData, setStepData] = useState<Record<number, any>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [direction, setDirection] = useState(1) // 1 for forward, -1 for backward

  useEffect(() => {
    loadSession()
  }, [sessionId])

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem(`session_${sessionId}`)
    if (saved) {
      const parsed = JSON.parse(saved)
      setStepData(parsed.stepData || {})
      setCurrentStep(parsed.currentStep || 1)
    }
  }, [sessionId])

  useEffect(() => {
    // Save to localStorage whenever stepData changes
    if (Object.keys(stepData).length > 0) {
      localStorage.setItem(
        `session_${sessionId}`,
        JSON.stringify({ stepData, currentStep })
      )
    }
  }, [stepData, currentStep, sessionId])

  const loadSession = async () => {
    try {
      const data: any = await api.getSession(sessionId)
      setSession(data.session)

      // Load existing step data from backend
      if (data.session.steps && data.session.steps.length > 0) {
        const existingData: Record<number, any> = {}
        data.session.steps.forEach((step: any) => {
          const stepNumber = STEP_INFO.findIndex(s => s.name.toLowerCase() === step.stepName) + 1
          if (stepNumber > 0) {
            existingData[stepNumber] = JSON.parse(step.userInput)
          }
        })
        setStepData(existingData)
      }
    } catch (error) {
      console.error('Error loading session:', error)
      alert('Failed to load session')
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const handleStepComplete = async (data: any) => {
    // Save locally first
    setStepData(prev => ({ ...prev, [currentStep]: data }))

    // Save to backend
    setSaving(true)
    try {
      await api.saveStep(sessionId, currentStep, data)

      // Move to next step
      if (currentStep < 8) {
        setDirection(1)
        setCurrentStep(currentStep + 1)
      } else {
        // Complete session
        await api.completeSession(sessionId)
        // Navigate to scoring
        router.push(`/session/${sessionId}/scoring`)
      }
    } catch (error) {
      console.error('Error saving step:', error)
      alert('Failed to save step. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setDirection(-1)
      setCurrentStep(currentStep - 1)
    }
  }

  const renderStep = () => {
    const props = {
      sessionId,
      prompt: session!.prompt,
      data: stepData[currentStep],
      onComplete: handleStepComplete,
      onBack: handleBack,
      saving,
    }

    switch (currentStep) {
      case 1:
        return <Step1Goal {...props} />
      case 2:
        return <Step2Mission {...props} />
      case 3:
        return <Step3Segments {...props} />
      case 4:
        return <Step4Problems {...props} />
      case 5:
        return <Step5Solutions {...props} />
      case 6:
        return <Step6Metrics {...props} />
      case 7:
        return <Step7Tradeoffs {...props} />
      case 8:
        return <Step8Summary {...props} steps={stepData} />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF6B00]"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">Session not found</p>
          <button onClick={() => router.push('/')} className="btn-primary">
            Go home
          </button>
        </div>
      </div>
    )
  }

  const progress = (currentStep / 8) * 100

  return (
    <div className="min-h-screen bg-background">
      {/* Header with progress */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          {/* Company badge */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/')}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div>
                <div className="text-sm text-muted-foreground">
                  {session.prompt.company} • {session.prompt.surface}
                </div>
                <div className="font-semibold">{session.prompt.name}</div>
              </div>
            </div>
            <div className="text-sm font-medium text-muted-foreground">
              Step {currentStep} of 8
            </div>
          </div>

          {/* Progress bar */}
          <div className="progress-bar">
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 100 : -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -100 : 100 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
