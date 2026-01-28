import { getPerformanceMetrics } from '@/lib/queries/performance'
import { getStudies } from '@/lib/queries/studies'
import PerformanceTable from '@/components/performance/performance-table'

export default async function PerformancePage() {
  const [metrics, studies] = await Promise.all([
    getPerformanceMetrics(),
    getStudies(),
  ])

  // Calculate summary stats
  const totalSites = metrics.length
  const highPerformers = metrics.filter(m => (m.performance_score ?? 0) >= 80).length
  const mediumPerformers = metrics.filter(m => {
    const score = m.performance_score ?? 0
    return score >= 60 && score < 80
  }).length
  const lowPerformers = metrics.filter(m => {
    const score = m.performance_score
    return score !== null && score < 60
  }).length

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Site Performance</h1>
        <p className="text-gray-500 mt-1">Monitor site quality metrics and performance tiers</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm font-medium text-gray-500">Total Sites</div>
          <div className="text-2xl font-bold text-gray-900">{totalSites}</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm font-medium text-gray-500">High Performers</div>
          <div className="text-2xl font-bold text-green-600">{highPerformers}</div>
          <div className="text-xs text-gray-400">Score 80+</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm font-medium text-gray-500">Medium Performers</div>
          <div className="text-2xl font-bold text-amber-600">{mediumPerformers}</div>
          <div className="text-xs text-gray-400">Score 60-79</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm font-medium text-gray-500">Needs Attention</div>
          <div className="text-2xl font-bold text-red-600">{lowPerformers}</div>
          <div className="text-xs text-gray-400">Score &lt;60</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <PerformanceTable metrics={metrics} studies={studies} />
      </div>
    </div>
  )
}
