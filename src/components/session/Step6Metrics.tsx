'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { InfoTooltip } from '@/components/ui/InfoTooltip' // Added import
import { Label } from '@/components/ui/label' // Added import

interface Props {
  sessionId: string
  prompt: any
  data?: any
  onComplete: (data: any) => void
  onBack: () => void
  saving: boolean
}

interface Guardrail {
  name: string
  threshold: string
}

export default function Step6Metrics({ data, onComplete, onBack, saving }: Props) {
  const [primaryMetric, setPrimaryMetric] = useState(data?.primaryMetric || { name: '', description: '', target: '' })
  const [guardrails, setGuardrails] = useState<Guardrail[]>(data?.guardrails || [{ name: '', threshold: '' }])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (primaryMetric.name.trim().length < 3) newErrors.primaryName = 'Metric name required'
    if (primaryMetric.description.trim().length < 20) newErrors.primaryDesc = 'Description too short'
    if (primaryMetric.target.trim().length < 5) newErrors.primaryTarget = 'Target required'
    guardrails.forEach((g, i) => {
      if (g.name.trim() && g.threshold.trim().length < 5) newErrors[`guard_${i}`] = 'Threshold required'
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validate()) {
      onComplete({
        primaryMetric: { ...primaryMetric, name: primaryMetric.name.trim(), description: primaryMetric.description.trim(), target: primaryMetric.target.trim() },
        guardrails: guardrails.filter(g => g.name.trim()).map(g => ({ name: g.name.trim(), threshold: g.threshold.trim() }))
      })
    }
  }

  const updateGuardrail = (idx: number, field: string, value: string) => {
    const updated = [...guardrails]
    updated[idx] = { ...updated[idx], [field]: value }
    setGuardrails(updated)
  }

  const addGuardrail = () => {
    if (guardrails.length < 3) setGuardrails([...guardrails, { name: '', threshold: '' }])
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Replaced h2 with Label and InfoTooltip as per instruction */}
        <div className="flex items-center gap-2 mb-2">
          <Label htmlFor="northStar" className="text-3xl font-bold">
            North Star Metric
          </Label>
          <InfoTooltip content="The single metric that best captures the core value your product delivers to its customers." />
        </div>
        <p className="text-muted-foreground">How will you measure success?</p>
      </motion.div>

      <div className="card-premium p-6 space-y-4">
        <h3 className="font-semibold">Primary Metric</h3>
        <input type="text" value={primaryMetric.name} onChange={(e) => setPrimaryMetric({ ...primaryMetric, name: e.target.value })} placeholder="Metric name (e.g., 7-Day Retention Rate)" className="input-premium w-full" />
        {errors.primaryName && <p className="text-destructive text-sm">{errors.primaryName}</p>}
        <textarea value={primaryMetric.description} onChange={(e) => setPrimaryMetric({ ...primaryMetric, description: e.target.value })} placeholder="Describe how you'll measure it..." className="input-premium w-full min-h-[80px]" rows={3} />
        {errors.primaryDesc && <p className="text-destructive text-sm">{errors.primaryDesc}</p>}
        <input type="text" value={primaryMetric.target} onChange={(e) => setPrimaryMetric({ ...primaryMetric, target: e.target.value })} placeholder="Target (e.g., Increase from 40% to 50% in 3 months)" className="input-premium w-full" />
        {errors.primaryTarget && <p className="text-destructive text-sm">{errors.primaryTarget}</p>}
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold">Guardrail Metrics</h3>
        {guardrails.map((g, idx) => (
          <div key={idx} className="card-premium p-6 space-y-4">
            <input type="text" value={g.name} onChange={(e) => updateGuardrail(idx, 'name', e.target.value)} placeholder="Guardrail metric name" className="input-premium w-full" />
            <input type="text" value={g.threshold} onChange={(e) => updateGuardrail(idx, 'threshold', e.target.value)} placeholder="Threshold (e.g., NPS must stay above 45)" className="input-premium w-full" />
            {errors[`guard_${idx}`] && <p className="text-destructive text-sm">{errors[`guard_${idx}`]}</p>}
          </div>
        ))}
        {guardrails.length < 3 && <button onClick={addGuardrail} className="text-sm text-[#FF9A3D]">+ Add guardrail</button>}
      </div>

      <div className="flex justify-between">
        <button onClick={onBack} className="btn-secondary px-8">Back</button>
        <button onClick={handleSubmit} disabled={saving} className="btn-primary px-8">{saving ? 'Saving...' : 'Next'}</button>
      </div>
    </div>
  )
}
