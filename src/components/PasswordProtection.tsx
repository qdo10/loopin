'use client'

import { useState } from 'react'
import { Lock, Unlock, Loader2, Check } from 'lucide-react'

interface PasswordProtectionProps {
  projectId: string
  userId: string
  hasPassword: boolean
  isPro: boolean
  onUpdate: () => void
}

export default function PasswordProtection({ 
  projectId, 
  userId, 
  hasPassword, 
  isPro,
  onUpdate 
}: PasswordProtectionProps) {
  const [enabled, setEnabled] = useState(hasPassword)
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const handleToggle = async () => {
    if (!isPro) return

    if (enabled) {
      // Remove password
      setSaving(true)
      const res = await fetch('/api/portal/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, userId, password: null }),
      })
      
      if (res.ok) {
        setEnabled(false)
        onUpdate()
      }
      setSaving(false)
    } else {
      // Show form to set password
      setShowForm(true)
    }
  }

  const handleSetPassword = async () => {
    if (!password.trim()) return
    setSaving(true)

    const res = await fetch('/api/portal/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, userId, password }),
    })

    if (res.ok) {
      setEnabled(true)
      setShowForm(false)
      setPassword('')
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      onUpdate()
    }
    setSaving(false)
  }

  if (!isPro) {
    return (
      <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
        <div className="flex items-center gap-3 mb-2">
          <Lock className="w-5 h-5 text-slate-500" />
          <span className="text-slate-400">Password Protection</span>
        </div>
        <p className="text-slate-500 text-sm">
          Upgrade to Pro to password-protect your client portals.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          {enabled ? (
            <Lock className="w-5 h-5 text-green-500" />
          ) : (
            <Unlock className="w-5 h-5 text-slate-500" />
          )}
          <span className="text-white">Password Protection</span>
        </div>
        <button
          onClick={handleToggle}
          disabled={saving}
          className={`relative w-12 h-6 rounded-full transition ${
            enabled ? 'bg-green-500' : 'bg-slate-600'
          }`}
        >
          <span 
            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
              enabled ? 'left-7' : 'left-1'
            }`}
          />
        </button>
      </div>

      {showForm && (
        <div className="mt-4 space-y-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
            placeholder="Enter password for this portal"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleSetPassword}
              disabled={saving || !password.trim()}
              className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : saved ? (
                <Check className="w-4 h-4" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              {saving ? 'Saving...' : saved ? 'Saved!' : 'Set Password'}
            </button>
            <button
              onClick={() => {
                setShowForm(false)
                setPassword('')
              }}
              className="text-slate-400 hover:text-white px-4 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {enabled && !showForm && (
        <p className="text-slate-500 text-sm">
          Clients will need to enter a password to view this portal.
        </p>
      )}
    </div>
  )
}
