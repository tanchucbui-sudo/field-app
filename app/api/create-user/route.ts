import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { email, password, full_name, role, project_id } = await req.json()
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
  const { data, error } = await supabase.auth.admin.createUser({
    email, password, email_confirm: true,
    user_metadata: { full_name }
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  await supabase.from('profiles').update({ role }).eq('id', data.user.id)

  if (project_id && role === 'field_user') {
    await supabase.from('project_members').insert({ project_id, user_id: data.user.id })
  }
  return NextResponse.json({ success: true })
}
