'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { StudyPipeline, PipelineSite } from '@/lib/queries/portfolio'

interface PipelineTrackProps {
  pipelines: StudyPipeline[]
}

const STAGES = [
  { key: 'regulatory', label: 'REG', position: 0, color: '#3b82f6' },
  { key: 'contracts', label: 'CONT', position: 33, color: '#8b5cf6' },
  { key: 'siv', label: 'SIV', position: 66, color: '#14b8a6' },
  { key: 'active', label: 'ACTIVE', position: 100, color: '#10b981' },
] as const

function getDotPosition(site: PipelineSite): number {
  const stagePositions = {
    regulatory: 0,
    contracts: 33,
    siv: 66,
    active: 100,
  }

  const basePosition = stagePositions[site.currentStage]
  const nextStageOffset = site.currentStage === 'active' ? 0 : (site.stageProgress / 100) * 33

  return Math.min(basePosition + nextStageOffset * 0.5, 100)
}

function getDotColor(site: PipelineSite): string {
  if (site.isStuck) return '#ef4444'
  if (site.currentStage === 'active') return '#10b981'
  if (site.currentStage === 'siv') return '#14b8a6'
  if (site.currentStage === 'contracts') return '#8b5cf6'
  return '#3b82f6'
}

function getGlowColor(site: PipelineSite): string {
  if (site.isStuck) return 'rgba(239, 68, 68, 0.4)'
  if (site.currentStage === 'active') return 'rgba(16, 185, 129, 0.4)'
  if (site.currentStage === 'siv') return 'rgba(20, 184, 166, 0.4)'
  if (site.currentStage === 'contracts') return 'rgba(139, 92, 246, 0.4)'
  return 'rgba(59, 130, 246, 0.4)'
}

interface SiteCluster {
  position: number
  sites: PipelineSite[]
}

function groupSitesByPosition(sites: PipelineSite[]): SiteCluster[] {
  const groups = new Map<number, PipelineSite[]>()

  for (const site of sites) {
    const pos = getDotPosition(site)
    const existing = groups.get(pos) || []
    groups.set(pos, [...existing, site])
  }

  return Array.from(groups.entries())
    .map(([position, sites]) => ({ position, sites }))
    .sort((a, b) => a.position - b.position)
}

