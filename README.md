# Frisbee Footage Tracker
Teams typically use footage from a wide range of (online) places, the intention
of this app is mainly to keep track of all the footage regardless
of where it is, as well as the ability to take some basic stats and perform
some rudimentary data analysis. It's by no means meant to be a replacement
for the more dedicated stat taking apps/websites, but to be a bridge between footage and stats.
This application is built using Next.js. For the backend, it uses Supabase, which provides a PostgreSQL database along with user authentication and storage services.

## Structure
Conceptually, the entire app is just built upon `sources` - just URLs pointing
to wherever your footage is housed. Then, on top of sources, you can have
`events`, these can be `games` or `trainings`. Events don't necessarily 
have direct links to sources, since some sources may contain multiple games or 
maybe one game spans across multiple sources. Users can also save `clips`, which
, again,  are just links to specific timestamps in the video; they can be assigned to
players, teams and events, or, can just be added to playlists.

## How to use:

### Adding a source
As sources are the building blocks of the app, you must first check if the footage
you are planning on viewing/statting/adding has been added yet. Clicking on the
**sources** tile of the homepage will take you to a list of all added sources, if
the footage hasn't been added yet, click + button in the bottom right
of your screen. This will prompt you for some basic info about the source and when
you have filled it in, click **Add**.

### Adding an event
Clicking on the **events** tile on the homepage will take you to a list of all
added events, clicking one of these will take you to that event's page, if
you need to add a new event, use the + button in the bottom right corner.
After choosing your event type, you will prompted to enter some basic info about
the event, enter this and then click **Add**. As mentioned above, an event doesn't
necessarily link to a specific video and so is source agnostic.

### Taking stats for a game
Once on an events page, click on the **points** tab, this will list all points that
have already been added, clicking one of these will take you to the point overview.
To add a new point, click on the + button in the bottom right. This will prompt you
for the source the point can be found on, the timestamp (this should be typed exactly 
as shown on whichever host site your using) and the offensive team. After clicking **Add**
you will be taken to a new page to start tracking. Fill out the inputs on the page - only
the possession outcome input is required, everything else is up to the user and how
much information they would like to keep track, bare in mind that quite a few features on 
the app will require other information to be filled out though. When you have filled out the
scoring possession's information, you will be able to click the **Add Point** button at
the bottom of the page.

### Adding clips
There are two main ways you can add a clip:
- When you are taking stats for a particular point there will be a clip icon in the
bottom right, clicking on this will open a pop up where you can enter some details
about the clip. When adding a clip this way, you will be assigning it to the current
event - you can also assign the clip to a specific player, team or playlist and it 
will appear on the corresponding page.
- If you are on a playlist (**home -> playlists -> playlist**), you can click on
the button in the bottom right to add a new clip, where you will be prompted for 
the required info.

### Player Search
One of the trickier parts of stat taking is knowing players on teams you are unfamiliar with,
one possible solution to this is using the Player Search page. This provides a table of scraped
data from various EUCS events wher you can find player names and numbers for teams involved
in those events. Clicking on a players row will give you the option to assign them to one
of the teams you have created on your app.


## Supabase schema
Below if the SQL definition of the base tables for the app that you can run in Supabase.

