'use client'

import { useEffect, useState } from 'react'
import { Eye, TrendingUp, Clock, BarChart3 } from 'lucide-react'
import { AnalyticsStats } from '@/lib/types'

interface AnalyticsCardProps {
  projectId: string
}

export default function AnalyticsCard({ projectId }: AnalyticsCardProps) {
  const [stats, setStats] = useState<AnalyticsStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [projectId])

  const loadStats = async () => {
    try {
      const res = await fetch(`/api/analytics/stats?projectId=${projectId}`)
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  if (loading) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 animate-pulse">
        <div className="h-6 bg-slate-700 rounded w-24 mb-4"></div>
        <div className="h-8 bg-slate-700 rounded w-16"></div>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-indigo-400" />
        <h3 className="text-lg font-semibold text-white">Portal Analytics</h3>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-900/50 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
            <Eye className="w-3 h-3" />
            Total
          </div>
          <p className="text-2xl font-bold text-white">{stats.totalViews}</p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
            <TrendingUp className="w-3 h-3" />
            This Week
          </div>
          <p className="text-2xl font-bold text-white">{stats.weeklyViews}</p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
            <Clock className="w-3 h-3" />
            Today
          </div>
          <p className="text-2xl font-bold text-white">{stats.dailyViews}</p>
        </div>
      </div>

      {stats.recentViews.length > 0 && (
        <div>
          <p className="text-slate-400 text-sm mb-2">Recent Activity</p>
          <div className="space-y-1">
            {stats.recentViews.slice(0, 5).map((view, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-slate-300">Client viewed portal</span>
                <span className="text-slate-500 ml-auto">{formatTimeAgo(view.viewed_at)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.totalViews === 0 && (
        <p className="text-slate-500 text-sm text-center py-4">
          No views yet. Share your portal link with your client!
        </p>
      )}
    </div>
  )
}
