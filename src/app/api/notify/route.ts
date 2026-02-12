import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// This would integrate with an email service like Resend, SendGrid, or Postmark
// For now, we'll set up the structure and log the notification

export async function POST(request: NextRequest) {
  try {
    const { projectId, updateContent, userId } = await request.json()

    if (!projectId || !updateContent || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Get project and client info
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('name, client_name, client_email, user_id')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Verify user owns this project
    if (project.user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get user's business info
    const { data: user } = await supabase
      .from('users')
      .select('name, business_name, email')
      .eq('id', userId)
      .single()

    if (!project.client_email) {
      return NextResponse.json({ 
        success: false, 
        message: 'No client email set for this project' 
      })
    }

    // TODO: Send actual email using Resend/SendGrid/Postmark
    // For now, log what would be sent
    const emailData = {
      to: project.client_email,
      subject: `Update on ${project.name}`,
      from_name: user?.business_name || user?.name || 'Your freelancer',
      project_name: project.name,
      update_preview: updateContent.substring(0, 200),
      // portal_link would be generated here
    }

    console.log('Would send email:', emailData)

    // In production, you'd call:
    // await resend.emails.send({
    //   from: 'updates@loopin.so',
    //   to: project.client_email,
    //   subject: `Update on ${project.name}`,
    //   html: renderEmailTemplate(emailData),
    // })

    return NextResponse.json({ 
      success: true, 
      message: 'Notification sent',
      // In production, return actual send status
    })
  } catch (error) {
    console.error('Notify error:', error)
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 })
  }
}
