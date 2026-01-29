# Portfolio Page Design — "Vital Signs Monitor"

> Cross-study visibility through visual pattern recognition, not number-reading.

## Problem

Users managing multiple studies have no portfolio-level view. They must click into each study individually to understand health and progress. Both Ops Managers (daily usage) and Executives (reporting) need a single view that answers "how's my portfolio?" instantly.

## Solution

A new **Portfolio** nav tab that displays all studies as "vital signs" — compact visual units communicating health through shape, color, and rhythm rather than just numbers.

---

## Design Concept

**Inspiration:** Hospital patient monitoring systems. Clinicians glance at a wall of monitors and instantly know which patient needs attention by visual pattern recognition.

**Tone:** Clinical calm. Medical monitoring room meets Bloomberg terminal. Data-dense but not chaotic. Serious but not cold.

**Signature Element:** Ambient pulse line in header — a subtle animated SVG that slowly oscillates like a heart rate monitor at rest. The one thing people remember: "the app with the heartbeat."

---

## Page Structure

Top to bottom, single scrollable page:

```
┌─────────────────────────────────────┐
│  Summary Header                     │  ← Executive glance (4 metrics + velocity)
├─────────────────────────────────────┤
│  Attention Rail                     │  ← Ops Manager action queue (if any)
├─────────────────────────────────────┤
│  Study Pulse Grid                   │  ← All studies as vital sign cards
└─────────────────────────────────────┘
```

No tabs, no toggles. Executive sees top, scrolls no further. Ops Manager scrolls to attention rail, then grid.

---

## Component 1: Summary Header

Answers "how's my portfolio?" in 2 seconds.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  Portfolio                                                              │
│                                                                         │
│  ┌───────────┐    ┌───────────┐    ┌───────────┐    ┌───────────┐     │
│  │    12     │    │     8     │    │     3     │    │     1     │     │
│  │  sites    │    │  active   │    │ activating│    │  at risk  │     │
│  │   total   │    │    ✓      │    │     →     │    │    ⚠      │     │
│  └───────────┘    └───────────┘    └───────────┘    └───────────┘     │
│                                                                         │
│   ▁▂▂▃▃▄▅▅▆▆▇▇  Portfolio velocity: 2.3 sites/week (↗ +15%)           │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Metrics

| Metric | Description |
|--------|-------------|
| Sites total | Sum across all studies |
| Active | Fully activated sites |
| Activating | Sites in the pipeline |
| At risk | Sites needing attention (clickable → scrolls to rail) |

### Portfolio Velocity Sparkline

12-week trend showing overall activation pace. Executive can say "we're accelerating" without digging in.

### Pulse Line

Behind the header, a subtle animated SVG line slowly oscillates:

```
───────────────╱╲───────────────╱╲───────────────
```

- Opacity: 5-10% (barely noticeable)
- Amplitude low when healthy, slightly higher when at-risk items exist
- Never distracting — subconscious reinforcement

---

## Component 2: Attention Rail

Surfaces specific problems without hunting. Horizontal queue of actionable items.

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ⚠ 2 need attention                                                     │
│  ┌────────────────────────────────┐ ┌────────────────────────────────┐ │
│  │ NOVA-303 · Site 042            │ │ BEACON-101 · Site 019          │ │
│  │ Stuck in Contracts · 18 days   │ │ Stuck in Regulatory · 14 days  │ │
│  │ ──────────────────────→        │ │ ──────────────────────→        │ │
│  └────────────────────────────────┘ └────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

### Attention Card Content

- Study name + Site name
- Stage where stuck + days stuck
- Click navigates directly to site detail (not study)

### Surfacing Rules

An item appears when:
- Site stuck >14 days in any stage
- Velocity dropped 50%+ week-over-week
- No activity in 7+ days on an activating study

### Zero State

```
✓ All clear — no sites need attention
```

Simple, calming, rewarding.

---

## Component 3: Study Pulse Grid

Each study as a compact "vital sign" card.

```
┌────────────────────────────────────┐
│                                    │
│   ● ● ● ● ● ○ ○ ○        ↗        │  ← Progress dots + trend arrow
│                                    │
│   ▁ ▂ ▂ ▃ ▄ ▅ ▆ ▇                 │  ← Velocity sparkline (8 weeks)
│                                    │
│   BEACON-101            PHASE III  │  ← Study name + phase badge
│   5 of 8 sites active              │  ← Simple count
│                                    │
│   ┌──────────────────────────────┐ │
│   │ ██████████████░░░░ Reg       │ │  ← Mini stage bars (on hover)
│   │ ████████████░░░░░░ Contract  │ │
│   │ ██████░░░░░░░░░░░░ SIV       │ │
│   │ ███░░░░░░░░░░░░░░░ Go-Live   │ │
│   └──────────────────────────────┘ │
│                                    │
└────────────────────────────────────┘
```

### Card Elements

