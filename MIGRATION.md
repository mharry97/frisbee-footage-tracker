# Chakra UI → Tailwind CSS Migration Plan

## Design changes

### Dark mode only
The entire app is built around dark colours. Rather than trying to support both modes, the new design will be dark-only — no toggle, no system preference detection. Tailwind's `dark:` variant won't be needed at all. This removes the need for `next-themes` entirely.

Colour palette (Tailwind classes throughout):

| Role | Class | Hex |
|------|-------|-----|
| Page background | `bg-gray-950` | #030712 |
| Surface (cards, modals, sidebar) | `bg-gray-900` | #111827 |
| Elevated surface (inputs, dropdowns) | `bg-gray-800` | #1f2937 |
| Border | `border-gray-700` | #374151 |
| Primary text | `text-gray-100` | #f3f4f6 |
| Muted text | `text-gray-400` | #9ca3af |
| Accent | `text-yellow-400` / `bg-yellow-400` | #facc15 |
| Accent hover | `bg-yellow-300` | #fde047 |
| Danger | `text-red-400` | #f87171 |

### Layout — sidebar on desktop, collapsible on mobile

The current layout uses `Container maxW="4xl"` (896px cap) on most pages and a horizontal scrolling icon menu that gives up all the horizontal space a desktop/laptop has.

New layout structure:

```
┌─────────────────────────────────────────────────────┐
│  Sidebar (240px, fixed)  │  Main content (flex-1)   │
│                          │                          │
│  [icon] Sources          │  <page content here,     │
│  [icon] Events           │   no max-width cap>      │
│  [icon] Playlists        │                          │
│  [icon] Strategies       │                          │
│  ...                     │                          │
└─────────────────────────────────────────────────────┘
```

On mobile (`< md`), the sidebar collapses — replaced by a hamburger button that opens a slide-in drawer or a fixed bottom nav strip (to decide during implementation, the current horizontal scroll icon menu works fine as a fallback).

**Root layout structure (replaces current `Container maxW` per-page pattern):**

```tsx
// app/layout.tsx — wraps all pages
<div className="flex min-h-screen bg-gray-950 text-gray-100">
  <Sidebar />  {/* fixed left, hidden on mobile */}
  <main className="flex-1 md:ml-60 p-6">
    {children}
  </main>
</div>
```

This means:
- `Container maxW="4xl"` gets removed from every page — content fills the available space naturally
- The `Header` component (back button + page title) stays but no longer needs to manage width
- `MainMenu` and `CollapsibleMainMenu` are replaced by a single `Sidebar` component
- Inner pages that currently show `CollapsibleMainMenu` get the sidebar for free from the layout

---

## Key findings from audit

- **52 of 58** files in `components/ui/` are unused dead code — can be deleted immediately
- Only **6** `components/ui/` files are actually used: `floating-plus`, `loading-spinner`, `provider`, `password-input`, `player-grid`, `add-player-button`
- `chakra-react-select` is dead code — the one component using it (`AddableSupabaseSelect`) is never imported anywhere
- `components/modal.tsx` already uses no Chakra at all
- The vast majority of Chakra usage is layout primitives: `Box`, `Text`, `HStack`, `VStack`, `Container`, `Button` — these are just divs/elements with Tailwind classes

## What stays untouched

- Supabase (backend, queries, auth)
- react-hook-form + zod (form state management)
- @tanstack/react-query (data fetching)
- All data logic, types, and hooks (except removing `createListCollection`)
- recharts (can be addressed separately later)

---

## Phase 0 — Setup (no deletions yet)

1. Install Tailwind:
   ```bash
   npm install -D tailwindcss @tailwindcss/forms
   ```
2. Add to `app/globals.css`:
   ```css
   @import "tailwindcss";
   ```
3. Confirm Tailwind classes render correctly alongside Chakra — both can coexist during migration

---

## Phase 1 — Delete dead code (no migration needed, just deletion)

These are safe to delete before touching any other file.

**Delete the entire `components/ui/` directory except these 6 files:**
- `provider.tsx` (needed until the very end)
- `floating-plus.tsx`
- `loading-spinner.tsx`
- `password-input.tsx`
- `player-grid.tsx`
- `add-player-button.tsx`

**Delete dead component:**
- `components/ui/drop-down-with-add.tsx` (the `AddableSupabaseSelect` — never imported anywhere)

**Remove from `package.json`:**
- `chakra-react-select`

This alone removes ~52 files of noise and one npm dependency.

---

## Phase 2 — Shared components (high leverage, used everywhere)

Migrate these first because every page depends on them. Once done, every page gets simpler automatically.

Order of easiest to hardest:

1. **`components/modal.tsx`** — already has zero Chakra, just needs Tailwind classes applied to existing inline styles
2. **`components/auth-wrapper.tsx`** — only uses `Box` and `Text`, trivial swap
3. **`components/card-grid.tsx`** — only uses `Grid`, one component
4. **`components/standard-header.tsx`** — only uses `Heading`
5. **`components/header.tsx`** — uses `Box`, `Button`, `Heading`
6. **`components/back-button.tsx`** — small, uses `Button`
7. **`components/stat-tile.tsx`** — small display component
8. **`components/tabbed-page.tsx`** — uses Chakra `Tabs`, needs a simple custom tabs implementation

