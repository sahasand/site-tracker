'use client'

import { useState, useMemo } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ExportButton } from '@/components/ui/export-button'
import SiteTable from './site-table'
import type { Site, SiteStatus } from '@/types'

interface SiteTableWithFilterProps {
  sites: Site[]
  studyName?: string
}

const STATUS_OPTIONS: { value: SiteStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'planned', label: 'Planned' },
  { value: 'activating', label: 'Activating' },
  { value: 'active', label: 'Active' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'closed', label: 'Closed' },
]

export default function SiteTableWithFilter({ sites, studyName }: SiteTableWithFilterProps) {
  const [statusFilter, setStatusFilter] = useState<SiteStatus | 'all'>('all')

  const filteredSites = useMemo(() => {
    if (statusFilter === 'all') return sites
    return sites.filter((site) => site.status === statusFilter)
  }, [sites, statusFilter])

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: sites.length }
    sites.forEach((site) => {
      counts[site.status] = (counts[site.status] || 0) + 1
    })
    return counts
  }, [sites])

  const getLabel = (value: string) => {
    const option = STATUS_OPTIONS.find((o) => o.value === value)
    const count = statusCounts[value] || 0
    return `${option?.label} (${count})`
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as SiteStatus | 'all')}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue>{getLabel(statusFilter)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label} ({statusCounts[option.value] || 0})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ExportButton
          sites={filteredSites}
          filename={`${studyName || 'sites'}-export-${new Date().toISOString().split('T')[0]}.csv`}
        />
      </div>

      {filteredSites.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          No sites match the selected filter.
        </div>
      ) : (
        <SiteTable sites={filteredSites} />
      )}
    </div>
  )
}
