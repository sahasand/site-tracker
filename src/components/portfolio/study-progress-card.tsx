'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import type { PortfolioStudy } from '@/lib/queries/portfolio'

interface StudyProgressCardProps {
  study: PortfolioStudy
  index?: number
}

const STAGE_CONFIG = {
  regulatory: { label: 'REG', color: '#3b82f6', lightColor: '#dbeafe' },
  contracts: { label: 'CONT', color: '#8b5cf6', lightColor: '#ede9fe' },
  site_initiation: { label: 'SIV', color: '#14b8a6', lightColor: '#ccfbf1' },
  go_live: { label: 'ACTIVE', color: '#10b981', lightColor: '#d1fae5' },
}

export default function StudyProgressCard({ study, index = 0 }: StudyProgressCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [animatedProgress, setAnimatedProgress] = useState(0)
  const [mounted, setMounted] = useState(false)

  const {
    id,
    name,
    phase,
    sitesActive,
    sitesActivating,
    sitesPlanned,
    sitesTotal,
    sitesStuck,
    health,
    stageCounts,
  } = study

  // Calculate overall milestone progress
  const totalMilestones = stageCounts.reduce((sum, s) => sum + s.total, 0)
  const completedMilestones = stageCounts.reduce((sum, s) => sum + s.completed, 0)
  const milestoneProgress = totalMilestones > 0
    ? Math.round((completedMilestones / totalMilestones) * 100)
    : 0

  // Animation on mount
  useEffect(() => {
    const mountTimer = setTimeout(() => setMounted(true), index * 60)
    return () => {
      clearTimeout(mountTimer)
    }
  }, [index])

  // Calculate activation percentage (active sites / total)
  const activationPercent = sitesTotal > 0 ? Math.round((sitesActive / sitesTotal) * 100) : 0

  // Animate progress
  useEffect(() => {
    const progressTimer = setTimeout(() => {
      setAnimatedProgress(activationPercent)
    }, 200 + index * 80)
    return () => {
      clearTimeout(progressTimer)
    }
  }, [activationPercent, index])

  // Donut chart data
  const donutData = [
    { name: 'Active', value: sitesActive || 0.001, color: '#10b981' },
    { name: 'Activating', value: sitesActivating || 0.001, color: '#f59e0b' },
    { name: 'Planned', value: sitesPlanned || 0.001, color: '#e2e8f0' },
  ].filter(d => d.value > 0.001 || d.name === 'Active')

  // Progress status based on milestone completion
  const progressStatus = milestoneProgress >= 75
    ? { icon: '●', label: 'Almost there', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' }
    : milestoneProgress >= 50
    ? { icon: '◐', label: 'Halfway', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' }
    : milestoneProgress > 0
    ? { icon: '○', label: 'In progress', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' }
    : { icon: '○', label: 'Starting', color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-100' }

  // Health-based styling
  const healthConfig = {
    healthy: {
      indicator: 'bg-emerald-500',
      label: 'On Track',
      labelColor: 'text-emerald-700',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      cardBorder: 'hover:border-emerald-200/60',
      glow: 'hover:shadow-emerald-100/50',
    },
    at_risk: {
      indicator: 'bg-amber-500',
      label: 'At Risk',
      labelColor: 'text-amber-700',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      cardBorder: 'border-amber-200/40 hover:border-amber-300/60',
      glow: 'hover:shadow-amber-100/50',
    },
    critical: {
      indicator: 'bg-red-500',
      label: 'Critical',
      labelColor: 'text-red-700',
      bg: 'bg-red-50',
      border: 'border-red-100',
      cardBorder: 'border-red-200/40 hover:border-red-300/60',
      glow: 'hover:shadow-red-100/50',
    },
  }
  const healthStyle = healthConfig[health]

  // Phase badge colors
  const phaseColors = {
    I: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    II: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
    III: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
    IV: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
  }
  const phaseStyle = phaseColors[phase as keyof typeof phaseColors] || phaseColors.IV

  return (
    <Link href={`/studies/${id}`}>
      <div
        className={`
          group relative bg-white rounded-2xl border overflow-hidden
          transition-all duration-300 ease-out cursor-pointer
          ${healthStyle.cardBorder}
          ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}
        `}
        style={{
          boxShadow: isHovered
            ? '0 0 0 1px rgba(0,0,0,0.04), 0 4px 12px -2px rgba(0,0,0,0.08), 0 12px 32px -4px rgba(0,0,0,0.12)'
            : '0 0 0 1px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02), 0 4px 8px -2px rgba(0,0,0,0.04)',
          transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
          transitionDelay: `${index * 40}ms`,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Top accent line based on health */}
        <div className={`absolute top-0 left-0 right-0 h-0.5 ${healthStyle.indicator} opacity-80`} />

        <div className="relative p-5">
          {/* Header: Name + Phase + Health */}
          <div className="flex items-start justify-between gap-3 mb-5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 mb-1">
                <h3 className="font-semibold text-slate-800 text-[15px] leading-tight truncate group-hover:text-slate-900 transition-colors">
                  {name}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium number-highlight">
                  {sitesTotal} {sitesTotal === 1 ? 'site' : 'sites'}
                </span>
                <div className="w-1 h-1 rounded-full bg-slate-200" />
                <span className={`
                  inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border
                  ${phaseStyle.bg} ${phaseStyle.text} ${phaseStyle.border}
                `}>
                  PHASE {phase}
                </span>
              </div>
            </div>

            {/* Health Badge */}
            <div className={`
              flex items-center gap-1.5 px-2 py-1 rounded-lg
              ${healthStyle.bg} ${healthStyle.border} border
            `}>
              <div className={`w-1.5 h-1.5 rounded-full ${healthStyle.indicator} ${health !== 'healthy' ? 'animate-pulse' : ''}`} />
              <span className={`text-[10px] font-semibold ${healthStyle.labelColor}`}>
                {healthStyle.label}
              </span>
            </div>
          </div>

          {/* Main content: Donut + Stats */}
          <div className="flex items-center gap-5">
            {/* Donut Chart */}
            <div className="relative w-[88px] h-[88px] flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={28}
                    outerRadius={40}
                    paddingAngle={3}
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
              </ResponsiveContainer>
              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-slate-800 number-highlight leading-none">
                  {animatedProgress}
                  <span className="text-sm text-slate-400 font-medium">%</span>
                </span>
                <span className="text-[8px] text-slate-400/70 font-medium uppercase tracking-wider mt-0.5">active</span>
              </div>
            </div>

            {/* Site counts */}
            <div className="flex-1 space-y-2.5">
              {[
                { label: 'Active', value: sitesActive, color: '#10b981', dotBg: 'bg-emerald-500' },
                { label: 'Activating', value: sitesActivating, color: '#f59e0b', dotBg: 'bg-amber-500' },
                { label: 'Planned', value: sitesPlanned, color: '#e2e8f0', dotBg: 'bg-slate-200' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2.5">
                  <div className={`w-2 h-2 rounded-full ${item.dotBg} flex-shrink-0`} />
                  <span className="text-xs text-slate-500 flex-1">{item.label}</span>
                  <span className="text-sm font-semibold text-slate-700 number-highlight w-6 text-right">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Stage Progress Bars */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <div className="grid grid-cols-4 gap-2">
              {stageCounts.map((stage, i) => {
                const config = STAGE_CONFIG[stage.stage]
                const completedWidth = stage.total > 0 ? (stage.completed / stage.total) * 100 : 0

                return (
                  <div key={stage.stage} className="space-y-1.5">
                    {/* Bar */}
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden relative">
                      <div
                        className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${completedWidth}%`,
                          backgroundColor: config.color,
                          transitionDelay: `${i * 100 + 200}ms`,
                        }}
                      />
                      {stage.inProgress > 0 && (
                        <div
                          className="absolute inset-y-0 rounded-full transition-all duration-700 ease-out opacity-40"
                          style={{
                            left: `${completedWidth}%`,
                            width: `${(stage.inProgress / stage.total) * 100}%`,
                            backgroundColor: config.color,
                            transitionDelay: `${i * 100 + 300}ms`,
                          }}
                        />
                      )}
                    </div>
                    {/* Label */}
                    <div className="flex items-center justify-between">
                      <p
                        className="text-[9px] font-bold uppercase tracking-wider"
                        style={{ color: config.color }}
                      >
                        {config.label}
                      </p>
                      <p className="text-[10px] font-semibold text-slate-500 number-highlight">
                        {stage.completed}/{stage.total}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Footer: Progress + Alerts */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            {/* Progress */}
            <div className="flex items-center gap-2.5">
              <div className={`
                inline-flex items-center justify-center w-6 h-6 rounded-lg text-sm font-bold
                ${progressStatus.bg} ${progressStatus.color} ${progressStatus.border} border
              `}>
                {progressStatus.icon}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700 number-highlight leading-none">
                  {completedMilestones}
                  <span className="text-xs text-slate-400 font-medium">/{totalMilestones}</span>
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">{progressStatus.label}</p>
              </div>
            </div>

            {/* Stuck sites alert */}
            {sitesStuck > 0 ? (
              <div className={`
                flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
                ${sitesStuck >= 3 ? 'bg-red-50 border border-red-100' : 'bg-amber-50 border border-amber-100'}
              `}>
                <svg
                  className={`w-3.5 h-3.5 ${sitesStuck >= 3 ? 'text-red-500' : 'text-amber-500'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <span className={`text-[11px] font-bold number-highlight ${sitesStuck >= 3 ? 'text-red-700' : 'text-amber-700'}`}>
                  {sitesStuck} stuck
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100">
                <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-[11px] font-bold text-emerald-700">On track</span>
              </div>
            )}
          </div>
        </div>

        {/* Hover indicator */}
        <div
          className={`
            absolute bottom-0 left-0 right-0 h-1 transition-all duration-300
            ${isHovered ? 'opacity-100' : 'opacity-0'}
          `}
          style={{
            background: health === 'critical' ? '#ef4444' : health === 'at_risk' ? '#f59e0b' : '#10b981',
          }}
        />
      </div>
    </Link>
  )
}
