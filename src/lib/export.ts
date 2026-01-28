import type { Site, SiteActivationMilestone, Study } from '@/types'

export interface ExportSite extends Site {
  milestones?: SiteActivationMilestone[]
  study?: Study
}

function escapeCSV(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  // Escape quotes and wrap in quotes if contains comma, quote, or newline
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function sitesToCSV(sites: ExportSite[], includeStudy = false): string {
  const headers = [
    'Site Number',
    'Site Name',
    'Principal Investigator',
    'Country',
    'Region',
    'Status',
    'Target Enrollment',
    'Current Enrollment',
    ...(includeStudy ? ['Study', 'Protocol Number'] : []),
    'Regulatory Submitted',
    'Regulatory Approved',
    'Contract Sent',
    'Contract Executed',
    'SIV Scheduled',
    'SIV Completed',
    'EDC Training Complete',
    'Site Activated',
  ]

  const rows = sites.map(site => {
    const getMilestoneStatus = (type: string) => {
      const milestone = site.milestones?.find(m => m.milestone_type === type)
      if (!milestone) return ''
      if (milestone.status === 'completed' && milestone.actual_date) {
        return milestone.actual_date
      }
      return milestone.status
    }

    return [
      escapeCSV(site.site_number),
      escapeCSV(site.name),
      escapeCSV(site.principal_investigator),
      escapeCSV(site.country),
      escapeCSV(site.region),
      escapeCSV(site.status),
      site.target_enrollment,
      site.current_enrollment,
      ...(includeStudy ? [
        escapeCSV(site.study?.name),
        escapeCSV(site.study?.protocol_number),
      ] : []),
      escapeCSV(getMilestoneStatus('regulatory_submitted')),
      escapeCSV(getMilestoneStatus('regulatory_approved')),
      escapeCSV(getMilestoneStatus('contract_sent')),
      escapeCSV(getMilestoneStatus('contract_executed')),
      escapeCSV(getMilestoneStatus('siv_scheduled')),
      escapeCSV(getMilestoneStatus('siv_completed')),
      escapeCSV(getMilestoneStatus('edc_training_complete')),
      escapeCSV(getMilestoneStatus('site_activated')),
    ].join(',')
  })

  return [headers.join(','), ...rows].join('\n')
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
