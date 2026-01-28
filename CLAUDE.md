# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev       # Start development server (port 3000)
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
npx tsc --noEmit  # Type check without emitting
```

## Architecture Overview

This is a clinical trial site tracking dashboard built with Next.js 14 App Router, Supabase, and React Query.

### Data Flow Pattern

1. **Server Components** fetch data using query functions from `lib/queries/`
2. **Server Actions** in `app/actions/` handle mutations and call `revalidatePath()`
3. **React Query** provides client-side caching with 60s staleTime

### Key Directories

- `src/app/actions/` - Server actions for CRUD (studies, sites, milestones)
- `src/lib/queries/` - Data access layer wrapping Supabase calls
- `src/lib/supabase/` - Client factories (server.ts for RSC, client.ts for browser)
- `src/types/` - Domain types and constants (Study, Site, Milestone enums)
- `src/components/ui/` - Shadcn primitives
- `supabase/migrations/` - SQL schema with triggers

### Database Triggers

When a site is created, a trigger auto-generates all 8 milestone records. The `updateMilestoneAndSiteStatus` function in `lib/queries/milestones.ts` auto-transitions site status based on milestone completion.

### Domain Model

**Studies** → **Sites** → **Milestones** (1:N:N cascade delete)

Site status progression: `planned` → `activating` (any milestone starts) → `active` (site_activated completes)

8 milestone types in order: regulatory_submitted, regulatory_approved, contract_sent, contract_executed, siv_scheduled, siv_completed, edc_training_complete, site_activated

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

## Adding Features

- Add types to `src/types/index.ts`
- Create query functions in `lib/queries/`
- Create server actions in `app/actions/`
- Use Shadcn components from `components/ui/`
- Database changes go in `supabase/migrations/`
