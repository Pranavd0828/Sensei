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

export default function Step7Tradeoffs({ data, onComplete, onBack, saving }: Props) {
  const [tradeoffs, setTradeoffs] = useState(data?.tradeoffs || [{ title: '', description: '', impact: 'MEDIUM', mitigation: '' }])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}
    const filled = tradeoffs.filter((t: any) => t.title.trim() && t.description.trim())
    if (filled.length < 2) newErrors.general = 'Add at least 2 tradeoffs'
    filled.forEach((t: any, i: number) => {
      if (t.title.length < 5) newErrors[`title_${i}`] = 'Title too short'
      if (t.description.length < 30) newErrors[`desc_${i}`] = 'Description too short'
      if (t.mitigation.length < 30) newErrors[`mit_${i}`] = 'Mitigation too short'
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validate()) {
      const cleaned = tradeoffs.filter((t: any) => t.title.trim()).map((t: any) => ({
        title: t.title.trim(),
        description: t.description.trim(),
        impact: t.impact,
        mitigation: t.mitigation.trim()
      }))
      onComplete({ tradeoffs: cleaned })
    }
  }

  const updateTradeoff = (idx: number, field: string, value: any) => {
    const updated = [...tradeoffs]
    updated[idx] = { ...updated[idx], [field]: value }
    setTradeoffs(updated)
  }

  const addTradeoff = () => {
    if (tradeoffs.length < 5) setTradeoffs([...tradeoffs, { title: '', description: '', impact: 'MEDIUM', mitigation: '' }])
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-3xl font-bold mb-2">Tradeoffs & Risks</h2>
        <p className="text-muted-foreground">What tradeoffs or risks should you consider?</p>
      </motion.div>

      <div className="space-y-4">
        {tradeoffs.map((t: any, idx: number) => (
          <div key={idx} className="card-premium p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Tradeoff {idx + 1}</h3>
              {tradeoffs.length > 1 && <button onClick={() => setTradeoffs(tradeoffs.filter((_: any, i: number) => i !== idx))} className="text-destructive text-sm">Remove</button>}
            </div>
            <input type="text" value={t.title} onChange={(e) => updateTradeoff(idx, 'title', e.target.value)} placeholder="Tradeoff title" className="input-premium w-full" />
            {errors[`title_${idx}`] && <p className="text-destructive text-sm">{errors[`title_${idx}`]}</p>}
            <textarea value={t.description} onChange={(e) => updateTradeoff(idx, 'description', e.target.value)} placeholder="Describe the tradeoff or risk..." className="input-premium w-full min-h-[80px]" rows={3} />
            {errors[`desc_${idx}`] && <p className="text-destructive text-sm">{errors[`desc_${idx}`]}</p>}
            <div>
              <label className="block text-sm font-medium mb-2">Impact level</label>
              <div className="flex gap-2">
                {['LOW', 'MEDIUM', 'HIGH'].map(level => (
                  <button key={level} onClick={() => updateTradeoff(idx, 'impact', level)} className={`chip ${t.impact === level ? 'chip-primary' : 'bg-card border border-white/10'}`}>{level}</button>
                ))}
              </div>
            </div>
            <textarea value={t.mitigation} onChange={(e) => updateTradeoff(idx, 'mitigation', e.target.value)} placeholder="How would you mitigate this?" className="input-premium w-full min-h-[80px]" rows={3} />
            {errors[`mit_${idx}`] && <p className="text-destructive text-sm">{errors[`mit_${idx}`]}</p>}
          </div>
        ))}
        {tradeoffs.length < 5 && <button onClick={addTradeoff} className="w-full py-4 border-2 border-dashed border-white/10 rounded-xl hover:border-[#FF6B00]/50 hover:bg-[#FF6B00]/5 transition-colors">+ Add tradeoff</button>}
        {errors.general && <p className="text-destructive text-sm">{errors.general}</p>}
      </div>

      <div className="flex justify-between">
        <button onClick={onBack} className="btn-secondary px-8">Back</button>
        <button onClick={handleSubmit} disabled={saving} className="btn-primary px-8">{saving ? 'Saving...' : 'Next'}</button>
      </div>
    </div>
  )
}
