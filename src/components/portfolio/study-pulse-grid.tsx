'use client'

import StudyProgressCard from './study-progress-card'
import type { PortfolioStudy } from '@/lib/queries/portfolio'

interface StudyPulseGridProps {
  studies: PortfolioStudy[]
}

export default function StudyPulseGrid({ studies }: StudyPulseGridProps) {
  // Sort studies by health (critical first, then at_risk, then healthy)
  const sortedStudies = [...studies].sort((a, b) => {
    const healthOrder = { critical: 0, at_risk: 1, healthy: 2 }
    return healthOrder[a.health] - healthOrder[b.health]
  })

  // Calculate summary stats
  const criticalCount = studies.filter(s => s.health === 'critical').length
  const atRiskCount = studies.filter(s => s.health === 'at_risk').length
  const healthyCount = studies.filter(s => s.health === 'healthy').length

  if (studies.length === 0) {
    return (
      <div className="card-elevated text-center py-16 px-6">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center">
          <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-700 mb-2">No studies with sites</h3>
        <p className="text-slate-500 text-sm max-w-sm mx-auto">
          Add sites to your studies to see them here in the portfolio dashboard.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-slate-800">Study Health</h2>
          {/* Health summary pills */}
          <div className="flex items-center gap-2">
            {criticalCount > 0 && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-50 border border-red-100">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span className="text-[11px] font-semibold text-red-700 number-highlight">{criticalCount} critical</span>
              </div>
            )}
            {atRiskCount > 0 && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-50 border border-amber-100">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span className="text-[11px] font-semibold text-amber-700 number-highlight">{atRiskCount} at risk</span>
              </div>
            )}
            {healthyCount > 0 && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-50 border border-emerald-100">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[11px] font-semibold text-emerald-700 number-highlight">{healthyCount} on track</span>
              </div>
            )}
          </div>
        </div>

        {/* View toggle placeholder */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>{studies.length} {studies.length === 1 ? 'study' : 'studies'}</span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {sortedStudies.map((study, index) => (
          <StudyProgressCard
            key={study.id}
            study={study}
            index={index}
          />
        ))}
      </div>
    </div>
  )
}
