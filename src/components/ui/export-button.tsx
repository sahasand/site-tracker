'use client'

import { Button } from '@/components/ui/button'
import { sitesToCSV, downloadCSV, type ExportSite } from '@/lib/export'

interface ExportButtonProps {
  sites: ExportSite[]
  filename: string
  includeStudy?: boolean
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function ExportButton({
  sites,
  filename,
  includeStudy = false,
  variant = 'outline',
  size = 'sm',
}: ExportButtonProps) {
  function handleExport() {
    const csv = sitesToCSV(sites, includeStudy)
    downloadCSV(csv, filename)
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleExport}
      className="gap-2"
      aria-label="Export sites to CSV"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
      Export CSV
    </Button>
  )
}
