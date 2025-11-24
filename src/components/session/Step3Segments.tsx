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

interface Segment {
  name: string
  description: string
}

export default function Step3Segments({ data, onComplete, onBack, saving }: Props) {
  const [segments, setSegments] = useState<Segment[]>(
    data?.segments || [
      { name: '', description: '' },
      { name: '', description: '' },
    ]
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}

    const filledSegments = segments.filter(s => s.name.trim() && s.description.trim())

    if (filledSegments.length === 0) {
      newErrors.general = 'Please add at least 1 user segment'
    }

    filledSegments.forEach((seg, idx) => {
      if (seg.name.trim().length < 3) {
        newErrors[`name_${idx}`] = 'Name too short'
      }
      if (seg.description.trim().length < 20) {
        newErrors[`desc_${idx}`] = 'Description too short (min 20 chars)'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validate()) {
      const cleanedSegments = segments
        .filter(s => s.name.trim() && s.description.trim())
        .map(s => ({
          name: s.name.trim(),
          description: s.description.trim(),
        }))
      onComplete({ segments: cleanedSegments })
    }
  }

  const updateSegment = (index: number, field: 'name' | 'description', value: string) => {
    const newSegments = [...segments]
    newSegments[index][field] = value
    setSegments(newSegments)
  }

  const addSegment = () => {
    if (segments.length < 3) {
      setSegments([...segments, { name: '', description: '' }])
    }
  }

  const removeSegment = (index: number) => {
    if (segments.length > 1) {
      setSegments(segments.filter((_, i) => i !== index))
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
        <h2 className="text-3xl font-bold mb-2">Identify User Segments</h2>
        <p className="text-muted-foreground">
          Who are the key user groups affected by this problem?
        </p>
      </motion.div>

      {/* Input form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="space-y-4"
      >
        {segments.map((segment, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="card-premium p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Segment {index + 1}</h3>
              {segments.length > 1 && (
                <button
                  onClick={() => removeSegment(index)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Segment name</label>
              <input
                type="text"
                value={segment.name}
                onChange={(e) => updateSegment(index, 'name', e.target.value)}
                placeholder="e.g., Aspiring Influencers"
                className="input-premium w-full"
              />
              {errors[`name_${index}`] && (
                <p className="text-destructive text-sm mt-1">{errors[`name_${index}`]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={segment.description}
                onChange={(e) => updateSegment(index, 'description', e.target.value)}
                placeholder="Describe this user segment (age, goals, behaviors, pain points...)"
                className="input-premium w-full min-h-[100px] resize-none"
                rows={3}
              />
              {errors[`desc_${index}`] && (
                <p className="text-destructive text-sm mt-1">{errors[`desc_${index}`]}</p>
              )}
            </div>
          </motion.div>
        ))}

        {/* Add segment button */}
        {segments.length < 3 && (
          <button
            onClick={addSegment}
            className="w-full py-4 border-2 border-dashed border-white/10 rounded-xl hover:border-[#FF6B00]/50 hover:bg-[#FF6B00]/5 transition-colors flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add another segment (up to 3 total)
          </button>
        )}

        {errors.general && (
          <p className="text-destructive text-sm">{errors.general}</p>
        )}
      </motion.div>

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
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
    </div>
  )
}
