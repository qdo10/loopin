'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { ProjectWithDetails, Milestone, Update } from '@/lib/types'
import { 
  ArrowLeft, ExternalLink, Copy, Check, Plus, 
  Trash2, Send, GripVertical, CheckCircle, Circle, Clock
} from 'lucide-react'

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [project, setProject] = useState<ProjectWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  // New update form
  const [newUpdate, setNewUpdate] = useState('')
  const [sendingUpdate, setSendingUpdate] = useState(false)

  // New milestone form
  const [showMilestoneForm, setShowMilestoneForm] = useState(false)
  const [newMilestone, setNewMilestone] = useState({ title: '', due_date: '' })

  useEffect(() => {
    loadProject()
  }, [projectId])

  const loadProject = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    // Get project
    const { data: projectData, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (error || !projectData) {
      router.push('/dashboard')
      return
    }

    // Get milestones
    const { data: milestones } = await supabase
      .from('milestones')
      .select('*')
      .eq('project_id', projectId)
      .order('order', { ascending: true })

    // Get updates
    const { data: updates } = await supabase
      .from('updates')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    // Get deliverables
    const { data: deliverables } = await supabase
      .from('deliverables')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    setProject({
      ...projectData,
      milestones: milestones || [],
      updates: updates || [],
      deliverables: deliverables || [],
    })
    setLoading(false)
  }

  const getPortalUrl = () => {
    if (!project) return ''
    return `${window.location.origin}/p/${project.share_token}`
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(getPortalUrl())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleMilestoneStatus = async (milestone: Milestone) => {
    const statusOrder = ['not_started', 'in_progress', 'complete'] as const
    const currentIndex = statusOrder.indexOf(milestone.status)
    const nextStatus = statusOrder[(currentIndex + 1) % 3]

    await supabase
      .from('milestones')
      .update({ status: nextStatus })
      .eq('id', milestone.id)

    loadProject()
  }

  const addMilestone = async () => {
    if (!newMilestone.title.trim() || !project) return

    await supabase
      .from('milestones')
      .insert({
        project_id: project.id,
        title: newMilestone.title,
        due_date: newMilestone.due_date || null,
        order: project.milestones.length,
        status: 'not_started',
      })

    setNewMilestone({ title: '', due_date: '' })
    setShowMilestoneForm(false)
    loadProject()
  }

  const deleteMilestone = async (milestoneId: string) => {
    await supabase
      .from('milestones')
      .delete()
      .eq('id', milestoneId)

    loadProject()
  }

  const sendUpdate = async () => {
    if (!newUpdate.trim() || !project) return
    setSendingUpdate(true)

    await supabase
      .from('updates')
      .insert({
        project_id: project.id,
        content: newUpdate,
      })

    setNewUpdate('')
    setSendingUpdate(false)
    loadProject()
  }

  const deleteUpdate = async (updateId: string) => {
    await supabase
      .from('updates')
      .delete()
      .eq('id', updateId)

    loadProject()
  }

  if (loading || !project) {
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
        <div className="max-w-5xl mx-auto px-6 py-4">
          <Link 
            href="/dashboard" 
            className="text-slate-400 hover:text-white flex items-center gap-2 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Project Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">{project.name}</h1>
            <p className="text-slate-400 mt-1">For {project.client_name}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={copyLink}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
            <a
              href={getPortalUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition"
            >
              <ExternalLink className="w-4 h-4" />
              View Portal
            </a>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Milestones */}
          <section className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Milestones</h2>
              <button
                onClick={() => setShowMilestoneForm(true)}
                className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-sm"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            {/* Milestone List */}
            <div className="space-y-3">
              {project.milestones.map((milestone) => (
                <div 
                  key={milestone.id}
                  className="flex items-center gap-3 bg-slate-900/50 rounded-lg p-3 group"
                >
                  <button
                    onClick={() => toggleMilestoneStatus(milestone)}
                    className="flex-shrink-0"
                    title="Click to change status"
                  >
                    {milestone.status === 'complete' && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {milestone.status === 'in_progress' && (
                      <Clock className="w-5 h-5 text-indigo-400" />
                    )}
                    {milestone.status === 'not_started' && (
                      <Circle className="w-5 h-5 text-slate-500" />
                    )}
                  </button>
                  <div className="flex-1">
                    <p className={`text-sm ${milestone.status === 'complete' ? 'text-slate-400 line-through' : 'text-white'}`}>
                      {milestone.title}
                    </p>
                    {milestone.due_date && (
                      <p className="text-slate-500 text-xs">
                        Due: {new Date(milestone.due_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteMilestone(milestone.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {project.milestones.length === 0 && !showMilestoneForm && (
                <p className="text-slate-500 text-center py-4">No milestones yet</p>
              )}

              {/* Add Milestone Form */}
              {showMilestoneForm && (
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-600">
                  <input
                    type="text"
                    value={newMilestone.title}
                    onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm mb-2 focus:outline-none focus:border-indigo-500"
                    placeholder="Milestone title"
                    autoFocus
                  />
                  <input
                    type="date"
                    value={newMilestone.due_date}
                    onChange={(e) => setNewMilestone({ ...newMilestone, due_date: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm mb-3 focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={addMilestone}
                      className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded text-sm"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setShowMilestoneForm(false)
                        setNewMilestone({ title: '', due_date: '' })
                      }}
                      className="text-slate-400 hover:text-white px-3 py-1.5 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Right Column - Updates */}
          <section className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Updates</h2>

            {/* New Update Form */}
            <div className="mb-6">
              <textarea
                value={newUpdate}
                onChange={(e) => setNewUpdate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition resize-none"
                placeholder="Share an update with your client..."
                rows={3}
              />
              <button
                onClick={sendUpdate}
                disabled={!newUpdate.trim() || sendingUpdate}
                className="mt-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
              >
                <Send className="w-4 h-4" />
                {sendingUpdate ? 'Posting...' : 'Post Update'}
              </button>
            </div>

            {/* Updates List */}
            <div className="space-y-4">
              {project.updates.map((update) => (
                <div 
                  key={update.id}
                  className="bg-slate-900/50 rounded-lg p-4 group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-slate-400 text-xs">
                      {new Date(update.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <button
                      onClick={() => deleteUpdate(update.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-slate-300 text-sm whitespace-pre-wrap">{update.content}</p>
                </div>
              ))}

              {project.updates.length === 0 && (
                <p className="text-slate-500 text-center py-4">No updates yet</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
