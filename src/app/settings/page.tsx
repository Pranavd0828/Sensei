'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import * as api from '@/lib/api'

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const [userData, statsData] = await Promise.all([
        api.getMe(),
        api.getProgressionStats()
      ])
      setUser(userData)
      setStats(statsData)
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await api.logout()
      localStorage.removeItem('session_token')
      localStorage.removeItem('user')
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      setError('Please type DELETE to confirm')
      return
    }

    setDeleting(true)
    setError('')

    try {
      await api.deleteAccount()
      localStorage.clear()
      router.push('/auth/login')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete account')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF6B00]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </motion.div>

        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-premium p-6 mb-6"
        >
          <h2 className="text-xl font-bold mb-4">Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Email
              </label>
              <div className="input-premium bg-card cursor-not-allowed">
                {user?.email || 'Not set'}
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Email cannot be changed at this time
            </div>
          </div>
        </motion.div>

        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-premium p-6 mb-6"
        >
          <h2 className="text-xl font-bold mb-4">Your Progress</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card rounded-xl p-4">
              <div className="text-3xl mb-2">🏆</div>
              <div className="text-2xl font-bold text-[#FF6B00]">
                Level {stats?.level || 1}
              </div>
              <div className="text-sm text-muted-foreground">Current Level</div>
            </div>

            <div className="bg-card rounded-xl p-4">
              <div className="text-3xl mb-2">⚡</div>
              <div className="text-2xl font-bold text-[#B5E550]">
                {stats?.xp || 0} XP
              </div>
              <div className="text-sm text-muted-foreground">Total Experience</div>
            </div>

            <div className="bg-card rounded-xl p-4">
              <div className="text-3xl mb-2">🔥</div>
              <div className="text-2xl font-bold text-[#FF9A3D]">
                {stats?.currentStreak || 0} days
              </div>
              <div className="text-sm text-muted-foreground">Current Streak</div>
            </div>

            <div className="bg-card rounded-xl p-4">
              <div className="text-3xl mb-2">⭐</div>
              <div className="text-2xl font-bold text-[#B5E550]">
                {stats?.longestStreak || 0} days
              </div>
              <div className="text-sm text-muted-foreground">Longest Streak</div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Progress to Level {(stats?.level || 1) + 1}</span>
              <span className="text-sm font-medium">{stats?.xp || 0} / {stats?.xpToNextLevel || 1000} XP</span>
            </div>
            <div className="h-2 bg-card rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${((stats?.xp || 0) / (stats?.xpToNextLevel || 1000)) * 100}%` }}
                transition={{ duration: 1, delay: 0.3 }}
                className="h-full bg-gradient-to-r from-[#FF6B00] to-[#FF9A3D] rounded-full"
              />
            </div>
          </div>
        </motion.div>

        {/* Account Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-premium p-6 mb-6"
        >
          <h2 className="text-xl font-bold mb-4">Account</h2>
          <div className="space-y-3">
            <button
              onClick={handleLogout}
              className="w-full btn-secondary text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🚪</span>
                <div>
                  <div className="font-semibold">Log Out</div>
                  <div className="text-xs text-muted-foreground">Sign out of your account</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full bg-destructive/10 hover:bg-destructive/20 text-destructive font-semibold rounded-2xl px-6 py-3.5 transition-all duration-200 text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">⚠️</span>
                <div>
                  <div className="font-semibold">Delete Account</div>
                  <div className="text-xs opacity-80">Permanently delete your account and data</div>
                </div>
              </div>
            </button>
          </div>
        </motion.div>

        {/* App Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center text-sm text-muted-foreground"
        >
          <p>Sensei MVP v1.0.0</p>
          <p className="mt-1">Product Sense Practice Platform</p>
        </motion.div>

        {/* Delete Account Modal */}
        <AnimatePresence>
          {showDeleteModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => {
                setShowDeleteModal(false)
                setDeleteConfirmation('')
                setError('')
              }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="card-premium p-8 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">⚠️</div>
                  <h2 className="text-2xl font-bold mb-2">Delete Account</h2>
                  <p className="text-muted-foreground">
                    This action cannot be undone. All your data, including sessions, progress, and stats will be permanently deleted.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Type <span className="text-destructive font-bold">DELETE</span> to confirm
                    </label>
                    <input
                      type="text"
                      value={deleteConfirmation}
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                      placeholder="DELETE"
                      className="input-premium w-full"
                      disabled={deleting}
                    />
                  </div>

                  {error && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 text-sm text-destructive">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowDeleteModal(false)
                        setDeleteConfirmation('')
                        setError('')
                      }}
                      disabled={deleting}
                      className="flex-1 btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleting || deleteConfirmation !== 'DELETE'}
                      className="flex-1 bg-destructive hover:bg-destructive/90 text-white font-semibold rounded-2xl px-6 py-3.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deleting ? 'Deleting...' : 'Delete Account'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
