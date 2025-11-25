'use client'

import { useState } from 'react'
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

const MATCH_ITEMS = [
  {
    id: 'objective',
    prompt: 'Which objective best fits this prompt?',
    options: ['Engagement', 'Retention', 'Monetization'],
    correct: 'Engagement',
  },
  {
    id: 'metric',
    prompt: 'Pick the best leading metric for this prompt',
    options: ['% sessions using trending sounds before peak', 'Monthly revenue', 'Churn rate'],
    correct: '% sessions using trending sounds before peak',
  },
  {
    id: 'time',
    prompt: 'What time sensitivity matters most here?',
    options: ['Needs <48h freshness', 'Can wait weeks', 'Yearly cycle'],
    correct: 'Needs <48h freshness',
  },
]

export default function Step1Goal({ prompt, data, onComplete, saving }: Props) {
  const [objective, setObjective] = useState(data?.objective || '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [matchAnswers, setMatchAnswers] = useState<Record<string, string>>(
    MATCH_ITEMS.reduce((acc, item) => ({ ...acc, [item.id]: '' }), {})
  )
  const [hint, setHint] = useState<{ title: string; points: string[] } | null>(null)

  const runValidation = () => {
    const newErrors: Record<string, string> = {}

    if (!objective) {
      newErrors.objective = 'Please select an objective'
    }

    const unanswered = MATCH_ITEMS.filter((item) => !matchAnswers[item.id])
    const incorrect = MATCH_ITEMS.filter(
      (item) => matchAnswers[item.id] && matchAnswers[item.id] !== item.correct
    )
    if (unanswered.length > 0) {
      newErrors.matches = 'Answer the quick matches before continuing'
    } else if (incorrect.length > 0) {
      newErrors.matches = 'Some answers need a quick fix'
    }

    setErrors(newErrors)
    return {
      ok: Object.keys(newErrors).length === 0,
      issues: newErrors,
      incorrect,
    }
  }

  const handleSubmit = () => {
    const { ok, incorrect } = runValidation()
    if (!ok) {
      if (incorrect && incorrect.length > 0) {
        setHint({
          title: 'Why these are correct',
          points: incorrect.map((i) => {
            if (i.id === 'objective') {
              return 'This prompt is about using trending sounds before they peak — that’s an engagement outcome, not acquisition or monetization.'
            }
            if (i.id === 'metric') {
              return 'A leading metric here is usage of trending sounds before peak; revenue or churn are lagging/secondary for this prompt.'
            }
            if (i.id === 'time') {
              return 'The prompt is time-sensitive (48h freshness). Picking “Needs <48h freshness” aligns with the core constraint.'
            }
            return `For "${i.prompt}", choose: ${i.correct}`
          }),
        })
      }
      return
    }
    setHint(null)
    onComplete({ objective, goalSentence: '' })
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
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="font-semibold">Quick matches</h3>
            <span className="text-xs text-muted-foreground">Check understanding before writing</span>
          </div>
          <div className="space-y-3">
            {MATCH_ITEMS.map((item) => (
              <div key={item.id} className="p-4 rounded-xl bg-card border border-white/5">
                <p className="text-sm font-medium mb-2">{item.prompt}</p>
                <div className="flex flex-wrap gap-2">
                  {item.options.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() =>
                        setMatchAnswers((prev) => ({
                          ...prev,
                          [item.id]: opt,
                        }))
                      }
                      className={`px-3 py-2 rounded-lg border text-sm transition ${
                        matchAnswers[item.id] === opt
                          ? 'border-[#FF6B00] bg-[#FF6B00]/10 text-foreground'
                          : 'border-white/10 hover:border-white/30 text-muted-foreground'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {errors.matches && <p className="text-destructive text-sm mt-2">{errors.matches}</p>}
        </div>

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

      {hint && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center px-4">
          <div className="card-premium w-full max-w-lg p-6 border border-amber-500/30">
            <h3 className="text-xl font-semibold mb-3">{hint.title}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {hint.points.map((p, idx) => (
                <li key={idx} className="flex gap-2">
                  <span className="text-foreground">•</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setHint(null)}
                className="btn-primary px-5"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
