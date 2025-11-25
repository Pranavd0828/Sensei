'use client'

import { useState } from 'react'
import { Reorder, motion } from 'framer-motion'
import { GripVertical, AlertCircle, ArrowUp, ArrowDown, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { InfoTooltip } from '@/components/ui/InfoTooltip'

export interface Problem {
    id: string
    title: string
    priority: 'critical' | 'major' | 'minor'
}

interface Props {
    onComplete: (problems: Problem[]) => void
    initialData?: Problem[]
}

export function PriorityPyramid({ onComplete, initialData }: Props) {
    const [problems, setProblems] = useState<Problem[]>(initialData || [])
    const [inputValue, setInputValue] = useState('')

    const addProblem = () => {
        if (inputValue.trim().length >= 5 && problems.length < 3) {
            const newProblem: Problem = {
                id: Math.random().toString(36).substr(2, 9),
                title: inputValue.trim(),
                priority: problems.length === 0 ? 'critical' : problems.length === 1 ? 'major' : 'minor'
            }
            setProblems([...problems, newProblem])
            setInputValue('')
        }
    }

    const handleReorder = (newOrder: Problem[]) => {
        // Re-assign priorities based on new order
        const updated = newOrder.map((p, index) => ({
            ...p,
            priority: index === 0 ? 'critical' : index === 1 ? 'major' : 'minor'
        })) as Problem[]
        setProblems(updated)
    }

    const isValid = problems.length === 3

    return (
        <div className="space-y-8">
            {/* Input Area */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <h3 className="text-lg font-medium">Add 3 Key Problems</h3>
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-sm text-muted-foreground flex gap-2 items-start">
                        <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <p>Focus on problems that are <strong>high impact</strong> (severe pain) and <strong>high frequency</strong> (happens often). Critical problems block the user from achieving their core goal.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addProblem()}
                        placeholder="e.g., Users can't find the settings menu"
                        className="input-premium flex-1"
                        disabled={problems.length >= 3}
                    />
                    <button
                        onClick={addProblem}
                        disabled={problems.length >= 3 || inputValue.trim().length < 5}
                        className="btn-secondary px-4"
                    >
                        Add
                    </button>
                </div>
                <p className="text-xs text-muted-foreground">
                    {problems.length}/3 problems added
                </p>
            </div>

            {/* Pyramid / List */}
            <div className="relative py-8 px-4 bg-card/30 rounded-xl border border-white/5">
                {/* Pyramid Background Visual */}
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-5 pointer-events-none">
                    <div className="w-32 h-32 border-l-[60px] border-r-[60px] border-b-[100px] border-l-transparent border-r-transparent border-b-primary/50" />
                </div>

                <Reorder.Group axis="y" values={problems} onReorder={handleReorder} className="space-y-4 relative z-10">
                    {problems.map((problem) => (
                        <Reorder.Item key={problem.id} value={problem}>
                            <div className={cn(
                                "flex items-center gap-4 p-4 rounded-lg border cursor-grab active:cursor-grabbing transition-all",
                                problem.priority === 'critical' ? "bg-red-500/10 border-red-500/30" :
                                    problem.priority === 'major' ? "bg-orange-500/10 border-orange-500/30" :
                                        "bg-blue-500/10 border-blue-500/30"
                            )}>
                                <GripVertical className="text-muted-foreground w-5 h-5" />

                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={cn(
                                            "text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded",
                                            problem.priority === 'critical' ? "bg-red-500/20 text-red-400" :
                                                problem.priority === 'major' ? "bg-orange-500/20 text-orange-400" :
                                                    "bg-blue-500/20 text-blue-400"
                                        )}>
                                            {problem.priority}
                                        </span>
                                    </div>
                                    <p className="font-medium">{problem.title}</p>
                                </div>

                                <button
                                    onClick={() => setProblems(problems.filter(p => p.id !== problem.id))}
                                    className="text-muted-foreground hover:text-destructive transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </Reorder.Item>
                    ))}
                </Reorder.Group>

                {problems.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        Add problems above, then drag to prioritize
                    </div>
                )}
            </div>

            <div className="flex justify-end">
                <button
                    onClick={() => onComplete(problems)}
                    disabled={!isValid}
                    className="btn-primary px-8"
                >
                    Confirm Priorities
                </button>
            </div>
        </div>
    )
}
