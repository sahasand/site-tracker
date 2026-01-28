import SiteCard from './site-card'
import type { Site, SiteActivationMilestone } from '@/types'

interface KanbanColumnProps {
  title: string
  sites: Array<Site & { milestones: SiteActivationMilestone[] }>
}

export default function KanbanColumn({ title, sites }: KanbanColumnProps) {
  return (
    <div className="flex flex-col bg-gray-100 rounded-lg p-4 min-w-[280px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-700">{title}</h3>
        <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded">
          {sites.length}
        </span>
      </div>
      <div className="flex flex-col gap-3 overflow-y-auto">
        {sites.map((site) => (
          <SiteCard key={site.id} site={site} />
        ))}
        {sites.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">No sites</p>
        )}
      </div>
    </div>
  )
}
