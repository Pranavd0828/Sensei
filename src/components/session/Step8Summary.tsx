'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface Props {
  sessionId: string
  prompt: any
  data?: any
  steps: Record<number, any>
  onComplete: (data: any) => void
  onBack: () => void
  saving: boolean
}

export default function Step8Summary({ steps, data, onComplete, onBack, saving }: Props) {
  const [reflection, setReflection] = useState(data?.reflection || '')
  const [learnings, setLearnings] = useState(data?.learnings || [''])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (reflection.trim().length < 100) newErrors.reflection = 'Reflection too short (min 100 chars)'
    const validLearnings = learnings.filter((l: string) => l.trim().length >= 20)
    if (validLearnings.length < 1) newErrors.learnings = 'Add at least 1 learning (min 20 chars)'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validate()) {
      const summary = generateSummary()
      onComplete({
        summary,
        reflection: reflection.trim(),
        learnings: learnings.filter((l: string) => l.trim().length >= 20).map((l: string) => l.trim())
      })
    }
  }

  const generateSummary = () => {
    const goal = steps[1]?.goalSentence || 'Goal not defined'
    const segments = steps[3]?.segments?.map((s: any) => s.name).join(', ') || 'No segments'
    return `Goal: ${goal}\nSegments: ${segments}\n\nAuto-generated summary based on your responses.`
  }

  const updateLearning = (idx: number, value: string) => {
    const updated = [...learnings]
    updated[idx] = value
    setLearnings(updated)
  }

  const addLearning = () => {
    if (learnings.length < 3) setLearnings([...learnings, ''])
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-3xl font-bold mb-2">Summary & Reflection</h2>
        <p className="text-muted-foreground">Review your work and reflect on what you learned</p>
      </motion.div>

      <div className="card-premium p-6">
        <h3 className="font-semibold mb-3">Your Session Summary</h3>
        <div className="bg-card p-4 rounded-xl text-sm text-muted-foreground whitespace-pre-wrap">
          {generateSummary()}
        </div>
      </div>

      <div className="card-premium p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Reflection</label>
          <textarea value={reflection} onChange={(e) => setReflection(e.target.value)} placeholder="What did you learn from this exercise? What would you do differently next time?" className="input-premium w-full min-h-[120px]" rows={5} />
          <div className="flex justify-between mt-2">
            <span className="text-xs text-muted-foreground">{reflection.length}/2000</span>
            {errors.reflection && <p className="text-destructive text-sm">{errors.reflection}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Key Learnings</label>
          {learnings.map((learning: string, idx: number) => (
            <textarea key={idx} value={learning} onChange={(e) => updateLearning(idx, e.target.value)} placeholder={`Learning ${idx + 1}`} className="input-premium w-full mb-2 min-h-[60px]" rows={2} />
          ))}
          {learnings.length < 3 && <button onClick={addLearning} className="text-sm text-[#FF9A3D]">+ Add learning</button>}
          {errors.learnings && <p className="text-destructive text-sm mt-2">{errors.learnings}</p>}
        </div>
      </div>

      <div className="flex justify-between">
        <button onClick={onBack} className="btn-secondary px-8">Back</button>
        <button onClick={handleSubmit} disabled={saving} className="btn-primary px-8 glow-orange">{saving ? 'Completing...' : 'Complete Session'}</button>
      </div>
    </div>
  )
}
