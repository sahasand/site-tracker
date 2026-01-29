'use client'

import { useState } from 'react'
import StudyPulseCard from './study-pulse-card'
import type { PortfolioStudy } from '@/lib/queries/portfolio'

interface StudyPulseGridProps {
  studies: PortfolioStudy[]
}

type SortOption = 'health' | 'progress' | 'velocity' | 'name'

export default function StudyPulseGrid({ studies }: StudyPulseGridProps) {
  const [sortBy, setSortBy] = useState<SortOption>('health')

  // Sort studies
  const sortedStudies = [...studies].sort((a, b) => {
    switch (sortBy) {
      case 'health': {
        const healthOrder = { critical: 0, at_risk: 1, healthy: 2 }
        return healthOrder[a.health] - healthOrder[b.health]
      }
      case 'progress': {
        const aProgress = a.sitesTotal > 0 ? a.sitesActive / a.sitesTotal : 0
        const bProgress = b.sitesTotal > 0 ? b.sitesActive / b.sitesTotal : 0
        return bProgress - aProgress
      }
      case 'velocity': {
        const aVel = a.weeklyVelocity.slice(-4).reduce((x, y) => x + y, 0)
        const bVel = b.weeklyVelocity.slice(-4).reduce((x, y) => x + y, 0)
        return bVel - aVel
      }
      case 'name':
        return a.name.localeCompare(b.name)
      default:
        return 0
    }
  })

  if (studies.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-slate-700 mb-2">No studies with sites</h3>
        <p className="text-slate-500 text-sm">Add sites to your studies to see them here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Sort controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-slate-700">
          {studies.length} {studies.length === 1 ? 'study' : 'studies'}
        </h2>
        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-400 mr-2">Sort:</span>
          {(['health', 'progress', 'velocity', 'name'] as SortOption[]).map((option) => (
            <button
              key={option}
              onClick={() => setSortBy(option)}
              className={`
                px-2.5 py-1 text-xs font-medium rounded-md transition-colors
                ${sortBy === option
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                }
              `}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sortedStudies.map((study, index) => (
          <div
            key={study.id}
            className="animate-slide-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <StudyPulseCard study={study} />
          </div>
        ))}
      </div>
    </div>
  )
}
