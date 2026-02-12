import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, name, description, fileUrl, fileSize } = body

    if (!projectId || !name || !fileUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('deliverables')
      .insert({
        project_id: projectId,
        name,
        description: description || null,
        file_url: fileUrl,
        file_size: fileSize || 0,
      })
      .select()
      .single()

    if (error) {
      console.error('Deliverable error:', error)
      return NextResponse.json({ error: 'Failed to create deliverable' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Deliverable error:', error)
    return NextResponse.json({ error: 'Failed to create deliverable' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing deliverable id' }, { status: 400 })
    }

    const supabase = createServerClient()

    const { error } = await supabase
      .from('deliverables')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: 'Failed to delete deliverable' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete deliverable' }, { status: 500 })
  }
}
