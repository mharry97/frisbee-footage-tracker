import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: Request) {
  const { email, password, player_name, team_id } = await req.json()

  const { data: user, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError || !user?.user) {
    return Response.json({ error: authError?.message }, { status: 400 })
  }

  const { error: dbError } = await supabaseAdmin.from('players').insert({
    auth_user_id: user.user.id,
    player_name,
    team_id,
    is_active: true,
  })

  if (dbError) {
    return Response.json({ error: dbError.message }, { status: 500 })
  }

  return Response.json({ message: 'User created' }, { status: 200 })
}
