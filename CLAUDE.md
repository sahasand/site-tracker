# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Getting Started

### Prerequisites
- Node.js 18+
- npm
- Supabase account (for database)

### Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# 3. Set up database
# Run the migration in supabase/migrations/001_initial_schema.sql
# via Supabase dashboard SQL editor

# 4. Start development server
npm run dev

# 5. Open http://localhost:3000
```

### Environment Variables

Create `.env.local` with:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Get these from: Supabase Dashboard → Project Settings → API

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
- `src/components/activation/` - Kanban board with drag-and-drop (single DndContext pattern)
- `src/components/studies/` - Study cards, charts, dialogs
- `src/components/sites/` - Site table, dialogs, CSV import
- `supabase/migrations/` - SQL schema with triggers

### Database Triggers

When a site is created, a trigger auto-generates all 8 milestone records. The `updateMilestoneAndSiteStatus` function in `lib/queries/milestones.ts` auto-transitions site status based on milestone completion.

### Domain Model

**Studies** → **Sites** → **Milestones** (1:N:N cascade delete)

Site status progression: `planned` → `activating` (any milestone starts) → `active` (site_activated completes)

8 milestone types in order: regulatory_submitted, regulatory_approved, contract_sent, contract_executed, siv_scheduled, siv_completed, edc_training_complete, site_activated

## Current Features

### Core CRUD
- Create/Edit/Delete studies and sites
- Milestone status updates with date tracking
- Toast notifications for all actions (sonner)

### Activation Pipeline (`/activation`)
- Kanban board with 5 stages: Regulatory, Contracts, SIV, EDC, Activated
- **Drag-and-drop** sites between columns (@dnd-kit/core)
  - Single DndContext at parent level (supports multiple studies)
  - Forward drag: auto-completes milestones
  - **Backward drag**: resets milestones to pending
  - Droppable IDs use `studyId:stage` format for uniqueness
- Confirmation dialog before completing/resetting milestones on drag
- Bulk milestone update mode (select multiple sites)
- Bottleneck alerts for sites stuck >14 days
- Export CSV button

### Study Detail Page (`/studies/[id]`)
- Stats cards: Total Sites, Active, Activating, Enrollment
- **Enrollment Progress chart** (Recharts AreaChart)
- **Milestone Cycle Times chart** (Recharts BarChart)
- Site table with sorting, status filter, export CSV
- **CSV Import** for bulk site creation

### Data Entry
- **CSV Import**: Drag-drop upload, validation preview, flexible import (valid rows imported, invalid skipped)
- Download template button for CSV format

### UI/UX
- Search studies by name or protocol
- Filter sites by status
- Sortable site tables
- Accessible: ARIA labels, proper contrast

## Key Libraries

- `@dnd-kit/core` - Drag and drop for kanban
- `recharts` - Charts for enrollment and cycle times
- `sonner` - Toast notifications
- `@radix-ui/*` - Dialog, Select, and other primitives (via Shadcn)

## Adding Features

- Add types to `src/types/index.ts`
- Create query functions in `lib/queries/`
- Create server actions in `app/actions/`
- Use Shadcn components from `components/ui/`
- Database changes go in `supabase/migrations/`

## File Patterns

- Dialogs: `src/components/{domain}/{action}-{entity}-dialog.tsx`
- Tables: `src/components/{domain}/{entity}-table.tsx`
- Charts: `src/components/{domain}/{name}-chart.tsx`
- Server actions: `src/app/actions/{entity}.ts`
- Queries: `src/lib/queries/{entity}.ts`
