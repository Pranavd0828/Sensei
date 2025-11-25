'use client'

import { useState } from 'react'
import { Reorder, motion } from 'framer-motion'
import { Plus, GripVertical, Trash2, Info, ArrowRight, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Feature {
    id: string
    title: string
    bucket: 'mvp' | 'v1' | 'v2'
}

interface Props {
    onComplete: (features: Feature[]) => void
    initialData?: Feature[]
}

const BUCKETS = [
    { id: 'mvp', label: 'MVP (Now)', desc: 'Must have', color: 'bg-green-500/10 border-green-500/20 text-green-500' },
    { id: 'v1', label: 'V1 (Next)', desc: 'Should have', color: 'bg-blue-500/10 border-blue-500/20 text-blue-500' },
    { id: 'v2', label: 'V2 (Later)', desc: 'Nice to have', color: 'bg-purple-500/10 border-purple-500/20 text-purple-500' },
]

export function FeatureKanban({ onComplete, initialData }: Props) {
    const [features, setFeatures] = useState<Feature[]>(initialData || [])
    const [inputValue, setInputValue] = useState('')

    const addFeature = () => {
        if (inputValue.trim().length >= 3) {
            const newFeature: Feature = {
                id: Math.random().toString(36).substr(2, 9),
                title: inputValue.trim(),
                bucket: 'mvp' // Default to MVP
            }
            setFeatures([...features, newFeature])
            setInputValue('')
        }
    }

    // Group features by bucket
    const getFeaturesByBucket = (bucketId: string) => features.filter(f => f.bucket === bucketId)

    const moveFeature = (featureId: string, newBucket: 'mvp' | 'v1' | 'v2') => {
        setFeatures(features.map(f => f.id === featureId ? { ...f, bucket: newBucket } : f))
    }

    const removeFeature = (featureId: string) => {
        setFeatures(features.filter(f => f.id !== featureId))
    }

    const isValid = features.filter(f => f.bucket === 'mvp').length >= 2

    return (
        <div className="space-y-8">
            {/* Header & Hints */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <h3 className="text-lg font-medium">Add Features</h3>
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-sm text-muted-foreground flex gap-2 items-start">
                        <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <p>Brainstorm features that solve the problems you identified. Start with the <strong>MVP</strong> (Must-haves), then plan for <strong>V1</strong> (Next steps) and <strong>V2</strong> (Future vision).</p>
                    </div>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {BUCKETS.map((bucket, bucketIdx) => (
                    <div key={bucket.id} className="space-y-3">
                        <div className={cn("p-3 rounded-lg border flex justify-between items-center", bucket.color)}>
                            <div>
                                <h4 className="font-bold text-sm">{bucket.label}</h4>
                                <p className="text-xs opacity-70">{bucket.desc}</p>
                            </div>
                            {/* Add directly to bucket */}
                            <button
                                onClick={() => {
                                    const title = prompt(`Add feature to ${bucket.label}:`)
                                    if (title && title.trim().length >= 3) {
                                        const newFeature: Feature = {
                                            id: Math.random().toString(36).substr(2, 9),
                                            title: title.trim(),
                                            bucket: bucket.id as any
                                        }
                                        setFeatures([...features, newFeature])
                                    }
                                }}
                                className="w-6 h-6 rounded-full bg-background/20 hover:bg-background/40 flex items-center justify-center transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="min-h-[200px] bg-card/30 rounded-xl border border-white/5 p-2 space-y-2">
                            {getFeaturesByBucket(bucket.id).map((feature) => (
                                <motion.div
                                    key={feature.id}
                                    layoutId={feature.id}
                                    className="bg-card border border-white/10 p-3 rounded-lg shadow-sm group relative"
                                >
                                    <p className="text-sm pr-6">{feature.title}</p>

                                    {/* Move Controls */}
                                    <div className="flex justify-between mt-2 pt-2 border-t border-white/5 opacity-60 group-hover:opacity-100 transition-opacity">
                                        {bucketIdx > 0 ? (
                                            <button
                                                onClick={() => moveFeature(feature.id, BUCKETS[bucketIdx - 1].id as any)}
                                                className="p-1 hover:bg-muted rounded"
                                                title="Move Left"
                                            >
                                                <ArrowLeft className="w-3 h-3" />
                                            </button>
                                        ) : <div />}

                                        {bucketIdx < BUCKETS.length - 1 ? (
                                            <button
                                                onClick={() => moveFeature(feature.id, BUCKETS[bucketIdx + 1].id as any)}
                                                className="p-1 hover:bg-muted rounded"
                                                title="Move Right"
                                            >
                                                <ArrowRight className="w-3 h-3" />
                                            </button>
                                        ) : <div />}
                                    </div>

                                    <button
                                        onClick={() => removeFeature(feature.id)}
                                        className="absolute top-2 right-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            ))}

                            {getFeaturesByBucket(bucket.id).length === 0 && (
                                <div className="text-center py-8 text-xs text-muted-foreground border-2 border-dashed border-white/5 rounded-lg">
                                    Empty
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                    {features.filter(f => f.bucket === 'mvp').length}/2 MVP features required
                </p>
                <button
                    onClick={() => onComplete(features)}
                    disabled={!isValid}
                    className="btn-primary px-8"
                >
                    Confirm Features
                </button>
            </div>
        </div>
    )
}
