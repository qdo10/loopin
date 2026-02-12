'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Check, Zap, CreditCard, Loader2 } from 'lucide-react'

export default function BillingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)
  const [user, setUser] = useState<{ id: string; email: string; subscription_status: string } | null>(null)
  const [projectCount, setProjectCount] = useState(0)

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      router.push('/login')
      return
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('id, email, subscription_status')
      .eq('id', authUser.id)
      .single()

    if (profile) {
      setUser(profile)
    }

    // Get project count
    const { count } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', authUser.id)
      .eq('status', 'active')

    setProjectCount(count || 0)
    setLoading(false)
  }

  const handleUpgrade = async () => {
    if (!user) return
    setUpgrading(true)

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
        }),
      })

      const { url, error } = await res.json()
      if (error) throw new Error(error)
      
      window.location.href = url
    } catch (error) {
      console.error('Upgrade error:', error)
      alert('Failed to start upgrade. Please try again.')
      setUpgrading(false)
    }
  }

  const handleManageBilling = async () => {
    if (!user) return

    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })

      const { url, error } = await res.json()
      if (error) throw new Error(error)
      
      window.location.href = url
    } catch (error) {
      console.error('Portal error:', error)
      alert('Failed to open billing portal.')
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
      </main>
    )
  }

  const isPro = user?.subscription_status === 'pro'

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
        <h1 className="text-3xl font-bold text-white mb-2">Billing</h1>
        <p className="text-slate-400 mb-8">Manage your subscription</p>

        {/* Current Plan */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Current Plan</h2>
              <p className="text-slate-400 mt-1">
                {isPro ? 'Pro' : 'Free'} Plan
              </p>
            </div>
            {isPro && (
              <span className="bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full text-sm font-medium">
                Active
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-slate-300">
            <div>
              <span className="text-2xl font-bold">{projectCount}</span>
              <span className="text-slate-500">/{isPro ? '∞' : '1'}</span>
            </div>
            <span className="text-slate-500">active projects</span>
          </div>

          {isPro && (
            <button
              onClick={handleManageBilling}
              className="mt-4 text-indigo-400 hover:text-indigo-300 flex items-center gap-2 text-sm"
            >
              <CreditCard className="w-4 h-4" />
              Manage billing
            </button>
          )}
        </div>

        {/* Upgrade Card */}
        {!isPro && (
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl p-6">
            <div className="flex items-center gap-2 text-indigo-200 mb-2">
              <Zap className="w-5 h-5" />
              <span className="font-medium">Upgrade to Pro</span>
            </div>
            <div className="mb-4">
              <span className="text-4xl font-bold text-white">$9</span>
              <span className="text-indigo-200">/month</span>
            </div>

            <ul className="space-y-2 mb-6">
              {[
                'Unlimited projects',
                '5GB file storage',
                'Password protected portals',
                'Custom branding (coming soon)',
                'Priority support',
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-white">
                  <Check className="w-4 h-4 text-indigo-300" />
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={handleUpgrade}
              disabled={upgrading}
              className="w-full bg-white hover:bg-slate-100 text-indigo-600 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
            >
              {upgrading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Redirecting to checkout...
                </>
              ) : (
                'Upgrade Now'
              )}
            </button>
          </div>
        )}

        {/* Pro User Benefits */}
        {isPro && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Your Pro Benefits</h3>
            <ul className="space-y-2">
              {[
                'Unlimited projects',
                '5GB file storage',
                'Password protected portals',
                'Custom branding (coming soon)',
                'Priority support',
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-slate-300">
                  <Check className="w-4 h-4 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  )
}
