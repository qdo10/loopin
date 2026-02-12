'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'

export default function PortalPasswordPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/portal/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const data = await res.json()

      if (data.success) {
        // Store access in sessionStorage
        sessionStorage.setItem(`portal_access_${token}`, 'true')
        router.push(`/p/${token}`)
      } else {
        setError('Incorrect password')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-indigo-600" />
          </div>
          
          <h1 className="text-xl font-semibold text-slate-900 text-center mb-2">
            Protected Portal
          </h1>
          <p className="text-slate-500 text-center text-sm mb-6">
            Enter the password to view this project
          </p>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:border-indigo-500 transition mb-4"
              placeholder="Enter password"
              required
              autoFocus
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-3 rounded-lg font-medium transition"
            >
              {loading ? 'Verifying...' : 'View Project'}
            </button>
          </form>
        </div>

        <p className="text-slate-400 text-center text-sm mt-6">
          Powered by{' '}
          <a href="https://loopin.so" className="text-indigo-600 hover:text-indigo-700">
            Loopin
          </a>
        </p>
      </div>
    </main>
  )
}
