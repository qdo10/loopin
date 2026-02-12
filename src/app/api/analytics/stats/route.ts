import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json({ error: 'Missing projectId' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Get total views
    const { count: totalViews } = await supabase
      .from('portal_views')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId)

    // Get views in last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const { count: weeklyViews } = await supabase
      .from('portal_views')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId)
      .gte('viewed_at', sevenDaysAgo.toISOString())

    // Get views in last 24 hours
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)
    
    const { count: dailyViews } = await supabase
      .from('portal_views')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId)
      .gte('viewed_at', oneDayAgo.toISOString())

    // Get recent views with timestamps
    const { data: recentViews } = await supabase
      .from('portal_views')
      .select('viewed_at')
      .eq('project_id', projectId)
      .order('viewed_at', { ascending: false })
      .limit(10)

    return NextResponse.json({
      totalViews: totalViews || 0,
      weeklyViews: weeklyViews || 0,
      dailyViews: dailyViews || 0,
      recentViews: recentViews || [],
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 })
  }
}
