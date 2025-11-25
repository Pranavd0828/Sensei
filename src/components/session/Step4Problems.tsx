'use client'

import { motion } from 'framer-motion'
import { PriorityPyramid, Problem } from './interactive/PriorityPyramid'

interface Props {
  sessionId: string
  prompt: any
  data?: any
  onComplete: (data: any) => void
  onBack: () => void
  saving: boolean
}

export default function Step4Problems({ data, onComplete, onBack, saving }: Props) {
  const handleProblemsComplete = (problems: Problem[]) => {
    // Map to expected format
    const formattedProblems = problems.map(p => ({
      title: p.title,
      description: `Priority: ${p.priority.toUpperCase()}`,
      affectedSegments: [] // Simplified for interactive flow
    }))

    onComplete({ problems: formattedProblems })
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-3xl font-bold mb-2">Prioritize Problems</h2>
        <p className="text-muted-foreground">
          Identify 3 key problems and rank them by impact.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <PriorityPyramid
          onComplete={handleProblemsComplete}
          initialData={data?.problems?.map((p: any) => ({
            id: Math.random().toString(36).substr(2, 9),
            title: p.title,
            priority: p.description.includes('CRITICAL') ? 'critical' : p.description.includes('MAJOR') ? 'major' : 'minor'
          }))}
        />
      </motion.div>

      <div className="flex justify-start mt-8">
        <button onClick={onBack} className="btn-secondary px-8">
          Back
        </button>
      </div>
    </div>
  )
}
