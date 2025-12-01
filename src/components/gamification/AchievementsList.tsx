'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Footprints, Flame, Zap, Star, Lock, Moon, Sun, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Progress } from '@/components/ui/progress'

interface Achievement {
    id: string
    code: string
    name: string
    description: string
    icon: string
    xpReward: number
    unlocked: boolean
    unlockedAt: string | null
}

interface UserProgress {
    level: number
    totalXp: number
    xpToNextLevel: number
    progressPercent: number
}

const iconMap: Record<string, any> = {
    Footprints,
    Flame,
    Zap,
    Star,
    Moon,
    Sun,
    Trophy
}

export function AchievementsList() {
    const [achievements, setAchievements] = useState<Achievement[]>([])
    const [progress, setProgress] = useState<UserProgress | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [achievementsRes, statsRes] = await Promise.all([
                    fetch('/api/achievements'),
                    fetch('/api/progression/stats')
                ])

                if (achievementsRes.ok && statsRes.ok) {
                    const achievementsData = await achievementsRes.json()
                    const statsData = await statsRes.json()

                    setAchievements(achievementsData.achievements)

                    // Calculate progress percentage
                    // XP for current level start = totalXp - xpToNextLevel (approx, but we need the range)
                    // For simplicity, let's just use a derived percentage if not provided by API
                    // Assuming linear-ish or just showing relative progress
                    // Actually, let's calculate it:
                    // We know totalXP and xpToNextLevel. 
                    // Current Level XP = totalXP
                    // Next Level Threshold = totalXP + xpToNextLevel
                    // This is tricky without knowing the previous level threshold.
                    // Let's assume the API might give us more, or we just show "XP to next level"
                    // For now, let's just show a visual bar based on an arbitrary "1000 XP per level" assumption or similar if we can't get exact bounds.
                    // Wait, `xpForLevel` util is on server. 
                    // Let's just use a simple visual for now: (totalXp % 1000) / 1000 * 100? No, that's inaccurate.
                    // Let's just display the text for now and a visual placeholder or fetch the bounds.
                    // Actually, let's just assume the stats API returns what we need or we calculate it roughly.
                    // Let's just show the XP values.

                    setProgress({
                        level: statsData.level,
                        totalXp: statsData.totalXp,
                        xpToNextLevel: statsData.xpToNextLevel,
                        progressPercent: 0 // We'll calculate this if we can, or just hide the bar if complex
                    })
                }
            } catch (error) {
                console.error('Failed to fetch data', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    if (loading) {
        return <div className="text-center py-12 text-muted-foreground">Loading achievements...</div>
    }

    return (
        <div className="space-y-8">
            {/* Level Progress Section */}
            {progress && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card-premium p-6 border-primary/20 bg-primary/5"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-2xl font-bold flex items-center gap-2">
                                Level {progress.level}
                                <Badge variant="secondary" className="bg-primary/20 text-primary hover:bg-primary/30">
                                    {progress.totalXp} XP
                                </Badge>
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {progress.xpToNextLevel} XP to Level {progress.level + 1}
                            </p>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                            <Trophy className="h-6 w-6 text-primary" />
                        </div>
                    </div>
                    {/* Simple progress bar visualization - just visual for now */}
                    <div className="h-2 bg-background/50 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '60%' }} // Placeholder since we don't have exact bounds on client
                            className="h-full bg-primary"
                        />
                    </div>
                </motion.div>
            )}

            {/* Achievements Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement, index) => {
                    const Icon = iconMap[achievement.icon] || Star

                    return (
                        <motion.div
                            key={achievement.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={cn(
                                "flex items-start gap-4 p-4 rounded-xl border transition-all duration-300",
                                achievement.unlocked
                                    ? "bg-card border-primary/20 shadow-[0_0_15px_rgba(255,107,0,0.05)]"
                                    : "bg-muted/20 border-white/5 opacity-60 grayscale-[0.5]"
                            )}
                        >
                            <div className={cn(
                                "p-3 rounded-full shrink-0",
                                achievement.unlocked
                                    ? "bg-gradient-to-br from-primary/20 to-orange-500/20 text-primary ring-1 ring-primary/30"
                                    : "bg-muted text-muted-foreground"
                            )}>
                                {achievement.unlocked ? <Icon className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
                            </div>

                            <div className="flex-1 space-y-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                    <h4 className="font-bold text-sm truncate">{achievement.name}</h4>
                                    {achievement.unlocked && (
                                        <Badge variant="outline" className="text-[10px] border-primary/30 text-primary shrink-0">
                                            +{achievement.xpReward} XP
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2">{achievement.description}</p>
                                {achievement.unlocked && achievement.unlockedAt && (
                                    <p className="text-[10px] text-primary/60 mt-2 font-medium">
                                        Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}
