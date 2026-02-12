'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Save, Loader2, User } from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [userId, setUserId] = useState('')
  const [name, setName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      router.push('/login')
      return
    }

    setEmail(authUser.email || '')

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single()

    if (profile) {
      setUserId(profile.id)
      setName(profile.name || '')
      setBusinessName(profile.business_name || '')
    }

    setLoading(false)
  }

  const handleSave = async () => {
    if (!userId) return
    setSaving(true)

    const { error } = await supabase
      .from('users')
      .update({
        name: name.trim() || null,
        business_name: businessName.trim() || null,
      })
      .eq('id', userId)

    setSaving(false)
    
    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <Link 
            href="/dashboard" 
            className="text-slate-400 hover:text-white flex items-center gap-2 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-slate-400 mb-8">Manage your account</p>

        {/* Profile Section */}
        <section className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Profile</h2>
              <p className="text-slate-400 text-sm">{email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition"
                placeholder="Jane Smith"
              />
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Business Name
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition"
                placeholder="Smith Design Co."
              />
              <p className="text-slate-500 text-sm mt-1">
                Shown on your client portals
              </p>
            </div>
          </div>
        </section>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <Save className="w-4 h-4" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>

        {/* Danger Zone */}
        <section className="mt-12 pt-8 border-t border-slate-700">
          <h3 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h3>
          <p className="text-slate-400 text-sm mb-4">
            Need to delete your account? Contact support.
          </p>
        </section>
      </div>
    </main>
  )
}
