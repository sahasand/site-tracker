'use client'

import { useMemo } from 'react'
import PipelineTrack from './pipeline-track'
import type { PortfolioSummary, StudyPipeline } from '@/lib/queries/portfolio'

interface SummaryHeaderProps {
  summary?: PortfolioSummary
  pipelines?: StudyPipeline[]
}

export default function SummaryHeader({ pipelines = [] }: SummaryHeaderProps) {
  // Calculate aggregate stats from pipelines
  const stats = useMemo(() => {
    let totalSites = 0
    let activeSites = 0
    let activatingSites = 0

    pipelines.forEach(p => {
      p.sites.forEach(s => {
        totalSites++
        if (s.currentStage === 'active') activeSites++
        else activatingSites++
      })
    })

    return {
      studies: pipelines.length,
      totalSites,
      activeSites,
      activatingSites,
      activationRate: totalSites > 0 ? Math.round((activeSites / totalSites) * 100) : 0,
    }
  }, [pipelines])

  const today = new Date()
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })

  return (
    <div className="relative">
      {/* Main container with premium styling */}
      <div className="card-elevated overflow-hidden">
        {/* Subtle gradient overlay at top */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />

        {/* Header section */}
        <div className="relative px-8 pt-8 pb-6">
          {/* Top row: Title + Date */}
          <div className="flex items-start justify-between mb-8">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-semibold gradient-text tracking-tight">
                  Portfolio
                </h1>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">Live</span>
                </div>
              </div>
              <p className="text-sm text-slate-400 font-medium">
                {formattedDate}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-6">
              <StatPill
                label="Studies"
                value={stats.studies}
                color="blue"
              />
              <div className="w-px h-8 bg-slate-200" />
              <StatPill
                label="Sites"
                value={stats.totalSites}
                color="slate"
              />
              <div className="w-px h-8 bg-slate-200" />
              <StatPill
                label="Active"
                value={stats.activeSites}
                suffix={`/${stats.totalSites}`}
                color="emerald"
              />
              <div className="w-px h-8 bg-slate-200" />
              <div className="text-right">
                <p className="text-2xl font-bold number-highlight text-slate-800">
                  {stats.activationRate}%
                </p>
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                  Activated
                </p>
              </div>
            </div>
          </div>

          {/* Stage Legend */}
          <div className="flex items-center gap-6 mb-6">
            <div className="flex items-center gap-4">
              {[
                { label: 'Regulatory', color: 'bg-blue-500' },
                { label: 'Contracts', color: 'bg-violet-500' },
                { label: 'SIV', color: 'bg-teal-500' },
                { label: 'Active', color: 'bg-emerald-500' },
              ].map((stage) => (
                <div key={stage.label} className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${stage.color}`} />
                  <span className="text-xs font-medium text-slate-500">{stage.label}</span>
                </div>
              ))}
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              <span>Stuck &gt;14d</span>
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="h-px separator-gradient mx-8" />

        {/* Pipeline Track Section */}
        <div className="relative px-2 py-6">
          {/* Stage column header - Active only */}
          <div className="px-6 mb-4 text-right">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-emerald-500">
              ACTIVE
            </span>
          </div>

          {/* Pipeline Track */}
          <PipelineTrack pipelines={pipelines} />
        </div>
      </div>
    </div>
  )
}

function StatPill({
  label,
  value,
  suffix,
  color
}: {
  label: string
  value: number
  suffix?: string
  color: 'blue' | 'slate' | 'emerald' | 'amber'
}) {
  const colorClasses = {
    blue: 'text-blue-600',
    slate: 'text-slate-700',
    emerald: 'text-emerald-600',
    amber: 'text-amber-600',
  }

  return (
    <div className="text-right">
      <p className={`text-2xl font-bold number-highlight ${colorClasses[color]}`}>
        {value}
        {suffix && <span className="text-sm font-medium text-slate-400">{suffix}</span>}
      </p>
      <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
        {label}
      </p>
    </div>
  )
}
