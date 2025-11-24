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
  const [missionAlignment, setMissionAlignment] = useState(data?.missionAlignment || '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!missionAlignment.trim()) {
      newErrors.missionAlignment = 'Please explain the mission alignment'
    } else if (missionAlignment.trim().length < 50) {
      newErrors.missionAlignment = 'Please provide more detail (at least 50 characters)'
    } else if (missionAlignment.length > 1000) {
      newErrors.missionAlignment = 'Please keep it under 1000 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validate()) {
      onComplete({ missionAlignment: missionAlignment.trim() })
    }
  }

  // Mock mission - in real app, this would come from the database
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
        className="card-premium p-8 space-y-4"
      >
        <div>
          <label htmlFor="alignment" className="block text-sm font-medium mb-2">
            Explain how your goal aligns with this mission
          </label>
          <textarea
            id="alignment"
            value={missionAlignment}
            onChange={(e) => setMissionAlignment(e.target.value)}
            placeholder="By helping new creators succeed early, we align with our mission to inspire creativity. When more people can express themselves and reach audiences, we create a more vibrant platform that brings joy to billions..."
            className="input-premium w-full min-h-[180px] resize-none"
            rows={7}
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">
              {missionAlignment.length}/1000 characters
            </span>
            {errors.missionAlignment && (
              <p className="text-destructive text-sm">{errors.missionAlignment}</p>
            )}
          </div>
        </div>

        <div className="p-4 bg-[#B5E550]/5 border border-[#B5E550]/20 rounded-xl">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-[#B5E550]">Tip:</span> Think about the broader impact on users, the company, and its values.
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
    </div>
  )
}
