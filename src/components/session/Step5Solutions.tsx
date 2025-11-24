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

export default function Step5Solutions({ data, onComplete, onBack, saving }: Props) {
  const [solutions, setSolutions] = useState(data?.solutions || [
    { version: 'V0', title: '', description: '', features: ['', ''] },
    { version: 'V1', title: '', description: '', features: ['', ''] },
    { version: 'V2', title: '', description: '', features: ['', ''] },
  ])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}
    solutions.forEach((sol, idx) => {
      if (sol.title.trim().length < 5) newErrors[`title_${idx}`] = 'Title too short'
      if (sol.description.trim().length < 50) newErrors[`desc_${idx}`] = 'Description too short (min 50 chars)'
      const validFeatures = sol.features.filter((f: string) => f.trim().length >= 10)
      if (validFeatures.length < 2) newErrors[`features_${idx}`] = 'Need at least 2 features (min 10 chars each)'
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validate()) {
      const cleaned = solutions.map((s: any) => ({
        ...s,
        title: s.title.trim(),
        description: s.description.trim(),
        features: s.features.filter((f: string) => f.trim().length >= 10).map((f: string) => f.trim()),
      }))
      onComplete({ solutions: cleaned })
    }
  }

  const updateSolution = (idx: number, field: string, value: any) => {
    const updated = [...solutions]
    updated[idx] = { ...updated[idx], [field]: value }
    setSolutions(updated)
  }

  const updateFeature = (solIdx: number, featIdx: number, value: string) => {
    const updated = [...solutions]
    updated[solIdx].features[featIdx] = value
    setSolutions(updated)
  }

  const addFeature = (solIdx: number) => {
    const updated = [...solutions]
    if (updated[solIdx].features.length < 5) {
      updated[solIdx].features.push('')
      setSolutions(updated)
    }
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-3xl font-bold mb-2">Ideate Solutions</h2>
        <p className="text-muted-foreground">Design three progressive versions: V0 (MVP), V1 (Enhanced), V2 (Complete)</p>
      </motion.div>

      <div className="space-y-4">
        {solutions.map((sol: any, idx: number) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="card-premium p-6 space-y-4">
            <div className="flex items-center gap-2">
              <div className="chip-primary">{sol.version}</div>
              <h3 className="font-semibold">{sol.version === 'V0' ? 'MVP' : sol.version === 'V1' ? 'Enhanced' : 'Complete'}</h3>
            </div>
            <input type="text" value={sol.title} onChange={(e) => updateSolution(idx, 'title', e.target.value)} placeholder="Solution title" className="input-premium w-full" />
            {errors[`title_${idx}`] && <p className="text-destructive text-sm">{errors[`title_${idx}`]}</p>}
            <textarea value={sol.description} onChange={(e) => updateSolution(idx, 'description', e.target.value)} placeholder="Describe the solution..." className="input-premium w-full min-h-[100px]" rows={3} />
            {errors[`desc_${idx}`] && <p className="text-destructive text-sm">{errors[`desc_${idx}`]}</p>}
            <div>
              <label className="block text-sm font-medium mb-2">Features</label>
              {sol.features.map((feat: string, featIdx: number) => (
                <input key={featIdx} type="text" value={feat} onChange={(e) => updateFeature(idx, featIdx, e.target.value)} placeholder={`Feature ${featIdx + 1}`} className="input-premium w-full mb-2" />
              ))}
              {sol.features.length < 5 && (
                <button onClick={() => addFeature(idx)} className="text-sm text-[#FF9A3D] hover:text-[#FF6B00]">+ Add feature</button>
              )}
              {errors[`features_${idx}`] && <p className="text-destructive text-sm">{errors[`features_${idx}`]}</p>}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-between">
        <button onClick={onBack} className="btn-secondary px-8">Back</button>
        <button onClick={handleSubmit} disabled={saving} className="btn-primary px-8">{saving ? 'Saving...' : 'Next'}</button>
      </div>
    </div>
  )
}