function SiteClusterDot({ cluster }: { cluster: SiteCluster }) {
  const [isHovered, setIsHovered] = useState(false)
  const { position, sites } = cluster
  const isMultiple = sites.length > 1
  const primarySite = sites[0]
  const primaryColor = getDotColor(primarySite)
  const glowColor = getGlowColor(primarySite)
  const hasStuck = sites.some(s => s.isStuck)

  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{
        left: `${position}%`,
        top: '50%',
        zIndex: isHovered ? 100 : 10,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Outer glow ring */}
      <div
        className={`absolute inset-0 rounded-full transition-all duration-300 ${
          isHovered ? 'scale-[2.5] opacity-100' : 'scale-150 opacity-0'
        }`}
        style={{
          background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
          width: '16px',
          height: '16px',
          marginLeft: '-4px',
          marginTop: '-4px',
        }}
      />

      {/* Main dot with premium styling */}
      {isMultiple ? (
        <div
          className={`relative cursor-pointer transition-all duration-200 ${
            isHovered ? 'scale-125' : 'scale-100'
          }`}
          style={{ width: '18px', height: '18px' }}
        >
          {/* Stacked appearance for multiple sites */}
          <div
            className="absolute rounded-full"
            style={{
              width: '14px',
              height: '14px',
              backgroundColor: primaryColor,
              boxShadow: `
                0 1px 2px rgba(0,0,0,0.1),
                0 2px 8px ${glowColor}
              `,
              top: '2px',
              left: '2px',
            }}
          />
          {/* Count badge - color matched */}
          <div
            className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1.5 rounded-full flex items-center justify-center border-2 border-white"
            style={{
              backgroundColor: primaryColor,
              boxShadow: `0 2px 6px ${glowColor}, 0 1px 2px rgba(0,0,0,0.1)`,
              zIndex: 20,
            }}
          >
            <span className="text-[10px] font-bold text-white number-highlight drop-shadow-sm">
              {sites.length}
            </span>
          </div>

          {/* Stuck indicator ring */}
          {hasStuck && (
            <div
              className="absolute inset-0 rounded-full animate-ping"
              style={{
                backgroundColor: 'transparent',
                border: '2px solid #ef4444',
                opacity: 0.6,
              }}
            />
          )}
        </div>
      ) : (
        <Link href={`/sites/${primarySite.id}`}>
          <div
            className={`rounded-full cursor-pointer transition-all duration-200 ${
              isHovered ? 'scale-150' : 'scale-100'
            } ${hasStuck ? 'animate-pulse' : ''}`}
            style={{
              width: '12px',
              height: '12px',
              backgroundColor: primaryColor,
              boxShadow: isHovered
                ? `0 0 0 3px ${primaryColor}20, 0 2px 12px ${glowColor}`
                : `0 1px 3px rgba(0,0,0,0.12), 0 1px 4px ${glowColor}`,
            }}
          />
        </Link>
      )}

      {/* Tooltip */}
      {isHovered && (
        <div
          className="absolute pointer-events-auto"
          style={{
            bottom: '100%',
            marginBottom: '16px',
            zIndex: 200,
            ...(position <= 15
              ? { left: 0 }
              : position >= 85
              ? { right: 0 }
              : { left: '50%', transform: 'translateX(-50%)' }),
          }}
        >
          <div
            className="rounded-xl overflow-hidden"
            style={{
              backgroundColor: '#0f172a',
              boxShadow: '0 4px 24px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)',
              minWidth: '180px',
            }}
          >
            {/* Tooltip header */}
            <div className="px-3 py-2 border-b border-white/10">
              <p className="text-[10px] font-semibold text-white/50 uppercase tracking-wider">
                {sites.length === 1 ? 'Site' : `${sites.length} Sites`}
              </p>
            </div>

            {/* Site list */}
            <div className="py-1">
              {sites.map((site) => (
                <Link
                  key={site.id}
                  href={`/sites/${site.id}`}
                  className="block hover:bg-white/10 transition-colors"
                >
                  <div className="px-3 py-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: getDotColor(site),
                          boxShadow: `0 0 6px ${getGlowColor(site)}`,
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate max-w-[140px]">
                          {site.name}
                        </p>
                        <p className="text-[11px] text-white/40 font-medium">
                          {site.siteNumber}
                        </p>
                      </div>
                      {site.daysInStage > 0 && (
                        <div
                          className={`text-[11px] font-bold number-highlight px-1.5 py-0.5 rounded ${
                            site.isStuck
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-white/10 text-white/60'
                          }`}
                        >
                          {site.daysInStage}d
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Arrow */}
          <div
            className="absolute top-full"
            style={{
              ...(position <= 15
                ? { left: '12px' }
                : position >= 85
                ? { right: '12px' }
                : { left: '50%', transform: 'translateX(-50%)' }),
            }}
          >
            <div
              className="w-0 h-0"
              style={{
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderTop: '8px solid #0f172a',
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function StudyTrack({ pipeline, isLast, index }: { pipeline: StudyPipeline; isLast: boolean; index: number }) {
  const clusters = groupSitesByPosition(pipeline.sites)
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={`relative group ${!isLast ? 'pb-5' : ''}`}
      style={{
        animationDelay: `${index * 80}ms`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Study label row */}
      <div className="flex items-center gap-3 mb-2.5 px-6">
        <Link
          href={`/studies/${pipeline.id}`}
          className={`text-sm font-semibold transition-colors truncate max-w-[180px] ${
            isHovered ? 'text-slate-900' : 'text-slate-600'
          }`}
        >
          {pipeline.name}
        </Link>
        <div className="flex items-center gap-1.5">
          <div className="w-1 h-1 rounded-full bg-slate-300" />
          <span className="text-xs font-medium text-slate-400 number-highlight">
            {pipeline.sites.length}
          </span>
          <span className="text-xs text-slate-400">
            {pipeline.sites.length === 1 ? 'site' : 'sites'}
          </span>
        </div>

        {/* Progress indicator */}
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1">
            {pipeline.sites.slice(0, 4).map((site, i) => (
              <div
                key={site.id}
                className="w-2 h-2 rounded-full border border-white"
                style={{
                  backgroundColor: getDotColor(site),
                  zIndex: 4 - i,
                }}
              />
            ))}
            {pipeline.sites.length > 4 && (
              <div className="w-2 h-2 rounded-full bg-slate-200 border border-white text-[6px] flex items-center justify-center text-slate-500 font-bold">
                +
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Track container */}
      <div className="relative h-8 mx-6 overflow-visible">
        {/* Track background with gradient */}
        <div
          className={`absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 rounded-full transition-all duration-300 ${
            isHovered ? 'h-1.5' : 'h-1'
          }`}
          style={{
            background: isHovered
              ? 'linear-gradient(90deg, #e2e8f0 0%, #cbd5e1 50%, #e2e8f0 100%)'
              : '#e2e8f0',
          }}
        />

        {/* Stage markers */}
        {STAGES.map((stage) => (
          <div
            key={stage.key}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
            style={{ left: `${stage.position}%` }}
          >
            <div
              className={`transition-all duration-200 rounded-full ${
                isHovered ? 'w-1.5 h-3.5' : 'w-1 h-2.5'
              }`}
              style={{
                backgroundColor: isHovered ? stage.color + '40' : '#cbd5e1',
              }}
            />
          </div>
        ))}

        {/* Site clusters */}
        {clusters.map((cluster) => (
          <SiteClusterDot key={`cluster-${cluster.position}`} cluster={cluster} />
        ))}
      </div>
    </div>
  )
}

export default function PipelineTrack({ pipelines }: PipelineTrackProps) {
  if (pipelines.length === 0) {
    return (
      <div className="text-center py-12 px-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
          </svg>
        </div>
        <p className="text-sm text-slate-400 font-medium">No active studies with sites</p>
        <p className="text-xs text-slate-300 mt-1">Add sites to studies to see them here</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {/* Study tracks */}
      <div className="space-y-0">
        {pipelines.map((pipeline, index) => (
          <StudyTrack
            key={pipeline.id}
            pipeline={pipeline}
            isLast={index === pipelines.length - 1}
            index={index}
          />
        ))}
      </div>
    </div>
  )
}
