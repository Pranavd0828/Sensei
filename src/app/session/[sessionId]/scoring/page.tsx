'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import * as api from '@/lib/api'

export default function ScoringPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string
  const [status, setStatus] = useState<'scoring' | 'success' | 'error'>('scoring')
  const [error, setError] = useState('')

  useEffect(() => {
    scoreSession()
  }, [])

  const scoreSession = async () => {
    try {
      await api.scoreSession(sessionId)
      setStatus('success')
      setTimeout(() => {
        router.push(`/session/${sessionId}/results`)
      }, 2000)
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Scoring failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        {status === 'scoring' && (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-20 h-20 border-4 border-[#FF6B00] border-t-transparent rounded-full mx-auto mb-6"
            />
            <h2 className="text-3xl font-bold mb-3">Scoring your session...</h2>
            <p className="text-muted-foreground mb-4">
              Our AI is analyzing your responses
            </p>
            <p className="text-sm text-muted-foreground">
              This usually takes 30-60 seconds
            </p>
          </>
        )}

        {status === 'success' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
          >
            <div className="w-20 h-20 bg-[#B5E550]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-[#B5E550]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-3">Scoring complete!</h2>
            <p className="text-muted-foreground">Redirecting to results...</p>
          </motion.div>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-3">Scoring failed</h2>
            <p className="text-destructive mb-6">{error}</p>
            <button onClick={() => router.push('/')} className="btn-primary">
              Go home
            </button>
          </>
        )}
      </motion.div>
    </div>
  )
}
