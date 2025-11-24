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

interface Problem {
  title: string
  description: string
  affectedSegments: string[]
}

export default function Step4Problems({ data, onComplete, onBack, saving }: Props) {
  const [problems, setProblems] = useState<Problem[]>(
    data?.problems || [
      { title: '', description: '', affectedSegments: [] },
    ]
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}

    const filledProblems = problems.filter(p => p.title.trim() && p.description.trim())

    if (filledProblems.length === 0) {
      newErrors.general = 'Please add at least 1 problem'
    }

    filledProblems.forEach((prob, idx) => {
      if (prob.title.trim().length < 5) {
        newErrors[`title_${idx}`] = 'Title too short (min 5 chars)'
      }
      if (prob.description.trim().length < 30) {
        newErrors[`desc_${idx}`] = 'Description too short (min 30 chars)'
      }
      if (prob.affectedSegments.length === 0) {
        newErrors[`segments_${idx}`] = 'Select at least 1 affected segment'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validate()) {
      const cleanedProblems = problems
        .filter(p => p.title.trim() && p.description.trim())
        .map(p => ({
          title: p.title.trim(),
          description: p.description.trim(),
          affectedSegments: p.affectedSegments,
        }))
      onComplete({ problems: cleanedProblems })
    }
  }

  const updateProblem = (index: number, field: keyof Problem, value: any) => {
    const newProblems = [...problems]
    newProblems[index] = { ...newProblems[index], [field]: value }
    setProblems(newProblems)
  }

  const toggleSegment = (problemIndex: number, segment: string) => {
    const problem = problems[problemIndex]
    const newSegments = problem.affectedSegments.includes(segment)
      ? problem.affectedSegments.filter(s => s !== segment)
      : [...problem.affectedSegments, segment]
    updateProblem(problemIndex, 'affectedSegments', newSegments)
  }

  const addProblem = () => {
    if (problems.length < 3) {
      setProblems([...problems, { title: '', description: '', affectedSegments: [] }])
    }
  }

  const removeProblem = (index: number) => {
    if (problems.length > 1) {
      setProblems(problems.filter((_, i) => i !== index))
    }
  }

  const moveProblem = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const newProblems = [...problems]
      ;[newProblems[index - 1], newProblems[index]] = [newProblems[index], newProblems[index - 1]]
      setProblems(newProblems)
    } else if (direction === 'down' && index < problems.length - 1) {
      const newProblems = [...problems]
      ;[newProblems[index], newProblems[index + 1]] = [newProblems[index + 1], newProblems[index]]
      setProblems(newProblems)
    }
  }

  // Mock segments from Step 3 - in real app, get from stepData
  const availableSegments = ['Segment 1', 'Segment 2', 'Segment 3']

  return (
    <div className="space-y-6">
      {/* Step header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-3xl font-bold mb-2">Prioritize Problems</h2>
        <p className="text-muted-foreground">
          What are the key problems users face? Order by priority (most important first).
        </p>
      </motion.div>

      {/* Input form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="space-y-4"
      >
        {problems.map((problem, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="card-premium p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => moveProblem(index, 'up')}
                    disabled={index === 0}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => moveProblem(index, 'down')}
                    disabled={index === problems.length - 1}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                <h3 className="font-semibold">Problem {index + 1}</h3>
                <div className="chip-primary">
                  Priority: {index + 1}
                </div>
              </div>
              {problems.length > 1 && (
                <button
                  onClick={() => removeProblem(index)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Problem title</label>
              <input
                type="text"
                value={problem.title}
                onChange={(e) => updateProblem(index, 'title', e.target.value)}
                placeholder="e.g., Lack of initial visibility"
                className="input-premium w-full"
              />
              {errors[`title_${index}`] && (
                <p className="text-destructive text-sm mt-1">{errors[`title_${index}`]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={problem.description}
                onChange={(e) => updateProblem(index, 'description', e.target.value)}
                placeholder="Describe the problem in detail..."
                className="input-premium w-full min-h-[100px] resize-none"
                rows={3}
              />
              {errors[`desc_${index}`] && (
                <p className="text-destructive text-sm mt-1">{errors[`desc_${index}`]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Affected segments</label>
              <div className="flex flex-wrap gap-2">
                {availableSegments.map(segment => (
                  <button
                    key={segment}
                    onClick={() => toggleSegment(index, segment)}
                    className={`chip transition-all ${
                      problem.affectedSegments.includes(segment)
                        ? 'chip-primary'
                        : 'bg-card border border-white/10 text-muted-foreground'
                    }`}
                  >
                    {segment}
                  </button>
                ))}
              </div>
              {errors[`segments_${index}`] && (
                <p className="text-destructive text-sm mt-1">{errors[`segments_${index}`]}</p>
              )}
            </div>
          </motion.div>
        ))}

        {/* Add problem button */}
        {problems.length < 3 && (
          <button
            onClick={addProblem}
            className="w-full py-4 border-2 border-dashed border-white/10 rounded-xl hover:border-[#FF6B00]/50 hover:bg-[#FF6B00]/5 transition-colors flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add another problem (up to 3 total)
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
