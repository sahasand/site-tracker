import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getSiteWithMilestones } from '@/lib/queries/sites'
import { getStudy } from '@/lib/queries/studies'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import MilestoneTracker from '@/components/milestones/milestone-tracker'

interface SiteDetailPageProps {
  params: Promise<{ id: string }>
}

const statusColors: Record<string, string> = {
  planned: 'bg-gray-100 text-gray-800',
  activating: 'bg-yellow-100 text-yellow-800',
  active: 'bg-green-100 text-green-800',
  on_hold: 'bg-red-100 text-red-800',
  closed: 'bg-gray-100 text-gray-800',
}

export default async function SiteDetailPage({ params }: SiteDetailPageProps) {
  const { id } = await params
  const result = await getSiteWithMilestones(id)

  if (!result) {
    notFound()
  }

  const { site, milestones } = result
  const study = await getStudy(site.study_id)

  if (!study) {
    notFound()
  }

  const completedMilestones = milestones.filter(m => m.status === 'completed').length
  const totalMilestones = milestones.length

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/studies/${site.study_id}`} className="text-gray-500 hover:text-gray-900">
          &larr; {study.name}
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              Site {site.site_number}
            </h1>
            <Badge className={statusColors[site.status]}>
              {site.status}
            </Badge>
          </div>
          <p className="text-gray-500">{site.name}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Principal Investigator</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{site.principal_investigator}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Location</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">
              {site.region ? `${site.region}, ` : ''}{site.country}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Enrollment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">
              {site.current_enrollment} / {site.target_enrollment}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Activation Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">
              {completedMilestones} / {totalMilestones} milestones
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activation Milestones</CardTitle>
        </CardHeader>
        <CardContent>
          <MilestoneTracker
            milestones={milestones}
            siteId={site.id}
            studyId={site.study_id}
          />
        </CardContent>
      </Card>
    </div>
  )
}
