# Stage Duration Chart Design

> Replaces the Milestone Cycle Times chart with actionable, always-available data.

## Problem

The current Milestone Cycle Times chart requires `planned_date` to be set on milestones, but:
- Milestones are created without planned dates (database trigger)
- Common workflows (drag-drop, quick complete) never set planned dates
- Result: Chart almost always shows "No cycle time data yet"

## Solution

Replace with **Stage Duration** — average days spent in each activation stage. Uses only `actual_date` which is always set on completion.

---

## Data Model

### Stage Groupings

Collapse 8 milestones into 4 pipeline-aligned stages:

| Stage | End Milestone | Duration Calculation |
|-------|---------------|---------------------|
| Regulatory | `regulatory_approved` | `reg_approved.actual_date - site.created_at` |
| Contracts | `contract_executed` | `contract_executed.actual_date - reg_approved.actual_date` |
| Site Initiation | `siv_completed` | `siv_completed.actual_date - contract_executed.actual_date` |
| Go-Live | `site_activated` | `site_activated.actual_date - siv_completed.actual_date` |

### Query Output

```typescript
interface StageDuration {
  stage: 'regulatory' | 'contracts' | 'site_initiation' | 'go_live'
  label: string
  avgDays: number | null
  minDays: number | null
  maxDays: number | null
  completedCount: number
}
```

---

## Visual Design

### Chart Type

**Horizontal bar chart** (not vertical)

Rationale:
- Stage names readable without rotation
- Left-to-right flow matches pipeline progression
- Bars extending into space creates momentum
- More distinctive than typical vertical charts

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Stage Duration                                    Total: 87d │
│  Average days per activation stage                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Regulatory    ████████████████████░░░░░░░░░░░░░░░░   23d   │
│                3 sites                                       │
│                                                              │
│  Contracts     ████████████████████████████████░░░░   38d   │
│                3 sites  · Longest stage                      │
│                                                              │
│  Site Init     ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░   12d   │
│                2 sites                                       │
│                                                              │
│  Go-Live       ██████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   14d   │
│                2 sites                                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Colors

Uses existing CSS variables:

| Stage | Color | Variable |
|-------|-------|----------|
| Regulatory | Blue #3b82f6 | `--stage-regulatory` |
| Contracts | Violet #8b5cf6 | `--stage-contracts` |
| Site Initiation | Teal #14b8a6 | `--stage-siv` |
| Go-Live | Emerald #10b981 | `--stage-activated` |

### Bar Styling

- Fill: Stage color, 100% opacity
- Track: `slate-100` behind each bar
- Border radius: 4px
- Height: 28px per bar
- Row gap: 24px

### Typography

| Element | Font | Size | Weight | Color |
|---------|------|------|--------|-------|
| Card title | Fraunces | 18px | 600 | slate-800 |
| Subtitle | DM Sans | 12px | 400 | slate-500 |
| Stage name | DM Sans | 14px | 500 | slate-700 |
| Days value | DM Sans | 16px | 600 | slate-800 |
| Sample size | DM Sans | 11px | 400 | slate-400 |
| Insight badge | DM Sans | 11px | 500 | amber-700 |

### Card Container

- `.glass-card` class
- Header gradient: `from-slate-50 to-white`
- Top accent: 3px teal-to-emerald gradient line

---

## Interactions

### Entrance Animation

- Bars animate from 0 to final width
- Staggered 80ms per row (top to bottom)
- Duration: 600ms, ease-out
- Days counter animates up (counting effect)

### Hover

- Bar: `brightness(1.08)`, subtle shadow
- Tooltip appears:
  ```
  Contracts
  ─────────────
  Avg: 38 days
  Range: 21–52 days
  Sites: 3 completed
  ```

### Longest Stage Highlight

- Amber badge: "Longest stage"
- `bg-amber-50 text-amber-700`
- Inline after sample count

---

## States

### Empty State

No sites have completed any stages:

```
┌─────────────────────────────────────────┐
│                                         │
│  No activation data yet                 │
│                                         │
│  Complete milestones to see how long    │
│  each stage takes on average.           │
│                                         │
└─────────────────────────────────────────┘
```

### Partial Data

Some stages have data, others don't:
- Stages without data show gray bar at 0 width
- Text: "—" instead of days
- Subtext: "No completions yet"

---

## Key Insight Line

Auto-generated summary above the chart:

Examples:
- "Contracts is your slowest stage at 38 days — 44% of total activation time."
- "Sites activate in 87 days on average."
- "All 4 sites activated. Average time: 87 days."

---

## Implementation Notes

### Files to Modify

1. `src/lib/queries/analytics.ts` — Add `calculateStageDurations()` function
2. `src/components/studies/cycle-time-chart.tsx` — Replace with `stage-duration-chart.tsx`
3. `src/app/studies/[id]/page.tsx` — Update import and props

### Dependencies

- Recharts `BarChart` (already installed)
- No new dependencies needed

### CSS Additions

Add to `globals.css`:
```css
@keyframes bar-grow {
  from { width: 0; }
  to { width: var(--bar-width); }
}

.stage-bar {
  animation: bar-grow 600ms ease-out forwards;
}
```
