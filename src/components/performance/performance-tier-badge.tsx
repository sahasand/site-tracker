'use client'

import { Badge } from '@/components/ui/badge'

type PerformanceTier = 'high' | 'medium' | 'low' | 'unknown'

const tierConfig: Record<PerformanceTier, { label: string; className: string }> = {
  high: { label: 'High', className: 'bg-green-100 text-green-800' },
  medium: { label: 'Medium', className: 'bg-amber-100 text-amber-800' },
  low: { label: 'Low', className: 'bg-red-100 text-red-800' },
  unknown: { label: 'N/A', className: 'bg-gray-100 text-gray-600' },
}

interface PerformanceTierBadgeProps {
  tier: PerformanceTier
  score?: number | null
  showScore?: boolean
}

export default function PerformanceTierBadge({ tier, score, showScore = false }: PerformanceTierBadgeProps) {
  const config = tierConfig[tier]

  return (
    <Badge className={config.className}>
      {showScore && score !== null ? `${score} - ${config.label}` : config.label}
    </Badge>
  )
}
