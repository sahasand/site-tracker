'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { StudyPipeline, PipelineSite } from '@/lib/queries/portfolio'

interface PipelineTrackProps {
  pipelines: StudyPipeline[]
}

const STAGES = [
  { key: 'regulatory', label: 'REG', position: 0 },
  { key: 'contracts', label: 'CONT', position: 33 },
  { key: 'siv', label: 'SIV', position: 66 },
  { key: 'active', label: 'ACTIVE', position: 100 },
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
  const hasStuck = sites.some(s => s.isStuck)

  const dotSize = isMultiple ? 'w-4 h-4' : 'w-3 h-3'

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
      {/* Outer ring for multiple sites */}
      {isMultiple && (
        <div
          className="absolute inset-0 rounded-full -m-1"
          style={{
            border: `2px solid ${primaryColor}`,
            opacity: 0.4,
          }}
        />
      )}

      {/* Main dot */}
      {isMultiple ? (
        <div
          className={`relative ${dotSize} rounded-full cursor-pointer transition-transform duration-150 ${
            isHovered ? 'scale-125' : 'scale-100'
          } ${hasStuck ? 'animate-pulse' : ''}`}
          style={{
            backgroundColor: primaryColor,
            boxShadow: `0 0 6px ${primaryColor}`,
          }}
        >
          {/* Count badge */}
          <span
            className="absolute -top-2.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-slate-700 text-white text-[10px] font-semibold flex items-center justify-center"
            style={{ zIndex: 20 }}
          >
            {sites.length}
          </span>
        </div>
      ) : (
        <Link href={`/sites/${primarySite.id}`}>
          <div
            className={`${dotSize} rounded-full cursor-pointer transition-transform duration-150 ${
              isHovered ? 'scale-150' : 'scale-100'
            } ${hasStuck ? 'animate-pulse' : ''}`}
            style={{
              backgroundColor: primaryColor,
              boxShadow: isHovered ? `0 0 10px ${primaryColor}` : `0 0 4px ${primaryColor}`,
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
            marginBottom: '12px',
            zIndex: 200,
            // Adjust horizontal position based on where dot is on track
            ...(position <= 15
              ? { left: 0 }
              : position >= 85
              ? { right: 0 }
              : { left: '50%', transform: 'translateX(-50%)' }),
          }}
        >
          <div className="bg-slate-900 text-white px-3 py-2 rounded-lg shadow-xl text-xs whitespace-nowrap min-w-[140px]">
            {sites.map((site, i) => (
              <Link
                key={site.id}
                href={`/sites/${site.id}`}
                className={`block hover:bg-slate-700 -mx-2 px-2 py-1.5 rounded transition-colors ${
                  i > 0 ? 'mt-1 pt-1.5 border-t border-slate-700' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: getDotColor(site) }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate max-w-[160px]">{site.name}</p>
                    <p className="text-slate-400 text-[10px]">{site.siteNumber}</p>
                  </div>
                  {site.daysInStage > 0 && (
                    <span
                      className={`text-[10px] flex-shrink-0 ${
                        site.isStuck ? 'text-red-400 font-medium' : 'text-slate-400'
                      }`}
                    >
                      {site.daysInStage}d
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
          {/* Arrow - also adjust position */}
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
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-slate-900" />
          </div>
        </div>
      )}
    </div>
  )
}

function StudyTrack({ pipeline, isLast }: { pipeline: StudyPipeline; isLast: boolean }) {
  const clusters = groupSitesByPosition(pipeline.sites)

  return (
    <div className={`relative ${!isLast ? 'pb-4' : ''}`}>
      {/* Study label */}
      <div className="flex items-center gap-2 mb-1.5">
        <Link
          href={`/studies/${pipeline.id}`}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors truncate max-w-[140px]"
        >
          {pipeline.name}
        </Link>
        <span className="text-[10px] text-slate-400 font-medium">
          {pipeline.sites.length} {pipeline.sites.length === 1 ? 'site' : 'sites'}
        </span>
      </div>

      {/* Track container */}
      <div className="relative h-6 overflow-visible">
        {/* Track background */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 rounded-full bg-slate-200" />

        {/* Stage markers */}
        {STAGES.map((stage) => (
          <div
            key={stage.key}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
            style={{ left: `${stage.position}%` }}
          >
            <div className="w-0.5 h-2.5 bg-slate-300 rounded-full" />
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
      <div className="text-center py-8 text-slate-400 text-sm">
        No active studies with sites
      </div>
    )
  }

  return (
    <div className="space-y-1 px-6">
      {/* Stage labels header */}
      <div className="relative h-5 mb-1">
        {STAGES.map((stage) => (
          <div
            key={stage.key}
            className="absolute text-[10px] font-medium text-slate-400 uppercase tracking-wider"
            style={{
              left: `${stage.position}%`,
              transform: stage.position === 0 ? 'none' : stage.position === 100 ? 'translateX(-100%)' : 'translateX(-50%)',
            }}
          >
            {stage.label}
          </div>
        ))}
      </div>

      {/* Study tracks */}
      <div className="space-y-0">
        {pipelines.map((pipeline, index) => (
          <StudyTrack
            key={pipeline.id}
            pipeline={pipeline}
            isLast={index === pipelines.length - 1}
          />
        ))}
      </div>

    </div>
  )
}