| Element | Description |
|---------|-------------|
| Progress dots | ● filled = activated, ○ empty = not yet |
| Trend arrow | ↗ accelerating, → steady, ↘ slowing |
| Velocity sparkline | 8-week activation pace |
| Study name | Clickable, navigates to study detail |
| Phase badge | Small, same style as existing |
| Mini stage bars | Appears on hover, shows bottlenecks |

### Health Communication

Health is communicated through visual properties, not badges:

| State | Card Background | Border | Sparkline | Trend |
|-------|-----------------|--------|-----------|-------|
| Healthy | White | None | Teal fill | ↗ teal |
| At Risk | Faint amber tint | 1px amber | Amber fill | → slate |
| Critical | Soft coral tint | 2px coral, subtle pulse | Coral fill | ↘ coral |

The user *feels* which study needs attention before consciously reading.

### Interactions

1. **Default:** Compact card — dots, sparkline, name only
2. **Hover:** Card lifts, mini stage bars fade in
3. **Click:** Navigate to study detail page

No modals, no popovers. Portfolio is for scanning, not editing.

### Grid Behavior

- Sortable by: Health (default), Progress, Velocity, Name
- Filterable by: Phase, Status
- Responsive: 4 columns → 3 → 2 → 1

---

## Visual Design

### Color Palette

| Element | Value | Usage |
|---------|-------|-------|
| Background | `#fafaf9` | Warm gray, less sterile |
| Card | White | Soft shadow, no border |
| Healthy | Teal `#14b8a6` | Dots, sparkline, arrows |
| At Risk | Amber `#f59e0b` | Tint, border, sparkline |
| Critical | Coral `#ef4444` | Muted, urgent but not alarming |

### Typography

| Element | Style |
|---------|-------|
| Page title | Fraunces, 28px, semibold, slate-800 |
| Metric numbers | DM Sans, 48px, semibold, slate-900 |
| Metric labels | DM Sans, 12px, uppercase, tracking-wide, slate-400 |
| Study names | DM Sans, 14px, medium, slate-700 |
| Attention text | DM Sans, 13px, slate-600 |

### Animation

- Card hover: 200ms lift with shadow
- Mini stage bars: 300ms fade in
- Critical pulse: 2s ease-in-out infinite, subtle opacity change
- Pulse line: 4s ease-in-out infinite, very subtle

---

## Data Model

```typescript
interface PortfolioStudy {
  id: string
  name: string
  phase: string
  sitesActive: number
  sitesTotal: number
  weeklyVelocity: number[]  // last 8-12 weeks
  trend: 'up' | 'flat' | 'down'
  health: 'healthy' | 'at_risk' | 'critical'
  stageCounts: {
    stage: 'regulatory' | 'contracts' | 'site_initiation' | 'go_live'
    completed: number
    total: number
  }[]
}

interface AttentionItem {
  studyId: string
  studyName: string
  siteId: string
  siteName: string
  siteNumber: string
  stage: string
  daysStuck: number
}

interface PortfolioSummary {
  sitesTotal: number
  sitesActive: number
  sitesActivating: number
  sitesAtRisk: number
  weeklyVelocity: number[]  // last 12 weeks
  velocityTrend: 'up' | 'flat' | 'down'
  velocityChange: number    // percentage
}
```

---

## Implementation Notes

### New Files

| File | Purpose |
|------|---------|
| `src/app/portfolio/page.tsx` | Portfolio page (server component) |
| `src/lib/queries/portfolio.ts` | Data fetching functions |
| `src/components/portfolio/summary-header.tsx` | Top metrics + velocity |
| `src/components/portfolio/attention-rail.tsx` | Action queue |
| `src/components/portfolio/study-pulse-grid.tsx` | Card grid |
| `src/components/portfolio/study-pulse-card.tsx` | Individual vital sign card |
| `src/components/portfolio/sparkline.tsx` | Reusable sparkline component |
| `src/components/portfolio/pulse-line.tsx` | Animated header background |

### Nav Update

Add "Portfolio" tab between "Studies" and "Activation Pipeline" in `src/components/layout/nav.tsx`.

### Queries Needed

```typescript
// Get all studies with activation metrics
getPortfolioStudies(): Promise<PortfolioStudy[]>

// Get sites needing attention across all studies
getPortfolioAttentionItems(daysThreshold: number): Promise<AttentionItem[]>

// Get aggregate portfolio metrics
getPortfolioSummary(): Promise<PortfolioSummary>

// Calculate weekly velocity for a study (sites activated per week)
calculateStudyVelocity(studyId: string, weeks: number): Promise<number[]>
```

---

## What This Is NOT

- Not a replacement for the Studies page (that's for CRUD)
- Not editable (no forms, no modals)
- Not a detailed drill-down (click through for that)
- Not customizable per user (single view serves all)

---

## Success Criteria

1. User identifies which study needs attention in <3 seconds
2. Executive gets portfolio status without scrolling
3. Ops Manager has clear action queue each morning
4. Zero training needed — visual language is intuitive