### Replacing `components/ui/` used files

These 5 surviving `components/ui/` files need Tailwind rewrites:

- **`floating-plus.tsx`** — a floating `+` button, simple circle button with Tailwind, used in 10+ pages
- **`loading-spinner.tsx`** — a spinner, CSS animation or one div with Tailwind `animate-spin`
- **`add-player-button.tsx`** — small button component
- **`player-grid.tsx`** — grid of player cards, straightforward Tailwind grid
- **`password-input.tsx`** — input with show/hide toggle, plain HTML + Tailwind

---

## Phase 3 — Simple pages (layout primitives only)

These pages use Chakra only for layout (`Box`, `Text`, `Container`, `HStack`, etc.) with no complex form behaviour. Straightforward find-and-replace.

- `app/page.tsx` — homepage, uses `Container`, `Box`, `Heading`, `Text`, `HStack`, `SimpleGrid`
- `app/login/page.tsx`
- `app/sources/page.tsx` and `app/sources/[source_id]/page.tsx`
- `app/teams/page.tsx`
- `app/playlists/page.tsx` and `app/playlists/[playlist_id]/page.tsx`
- `app/strategies/page.tsx`
- `app/stats/page.tsx` and stat sub-components (except charts)
- `app/clips/page.tsx`
- `app/admin/page.tsx`
- `app/players/[player_id]/page.tsx`
- `app/playersearch/page.tsx`

### Chakra → Tailwind cheatsheet for this phase

| Chakra | Tailwind equivalent |
|--------|-------------------|
| `<Box>` | `<div>` |
| `<Text>` | `<p>` |
| `<Heading>` | `<h1>` / `<h2>` etc. |
| `<Container maxW="xl">` | `<div className="max-w-xl mx-auto px-4">` |
| `<HStack gap={4}>` | `<div className="flex items-center gap-4">` |
| `<VStack gap={4}>` | `<div className="flex flex-col gap-4">` |
| `<SimpleGrid columns={2}>` | `<div className="grid grid-cols-2 gap-4">` |
| `<Button>` | `<button className="px-4 py-2 rounded bg-...">` |
| `<Input>` | `<input className="border rounded px-3 py-2 w-full">` |
| `<Separator>` | `<hr className="border-t border-gray-700">` |
| `<Center>` | `<div className="flex items-center justify-center">` |
| `<Stack>` | `<div className="flex flex-col gap-4">` or `<div className="flex gap-4">` |

---

## Phase 4 — Form-heavy pages (requires care)

These pages use `createListCollection` and Chakra's `Select` component for controlled dropdowns. The pattern maps cleanly to plain `<select>` elements — `createListCollection({ items })` just becomes a plain array.

**Before:**
```tsx
const teamCollection = createListCollection({
  items: teams.map(t => ({ label: t.team_name, value: t.team_id }))
})
// ...
<Select.Root collection={teamCollection} onValueChange={...}>
  <Select.Trigger />
  <Select.Content>
    {teamCollection.items.map(item => (
      <Select.Item item={item} key={item.value} />
    ))}
  </Select.Content>
</Select.Root>
```

**After:**
```tsx
const teams = [...] // plain array, no createListCollection needed
// ...
<select onChange={e => setValue(e.target.value)} className="...">
  {teams.map(t => (
    <option key={t.team_id} value={t.team_id}>{t.team_name}</option>
  ))}
</select>
```

Files to migrate in this phase:
- `app/hooks/usePointFormData.ts` — remove all `createListCollection`, return plain arrays
- `app/events/components/event-form.tsx`
- `app/events/[id]/components/new-point-form.tsx`
- `app/events/[id]/new-point/page.tsx` (already uses `NativeSelect` — closest to plain HTML)
- `app/events/[id]/[point_id]/page.tsx` — possession entry form, most complex
- `app/events/[id]/[point_id]/view/components/edit-possession.tsx`
- `app/clips/components/add-clip-modal.tsx`
- `app/players/components/player-modal.tsx`
- `app/strategies/components/strategy-modal.tsx`
- `app/possessions/components/PossessionFilters.tsx`

---

## Phase 5 — Final cleanup

Once all pages are migrated:

1. Delete `components/ui/provider.tsx` and `components/ui/color-mode.tsx`
2. Update `app/layout.tsx` to remove `<Provider>` wrapper (Tailwind needs no provider)
3. Remove from `package.json`:
   - `@chakra-ui/react`
   - `@chakra-ui/toast`
   - `@chakra-ui/cli`
   - `@emotion/react`
   - `next-themes`
   - `chakra-react-select` (already gone from Phase 1)
   - `styled-components`
4. Delete `components/ui/` directory entirely

---

## Rough order summary

| Phase | What | Files affected |
|-------|------|---------------|
| 0 | Install Tailwind | 1 config file |
| 1 | Delete dead code | ~52 files deleted |
| 2 | Shared components | ~10 components |
| 3 | Simple pages | ~12 pages |
| 4 | Form-heavy pages | ~10 files |
| 5 | Remove Chakra entirely | package.json + 2 provider files |
