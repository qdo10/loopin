'use client'

import Link from 'next/link'
import { CheckCircle, Circle, Clock, Download, Calendar, ArrowRight, ArrowLeft } from 'lucide-react'

// Demo data - shows what a client portal looks like
const demoProject = {
  name: 'Brand Identity Redesign',
  client_name: 'Acme Startup',
  description: 'Complete brand refresh including logo, color palette, typography, and brand guidelines.',
  milestones: [
    { id: '1', title: 'Discovery & Research', status: 'complete', due_date: '2026-01-15' },
    { id: '2', title: 'Concept Development', status: 'complete', due_date: '2026-01-25' },
    { id: '3', title: 'Logo Design', status: 'in_progress', due_date: '2026-02-05' },
    { id: '4', title: 'Brand Guidelines', status: 'not_started', due_date: '2026-02-15' },
    { id: '5', title: 'Final Delivery', status: 'not_started', due_date: '2026-02-20' },
  ],
  updates: [
    {
      id: '1',
      content: "Great news! We've completed the initial concept phase and have 3 strong logo directions to share. I'll be sending the presentation tomorrow for your review.",
      created_at: '2026-02-10T14:30:00Z',
    },
    {
      id: '2', 
      content: "Finished the competitive analysis and mood boards. Your brand positioning is looking really strong compared to competitors. Attached the research deck for your reference.",
      created_at: '2026-02-05T10:15:00Z',
    },
    {
      id: '3',
      content: 'Kicked off the project today! Started with stakeholder interviews and market research. Excited to bring your new brand to life.',
      created_at: '2026-01-12T09:00:00Z',
    },
  ],
  deliverables: [
    { id: '1', name: 'Brand Research Deck.pdf', file_size: 2450000 },
    { id: '2', name: 'Mood Boards.zip', file_size: 15800000 },
    { id: '3', name: 'Competitor Analysis.pdf', file_size: 1200000 },
  ],
}

export default function DemoPage() {
  const completedMilestones = demoProject.milestones.filter(m => m.status === 'complete').length
  const progress = Math.round((completedMilestones / demoProject.milestones.length) * 100)

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Demo Banner */}
      <div className="bg-indigo-600 text-white text-center py-3 px-4">
        <p className="text-sm">
          👀 This is a demo portal.{' '}
          <Link href="/signup" className="underline font-medium">
            Create your own free →
          </Link>
        </p>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Link 
            href="/" 
            className="text-slate-400 hover:text-slate-600 flex items-center gap-2 text-sm mb-4 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Loopin
          </Link>
          <div className="flex items-center gap-2 text-indigo-600 text-sm font-medium mb-2">
            <span>Project Portal</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{demoProject.name}</h1>
          <p className="text-slate-500">For {demoProject.client_name}</p>
          <p className="text-slate-600 mt-4">{demoProject.description}</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Progress Overview */}
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
            {completedMilestones} of {demoProject.milestones.length} milestones completed
          </p>
        </section>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Timeline */}
            <section className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-6">Timeline</h2>
              <div className="space-y-4">
                {demoProject.milestones.map((milestone, index) => (
                  <MilestoneItem 
                    key={milestone.id} 
                    milestone={milestone} 
                    isLast={index === demoProject.milestones.length - 1}
                  />
                ))}
              </div>
            </section>

            {/* Updates */}
            <section className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-6">Recent Updates</h2>
              <div className="space-y-6">
                {demoProject.updates.map((update) => (
                  <UpdateItem key={update.id} update={update} />
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Deliverables */}
            <section className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Deliverables</h2>
              <div className="space-y-3">
                {demoProject.deliverables.map((deliverable) => (
                  <DeliverableItem key={deliverable.id} deliverable={deliverable} />
                ))}
              </div>
            </section>

            {/* CTA */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 text-center">
              <p className="text-indigo-900 font-medium mb-2">Like what you see?</p>
              <p className="text-indigo-700 text-sm mb-4">Create portals like this for your own clients.</p>
              <Link 
                href="/signup"
                className="block bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium transition"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-16">
        <div className="max-w-4xl mx-auto px-6 py-6 text-center">
          <p className="text-slate-400 text-sm">
            Powered by{' '}
            <Link href="/" className="text-indigo-600 hover:text-indigo-700">
              Loopin
            </Link>
          </p>
        </div>
      </footer>
    </main>
  )
}

function MilestoneItem({ milestone, isLast }: { milestone: typeof demoProject.milestones[0], isLast: boolean }) {
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

  const config = statusConfig[milestone.status as keyof typeof statusConfig]

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
        {milestone.due_date && (
          <div className="flex items-center gap-1 text-slate-400 text-sm mt-1">
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

function UpdateItem({ update }: { update: typeof demoProject.updates[0] }) {
  return (
    <div className="border-l-2 border-indigo-200 pl-4">
      <p className="text-slate-400 text-sm mb-2">
        {new Date(update.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}
      </p>
      <p className="text-slate-700">{update.content}</p>
    </div>
  )
}

function DeliverableItem({ deliverable }: { deliverable: typeof demoProject.deliverables[0] }) {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition cursor-pointer group">
      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
        <Download className="w-5 h-5 text-indigo-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-800 truncate">{deliverable.name}</p>
        <p className="text-slate-400 text-sm">{formatFileSize(deliverable.file_size)}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition" />
    </div>
  )
}
