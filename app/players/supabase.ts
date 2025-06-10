export type Player = {
  player_id: string;
  player_name: string;
  is_active: string;
  is_admin: string;
  is_editor: string;
  notes: string;
  username: string;
  number: number;
}

export type PlayerDetailed = Player & {
  team_id: string;
  team_name: string;
  is_home_team: string;
  auth_user_id: string;
}
