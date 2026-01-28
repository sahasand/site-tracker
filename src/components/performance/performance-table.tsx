'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import PerformanceTierBadge from './performance-tier-badge'
import type { Study, SitePerformanceMetric, Site } from '@/types'

// Inline the type and function to avoid importing server-side code
interface SitePerformanceWithDetails extends SitePerformanceMetric {
  site: Site & { study: Study }
}

function getPerformanceTier(score: number | null): 'high' | 'medium' | 'low' | 'unknown' {
  if (score === null) return 'unknown'
  if (score >= 80) return 'high'
  if (score >= 60) return 'medium'
  return 'low'
}

interface PerformanceTableProps {
  metrics: SitePerformanceWithDetails[]
  studies: Study[]
}

export default function PerformanceTable({ metrics, studies }: PerformanceTableProps) {
  const [studyFilter, setStudyFilter] = useState<string>('all')

  const filteredMetrics = useMemo(() => {
    if (studyFilter === 'all') return metrics
    return metrics.filter(m => m.site?.study?.id === studyFilter)
  }, [metrics, studyFilter])

  if (metrics.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-lg font-medium">No performance data yet</p>
        <p className="text-sm">Performance metrics will appear as sites collect data.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="study-filter" className="text-sm font-medium text-gray-700">
            Filter by Study:
          </label>
          <Select value={studyFilter} onValueChange={setStudyFilter}>
            <SelectTrigger className="w-[250px]" id="study-filter">
              <SelectValue placeholder="All Studies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Studies</SelectItem>
              {studies.map((study) => (
                <SelectItem key={study.id} value={study.id}>
                  {study.protocol_number} - {study.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-gray-500">
          {filteredMetrics.length} site{filteredMetrics.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>Site</TableHead>
              <TableHead>Study</TableHead>
              <TableHead className="text-center">Score</TableHead>
              <TableHead className="text-center">Tier</TableHead>
              <TableHead className="text-right">Queries Open</TableHead>
              <TableHead className="text-right">Queries Resolved</TableHead>
              <TableHead className="text-right">Avg Resolution (days)</TableHead>
              <TableHead className="text-right">Data Lag (days)</TableHead>
              <TableHead className="text-right">Deviations</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMetrics.map((metric) => {
              const tier = getPerformanceTier(metric.performance_score)
              return (
                <TableRow key={metric.id}>
                  <TableCell>
                    <Link
                      href={`/sites/${metric.site_id}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {metric.site?.site_number} - {metric.site?.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {metric.site?.study?.protocol_number}
                  </TableCell>
                  <TableCell className="text-center font-semibold">
                    {metric.performance_score ?? '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    <PerformanceTierBadge tier={tier} />
                  </TableCell>
                  <TableCell className="text-right">
                    {metric.queries_opened}
                  </TableCell>
                  <TableCell className="text-right">
                    {metric.queries_resolved}
                  </TableCell>
                  <TableCell className="text-right">
                    {metric.avg_resolution_days?.toFixed(1) ?? '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {metric.data_entry_lag_days ?? '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {metric.protocol_deviations}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-green-500"></span>
          High (80+)
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-500"></span>
          Medium (60-79)
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500"></span>
          Low (&lt;60)
        </div>
      </div>
    </div>
  )
}
