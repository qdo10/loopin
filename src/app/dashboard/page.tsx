'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Project } from '@/lib/types'
import { Plus, ExternalLink, MoreVertical, LogOut, Folder, CreditCard } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    checkAuth()
    loadProjects()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('name')
      .eq('id', user.id)
      .single()

    if (profile?.name) {
      setUserName(profile.name)
    }
  }

  const loadProjects = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setProjects(data)
    }
    setLoading(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const getPortalUrl = (shareToken: string) => {
    return `${window.location.origin}/p/${shareToken}`
  }

  return (
    <main className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-2xl font-bold text-white">
            Loop<span className="text-indigo-400">in</span>
          </Link>
          <div className="flex items-center gap-4">
            {userName && (
              <span className="text-slate-400">Hey, {userName.split(' ')[0]}</span>
            )}
            <Link
              href="/dashboard/billing"
              className="text-slate-400 hover:text-white transition flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              Billing
            </Link>
            <button
              onClick={handleSignOut}
              className="text-slate-400 hover:text-white transition flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Projects</h1>
            <p className="text-slate-400 mt-1">
              {projects.length} project{projects.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Link
            href="/dashboard/new"
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition"
          >
            <Plus className="w-5 h-5" />
            New Project
          </Link>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-slate-400 mt-4">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 bg-slate-800/30 rounded-xl border border-slate-700">
            <Folder className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No projects yet</h2>
            <p className="text-slate-400 mb-6">Create your first project to get started</p>
            <Link
              href="/dashboard/new"
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2 transition"
            >
              <Plus className="w-5 h-5" />
              Create Project
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                portalUrl={getPortalUrl(project.share_token)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

function ProjectCard({ project, portalUrl }: { project: Project, portalUrl: string }) {
  const [showMenu, setShowMenu] = useState(false)

  const statusColors = {
    active: 'bg-green-500/20 text-green-400 border-green-500/30',
    completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    archived: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  }

  const copyLink = () => {
    navigator.clipboard.writeText(portalUrl)
    setShowMenu(false)
    // Could add toast notification here
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{project.name}</h3>
          <p className="text-slate-400 text-sm">{project.client_name}</p>
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="text-slate-400 hover:text-white p-1"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-8 bg-slate-700 border border-slate-600 rounded-lg py-2 w-48 z-10 shadow-xl">
              <Link 
                href={`/dashboard/project/${project.id}`}
                className="block px-4 py-2 text-slate-300 hover:bg-slate-600 transition"
              >
                Edit Project
              </Link>
              <button 
                onClick={copyLink}
                className="w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-600 transition"
              >
                Copy Portal Link
              </button>
              <a 
                href={portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-2 text-slate-300 hover:bg-slate-600 transition"
              >
                View Portal
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className={`text-xs px-2 py-1 rounded-full border ${statusColors[project.status]}`}>
          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
        </span>
        <a
          href={portalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1"
        >
          View portal <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  )
}
