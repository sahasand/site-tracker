'use client'

import Link from 'next/link'
import type { MilestoneType } from '@/types'

interface StuckSite {
  siteId: string
  siteName: string
  siteNumber: string
  studyId: string
  studyName: string
  milestoneType: MilestoneType
  milestoneLabel: string
  daysStuck: number
}

interface BottleneckAlertsProps {
  stuckSites: StuckSite[]
}

function getSeverity(days: number): 'warning' | 'critical' {
  return days >= 21 ? 'critical' : 'warning'
}

export default function BottleneckAlerts({ stuckSites }: BottleneckAlertsProps) {
  if (stuckSites.length === 0) {
    return null
  }

  const criticalCount = stuckSites.filter(s => s.daysStuck >= 21).length
  const warningCount = stuckSites.length - criticalCount

  return (
    <div className="bg-white border border-amber-200 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">
              {stuckSites.length} site{stuckSites.length !== 1 ? 's' : ''} need attention
            </h3>
            <div className="flex gap-2 text-xs">
              {criticalCount > 0 && (
                <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                  {criticalCount} critical (21+ days)
                </span>
              )}
              {warningCount > 0 && (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                  {warningCount} warning (14-20 days)
                </span>
              )}
            </div>
          </div>

          <div className="mt-3 space-y-2 max-h-[180px] overflow-y-auto">
            {stuckSites.slice(0, 10).map((site) => {
              const severity = getSeverity(site.daysStuck)
              return (
                <div
                  key={`${site.siteId}-${site.milestoneType}`}
                  className={`flex items-center justify-between p-2 rounded-lg ${
                    severity === 'critical' ? 'bg-red-50' : 'bg-amber-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      severity === 'critical' ? 'bg-red-500' : 'bg-amber-500'
                    }`} />
                    <div>
                      <Link
                        href={`/sites/${site.siteId}`}
                        className="font-medium text-gray-900 hover:text-blue-600 hover:underline"
                      >
                        {site.siteNumber} - {site.siteName}
                      </Link>
                      <p className="text-xs text-gray-500">
                        {site.studyName} • Stuck at {site.milestoneLabel}
                      </p>
                    </div>
                  </div>
                  <div className={`text-sm font-semibold ${
                    severity === 'critical' ? 'text-red-600' : 'text-amber-600'
                  }`}>
                    {site.daysStuck} days
                  </div>
                </div>
              )
            })}
          </div>

          {stuckSites.length > 10 && (
            <p className="mt-2 text-xs text-gray-500">
              And {stuckSites.length - 10} more sites...
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
