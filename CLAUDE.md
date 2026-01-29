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
- `src/components/ui/` - Shadcn primitives (includes Popover for milestone stepper)
- `src/components/activation/` - Kanban board with drag-and-drop (single DndContext pattern)
- `src/components/portfolio/` - Portfolio page components (pipeline track, study progress cards, sparklines)
- `src/components/studies/` - Study cards, charts, dialogs, StudyPulse
- `src/components/sites/` - Site table, dialogs, CSV import
- `src/components/milestones/` - MilestoneStepper (horizontal progress UI)
- `supabase/migrations/` - SQL schema with triggers

### Database Triggers

When a site is created, a trigger auto-generates all 8 milestone records. The `updateMilestoneAndSiteStatus` function in `lib/queries/milestones.ts` auto-transitions site status based on milestone completion.

### Domain Model

**Studies** → **Sites** → **Milestones** (1:N:N cascade delete)

Site status progression: `planned` → `activating` (any milestone starts) → `active` (site_activated completes)

8 milestone types grouped into 5 stages:
- **Regulatory** (2): regulatory_submitted, regulatory_approved
- **Contracts** (2): contract_sent, contract_executed
- **SIV** (2): siv_scheduled, siv_completed
- **EDC** (1): edc_training_complete
- **Activated** (1): site_activated

Site cards show "x/5 stages" (not milestones) to match the visible kanban columns.

## Current Features

### Core CRUD
- Create/Edit/Delete studies and sites
- Milestone status updates with date tracking
- Toast notifications for all actions (sonner)

### Portfolio Page (`/portfolio`) - Landing Page
- **Cross-study dashboard** for Ops Managers and Executives
- Root URL (`/`) redirects here as the main landing page
- **Pipeline Track Header**: Visual site-by-study pipeline showing:
  - Each study as a horizontal track with stage markers (REG → CONT → SIV → ACTIVE)
  - Sites as colored dots positioned at their current stage
  - Clustered dots with count badge when multiple sites at same position
  - Hover tooltips with site details and click-through to site page
  - Edge-aware tooltip positioning (adjusts for left/right boundaries)
- **Attention Rail**: Horizontally scrollable queue of sites stuck >14 days (hidden when empty)
- **Study Progress Cards**: Cards showing each study's health at a glance
  - Donut chart with Active/Activating/Planned breakdown and percentage
  - Stage completion bars (Regulatory, Contracts, SIV, Active)
  - Velocity indicator with trend arrow
  - Health-based styling (healthy/at_risk/critical)
- Click-through to study detail page

### Studies Page (`/studies`)
- List of all studies with site counts
- Create new study dialog
- Click-through to study detail page

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
- **Study Pulse** - Executive summary component replacing stat cards:
  - Health indicator (On Track / At Risk / Critical) based on stuck site count
  - Auto-generated narrative summary
  - Compact site counts (Total, Active, Activating, Planned)
  - "Needs Attention" list with click-to-scroll to site row
  - Bottleneck callout showing worst milestone stage
- **Stage Duration chart** - Horizontal bar chart showing average days per stage:
  - 4 stages: Regulatory, Contracts, Site Initiation, Go-Live
  - Color-coded bars with "Longest stage" badge
  - Hover tooltip with avg/min/max/count
  - Auto-generated insight line
- Site table with sorting, status filter, export CSV
- **CSV Import** for bulk site creation

### Site Detail Page (`/sites/[id]`)
- Site info cards (PI, Location, Enrollment, Progress)
- **Activation Record** - Vertical timeline as official audit trail:
  - Grouped by stage (Regulatory, Contracts, Site Initiation, Training & Go-Live)
  - Shows planned vs actual dates with variance badges (days early/late)
  - Current step highlighted with teal background
  - Click any milestone to open popover with editing
  - One-click "Mark Complete" for current step
  - Notes/Blockers field for documenting delays
  - Summary header: Progress count, Schedule Variance, Next Step

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
- `@radix-ui/*` - Dialog, Select, Popover, and other primitives (via Shadcn)

## Analytics Queries

Located in `src/lib/queries/analytics.ts`:
- `calculateStageDurations(studyId)` - Average days between milestone completions per stage
- `getStuckSitesForStudy(studyId, daysThreshold)` - Sites stuck in a milestone >N days
- `getStuckSites(daysThreshold)` - All stuck sites across studies (used in Activation Pipeline)

Located in `src/lib/queries/portfolio.ts`:
- `getPortfolioStudies()` - All studies with health, velocity, stage counts
- `getPortfolioAttentionItems(daysThreshold)` - Stuck sites across all studies
- `getPortfolioSummary()` - Aggregate metrics for portfolio header
- `getStudyPipelines()` - All studies with individual site positions for pipeline track visualization

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
- Steppers: `src/components/{domain}/{entity}-stepper.tsx`

## Design Patterns

### Study Pulse (Executive Summary)
The Study Pulse component (`src/components/studies/study-pulse.tsx`) demonstrates a pattern for actionable dashboards:
- Health indicator derived from simple rule (stuck sites count)
- Auto-generated narrative from data
- "Needs Attention" items with click-to-scroll using `data-site-id` attributes on table rows

### Activation Timeline (Audit Record)
The Activation Timeline (`src/components/milestones/activation-timeline.tsx`) serves as the official record:
- Vertical timeline grouped by stage (matches Pipeline columns)
- Shows planned vs actual dates with variance calculation
- Differentiates from Pipeline: detailed data entry vs batch workflow
- Notes/Blockers field for compliance documentation
- Summary stats: progress, schedule variance, next step

### Portfolio Vital Signs (Cross-Study View)
The Portfolio page (`src/app/portfolio/page.tsx`) demonstrates patterns for executive dashboards:
- Health derived from stuck site count and velocity trend
- Sparklines for compact trend visualization (`src/components/portfolio/sparkline.tsx`)
- Cards as "vital signs" with hover-reveal details
- Stage completion calculated by checking if all milestones in a stage are completed
- Attention rail pattern for surfacing actionable items

### Pipeline Track (Site-Level Visualization)
The Pipeline Track (`src/components/portfolio/pipeline-track.tsx`) shows individual sites across studies:
- Groups sites by position to handle overlaps (clustering)
- Count badge displayed when multiple sites at same stage
- Edge-aware tooltip positioning prevents clipping at boundaries
- Color-coded dots by stage (blue=Regulatory, violet=Contracts, teal=SIV, emerald=Active)
- Stuck sites pulse red with animation
- Click-through navigation to site detail pages
