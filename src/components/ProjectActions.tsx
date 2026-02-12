'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  MoreHorizontal, Copy, Archive, CheckCircle2, 
  Trash2, RotateCcw, Loader2, X 
} from 'lucide-react'

interface ProjectActionsProps {
  projectId: string
  projectName: string
  status: 'active' | 'completed' | 'archived'
  onStatusChange: () => void
}

export default function ProjectActions({ 
  projectId, 
  projectName, 
  status, 
  onStatusChange 
}: ProjectActionsProps) {
  const router = useRouter()
  const [showMenu, setShowMenu] = useState(false)
  const [showConfirm, setShowConfirm] = useState<'delete' | 'duplicate' | null>(null)
  const [loading, setLoading] = useState(false)

  const updateStatus = async (newStatus: 'active' | 'completed' | 'archived') => {
    setLoading(true)
    await supabase
      .from('projects')
      .update({ status: newStatus })
      .eq('id', projectId)
    
    setLoading(false)
    setShowMenu(false)
    onStatusChange()
  }

  const duplicateProject = async () => {
    setLoading(true)

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Get original project with milestones
    const { data: original } = await supabase
      .from('projects')
      .select('*, milestones(*)')
      .eq('id', projectId)
      .single()

    if (!original) {
      setLoading(false)
      return
    }

    // Create new project
    const { data: newProject, error } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        name: `${original.name} (Copy)`,
        client_name: original.client_name,
        client_email: original.client_email,
        description: original.description,
        status: 'active',
      })
      .select()
      .single()

    if (error || !newProject) {
      setLoading(false)
      alert('Failed to duplicate project')
      return
    }

    // Copy milestones
    if (original.milestones && original.milestones.length > 0) {
      await supabase
        .from('milestones')
        .insert(
          original.milestones.map((m: any, index: number) => ({
            project_id: newProject.id,
            title: m.title,
            description: m.description,
            due_date: m.due_date,
            status: 'not_started',
            order: index,
          }))
        )
    }

    setLoading(false)
    setShowConfirm(null)
    router.push(`/dashboard/project/${newProject.id}`)
  }

  const deleteProject = async () => {
    setLoading(true)
    await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
    
    setLoading(false)
    router.push('/dashboard')
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
      >
        <MoreHorizontal className="w-5 h-5" />
      </button>

      {showMenu && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 top-10 bg-slate-800 border border-slate-700 rounded-lg py-2 w-56 z-20 shadow-xl">
            {status === 'active' && (
              <button
                onClick={() => updateStatus('completed')}
                disabled={loading}
                className="w-full flex items-center gap-3 px-4 py-2 text-slate-300 hover:bg-slate-700 transition text-left"
              >
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Mark Complete
              </button>
            )}

            {status === 'completed' && (
              <button
                onClick={() => updateStatus('active')}
                disabled={loading}
                className="w-full flex items-center gap-3 px-4 py-2 text-slate-300 hover:bg-slate-700 transition text-left"
              >
                <RotateCcw className="w-4 h-4" />
                Reopen Project
              </button>
            )}

            {status !== 'archived' && (
              <button
                onClick={() => updateStatus('archived')}
                disabled={loading}
                className="w-full flex items-center gap-3 px-4 py-2 text-slate-300 hover:bg-slate-700 transition text-left"
              >
                <Archive className="w-4 h-4" />
                Archive
              </button>
            )}

            {status === 'archived' && (
              <button
                onClick={() => updateStatus('active')}
                disabled={loading}
                className="w-full flex items-center gap-3 px-4 py-2 text-slate-300 hover:bg-slate-700 transition text-left"
              >
                <RotateCcw className="w-4 h-4" />
                Restore Project
              </button>
            )}

            <div className="border-t border-slate-700 my-2" />

            <button
              onClick={() => {
                setShowMenu(false)
                setShowConfirm('duplicate')
              }}
              disabled={loading}
              className="w-full flex items-center gap-3 px-4 py-2 text-slate-300 hover:bg-slate-700 transition text-left"
            >
              <Copy className="w-4 h-4" />
              Duplicate Project
            </button>

            <div className="border-t border-slate-700 my-2" />

            <button
              onClick={() => {
                setShowMenu(false)
                setShowConfirm('delete')
              }}
              disabled={loading}
              className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-slate-700 transition text-left"
            >
              <Trash2 className="w-4 h-4" />
              Delete Project
            </button>
          </div>
        </>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-white">
                {showConfirm === 'delete' ? 'Delete Project' : 'Duplicate Project'}
              </h3>
              <button
                onClick={() => setShowConfirm(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-slate-400 mb-6">
              {showConfirm === 'delete' 
                ? `Are you sure you want to delete "${projectName}"? This action cannot be undone.`
                : `Create a copy of "${projectName}" with all milestones?`
              }
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(null)}
                className="flex-1 border border-slate-600 hover:border-slate-500 text-slate-300 py-2 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={showConfirm === 'delete' ? deleteProject : duplicateProject}
                disabled={loading}
                className={`flex-1 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition ${
                  showConfirm === 'delete'
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                }`}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {showConfirm === 'delete' ? 'Delete' : 'Duplicate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
