'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import * as api from '@/lib/api'

interface AppLayoutProps {
  children: React.ReactNode
}

interface User {
  id: string
  email: string
  displayName: string | null
  level: number
  totalXp: number
}

interface Stats {
  level: number
  totalXp: number
  xpToNextLevel: number
  currentStreak: number
  bestStreak: number
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    const userData = await api.getMe()
    if (userData) {
      setUser(userData)
      const statsData = await api.getProgressionStats()
      setStats(statsData)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('session_token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const getDisplayName = () => {
    if (user?.displayName) return user.displayName
    if (user?.email) return user.email.split('@')[0]
    return 'User'
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 border-b border-white/5 backdrop-blur-xl bg-background/80">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="text-2xl font-bold text-gradient-orange">Sensei</div>
          </button>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Level chip */}
            {stats && (
              <div className="chip-primary hidden sm:flex">
                <span className="text-base">🏆</span>
                <span className="font-semibold">Level {stats.level}</span>
                <span className="text-muted-foreground">•</span>
                <span>{stats.totalXp.toLocaleString()} XP</span>
              </div>
            )}

            {/* Streak chip */}
            {stats && stats.currentStreak > 0 && (
              <div className="chip-success hidden sm:flex">
                <span className="text-base">🔥</span>
                <span className="font-semibold">{stats.currentStreak} day streak</span>
              </div>
            )}

            {/* Profile menu */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-card transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#FF6B00] flex items-center justify-center text-sm font-bold">
                  {getDisplayName()[0].toUpperCase()}
                </div>
                <svg
                  className={`w-4 h-4 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown menu */}
              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-64 card-premium p-2 shadow-2xl"
                  >
                    <div className="px-3 py-2 border-b border-white/5 mb-2">
                      <div className="font-semibold">{getDisplayName()}</div>
                      <div className="text-sm text-muted-foreground">{user?.email}</div>
                    </div>

                    {stats && (
                      <div className="px-3 py-2 mb-2 bg-[#FF6B00]/5 rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">Progress</div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-semibold">Level {stats.level}</span>
                          <span className="text-muted-foreground">•</span>
                          <span>{stats.totalXp} XP</span>
                        </div>
                        {stats.currentStreak > 0 && (
                          <div className="text-sm text-[#B5E550] mt-1">
                            🔥 {stats.currentStreak} day streak
                          </div>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => {
                        router.push('/settings')
                        setShowProfileMenu(false)
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-card rounded-lg transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Settings
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full px-3 py-2 text-left hover:bg-destructive/10 text-destructive rounded-lg transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Log out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>

      {/* Click outside to close menu */}
      {showProfileMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowProfileMenu(false)}
        />
      )}
    </div>
  )
}
