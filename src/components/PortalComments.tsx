'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, Send, User } from 'lucide-react'
import { Comment } from '@/lib/types'

interface PortalCommentsProps {
  projectId: string
}

export default function PortalComments({ projectId }: PortalCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)
  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [content, setContent] = useState('')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    loadComments()
    
    // Check if user has previously commented
    const savedName = localStorage.getItem('loopin_comment_name')
    const savedEmail = localStorage.getItem('loopin_comment_email')
    if (savedName) setName(savedName)
    if (savedEmail) setEmail(savedEmail)
  }, [projectId])

  const loadComments = async () => {
    try {
      const res = await fetch(`/api/comments?projectId=${projectId}`)
      if (res.ok) {
        const data = await res.json()
        setComments(data)
      }
    } catch (error) {
      console.error('Failed to load comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || !name.trim()) return

    setPosting(true)

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          content: content.trim(),
          authorName: name.trim(),
          authorEmail: email.trim() || null,
        }),
      })

      if (res.ok) {
        // Save user info for future comments
        localStorage.setItem('loopin_comment_name', name.trim())
        if (email.trim()) {
          localStorage.setItem('loopin_comment_email', email.trim())
        }

        setContent('')
        setShowForm(false)
        loadComments()
      }
    } catch (error) {
      console.error('Failed to post comment:', error)
    } finally {
      setPosting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <section className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-600" />
          Comments
        </h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
          >
            Leave a comment
          </button>
        )}
      </div>

      {/* Comment Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-slate-50 rounded-lg">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-indigo-500"
              placeholder="Your name *"
              required
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-indigo-500"
              placeholder="Email (optional)"
            />
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-indigo-500 resize-none mb-3"
            placeholder="Write a comment..."
            rows={3}
            required
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={posting || !content.trim() || !name.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {posting ? 'Posting...' : 'Post Comment'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false)
                setContent('')
              }}
              className="text-slate-500 hover:text-slate-700 px-4 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
        </div>
      ) : comments.length === 0 ? (
        <p className="text-slate-500 text-center py-8">
          No comments yet. Be the first to share your thoughts!
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-slate-900 text-sm">
                    {comment.author_name}
                  </span>
                  <span className="text-slate-400 text-xs">
                    {formatDate(comment.created_at)}
                  </span>
                </div>
                <p className="text-slate-700 text-sm whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
