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

const statusColors: Record<string, string> = {
  planned: 'bg-gray-100 text-gray-800',
  activating: 'bg-yellow-100 text-yellow-800',
  active: 'bg-green-100 text-green-800',
  on_hold: 'bg-red-100 text-red-800',
  closed: 'bg-gray-100 text-gray-800',
}

export default function SiteTable({ sites }: SiteTableProps) {
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
          <TableHead>Site #</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>PI</TableHead>
          <TableHead>Country</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Enrollment</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sites.map((site) => (
          <TableRow key={site.id}>
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
