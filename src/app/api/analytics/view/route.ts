import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { projectId, userAgent, referrer } = await request.json()

    if (!projectId) {
      return NextResponse.json({ error: 'Missing projectId' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Record the view
    await supabase
      .from('portal_views')
      .insert({
        project_id: projectId,
        user_agent: userAgent || null,
        referrer: referrer || null,
        ip_hash: null, // Could hash IP for unique visitor tracking
      })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Failed to record view' }, { status: 500 })
  }
}
