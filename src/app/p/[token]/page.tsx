'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ProjectWithDetails, Milestone, Update, Deliverable } from '@/lib/types'
import { CheckCircle, Circle, Clock, Download, FileText, Calendar, ArrowRight } from 'lucide-react'

export default function PortalPage() {
  const params = useParams()
  const token = params.token as string

  const [project, setProject] = useState<ProjectWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadProject()
  }, [token])

  const loadProject = async () => {
    // Get project by share token
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('share_token', token)
      .eq('status', 'active')
      .single()

    if (projectError || !projectData) {
      setError('Project not found or no longer available')
      setLoading(false)
      return
    }

    // Get milestones
    const { data: milestones } = await supabase
      .from('milestones')
      .select('*')
      .eq('project_id', projectData.id)
      .order('order', { ascending: true })

    // Get updates
    const { data: updates } = await supabase
      .from('updates')
      .select('*')
      .eq('project_id', projectData.id)
      .order('created_at', { ascending: false })

    // Get deliverables
    const { data: deliverables } = await supabase
      .from('deliverables')
      .select('*')
      .eq('project_id', projectData.id)
      .order('created_at', { ascending: false })

    setProject({
      ...projectData,
      milestones: milestones || [],
      updates: updates || [],
      deliverables: deliverables || [],
    })
    setLoading(false)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-slate-500 mt-4">Loading project...</p>
        </div>
      </main>
    )
  }

  if (error || !project) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Project Not Found</h1>
          <p className="text-slate-500">{error || 'This project may have been removed or the link is invalid.'}</p>
        </div>
      </main>
    )
  }

  const completedMilestones = project.milestones.filter(m => m.status === 'complete').length
  const progress = project.milestones.length > 0 
    ? Math.round((completedMilestones / project.milestones.length) * 100) 
    : 0

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center gap-2 text-indigo-600 text-sm font-medium mb-2">
            <span>Project Portal</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{project.name}</h1>
          <p className="text-slate-500">For {project.client_name}</p>
          {project.description && (
            <p className="text-slate-600 mt-4">{project.description}</p>
          )}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Progress Overview */}
        {project.milestones.length > 0 && (
          <section className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-slate-800">Overall Progress</h2>
              <span className="text-2xl font-bold text-indigo-600">{progress}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div 
                className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-slate-500 text-sm mt-2">
              {completedMilestones} of {project.milestones.length} milestones completed
            </p>
          </section>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Timeline / Milestones */}
            {project.milestones.length > 0 && (
              <section className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-6">Timeline</h2>
                <div className="space-y-4">
                  {project.milestones.map((milestone, index) => (
                    <MilestoneItem 
                      key={milestone.id} 
                      milestone={milestone} 
                      isLast={index === project.milestones.length - 1}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Updates */}
            {project.updates.length > 0 && (
              <section className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-6">Recent Updates</h2>
                <div className="space-y-6">
                  {project.updates.map((update) => (
                    <UpdateItem key={update.id} update={update} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Deliverables */}
            {project.deliverables.length > 0 && (
              <section className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Deliverables</h2>
                <div className="space-y-3">
                  {project.deliverables.map((deliverable) => (
                    <DeliverableItem key={deliverable.id} deliverable={deliverable} />
                  ))}
                </div>
              </section>
            )}

            {/* Empty State */}
            {project.milestones.length === 0 && project.updates.length === 0 && project.deliverables.length === 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
                <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No updates yet. Check back soon!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-16">
        <div className="max-w-4xl mx-auto px-6 py-6 text-center">
          <p className="text-slate-400 text-sm">
            Powered by{' '}
            <a href="https://loopin.so" className="text-indigo-600 hover:text-indigo-700">
              Loopin
            </a>
          </p>
        </div>
      </footer>
    </main>
  )
}

function MilestoneItem({ milestone, isLast }: { milestone: Milestone, isLast: boolean }) {
  const statusConfig = {
    complete: {
      icon: <CheckCircle className="w-6 h-6 text-green-500" />,
      lineColor: 'bg-green-500',
      textColor: 'text-slate-800',
    },
    in_progress: {
      icon: <div className="w-6 h-6 rounded-full border-2 border-indigo-500 bg-indigo-100 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-indigo-500" />
      </div>,
      lineColor: 'bg-slate-200',
      textColor: 'text-slate-800',
    },
    not_started: {
      icon: <Circle className="w-6 h-6 text-slate-300" />,
      lineColor: 'bg-slate-200',
      textColor: 'text-slate-500',
    },
  }

  const config = statusConfig[milestone.status]

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        {config.icon}
        {!isLast && (
          <div className={`w-0.5 h-full mt-2 ${config.lineColor}`} />
        )}
      </div>
      <div className="pb-6">
        <h3 className={`font-medium ${config.textColor}`}>{milestone.title}</h3>
        {milestone.description && (
          <p className="text-slate-500 text-sm mt-1">{milestone.description}</p>
        )}
        {milestone.due_date && (
          <div className="flex items-center gap-1 text-slate-400 text-sm mt-2">
            <Calendar className="w-4 h-4" />
            {new Date(milestone.due_date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function UpdateItem({ update }: { update: Update }) {
  return (
    <div className="border-l-2 border-indigo-200 pl-4">
      <p className="text-slate-400 text-sm mb-2">
        {new Date(update.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </p>
      <p className="text-slate-700 whitespace-pre-wrap">{update.content}</p>
      {update.attachment_url && (
        <a
          href={update.attachment_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 text-sm mt-2"
        >
          <FileText className="w-4 h-4" />
          {update.attachment_name || 'Attachment'}
        </a>
      )}
    </div>
  )
}

function DeliverableItem({ deliverable }: { deliverable: Deliverable }) {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <a
      href={deliverable.file_url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition group"
    >
      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
        <Download className="w-5 h-5 text-indigo-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-800 truncate">{deliverable.name}</p>
        <p className="text-slate-400 text-sm">{formatFileSize(deliverable.file_size)}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition" />
    </a>
  )
}
