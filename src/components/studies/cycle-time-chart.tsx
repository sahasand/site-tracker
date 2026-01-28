'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts'
import type { MilestoneCycleTime } from '@/lib/queries/analytics'

interface CycleTimeChartProps {
  cycleTimes: MilestoneCycleTime[]
}

// Colors for different milestone stages
const stageColors: Record<string, string> = {
  regulatory_submitted: '#3b82f6', // blue
  regulatory_approved: '#3b82f6',
  contract_sent: '#8b5cf6', // violet
  contract_executed: '#8b5cf6',
  siv_scheduled: '#f59e0b', // amber
  siv_completed: '#f59e0b',
  edc_training_complete: '#10b981', // emerald
  site_activated: '#10b981',
}

// Short labels for chart
const shortLabels: Record<string, string> = {
  regulatory_submitted: 'Reg Submit',
  regulatory_approved: 'Reg Approve',
  contract_sent: 'Contract Out',
  contract_executed: 'Contract Sign',
  siv_scheduled: 'SIV Sched',
  siv_completed: 'SIV Done',
  edc_training_complete: 'EDC Train',
  site_activated: 'Activated',
}

export default function CycleTimeChart({ cycleTimes }: CycleTimeChartProps) {
  // Filter to only show milestones with data
  const hasAnyData = cycleTimes.some(ct => ct.avgDays !== null)

  if (!hasAnyData) {
    return (
      <div className="h-[250px] flex items-center justify-center text-gray-500 text-sm">
        No cycle time data yet. Complete milestones with planned and actual dates to see analytics.
      </div>
    )
  }

  const chartData = cycleTimes.map(ct => ({
    ...ct,
    shortLabel: shortLabels[ct.type] || ct.label,
    displayValue: ct.avgDays ?? 0,
  }))

  // Calculate overall average
  const withData = cycleTimes.filter(ct => ct.avgDays !== null)
  const overallAvg = withData.length > 0
    ? Math.round(withData.reduce((sum, ct) => sum + (ct.avgDays || 0), 0) / withData.length)
    : null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-blue-500"></span>
            Regulatory
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-violet-500"></span>
            Contracts
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-amber-500"></span>
            SIV
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-500"></span>
            Activation
          </div>
        </div>
        {overallAvg !== null && (
          <div className="text-sm text-gray-500">
            Avg variance: <span className={overallAvg > 0 ? 'text-red-600' : 'text-green-600'}>
              {overallAvg > 0 ? '+' : ''}{overallAvg} days
            </span>
          </div>
        )}
      </div>

      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="shortLabel"
              tick={{ fontSize: 10, fill: '#64748b' }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
              label={{ value: 'Days from Plan', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#64748b' }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const data = payload[0].payload as MilestoneCycleTime & { displayValue: number }
                if (data.avgDays === null) return null
                return (
                  <div className="bg-white border border-gray-200 shadow-lg rounded-lg p-3">
                    <p className="font-semibold text-gray-900">{data.label}</p>
                    <p className="text-sm text-gray-600">
                      Avg: <span className={data.avgDays > 0 ? 'text-red-600' : 'text-green-600'}>
                        {data.avgDays > 0 ? '+' : ''}{data.avgDays} days
                      </span>
                    </p>
                    {data.minDays !== null && data.maxDays !== null && (
                      <p className="text-xs text-gray-500">
                        Range: {data.minDays > 0 ? '+' : ''}{data.minDays} to {data.maxDays > 0 ? '+' : ''}{data.maxDays}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {data.completedCount} milestone{data.completedCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                )
              }}
            />
            <ReferenceLine y={0} stroke="#64748b" strokeWidth={1} />
            <Bar dataKey="displayValue" radius={[4, 4, 0, 0]}>
              {chartData.map((entry) => (
                <Cell
                  key={entry.type}
                  fill={entry.avgDays === null ? '#e2e8f0' : stageColors[entry.type]}
                  opacity={entry.avgDays === null ? 0.5 : 1}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-gray-500 text-center">
        Positive values = behind schedule | Negative values = ahead of schedule
      </p>
    </div>
  )
}
