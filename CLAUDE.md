# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js application for tracking Ultimate Frisbee footage, stats, and clips. The app provides a bridge between scattered video footage and basic statistical analysis, allowing teams to catalog footage from various sources (YouTube, Veo, Google Drive) and track game/training statistics.

## Development Commands

```bash
# Development server (uses Turbopack)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Linting (note: eslint errors don't block builds - see next.config.ts)
npm run lint
```

## Required Environment Variables

The app requires two Supabase environment variables:

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous/public key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (for admin operations)

These are used in `lib/supabase.ts` and `lib/supabase-admin.ts`.

## Architecture

### Core Data Model

The app is built around a hierarchical data model:

1. **Sources** - URLs pointing to video footage (YouTube, Veo, Google Drive)
2. **Events** - Games, trainings, or scrimmages (event-agnostic to sources)
3. **Points** - Individual points within events, linked to specific timestamps in sources
4. **Possessions** - Offensive possessions within points, containing detailed play data
5. **Clips** - Timestamped video segments that can be tagged to players, teams, events, or playlists

Additional entities:
- **Teams** - Team management with home team designation
- **Players** - Player records linked to teams and auth users
- **Playlists** - Collections of clips
- **Strategies** - Offensive/defensive strategies categorized by type (initiation vs main)

### Authentication Pattern

Authentication uses a custom username-to-email mapping system:
- Usernames are converted to `${username}@app.local` format (see `lib/auth-context.tsx:21`)
- Supabase handles auth, but user profiles are stored in the `players` table
- The `AuthContext` provides `user` (Supabase auth user) and `player` (app-specific player data)
- Use `<AuthWrapper>` component to protect routes (supports `requireAdmin` prop)
- Use `useAuth()` for general auth access, `useRequireAuth()` to auto-redirect to login

### Supabase Integration

Two Supabase clients exist:
- `lib/supabase.ts` - Client for regular authenticated operations
- `lib/supabase-admin.ts` - Admin client using service role key (for privileged operations)

Each feature directory (`app/events/`, `app/clips/`, etc.) has its own `supabase.ts` file containing feature-specific database queries.

### Timestamp Handling

Timestamps are handled differently based on video provider:
- **YouTube**: Converted to seconds, embedded URLs use `?start=<seconds>`
- **Veo**: Uses hash format `#t=<timestamp>`
- **Google Drive**: Uses query param `?start=<seconds>` or `&start=<seconds>`

Key utility functions in `lib/utils.ts`:
- `getFootageProvider(url)` - Detects provider from URL
- `convertTimestampToSeconds(timestamp)` - Handles HH:MM:SS, MM:SS, or seconds
- `convertYoutubeUrlToEmbed(url, seconds)` - Creates YouTube embed URLs
- `baseUrlToTimestampUrl(url, timestamp)` - Generates provider-specific timestamp URLs

### State Management

- Uses `@tanstack/react-query` for server state (see `usePointFormData` hook)
- Form state managed with `react-hook-form` and `@hookform/resolvers`
- Zod schemas for validation (e.g., `app/possessions/possessions.schema.ts`)
- Chakra UI's `createListCollection` for dropdown data

### Statistics Calculation

Statistics are computed client-side from possession data:
- `app/stats/player/player-base-stats.ts` - Player stat calculations (goals, assists, Ds, turnovers, +/-, points played)
- `app/stats/game/game-stats.ts` - Game-level statistics
- `app/stats/game/game-flow.ts` - Score progression and game flow
- Stats are derived from the `possessions` table which tracks detailed play-by-play data

### Possession Data Structure

Possessions track:
- **Outcome**: Score or Turnover (required field)
- **Players**: Score player, assist player, turnover thrower/receiver, D player
- **Strategies**: Offensive/defensive initiation and main strategies
- **Zones**: Field zones for turnovers (1-12)
- **Details**: Number of throws, turnover reason, score method

Forms use array-based selection (see `possessions.schema.ts`) where Chakra UI select components return arrays.

### Component Patterns

- **Feature pages**: Located in `app/[feature]/page.tsx`
- **Components**: Feature-specific components in `app/[feature]/components/`, shared components in `components/`
- **Supabase queries**: Feature-specific queries in `app/[feature]/supabase.ts`
- **UI components**: Custom Chakra UI components in `components/ui/`
- **Page structure**: Most pages use `<AuthWrapper>` + content component pattern

Common shared components:
- `<StandardHeader>` - Page headers with admin controls
- `<AuthWrapper>` - Authentication boundary with loading states
- `<Modal>` - Reusable modal component
- `components/ui/` - Custom Chakra UI component library

### Player Search Feature

The app includes a player search system (`app/playersearch/`) that uses scraped data from EUCS events (stored in `scraped_players` table) to help identify players on unfamiliar teams. Players can be imported from this data into your teams.

### Key Workflows

**Adding a point:**
1. Navigate to event → Points tab → Add point
2. Select source and enter timestamp
3. Select offensive team (defensive team auto-calculated)
4. Optionally select 7 players (if home team exists)
5. Route: `/events/[id]/new-point` → redirects to `/events/[id]/[point_id]` for stat entry

**Taking stats:**
1. Point page (`/events/[id]/[point_id]`) displays possession form
2. Fill possession details (outcome required, other fields optional)
3. Add multiple possessions until point completes
4. Each possession tracks strategies, players, zones, and outcomes

**Adding clips:**
1. Via point stat page (clip icon) - auto-assigns to current event
2. Via playlist page - manual assignment to playlists, teams, players
3. Clips store source_id + timestamp for video reference

## Database Schema

The database schema is documented in the README.md file. Key tables:
- `sources`, `events`, `points`, `possessions` - Core footage/stats hierarchy
- `teams`, `players`, `point_players` - Team/player management
- `clips`, `playlists` - Clip management
- `strategies` - Play strategies (categorized by play_type and strategy_type)
- `scraped_players` - External player data for identification

Important relationships:
- Points → Events (many-to-one)
- Points → Sources (many-to-one, optional)
- Possessions → Points (many-to-one)
- Players → Teams (many-to-one)
- Players → Auth Users (one-to-one via auth_user_id)
