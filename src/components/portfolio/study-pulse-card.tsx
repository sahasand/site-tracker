'use client'

import { useState } from 'react'
import Link from 'next/link'
import Sparkline from './sparkline'
import type { PortfolioStudy } from '@/lib/queries/portfolio'

interface StudyPulseCardProps {
  study: PortfolioStudy
}

export default function StudyPulseCard({ study }: StudyPulseCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const {
    id,
    name,
    phase,
    sitesActive,
    sitesTotal,
    weeklyVelocity,
    trend,
    health,
    stageCounts,
  } = study

  // Health-based styling
  const healthStyles = {
    healthy: {
      bg: 'bg-white',
      border: 'border-slate-200/60',
      pulse: false,
    },
    at_risk: {
      bg: 'bg-amber-50/30',
      border: 'border-amber-200/60',
      pulse: false,
    },
    critical: {
      bg: 'bg-red-50/30',
      border: 'border-red-200/60',
      pulse: true,
    },
  }

  const style = healthStyles[health]

  // Trend arrow and color
  const trendConfig = {
    up: { arrow: '↗', color: 'text-teal-500' },
    flat: { arrow: '→', color: 'text-slate-400' },
    down: { arrow: '↘', color: 'text-red-500' },
  }
  const { arrow, color: trendColor } = trendConfig[trend]

  // Sparkline color based on health
  const sparklineColor = health === 'healthy' ? '#14b8a6' : health === 'at_risk' ? '#f59e0b' : '#ef4444'

  // Stage labels
  const stageLabels = {
    regulatory: 'Reg',
    contracts: 'Contract',
    site_initiation: 'SIV',
    go_live: 'Go-Live',
  }

  return (
    <Link href={`/studies/${id}`}>
      <div
        className={`
          relative p-4 rounded-xl border transition-all duration-200 cursor-pointer
          ${style.bg} ${style.border}
          ${isHovered ? 'shadow-md -translate-y-0.5' : 'shadow-sm'}
          ${style.pulse ? 'animate-pulse-subtle' : ''}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Progress dots + trend */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            {Array.from({ length: sitesTotal }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i < sitesActive ? 'bg-teal-500' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
          <span className={`text-lg font-medium ${trendColor}`}>{arrow}</span>
        </div>

        {/* Sparkline */}
        <div className="mb-3">
          <Sparkline
            data={weeklyVelocity}
            width={140}
            height={28}
            color={sparklineColor}
          />
        </div>

        {/* Study name + phase */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-slate-800 text-sm leading-tight line-clamp-2">
            {name}
          </h3>
          <span className={`
            flex-shrink-0 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded
            ${phase === 'I' ? 'bg-blue-100 text-blue-700' :
              phase === 'II' ? 'bg-violet-100 text-violet-700' :
              phase === 'III' ? 'bg-teal-100 text-teal-700' :
              'bg-slate-100 text-slate-700'}
          `}>
            {phase}
          </span>
        </div>

        {/* Site count */}
        <p className="text-xs text-slate-500 mt-1">
          {sitesActive} of {sitesTotal} sites active
        </p>

        {/* Mini stage bars (on hover) */}
        <div className={`
          mt-3 pt-3 border-t border-slate-100 space-y-1.5
          transition-all duration-200
          ${isHovered ? 'opacity-100 max-h-32' : 'opacity-0 max-h-0 overflow-hidden'}
        `}>
          {stageCounts.map(({ stage, completed, total }) => (
            <div key={stage} className="flex items-center gap-2">
              <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    stage === 'regulatory' ? 'bg-blue-500' :
                    stage === 'contracts' ? 'bg-violet-500' :
                    stage === 'site_initiation' ? 'bg-teal-500' :
                    'bg-emerald-500'
                  }`}
                  style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 w-14 text-right">
                {stageLabels[stage]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Link>
  )
}
