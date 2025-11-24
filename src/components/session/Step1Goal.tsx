'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface Props {
  sessionId: string
  prompt: any
  data?: any
  onComplete: (data: any) => void
  onBack: () => void
  saving: boolean
}

const OBJECTIVES = [
  { value: 'ACQUISITION', label: 'Acquisition', emoji: '🎯' },
  { value: 'ACTIVATION', label: 'Activation', emoji: '⚡' },
  { value: 'RETENTION', label: 'Retention', emoji: '🔄' },
  { value: 'MONETIZATION', label: 'Monetization', emoji: '💰' },
  { value: 'ENGAGEMENT', label: 'Engagement', emoji: '❤️' },
]

export default function Step1Goal({ prompt, data, onComplete, saving }: Props) {
  const [objective, setObjective] = useState(data?.objective || '')
  const [goalSentence, setGoalSentence] = useState(data?.goalSentence || '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!objective) {
      newErrors.objective = 'Please select an objective'
    }

    if (!goalSentence.trim()) {
      newErrors.goalSentence = 'Please write a goal statement'
    } else if (goalSentence.trim().length < 20) {
      newErrors.goalSentence = 'Goal should be at least 20 characters'
    } else if (goalSentence.length > 500) {
      newErrors.goalSentence = 'Goal should not exceed 500 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validate()) {
      onComplete({ objective, goalSentence: goalSentence.trim() })
    }
  }

  return (
    <div className="space-y-6">
      {/* Step header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-3xl font-bold mb-2">Clarify the Goal</h2>
        <p className="text-muted-foreground">
          What's the primary objective you're trying to achieve?
        </p>
      </motion.div>

      {/* Prompt context */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="card-premium p-6 bg-[#FF6B00]/5 border-[#FF6B00]/20"
      >
        <div className="text-sm text-muted-foreground mb-2">Prompt</div>
        <p className="text-foreground leading-relaxed">{prompt.promptText}</p>
      </motion.div>

      {/* Input form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="card-premium p-8 space-y-6"
      >
        {/* Objective selector */}
        <div>
          <label className="block text-sm font-medium mb-3">
            Select objective category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {OBJECTIVES.map((obj) => (
              <button
                key={obj.value}
                onClick={() => setObjective(obj.value)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  objective === obj.value
                    ? 'border-[#FF6B00] bg-[#FF6B00]/10'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="text-2xl mb-1">{obj.emoji}</div>
                <div className="text-sm font-semibold">{obj.label}</div>
              </button>
            ))}
          </div>
          {errors.objective && (
            <p className="text-destructive text-sm mt-2">{errors.objective}</p>
          )}
        </div>

        {/* Goal statement */}
        <div>
          <label htmlFor="goal" className="block text-sm font-medium mb-2">
            Write your goal statement
          </label>
          <textarea
            id="goal"
            value={goalSentence}
            onChange={(e) => setGoalSentence(e.target.value)}
            placeholder="Example: Increase 7-day retention for new creators by 25% through improved onboarding..."
            className="input-premium w-full min-h-[120px] resize-none"
            rows={4}
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">
              {goalSentence.length}/500 characters
            </span>
            {errors.goalSentence && (
              <p className="text-destructive text-sm">{errors.goalSentence}</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="flex justify-end gap-3"
      >
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="btn-primary px-8 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
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
              Saving...
            </span>
          ) : (
            'Next'
          )}
        </button>
      </motion.div>
    </div>
  )
}
