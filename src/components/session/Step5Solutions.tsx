'use client'

import { motion } from 'framer-motion'
import { FeatureKanban, Feature } from './interactive/FeatureKanban'

interface Props {
  sessionId: string
  prompt: any
  data?: any
  onComplete: (data: any) => void
  onBack: () => void
  saving: boolean
}

export default function Step5Solutions({ data, onComplete, onBack, saving }: Props) {
  const handleFeaturesComplete = (features: Feature[]) => {
    // Map to expected format: 3 solution objects (MVP, V1, V2)
    const solutions = [
      {
        version: 'V0',
        title: 'MVP',
        description: 'Core features to solve the immediate problem',
        features: features.filter(f => f.bucket === 'mvp').map(f => f.title)
      },
      {
        version: 'V1',
        title: 'Enhanced',
        description: 'Improved experience with key differentiators',
        features: features.filter(f => f.bucket === 'v1').map(f => f.title)
      },
      {
        version: 'V2',
        title: 'Complete',
        description: 'Full vision realized',
        features: features.filter(f => f.bucket === 'v2').map(f => f.title)
      }
    ]

    onComplete({ solutions })
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-3xl font-bold mb-2">Ideate Solutions</h2>
        <p className="text-muted-foreground">Brainstorm features and organize them into a roadmap.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <FeatureKanban
          onComplete={handleFeaturesComplete}
          initialData={data?.solutions?.flatMap((s: any) =>
            s.features.map((f: string) => ({
              id: Math.random().toString(36).substr(2, 9),
              title: f,
              bucket: s.version === 'V0' ? 'mvp' : s.version === 'V1' ? 'v1' : 'v2'
            }))
          )}
        />
      </motion.div>

      <div className="flex justify-start mt-8">
        <button onClick={onBack} className="btn-secondary px-8">Back</button>
      </div>
    </div>
  )
}
