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

  if (studies.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center shadow-inner">
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
      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
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
