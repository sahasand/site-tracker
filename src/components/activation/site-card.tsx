import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import type { Site, SiteActivationMilestone } from '@/types'

interface SiteCardProps {
  site: Site & { milestones: SiteActivationMilestone[] }
}

export default function SiteCard({ site }: SiteCardProps) {
  const currentMilestone = site.milestones.find(m =>
    m.status === 'in_progress' ||
    (m.status === 'pending' && site.milestones.every(om =>
      om.status === 'pending' || om.milestone_type === m.milestone_type
    ))
  )

  const daysInStage = currentMilestone?.updated_at
    ? Math.floor((Date.now() - new Date(currentMilestone.updated_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <Link href={`/sites/${site.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-sm">Site {site.site_number}</span>
            {daysInStage > 0 && (
              <span className={`text-xs px-2 py-1 rounded ${
                daysInStage > 14 ? 'bg-red-100 text-red-700' :
                daysInStage > 7 ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-600'
              }`}>
                {daysInStage}d
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 truncate">{site.name}</p>
          <p className="text-xs text-gray-400 mt-1">{site.principal_investigator}</p>
        </CardContent>
      </Card>
    </Link>
  )
}
