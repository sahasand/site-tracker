import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getStudy } from '@/lib/queries/studies'
import { getSitesByStudy } from '@/lib/queries/sites'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import SiteTable from '@/components/sites/site-table'
import CreateSiteDialog from '@/components/sites/create-site-dialog'

interface StudyDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function StudyDetailPage({ params }: StudyDetailPageProps) {
  const { id } = await params
  const study = await getStudy(id)

  if (!study) {
    notFound()
  }

  const sites = await getSitesByStudy(id)

  const activeSites = sites.filter(s => s.status === 'active').length
  const activatingSites = sites.filter(s => s.status === 'activating').length
  const totalEnrollment = sites.reduce((sum, s) => sum + s.current_enrollment, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-gray-500 hover:text-gray-900">
          &larr; Studies
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{study.name}</h1>
          <p className="text-gray-500">{study.protocol_number}</p>
        </div>
        <Badge variant="outline" className="text-lg px-3 py-1">
          Phase {study.phase}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Sites</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{sites.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{activeSites}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Activating</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">{activatingSites}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Enrollment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {totalEnrollment} / {study.target_enrollment}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Sites</CardTitle>
          <CreateSiteDialog studyId={id} />
        </CardHeader>
        <CardContent>
          <SiteTable sites={sites} />
        </CardContent>
      </Card>
    </div>
  )
}