```
CREATE TABLE public.clips (
  players jsonb,
  teams jsonb,
  title text NOT NULL,
  description text,
  timestamp text NOT NULL,
  clip_id uuid NOT NULL DEFAULT gen_random_uuid(),
  is_public boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  event_id uuid,
  created_by uuid NOT NULL DEFAULT auth.uid(),
  source_id uuid,
  playlists jsonb,
  CONSTRAINT clips_pkey PRIMARY KEY (clip_id),
  CONSTRAINT clips_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(event_id),
  CONSTRAINT clips_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id),
  CONSTRAINT clips_source_id_fkey FOREIGN KEY (source_id) REFERENCES public.sources(source_id)
);
CREATE TABLE public.events (
  event_name text NOT NULL,
  event_date date NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['Game'::text, 'Training'::text, 'Scrimmage'::text])),
  team_1_id uuid NOT NULL,
  team_2_id uuid NOT NULL,
  event_id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  notes text,
  teams jsonb,
  CONSTRAINT events_pkey PRIMARY KEY (event_id),
  CONSTRAINT events_team_1_id_fkey FOREIGN KEY (team_1_id) REFERENCES public.teams(team_id),
  CONSTRAINT events_team_2_id_fkey FOREIGN KEY (team_2_id) REFERENCES public.teams(team_id)
);
CREATE TABLE public.players (
  is_active boolean DEFAULT true,
  player_name text NOT NULL,
  team_id uuid,
  player_id uuid NOT NULL DEFAULT gen_random_uuid(),
  is_admin boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  number integer,
  auth_user_id uuid,
  notes text,
  is_editor boolean NOT NULL DEFAULT false,
  CONSTRAINT players_pkey PRIMARY KEY (player_id),
  CONSTRAINT players_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(team_id),
  CONSTRAINT players_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.playlists (
  title text NOT NULL,
  description text,
  playlist_id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  is_public boolean NOT NULL DEFAULT true,
  created_by uuid NOT NULL DEFAULT auth.uid(),
  CONSTRAINT playlists_pkey PRIMARY KEY (playlist_id),
  CONSTRAINT playlists_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);
CREATE TABLE public.point_players (
  point_id uuid NOT NULL,
  player_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT point_players_pkey PRIMARY KEY (point_id, player_id),
  CONSTRAINT point_players_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(player_id),
  CONSTRAINT point_players_point_id_fkey FOREIGN KEY (point_id) REFERENCES public.points(point_id)
);
CREATE TABLE public.points (
  offence_team_players jsonb,
  defence_team_players jsonb,
  timestamp_seconds integer NOT NULL DEFAULT 0,
  event_id uuid NOT NULL,
  timestamp text,
  source_id uuid,
  offence_team uuid,
  defence_team uuid,
  point_id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT points_pkey PRIMARY KEY (point_id),
  CONSTRAINT points_defence_team_fkey FOREIGN KEY (defence_team) REFERENCES public.teams(team_id),
  CONSTRAINT points_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(event_id),
  CONSTRAINT points_offence_team_fkey FOREIGN KEY (offence_team) REFERENCES public.teams(team_id),
  CONSTRAINT points_source_id_fkey FOREIGN KEY (source_id) REFERENCES public.sources(source_id)
);
CREATE TABLE public.possessions (
  point_id uuid NOT NULL,
  throws integer,
  turn_throw_zone integer,
  turn_receive_zone integer,
  turnover_reason text,
  score_method text,
  score_player uuid,
  assist_player uuid,
  offence_team uuid,
  defence_team uuid,
  turn_thrower uuid,
  turn_intended_receiver uuid,
  d_player uuid,
  possession_number integer NOT NULL,
  possession_id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  is_score boolean NOT NULL DEFAULT false,
  defence_init uuid,
  defence_main uuid,
  offence_init uuid,
  offence_main uuid,
  CONSTRAINT possessions_pkey PRIMARY KEY (possession_id),
  CONSTRAINT possessions_assist_player_fkey FOREIGN KEY (assist_player) REFERENCES public.players(player_id),
  CONSTRAINT possessions_d_player_fkey FOREIGN KEY (d_player) REFERENCES public.players(player_id),
  CONSTRAINT possessions_defence_team_fkey FOREIGN KEY (defence_team) REFERENCES public.teams(team_id),
  CONSTRAINT possessions_offence_team_fkey FOREIGN KEY (offence_team) REFERENCES public.teams(team_id),
  CONSTRAINT possessions_point_id_fkey FOREIGN KEY (point_id) REFERENCES public.points(point_id),
  CONSTRAINT possessions_score_player_fkey FOREIGN KEY (score_player) REFERENCES public.players(player_id),
  CONSTRAINT possessions_turn_intended_receiver_fkey FOREIGN KEY (turn_intended_receiver) REFERENCES public.players(player_id),
  CONSTRAINT possessions_turn_thrower_fkey FOREIGN KEY (turn_thrower) REFERENCES public.players(player_id),
  CONSTRAINT possessions_defence_init_fkey FOREIGN KEY (defence_init) REFERENCES public.strategies(strategy_id),
  CONSTRAINT possessions_offence_init_fkey FOREIGN KEY (offence_init) REFERENCES public.strategies(strategy_id),
  CONSTRAINT possessions_offence_main_fkey FOREIGN KEY (offence_main) REFERENCES public.strategies(strategy_id),
  CONSTRAINT possessions_defence_main_fkey FOREIGN KEY (defence_main) REFERENCES public.strategies(strategy_id)
);
CREATE TABLE public.scraped_players (
  event_player_name text,
  unique_player_id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_player_number smallint,
  games integer,
  event_team_id integer,
  assists text,
  event_name text,
  goals text,
  event_team_name text,
  event_player_id bigint,
  CONSTRAINT scraped_players_pkey PRIMARY KEY (unique_player_id)
);
CREATE TABLE public.sources (
  title text,
  url text UNIQUE,
  recorded_date date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  source_id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL DEFAULT auth.uid(),
  CONSTRAINT sources_pkey PRIMARY KEY (source_id),
  CONSTRAINT sources_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);
CREATE TABLE public.strategies (
  strategy text NOT NULL DEFAULT ''::text,
  play_type text NOT NULL,
  strategy_type text,
  description text,
  strategy_id uuid NOT NULL DEFAULT gen_random_uuid(),
  CONSTRAINT strategies_pkey PRIMARY KEY (strategy_id)
);
CREATE TABLE public.teams (
  created_by uuid NOT NULL DEFAULT auth.uid(),
  team_name text UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  is_home_team boolean DEFAULT false,
  team_id uuid NOT NULL DEFAULT gen_random_uuid(),
  CONSTRAINT teams_pkey PRIMARY KEY (team_id),
  CONSTRAINT teams_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);
```



