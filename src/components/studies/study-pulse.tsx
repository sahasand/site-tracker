'use client'

import type { Site, MilestoneType } from '@/types'
import type { MilestoneCycleTime } from '@/lib/queries/analytics'

interface StuckSite {
  siteId: string
  siteName: string
  siteNumber: string
  milestoneType: MilestoneType
  milestoneLabel: string
  daysStuck: number
}

interface StudyPulseProps {
  sites: Site[]
  cycleTimes: MilestoneCycleTime[]
  stuckSites: StuckSite[]
}

type HealthStatus = 'on-track' | 'at-risk' | 'critical'

export default function StudyPulse({ sites, cycleTimes, stuckSites }: StudyPulseProps) {
  // Calculate counts
  const activeSites = sites.filter(s => s.status === 'active').length
  const activatingSites = sites.filter(s => s.status === 'activating').length
  const plannedSites = sites.filter(s => s.status === 'planned').length

  // Determine health status based on stuck sites
  const stuckCount = stuckSites.length
  const healthStatus: HealthStatus =
    stuckCount === 0 ? 'on-track' :
    stuckCount <= 2 ? 'at-risk' : 'critical'

  // Find the bottleneck - milestone with most stuck sites or longest delay
  const bottleneck = findBottleneck(stuckSites, cycleTimes)

  // Generate narrative
  const narrative = generateNarrative(stuckSites, cycleTimes, sites, bottleneck)

  // Scroll to site row in table
  const scrollToSite = (siteId: string) => {
    const row = document.querySelector(`[data-site-id="${siteId}"]`)
    if (row) {
      row.scrollIntoView({ behavior: 'smooth', block: 'center' })
      row.classList.add('bg-amber-50')
      setTimeout(() => row.classList.remove('bg-amber-50'), 2000)
    }
  }

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      {/* Header with health indicator */}
      <div className="px-5 py-4 border-b border-slate-200/60 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-800">Study Pulse</h2>
        <HealthBadge status={healthStatus} />
      </div>

      <div className="p-5 space-y-5">
        {/* Narrative summary */}
        <p className="text-sm text-slate-600 leading-relaxed">
          {narrative}
        </p>

        {/* Key counts */}
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold text-slate-800">{sites.length} Sites</span>
          <span className="text-slate-300">·</span>
          <span className="text-emerald-600 font-medium">{activeSites} Active</span>
          <span className="text-slate-300">·</span>
          <span className="text-amber-600 font-medium">{activatingSites} Activating</span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-500">{plannedSites} Planned</span>
        </div>

        {/* Needs Attention + Bottleneck */}
        {(stuckSites.length > 0 || bottleneck) && (
          <div className="grid gap-4 md:grid-cols-2 pt-2">
            {/* Needs Attention */}
            {stuckSites.length > 0 && (
              <div>
                <h3 className="text-xs uppercase tracking-wider text-slate-400 font-medium mb-2">
                  Needs Attention
                </h3>
                <ul className="space-y-1.5">
                  {stuckSites.slice(0, 5).map((site) => (
                    <li key={site.siteId}>
                      <button
                        onClick={() => scrollToSite(site.siteId)}
                        className="text-sm text-left hover:text-blue-600 transition-colors group w-full"
                      >
                        <span className="font-medium text-slate-700 group-hover:text-blue-600">
                          Site {site.siteNumber}
                        </span>
                        <span className="text-slate-400 mx-1">—</span>
                        <span className="text-slate-500">{site.milestoneLabel}</span>
                        <span className="text-red-500 ml-1">({site.daysStuck}d)</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Bottleneck */}
            {bottleneck && (
              <div>
                <h3 className="text-xs uppercase tracking-wider text-slate-400 font-medium mb-2">
                  Bottleneck
                </h3>
                <div className="text-sm">
                  <p className="font-medium text-slate-700">{bottleneck.label}</p>
                  <p className="text-slate-500">
                    {bottleneck.reason}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* All clear message */}
        {stuckSites.length === 0 && !bottleneck && (
          <div className="flex items-center gap-2 text-sm text-emerald-600">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>All sites progressing normally</span>
          </div>
        )}
      </div>
    </div>
  )
}

function HealthBadge({ status }: { status: HealthStatus }) {
  const config = {
    'on-track': { label: 'On Track', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    'at-risk': { label: 'At Risk', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
    'critical': { label: 'Critical', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  }
  const { label, bg, text, dot } = config[status]

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  )
}

function findBottleneck(
  stuckSites: StuckSite[],
  cycleTimes: MilestoneCycleTime[]
): { label: string; reason: string } | null {
  // First check: milestone with most stuck sites
  if (stuckSites.length > 0) {
    const stuckByType = new Map<string, number>()
    for (const site of stuckSites) {
      stuckByType.set(site.milestoneLabel, (stuckByType.get(site.milestoneLabel) || 0) + 1)
    }

    let maxStuck = 0
    let bottleneckLabel = ''
    stuckByType.forEach((count, label) => {
      if (count > maxStuck) {
        maxStuck = count
        bottleneckLabel = label
      }
    })

    if (maxStuck >= 2) {
      return {
        label: bottleneckLabel,
        reason: `${maxStuck} sites stuck at this stage`,
      }
    }
  }

  // Second check: milestone with worst cycle time variance
  const worstCycleTime = cycleTimes
    .filter(ct => ct.avgDays !== null && ct.avgDays > 0)
    .sort((a, b) => (b.avgDays || 0) - (a.avgDays || 0))[0]

  if (worstCycleTime && worstCycleTime.avgDays && worstCycleTime.avgDays > 5) {
    return {
      label: worstCycleTime.label,
      reason: `avg +${worstCycleTime.avgDays}d vs plan`,
    }
  }

  return null
}

function generateNarrative(
  stuckSites: StuckSite[],
  cycleTimes: MilestoneCycleTime[],
  sites: Site[],
  bottleneck: { label: string; reason: string } | null
): string {
  const parts: string[] = []

  // Stuck sites
  if (stuckSites.length === 0) {
    parts.push('No sites currently stuck.')
  } else if (stuckSites.length === 1) {
    const s = stuckSites[0]
    parts.push(`1 site stuck in ${s.milestoneLabel} for ${s.daysStuck} days.`)
  } else {
    // Group by milestone type
    const byType = new Map<string, number>()
    for (const s of stuckSites) {
      byType.set(s.milestoneLabel, (byType.get(s.milestoneLabel) || 0) + 1)
    }
    const entries: [string, number][] = []
    byType.forEach((count, label) => entries.push([label, count]))
    const summary = entries
      .map(([label, count]) => `${count} in ${label}`)
      .join(', ')
    parts.push(`${stuckSites.length} sites stuck (${summary}).`)
  }

  // Activation velocity - simple calculation
  const activeSites = sites.filter(s => s.status === 'active')
  if (activeSites.length > 0 && sites.length > activeSites.length) {
    const remaining = sites.length - activeSites.length
    parts.push(`${activeSites.length} of ${sites.length} sites activated, ${remaining} remaining.`)
  }

  // Bottleneck mention if different from stuck
  if (bottleneck && stuckSites.length === 0) {
    parts.push(`${bottleneck.label} running ${bottleneck.reason}.`)
  }

  return parts.join(' ')
}
