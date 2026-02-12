'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Plus, Trash2, AlertCircle } from 'lucide-react'

interface MilestoneInput {
  id: string
  title: string
  description: string
  due_date: string
}

export default function NewProjectPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [checkingLimits, setCheckingLimits] = useState(true)
  const [error, setError] = useState('')
  const [limitReached, setLimitReached] = useState(false)

  useEffect(() => {
    checkFreeTierLimit()
  }, [])

  const checkFreeTierLimit = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    // Check subscription status
    const { data: profile } = await supabase
      .from('users')
      .select('subscription_status')
      .eq('id', user.id)
      .single()

    if (profile?.subscription_status === 'pro') {
      setCheckingLimits(false)
      return
    }

    // Check active project count for free users
    const { count } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'active')

    if ((count || 0) >= 1) {
      setLimitReached(true)
    }
    
    setCheckingLimits(false)
  }

  // Project fields
  const [name, setName] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [description, setDescription] = useState('')

  // Milestones
  const [milestones, setMilestones] = useState<MilestoneInput[]>([
    { id: '1', title: '', description: '', due_date: '' }
  ])

  const addMilestone = () => {
    setMilestones([
      ...milestones,
      { id: Date.now().toString(), title: '', description: '', due_date: '' }
    ])
  }

  const removeMilestone = (id: string) => {
    if (milestones.length > 1) {
      setMilestones(milestones.filter(m => m.id !== id))
    }
  }

  const updateMilestone = (id: string, field: keyof MilestoneInput, value: string) => {
    setMilestones(milestones.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    // Create project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        name,
        client_name: clientName,
        client_email: clientEmail || null,
        description: description || null,
      })
      .select()
      .single()

    if (projectError) {
      setError(projectError.message)
      setLoading(false)
      return
    }

    // Create milestones
    const validMilestones = milestones.filter(m => m.title.trim())
    if (validMilestones.length > 0) {
      const { error: milestonesError } = await supabase
        .from('milestones')
        .insert(
          validMilestones.map((m, index) => ({
            project_id: project.id,
            title: m.title,
            description: m.description || null,
            due_date: m.due_date || null,
            order: index,
            status: 'not_started',
          }))
        )

      if (milestonesError) {
        console.error('Milestones error:', milestonesError)
      }
    }

    router.push(`/dashboard/project/${project.id}`)
  }

  if (checkingLimits) {
    return (
      <main className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
      </main>
    )
  }

  if (limitReached) {
    return (
      <main className="min-h-screen bg-slate-900">
        <header className="border-b border-slate-800">
          <div className="max-w-3xl mx-auto px-6 py-4">
            <Link 
              href="/dashboard" 
              className="text-slate-400 hover:text-white flex items-center gap-2 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>
        </header>
        <div className="max-w-lg mx-auto px-6 py-16 text-center">
          <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Free Plan Limit Reached</h1>
          <p className="text-slate-400 mb-6">
            You've reached the 1 active project limit on the free plan. 
            Upgrade to Pro for unlimited projects.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/dashboard/billing"
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium transition"
            >
              Upgrade to Pro — $9/mo
            </Link>
            <Link
              href="/dashboard"
              className="border border-slate-600 hover:border-slate-500 text-slate-300 px-6 py-3 rounded-lg transition"
            >
              Go Back
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <Link 
            href="/dashboard" 
            className="text-slate-400 hover:text-white flex items-center gap-2 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">New Project</h1>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Project Details */}
          <section className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Project Details</h2>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition"
                  placeholder="Website Redesign"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Client Name *
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition"
                  placeholder="Acme Inc"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Client Email (optional)
              </label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition"
                placeholder="client@example.com"
              />
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition resize-none"
                placeholder="Brief description of the project..."
                rows={3}
              />
            </div>
          </section>

          {/* Milestones */}
          <section className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Milestones</h2>
              <button
                type="button"
                onClick={addMilestone}
                className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Milestone
              </button>
            </div>

            <div className="space-y-4">
              {milestones.map((milestone, index) => (
                <div 
                  key={milestone.id}
                  className="bg-slate-900/50 border border-slate-700 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-slate-500 text-sm">Milestone {index + 1}</span>
                    {milestones.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMilestone(milestone.id)}
                        className="text-slate-500 hover:text-red-400 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={milestone.title}
                      onChange={(e) => updateMilestone(milestone.id, 'title', e.target.value)}
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 transition"
                      placeholder="Milestone title"
                    />
                    <input
                      type="date"
                      value={milestone.due_date}
                      onChange={(e) => updateMilestone(milestone.id, 'due_date', e.target.value)}
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white px-8 py-3 rounded-lg font-semibold transition"
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
            <Link
              href="/dashboard"
              className="border border-slate-600 hover:border-slate-500 text-slate-300 px-8 py-3 rounded-lg transition"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </main>
  )
}
