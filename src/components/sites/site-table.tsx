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
import { Badge } from '@/components/ui/badge'
import type { Site } from '@/types'

interface SiteTableProps {
  sites: Site[]
}

type SortColumn = 'site_number' | 'name' | 'status' | 'current_enrollment'
type SortDirection = 'asc' | 'desc'

const statusColors: Record<string, string> = {
  planned: 'bg-gray-100 text-gray-800',
  activating: 'bg-amber-100 text-amber-800',
  active: 'bg-green-100 text-green-800',
  on_hold: 'bg-red-100 text-red-800',
  closed: 'bg-gray-100 text-gray-800',
}

const statusOrder: Record<string, number> = {
  planned: 0,
  activating: 1,
  active: 2,
  on_hold: 3,
  closed: 4,
}

function SortIcon({ direction }: { direction: SortDirection | null }) {
  if (!direction) {
    return (
      <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
      </svg>
    )
  }
  return direction === 'asc' ? (
    <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
    </svg>
  ) : (
    <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  )
}

export default function SiteTable({ sites }: SiteTableProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>('site_number')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const sortedSites = useMemo(() => {
    return [...sites].sort((a, b) => {
      let comparison = 0

      switch (sortColumn) {
        case 'site_number':
          comparison = a.site_number.localeCompare(b.site_number, undefined, { numeric: true })
          break
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'status':
          comparison = statusOrder[a.status] - statusOrder[b.status]
          break
        case 'current_enrollment':
          comparison = a.current_enrollment - b.current_enrollment
          break
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [sites, sortColumn, sortDirection])

  function handleSort(column: SortColumn) {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  if (sites.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No sites yet. Add your first site to get started.
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            <button
              onClick={() => handleSort('site_number')}
              className="flex items-center gap-1 hover:text-slate-900 transition-colors"
              aria-label={`Sort by site number${sortColumn === 'site_number' ? `, currently ${sortDirection}ending` : ''}`}
            >
              Site #
              <SortIcon direction={sortColumn === 'site_number' ? sortDirection : null} />
            </button>
          </TableHead>
          <TableHead>
            <button
              onClick={() => handleSort('name')}
              className="flex items-center gap-1 hover:text-slate-900 transition-colors"
              aria-label={`Sort by name${sortColumn === 'name' ? `, currently ${sortDirection}ending` : ''}`}
            >
              Name
              <SortIcon direction={sortColumn === 'name' ? sortDirection : null} />
            </button>
          </TableHead>
          <TableHead>PI</TableHead>
          <TableHead>Country</TableHead>
          <TableHead>
            <button
              onClick={() => handleSort('status')}
              className="flex items-center gap-1 hover:text-slate-900 transition-colors"
              aria-label={`Sort by status${sortColumn === 'status' ? `, currently ${sortDirection}ending` : ''}`}
            >
              Status
              <SortIcon direction={sortColumn === 'status' ? sortDirection : null} />
            </button>
          </TableHead>
          <TableHead className="text-right">
            <button
              onClick={() => handleSort('current_enrollment')}
              className="flex items-center gap-1 ml-auto hover:text-slate-900 transition-colors"
              aria-label={`Sort by enrollment${sortColumn === 'current_enrollment' ? `, currently ${sortDirection}ending` : ''}`}
            >
              Enrollment
              <SortIcon direction={sortColumn === 'current_enrollment' ? sortDirection : null} />
            </button>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedSites.map((site) => (
          <TableRow key={site.id} data-site-id={site.id} className="transition-colors duration-500">
            <TableCell>
              <Link
                href={`/sites/${site.id}`}
                className="font-medium text-blue-600 hover:underline"
              >
                {site.site_number}
              </Link>
            </TableCell>
            <TableCell>{site.name}</TableCell>
            <TableCell>{site.principal_investigator}</TableCell>
            <TableCell>{site.country}</TableCell>
            <TableCell>
              <Badge className={statusColors[site.status]}>
                {site.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              {site.current_enrollment} / {site.target_enrollment}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
