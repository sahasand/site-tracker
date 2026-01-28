import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Study } from '@/types'

interface StudyCardProps {
  study: Study
  siteCount: number
}

export default function StudyCard({ study, siteCount }: StudyCardProps) {
  return (
    <Link href={`/studies/${study.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{study.name}</CardTitle>
            <Badge variant="outline">Phase {study.phase}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p>
              <span className="font-medium">Protocol:</span> {study.protocol_number}
            </p>
            <p>
              <span className="font-medium">Sponsor:</span> {study.sponsor_name}
            </p>
            <p>
              <span className="font-medium">Sites:</span> {siteCount}
            </p>
            <p>
              <span className="font-medium">Target Enrollment:</span> {study.target_enrollment}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
