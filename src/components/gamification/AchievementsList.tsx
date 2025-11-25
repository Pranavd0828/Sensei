'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Footprints, Flame, Zap, Star, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

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

const iconMap: Record<string, any> = {
    Footprints,
    Flame,
    Zap,
    Star,
}

export function AchievementsList() {
    const [achievements, setAchievements] = useState<Achievement[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchAchievements = async () => {
            try {
                const res = await fetch('/api/achievements')
                if (res.ok) {
                    const data = await res.json()
                    setAchievements(data.achievements)
                }
            } catch (error) {
                console.error('Failed to fetch achievements', error)
            } finally {
                setLoading(false)
            }
        }

        fetchAchievements()
    }, [])

    if (loading) {
        return <div className="text-center py-4">Loading achievements...</div>
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Achievements
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {achievements.map((achievement) => {
                        const Icon = iconMap[achievement.icon] || Star

                        return (
                            <div
                                key={achievement.id}
                                className={cn(
                                    "flex items-start gap-4 p-4 rounded-lg border transition-all",
                                    achievement.unlocked
                                        ? "bg-card border-border shadow-sm"
                                        : "bg-muted/50 border-transparent opacity-70"
                                )}
                            >
                                <div className={cn(
                                    "p-2 rounded-full",
                                    achievement.unlocked ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                                )}>
                                    {achievement.unlocked ? <Icon className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
                                </div>

                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-semibold text-sm">{achievement.name}</h4>
                                        {achievement.unlocked && (
                                            <Badge variant="secondary" className="text-xs">
                                                +{achievement.xpReward} XP
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                                    {achievement.unlocked && achievement.unlockedAt && (
                                        <p className="text-[10px] text-muted-foreground mt-1">
                                            Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
