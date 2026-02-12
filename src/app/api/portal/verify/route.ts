import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ success: false, error: 'Missing token or password' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Get project by share token
    const { data: project, error } = await supabase
      .from('projects')
      .select('password_hash')
      .eq('share_token', token)
      .single()

    if (error || !project) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })
    }

    if (!project.password_hash) {
      // No password set, allow access
      return NextResponse.json({ success: true })
    }

    // Verify password
    const isValid = await bcrypt.compare(password, project.password_hash)

    if (isValid) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ success: false, error: 'Incorrect password' }, { status: 401 })
    }
  } catch (error) {
    console.error('Portal verify error:', error)
    return NextResponse.json({ success: false, error: 'Verification failed' }, { status: 500 })
  }
}
