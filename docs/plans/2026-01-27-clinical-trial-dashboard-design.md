# Clinical Trial Site Tracker Dashboard - Design Document

**Date**: 2026-01-27
**Status**: Approved

## Overview

A clinical trial site tracking dashboard for a small CRO, focused on site activation and performance monitoring.

### Context

- **Role**: CRO managing studies and sites
- **Scale**: Small (1-5 active studies, <50 sites)
- **Data situation**: Starting fresh - needs data entry + visualization
- **Users**: Single user / small team, no auth required
- **Priority**: Working demo

## Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Framework | Next.js 14 (App Router) | Full-stack React, good DX, easy deployment |
| Database | Supabase (Postgres) | Free tier, real-time capable, scales if needed |
| Styling | Tailwind CSS | Fast, utility-first, consistent |
| Charts | Recharts | Simple, React-native, good for dashboards |
| UI Components | shadcn/ui | Clean, accessible, customizable |
| State | React Query (TanStack) | Server state caching, auto-refetch |
| Deployment | Vercel | Free tier, automatic deploys from GitHub |

## Data Model

### Studies

```
Studies
├── id (uuid, PK)
├── name (text)
├── protocol_number (text)
├── sponsor_name (text)
├── phase (enum: I, II, III, IV)
├── status (enum: active, completed, on_hold)
├── target_enrollment (int)
├── enrollment_start_date (date)
├── planned_end_date (date)
├── created_at (timestamp)
└── updated_at (timestamp)
```

### Sites

```
Sites
├── id (uuid, PK)
├── study_id (uuid, FK → Studies)
├── site_number (text)
├── name (text)
├── principal_investigator (text)
├── country (text)
├── region (text)
├── status (enum: planned, activating, active, on_hold, closed)
├── target_enrollment (int)
├── current_enrollment (int, default 0)
├── created_at (timestamp)
└── updated_at (timestamp)
```

### Site Activation Milestones

```
Site_Activation_Milestones
├── id (uuid, PK)
├── site_id (uuid, FK → Sites)
├── milestone_type (enum, see below)
├── status (enum: pending, in_progress, completed)
├── planned_date (date, nullable)
├── actual_date (date, nullable)
├── notes (text, nullable)
├── created_at (timestamp)
└── updated_at (timestamp)
```

**Milestone Types (in order):**

| Stage | Type | Description |
|-------|------|-------------|
| 1 | regulatory_submitted | IRB/EC package sent for review |
| 2 | regulatory_approved | IRB/EC approval received |
| 3 | contract_sent | CTA/budget sent to site |
| 4 | contract_executed | Signed agreement in place |
| 5 | siv_scheduled | Site initiation visit date set |
| 6 | siv_completed | Training and setup done |
| 7 | edc_training_complete | Site staff trained on data entry system |
| 8 | site_activated | Open for enrollment |

### Site Performance Metrics

```
Site_Performance_Metrics
├── id (uuid, PK)
├── site_id (uuid, FK → Sites)
├── period (date, first of month)
├── queries_opened (int)
├── queries_resolved (int)
├── avg_resolution_days (decimal)
├── data_entry_lag_days (decimal)
├── protocol_deviations (int)
├── visit_completion_rate (decimal, 0-100)
├── performance_score (decimal, calculated)
└── recorded_at (timestamp)
```

**Performance Score Calculation:**

Weighted composite (0-100):
- Query resolution time: 30%
- Data entry timeliness: 25%
- Protocol deviations: 25%
- Visit completion: 20%

**Tiers:**
- Top Performer: 80+
- On Track: 60-79
- Needs Attention: <60

## Dashboard Views

### 1. Study Overview (Home)

Landing page showing all active studies.

- Cards per study: name, phase, sponsor, site count, enrollment progress bar
- Quick stats: total sites, sites activating, sites enrolling
- Click study to drill into details

### 2. Site Activation Tracker

Kanban-style view of sites moving through activation stages.

- Columns: Regulatory → Contracts → SIV → EDC → Activated
- Site cards show: site number, PI name, days in current stage, target date
- Color coding: green (on track), yellow (at risk), red (overdue)
- Click card for full milestone timeline and notes
- Filter by study, country, status

### 3. Site Performance Dashboard

Table + charts view for operational metrics.

- Sortable table: site, queries open, avg resolution days, data entry lag, deviations
- Sparklines showing 3-month trend per metric
- Performance score with color coding
- Filter by study, performance tier

### 4. Site Detail Page

Deep dive into a single site.

- Header: site info, PI, contact details, status badge
- Activation timeline: visual milestone tracker with dates
- Enrollment chart: cumulative vs target
- Performance history: metrics over time
- Activity log: notes, status changes, events

## Site Activation Workflow

### Status Logic

- **Planned**: No milestones started
- **Activating**: At least one milestone in progress, not yet activated
- **Active**: Site activated milestone completed
- **On Hold**: Manual flag for paused sites
- **Closed**: Study complete or site terminated

### Risk Indicators

Calculated automatically:
- Days in current stage vs. typical duration (configurable thresholds)
- Planned date vs. today (overdue = red, within 7 days = yellow)
- Blocking issues flagged in notes

## Data Entry Flows

### Adding a Study

Form fields: name, protocol number, sponsor, phase, target enrollment, planned dates.

### Adding Sites

From study detail, "Add Site" opens form: site number, name, PI, country, region, target enrollment. All milestones auto-created as pending.

### Updating Milestones

Two methods:
1. Kanban drag-drop → prompts for completion date
2. Site detail page → click milestone to edit

Quick actions: "Mark Complete", "Set Planned Date", "Add Note"

### Entering Performance Metrics

- Monthly entry prompt at month-end
- Form per site or bulk table entry
- "Copy from Last Month" option

## Project Structure

```
site-tracker/
├── app/
│   ├── page.tsx                 # Study overview (home)
│   ├── studies/[id]/page.tsx    # Study detail
│   ├── activation/page.tsx      # Kanban activation view
│   ├── performance/page.tsx     # Performance dashboard
│   └── sites/[id]/page.tsx      # Site detail
├── components/
│   ├── ui/                      # shadcn components
│   ├── site-card.tsx
│   ├── milestone-tracker.tsx
│   └── performance-table.tsx
├── lib/
│   ├── supabase.ts              # DB client
│   └── queries.ts               # Data fetching functions
└── types/
    └── index.ts                 # TypeScript interfaces
```

## Implementation Phases

### Phase 1: Core Foundation (MVP)

- Study list page (add/view studies)
- Site list per study (add/view sites)
- Site detail page with milestone tracker
- Basic activation kanban (view + drag to update)
- Simple forms for data entry

### Phase 2: Activation Polish

- Risk indicators (color coding)
- Planned vs actual date tracking
- Notes on milestones
- Filter/search on kanban
- Activation timeline visualization

### Phase 3: Performance Tracking

- Performance table with sorting
- Monthly metric entry flow
- Performance scoring calculation
- Sparkline trends
- Site ranking/tiering

### Phase 4: Enhancements

- Dashboard home with aggregate stats
- Export to CSV/PDF
- Enrollment tracking charts
- Email reminders for overdue milestones
- Dark mode
