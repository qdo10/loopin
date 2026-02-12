import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { projectId, password, userId } = await request.json()

    if (!projectId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Verify user owns this project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', projectId)
      .single()

    if (projectError || !project || project.user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    let passwordHash = null
    if (password && password.trim()) {
      // Hash the password
      passwordHash = await bcrypt.hash(password, 10)
    }

    // Update project with password
    const { error: updateError } = await supabase
      .from('projects')
      .update({ password_hash: passwordHash })
      .eq('id', projectId)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update password' }, { status: 500 })
    }

    return NextResponse.json({ success: true, hasPassword: !!passwordHash })
  } catch (error) {
    console.error('Set password error:', error)
    return NextResponse.json({ error: 'Failed to set password' }, { status: 500 })
  }
}
