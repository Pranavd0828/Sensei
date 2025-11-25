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

export default function Step2Mission({ prompt, data, onComplete, onBack, saving }: Props) {
  const [bestChoice, setBestChoice] = useState(data?.picks?.best || '')
  const [offChoice, setOffChoice] = useState(data?.picks?.off || '')
  const [note, setNote] = useState(data?.missionAlignment || '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [hint, setHint] = useState<{ title: string; points: string[] } | null>(null)

  const BEST_OPTIONS = [
    'This goal directly drives the mission to inspire creativity and joy.',
    'This goal is about cost cutting unrelated to the mission.',
    'This goal is about monetization first.',
  ]

  const OFF_OPTIONS = [
    'Chasing ads revenue at the expense of creator tools.',
    'Investing in creation tools that widen access and joy.',
    'Making onboarding delightful so new creators publish.',
  ]

  const validate = () => {
    const newErrors: Record<string, string> = {}
    const reasons: string[] = []

    if (!bestChoice) newErrors.best = 'Pick the best mission fit'
    if (!offChoice) newErrors.off = 'Pick the least aligned option'

    if (bestChoice && bestChoice !== BEST_OPTIONS[0]) {
      reasons.push('Best fit should ladder to inspiring creativity/joy (not cost or monetization first).')
    }
    if (offChoice && offChoice !== OFF_OPTIONS[0]) {
      reasons.push('Off-mission choice is the ads-first option that ignores creation/joy.')
    }

    setErrors(newErrors)
    return { ok: Object.keys(newErrors).length === 0 && reasons.length === 0, reasons }
  }

  const handleSubmit = () => {
    const { ok, reasons } = validate()
    if (!ok) {
      setHint({
        title: 'Why these picks matter',
        points: reasons.length
          ? reasons
          : ['Pick the option that ladders to inspiring creativity/joy; mark the ads-first path as off-mission.'],
      })
      return
    }
    setHint(null)
    onComplete({
      picks: { best: bestChoice, off: offChoice },
      missionAlignment: note.trim(),
    })
  }

  const companyMission = `${prompt.company}'s mission is to inspire creativity and bring joy to people around the world.`

  return (
    <div className="space-y-6">
      {/* Step header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-3xl font-bold mb-2">Align to Mission</h2>
        <p className="text-muted-foreground">
          How does your goal connect to the company's mission?
        </p>
      </motion.div>

      {/* Company mission */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="card-premium p-6"
      >
        <div className="flex items-start gap-3">
          <div className="text-2xl">🎯</div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">
              {prompt.company} Mission
            </div>
            <p className="text-foreground font-medium">{companyMission}</p>
          </div>
        </div>
      </motion.div>

      {/* Input form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="card-premium p-8 space-y-6"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Which option best aligns to the mission?</p>
            <div className="space-y-2">
              {BEST_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setBestChoice(opt)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition ${
                    bestChoice === opt
                      ? 'border-[#FF6B00] bg-[#FF6B00]/10'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            {errors.best && <p className="text-destructive text-sm mt-2">{errors.best}</p>}
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Which option is least aligned to the mission?</p>
            <div className="space-y-2">
              {OFF_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setOffChoice(opt)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition ${
                    offChoice === opt
                      ? 'border-red-500/60 bg-red-500/10'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            {errors.off && <p className="text-destructive text-sm mt-2">{errors.off}</p>}
          </div>

          <div className="p-4 bg-[#B5E550]/5 border border-[#B5E550]/20 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Want to add a quick note?</p>
              <span className="text-xs text-muted-foreground">Optional</span>
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional: one or two sentences on how your goal ladders to mission."
              className="input-premium w-full min-h-[100px] resize-none"
              rows={4}
            />
          </div>
        </div>

        <div className="p-4 bg-[#B5E550]/5 border border-[#B5E550]/20 rounded-xl">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-[#B5E550]">Tip:</span> Mission fit is about intent (creativity/joy) more than revenue/cost; highlight how your goal advances that.
          </p>
        </div>
      </motion.div>

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="flex justify-between gap-3"
      >
        <button onClick={onBack} className="btn-secondary px-8">
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="btn-primary px-8 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Next'}
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
              <button onClick={() => setHint(null)} className="btn-primary px-5">Got it</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
