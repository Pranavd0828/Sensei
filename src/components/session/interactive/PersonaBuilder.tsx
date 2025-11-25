'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, User, Briefcase, GraduationCap, Heart, Zap, DollarSign, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import { InfoTooltip } from '@/components/ui/InfoTooltip'

export interface Persona {
    role: string
    traits: string[]
    icon: string
}

interface Props {
    onComplete: (personas: Persona[]) => void
    initialData?: Persona[]
}

const ROLES = [
    { id: 'student', label: 'Student', icon: GraduationCap, desc: 'Learning and growing' },
    { id: 'professional', label: 'Professional', icon: Briefcase, desc: 'Career-focused' },
    { id: 'creator', label: 'Creator', icon: Zap, desc: 'Building an audience' },
    { id: 'parent', label: 'Parent', icon: Heart, desc: 'Family-oriented' },
    { id: 'executive', label: 'Executive', icon: Globe, desc: 'Decision maker' },
    { id: 'consumer', label: 'Consumer', icon: DollarSign, desc: 'Looking for value' },
]

const TRAITS = [
    'Price-sensitive', 'Tech-savvy', 'Time-poor', 'Quality-focused',
    'Early adopter', 'Skeptical', 'Social', 'Private',
    'Goal-oriented', 'Casual', 'Power user', 'Beginner'
]

export function PersonaBuilder({ onComplete, initialData }: Props) {
    const [selectedRole, setSelectedRole] = useState<string | null>(initialData?.[0]?.role || null)
    // Filter initial traits to ensure we only have valid ones from our list
    // This prevents "garbage" from existing descriptions filling up the 3-trait limit
    const [selectedTraits, setSelectedTraits] = useState<string[]>(
        (initialData?.[0]?.traits || []).filter(t => TRAITS.includes(t))
    )

    const toggleTrait = (trait: string) => {
        if (selectedTraits.includes(trait)) {
            setSelectedTraits(selectedTraits.filter(t => t !== trait))
        } else {
            if (selectedTraits.length < 3) {
                setSelectedTraits([...selectedTraits, trait])
            }
        }
    }

    const isValid = selectedRole && selectedTraits.length >= 2

    const handleSubmit = () => {
        if (isValid && selectedRole) {
            // For MVP, we construct one detailed persona, but return array to match interface
            const roleObj = ROLES.find(r => r.label === selectedRole) || ROLES[0]
            onComplete([{
                role: selectedRole,
                traits: selectedTraits,
                icon: roleObj.id // Store icon ID
            }])
        }
    }

    return (
        <div className="space-y-8">
            {/* 1. Select Role */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold">1</span>
                    Choose a primary archetype
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {ROLES.map((role) => {
                        const Icon = role.icon
                        const isSelected = selectedRole === role.label
                        return (
                            <motion.button
                                key={role.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedRole(role.label)}
                                className={cn(
                                    "flex flex-col items-center p-4 rounded-xl border-2 transition-all",
                                    isSelected
                                        ? "border-primary bg-primary/5 shadow-[0_0_15px_rgba(255,107,0,0.15)]"
                                        : "border-transparent bg-card hover:bg-accent/50"
                                )}
                            >
                                <Icon className={cn("w-8 h-8 mb-2", isSelected ? "text-primary" : "text-muted-foreground")} />
                                <span className={cn("font-medium", isSelected ? "text-foreground" : "text-muted-foreground")}>{role.label}</span>
                                <span className="text-xs text-muted-foreground/60">{role.desc}</span>
                            </motion.button>
                        )
                    })}
                </div>
            </div>

            {/* 2. Select Traits */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold">2</span>
                    Select 2-3 defining traits
                    <InfoTooltip content="Traits help define the specific behaviors or constraints of your user. Are they rich but time-poor? Or students who are price-sensitive?" />
                </h3>
                <div className="flex flex-wrap gap-2">
                    {TRAITS.map((trait) => {
                        const isSelected = selectedTraits.includes(trait)
                        return (
                            <button
                                key={trait}
                                type="button" // Explicitly set type to button to prevent form submission
                                onClick={() => toggleTrait(trait)}
                                className={cn(
                                    "px-4 py-2 rounded-full text-sm font-medium transition-all border",
                                    isSelected
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-card text-muted-foreground border-border hover:border-primary/50"
                                )}
                            >
                                {trait}
                            </button>
                        )
                    })}
                </div>
                <p className="text-xs text-muted-foreground">
                    * Select at least 2 traits to proceed.
                </p>
            </div>

            {/* Preview & Submit */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex items-center gap-3">
                    {selectedRole && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="w-4 h-4" />
                            <span>{selectedRole}</span>
                        </div>
                    )}
                    {selectedTraits.length > 0 && (
                        <div className="flex gap-1">
                            {selectedTraits.map(t => (
                                <span key={t} className="text-xs bg-secondary px-2 py-1 rounded-md text-secondary-foreground">{t}</span>
                            ))}
                        </div>
                    )}
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={!isValid}
                    className={cn(
                        "btn-primary px-8 transition-all",
                        !isValid && "opacity-50 cursor-not-allowed"
                    )}
                >
                    Confirm Persona
                </button>
            </div>
        </div>
    )
}
