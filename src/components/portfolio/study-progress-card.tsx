'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PieChart, Pie, Cell } from 'recharts'
import type { PortfolioStudy } from '@/lib/queries/portfolio'

interface StudyProgressCardProps {
  study: PortfolioStudy
  index?: number
}

const STAGE_CONFIG = {
  regulatory: { label: 'Regulatory', color: '#3b82f6', bgColor: 'bg-blue-500' },
  contracts: { label: 'Contracts', color: '#8b5cf6', bgColor: 'bg-violet-500' },
  site_initiation: { label: 'SIV', color: '#14b8a6', bgColor: 'bg-teal-500' },
  go_live: { label: 'Active', color: '#10b981', bgColor: 'bg-emerald-500' },
}

export default function StudyProgressCard({ study, index = 0 }: StudyProgressCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [animatedProgress, setAnimatedProgress] = useState(0)

  const {
    id,
    name,
    phase,
    sitesActive,
    sitesActivating,
    sitesPlanned,
    sitesTotal,
    sitesStuck,
    weeklyVelocity,
    trend,
    health,
    stageCounts,
  } = study

  // Calculate progress percentage
  const progressPercent = sitesTotal > 0 ? Math.round((sitesActive / sitesTotal) * 100) : 0

  // Animate progress on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progressPercent)
    }, 100 + index * 80)
    return () => clearTimeout(timer)
  }, [progressPercent, index])

  // Donut chart data
  const donutData = [
    { name: 'Active', value: sitesActive, color: '#10b981' },
    { name: 'Activating', value: sitesActivating, color: '#f59e0b' },
    { name: 'Planned', value: sitesPlanned, color: '#e2e8f0' },
  ]

  // Calculate recent velocity (avg of last 4 weeks)
  const recentVelocity = weeklyVelocity.slice(-4)
  const avgVelocity = recentVelocity.length > 0
    ? (recentVelocity.reduce((a, b) => a + b, 0) / recentVelocity.length).toFixed(1)
    : '0'

  // Trend styling
  const trendConfig = {
    up: { icon: '↗', color: 'text-emerald-500', bg: 'bg-emerald-50' },
    flat: { icon: '→', color: 'text-slate-400', bg: 'bg-slate-50' },
    down: { icon: '↘', color: 'text-red-500', bg: 'bg-red-50' },
  }
  const trendStyle = trendConfig[trend]

  // Health-based card styling
  const healthStyles = {
    healthy: {
      border: 'border-slate-200/80',
      shadow: 'shadow-sm hover:shadow-lg',
      glow: '',
    },
    at_risk: {
      border: 'border-amber-200/80',
      shadow: 'shadow-sm hover:shadow-lg hover:shadow-amber-100/50',
      glow: 'ring-1 ring-amber-100',
    },
    critical: {
      border: 'border-red-200/80',
      shadow: 'shadow-sm hover:shadow-lg hover:shadow-red-100/50',
      glow: 'ring-1 ring-red-100',
    },
  }
  const cardStyle = healthStyles[health]

  return (
    <Link href={`/studies/${id}`}>
      <div
        className={`
          group relative bg-white rounded-2xl border overflow-hidden
          transition-all duration-300 ease-out cursor-pointer
          ${cardStyle.border} ${cardStyle.shadow} ${cardStyle.glow}
          ${isHovered ? '-translate-y-1' : ''}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          animationDelay: `${index * 60}ms`,
        }}
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-slate-50/50 pointer-events-none" />

        <div className="relative p-5">
          {/* Header: Name + Phase */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-800 text-sm leading-tight truncate group-hover:text-slate-900 transition-colors">
                {name}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 font-medium tracking-wide">
                {sitesTotal} {sitesTotal === 1 ? 'site' : 'sites'}
              </p>
            </div>
            <span className={`
              flex-shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md
              ${phase === 'I' ? 'bg-blue-50 text-blue-600' :
                phase === 'II' ? 'bg-violet-50 text-violet-600' :
                phase === 'III' ? 'bg-teal-50 text-teal-600' :
                'bg-slate-50 text-slate-600'}
            `}>
              Phase {phase}
            </span>
          </div>

          {/* Main content: Donut + Stats */}
          <div className="flex items-center gap-4">
            {/* Donut Chart */}
            <div className="relative w-20 h-20 flex-shrink-0">
              <PieChart width={80} height={80} className="absolute inset-0">
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={24}
                  outerRadius={36}
                  paddingAngle={2}
                  dataKey="value"
                  strokeWidth={0}
                  animationBegin={index * 80}
                  animationDuration={800}
                >
                  {donutData.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
              {/* Center percentage */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-lg font-bold text-slate-800 tabular-nums leading-none">
                  {animatedProgress}%
                </span>
              </div>
            </div>

            {/* Site counts */}
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                <span className="text-xs text-slate-600 flex-1">Active</span>
                <span className="text-xs font-semibold text-slate-800 tabular-nums w-6 text-right">{sitesActive}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                <span className="text-xs text-slate-600 flex-1">Activating</span>
                <span className="text-xs font-semibold text-slate-800 tabular-nums w-6 text-right">{sitesActivating}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-200 flex-shrink-0" />
                <span className="text-xs text-slate-600 flex-1">Planned</span>
                <span className="text-xs font-semibold text-slate-800 tabular-nums w-6 text-right">{sitesPlanned}</span>
              </div>
            </div>
          </div>

          {/* Stage Progress Bars */}
          <div className="mt-4 pt-4 border-t border-slate-100/80">
            <div className="grid grid-cols-4 gap-1.5">
              {stageCounts.map((stage, i) => {
                const config = STAGE_CONFIG[stage.stage]
                const completedWidth = stage.total > 0 ? (stage.completed / stage.total) * 100 : 0
                const inProgressWidth = stage.total > 0 ? (stage.inProgress / stage.total) * 100 : 0

                return (
                  <div key={stage.stage} className="text-center">
                    {/* Bar */}
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden mb-1">
                      <div className="h-full flex">
                        <div
                          className="h-full transition-all duration-700 ease-out"
                          style={{
                            width: `${completedWidth}%`,
                            backgroundColor: config.color,
                            transitionDelay: `${i * 100 + 200}ms`,
                          }}
                        />
                        <div
                          className="h-full transition-all duration-700 ease-out opacity-40"
                          style={{
                            width: `${inProgressWidth}%`,
                            backgroundColor: config.color,
                            transitionDelay: `${i * 100 + 300}ms`,
                          }}
                        />
                      </div>
                    </div>
                    {/* Label + Count */}
                    <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">
                      {config.label}
                    </p>
                    <p className="text-[10px] font-semibold text-slate-600 tabular-nums">
                      {stage.completed}/{stage.total}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Footer: Velocity + Alerts */}
          <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center justify-between">
            {/* Velocity */}
            <div className="flex items-center gap-2">
              <span className={`
                inline-flex items-center justify-center w-5 h-5 rounded-md text-xs font-bold
                ${trendStyle.bg} ${trendStyle.color}
              `}>
                {trendStyle.icon}
              </span>
              <div>
                <p className="text-xs font-semibold text-slate-700">
                  {avgVelocity}<span className="text-slate-400 font-normal">/wk</span>
                </p>
              </div>
            </div>

            {/* Stuck sites alert */}
            {sitesStuck > 0 ? (
              <div className={`
                flex items-center gap-1.5 px-2 py-1 rounded-lg
                ${sitesStuck >= 3 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}
              `}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <span className="text-[10px] font-semibold">{sitesStuck} stuck</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-[10px] font-semibold">On track</span>
              </div>
            )}
          </div>
        </div>

        {/* Hover indicator line */}
        <div className={`
          absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-300
          ${isHovered ? 'opacity-100' : 'opacity-0'}
          ${health === 'critical' ? 'bg-red-500' : health === 'at_risk' ? 'bg-amber-500' : 'bg-teal-500'}
        `} />
      </div>
    </Link>
  )
}
