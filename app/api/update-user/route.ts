import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: Request) {
  const {
    email,
    player_name,
    is_active,
    is_editor,
    is_admin,
    player_id,
    auth_user_id,
  } = await req.json()

  // Update the email in auth.users
  const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(auth_user_id, {
    email,
  })

  if (authError) {
    console.error("Auth update failed:", authError)
    return Response.json({ error: authError.message }, { status: 400 })
  }

  // Update the players table
  const { error: dbError } = await supabaseAdmin
    .from('players')
    .update({
      player_name,
      is_active,
      is_editor,
      is_admin,
    })
    .eq('player_id', player_id)

  if (dbError) {
    console.error("Player update failed:", authError)
    return Response.json({ error: dbError.message }, { status: 500 })
  }

  return Response.json({ message: 'User updated successfully' }, { status: 200 })
}
