'use client'

import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import type { Site } from '@/types'

interface EnrollmentChartProps {
  sites: Site[]
  targetEnrollment: number
}

export default function EnrollmentChart({ sites, targetEnrollment }: EnrollmentChartProps) {
  const chartData = useMemo(() => {
    // Sort sites by updated_at (as proxy for activation date) and calculate cumulative enrollment
    const sortedSites = [...sites]
      .filter(s => s.status === 'active' || s.current_enrollment > 0)
      .sort((a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime())

    let cumulative = 0
    return sortedSites.map((site, index) => {
      cumulative += site.current_enrollment
      return {
        name: site.site_number,
        siteName: site.name,
        enrollment: site.current_enrollment,
        cumulative,
        index: index + 1,
      }
    })
  }, [sites])

  if (chartData.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center text-gray-500 text-sm">
        No enrollment data yet
      </div>
    )
  }

  const totalEnrollment = chartData[chartData.length - 1]?.cumulative || 0
  const enrollmentPercent = targetEnrollment > 0
    ? Math.round((totalEnrollment / targetEnrollment) * 100)
    : 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-2xl font-bold text-violet-600">{totalEnrollment}</span>
          <span className="text-gray-500"> / {targetEnrollment} enrolled</span>
        </div>
        <div className="text-sm text-gray-500">
          {enrollmentPercent}% of target
        </div>
      </div>

      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="enrollmentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
              domain={[0, Math.max(targetEnrollment, totalEnrollment) * 1.1]}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const data = payload[0].payload
                return (
                  <div className="bg-white border border-gray-200 shadow-lg rounded-lg p-3">
                    <p className="font-semibold text-gray-900">{data.name} - {data.siteName}</p>
                    <p className="text-sm text-gray-600">Site Enrollment: {data.enrollment}</p>
                    <p className="text-sm text-violet-600 font-medium">Cumulative: {data.cumulative}</p>
                  </div>
                )
              }}
            />
            <ReferenceLine
              y={targetEnrollment}
              stroke="#10b981"
              strokeDasharray="5 5"
              label={{
                value: 'Target',
                position: 'right',
                fill: '#10b981',
                fontSize: 11
              }}
            />
            <Area
              type="monotone"
              dataKey="cumulative"
              stroke="#8b5cf6"
              strokeWidth={2}
              fill="url(#enrollmentGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
