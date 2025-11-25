'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { PersonaBuilder, Persona } from './interactive/PersonaBuilder'

interface Props {
  sessionId: string
  prompt: any
  data?: any
  onComplete: (data: any) => void
  onBack: () => void
  saving: boolean
}

export default function Step3Segments({ data, onComplete, onBack, saving }: Props) {
  const handlePersonaComplete = (personas: Persona[]) => {
    // Map the structured persona back to the expected format for compatibility
    // In a real migration, we'd update the schema, but for now we map to name/description
    const segments = personas.map(p => ({
      name: p.role,
      description: `Traits: ${p.traits.join(', ')}`,
      // We store the structured data in a hidden field or just rely on the text representation for now
      // Ideally, we'd store the full object in the JSON field
      structuredData: p
    }))

    onComplete({ segments })
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-3xl font-bold mb-2">Identify User Segments</h2>
        <p className="text-muted-foreground">
          Build a persona that represents your target user.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <PersonaBuilder
          onComplete={handlePersonaComplete}
          // Attempt to reconstruct initial data if it exists and matches our new format
          // This is a best-effort for backward compatibility
          initialData={data?.segments?.map((s: any) => ({
            role: s.name,
            traits: s.description.replace('Traits: ', '').split(', '),
            icon: 'user'
          }))}
        />
      </motion.div>

      <div className="flex justify-start mt-8">
        <button onClick={onBack} className="btn-secondary px-8">
          Back
        </button>
        {/* Next button is handled inside PersonaBuilder via onComplete, 
            but we might want a manual one if the user wants to edit? 
            For now, the builder has a "Confirm" button that triggers onComplete.
        */}
      </div>
    </div>
  )
}
