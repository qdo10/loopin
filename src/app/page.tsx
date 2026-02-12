'use client'

import Link from 'next/link'
import { ArrowRight, Check, Users, FileText, Clock, Share2 } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Nav */}
      <nav className="flex justify-between items-center px-6 py-4 max-w-6xl mx-auto">
        <div className="text-2xl font-bold text-white">
          Loop<span className="text-indigo-400">in</span>
        </div>
        <div className="flex gap-4">
          <Link 
            href="/login" 
            className="text-slate-300 hover:text-white transition"
          >
            Log in
          </Link>
          <Link 
            href="/signup" 
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-20 max-w-4xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
          Keep clients in the loop,
          <br />
          <span className="text-indigo-400">without the chaos</span>
        </h1>
        <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
          Beautiful client portals for freelancers. Share project progress, 
          deliverables, and updates — no client login required.
        </p>
        <div className="flex gap-4 justify-center">
          <Link 
            href="/signup" 
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold flex items-center gap-2 transition"
          >
            Start Free <ArrowRight className="w-5 h-5" />
          </Link>
          <Link 
            href="/demo" 
            className="border border-slate-600 hover:border-slate-500 text-white px-8 py-4 rounded-xl text-lg transition"
          >
            See Demo
          </Link>
        </div>
        <p className="text-slate-500 mt-4 text-sm">
          Free plan includes 1 active project. No credit card required.
        </p>
      </section>

      {/* Features */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Everything you need, nothing you don't
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <FeatureCard 
            icon={<Share2 className="w-8 h-8" />}
            title="Share with a link"
            description="No client login needed. Just share a link and your client sees their project status instantly."
          />
          <FeatureCard 
            icon={<Clock className="w-8 h-8" />}
            title="Timeline & milestones"
            description="Show project phases with clear status indicators. Clients always know what's done and what's next."
          />
          <FeatureCard 
            icon={<FileText className="w-8 h-8" />}
            title="Deliverables in one place"
            description="Upload files and let clients download them from a clean, organized interface."
          />
          <FeatureCard 
            icon={<Users className="w-8 h-8" />}
            title="Look professional"
            description="Beautiful by default. Make a great impression without any design work."
          />
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-20 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Simple pricing
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <PricingCard 
            name="Free"
            price="$0"
            description="Perfect to try it out"
            features={[
              '1 active project',
              'Unlimited milestones',
              'File uploads (100MB)',
              'Shareable link'
            ]}
            cta="Get Started"
            href="/signup"
          />
          <PricingCard 
            name="Pro"
            price="$9"
            period="/month"
            description="For active freelancers"
            features={[
              'Unlimited projects',
              'File uploads (5GB)',
              'Password protection',
              'Custom branding (soon)',
              'Priority support'
            ]}
            cta="Start Free Trial"
            href="/signup?plan=pro"
            highlighted
          />
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Ready to impress your clients?
        </h2>
        <p className="text-slate-300 mb-8">
          Join freelancers who use Loopin to deliver a professional experience.
        </p>
        <Link 
          href="/signup" 
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold inline-flex items-center gap-2 transition"
        >
          Get Started Free <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-slate-700">
        <div className="max-w-6xl mx-auto flex justify-between items-center text-slate-400 text-sm">
          <div>© 2026 Loopin. All rights reserved.</div>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition">Terms</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
      <div className="text-indigo-400 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400">{description}</p>
    </div>
  )
}

function PricingCard({ 
  name, 
  price, 
  period, 
  description, 
  features, 
  cta, 
  href, 
  highlighted 
}: { 
  name: string
  price: string
  period?: string
  description: string
  features: string[]
  cta: string
  href: string
  highlighted?: boolean 
}) {
  return (
    <div className={`rounded-xl p-8 ${highlighted ? 'bg-indigo-600 border-2 border-indigo-400' : 'bg-slate-800/50 border border-slate-700'}`}>
      <h3 className={`text-lg font-semibold ${highlighted ? 'text-indigo-100' : 'text-slate-300'}`}>{name}</h3>
      <div className="mt-2 mb-4">
        <span className="text-4xl font-bold text-white">{price}</span>
        {period && <span className="text-slate-300">{period}</span>}
      </div>
      <p className={`mb-6 ${highlighted ? 'text-indigo-100' : 'text-slate-400'}`}>{description}</p>
      <ul className="space-y-3 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2 text-white">
            <Check className={`w-5 h-5 ${highlighted ? 'text-indigo-200' : 'text-indigo-400'}`} />
            {feature}
          </li>
        ))}
      </ul>
      <Link 
        href={href}
        className={`block text-center py-3 rounded-lg font-semibold transition ${
          highlighted 
            ? 'bg-white text-indigo-600 hover:bg-slate-100' 
            : 'bg-indigo-500 text-white hover:bg-indigo-600'
        }`}
      >
        {cta}
      </Link>
    </div>
  )
}
