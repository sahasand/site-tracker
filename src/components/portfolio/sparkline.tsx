'use client'

interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  color?: string
  showFill?: boolean
  strokeWidth?: number
  className?: string
}

export default function Sparkline({
  data,
  width = 80,
  height = 24,
  color = '#14b8a6',
  showFill = true,
  strokeWidth = 1.5,
  className = '',
}: SparklineProps) {
  if (data.length === 0) return null

  const max = Math.max(...data, 1) // Ensure at least 1 to avoid division by zero
  const min = Math.min(...data, 0)
  const range = max - min || 1

  // Calculate points with padding
  const paddingX = 2
  const paddingY = 2
  const chartWidth = width - paddingX * 2
  const chartHeight = height - paddingY * 2

  const points = data.map((value, index) => {
    const x = paddingX + (index / (data.length - 1 || 1)) * chartWidth
    const y = paddingY + chartHeight - ((value - min) / range) * chartHeight
    return { x, y }
  })

  // Create SVG path
  const linePath = points
    .map((point, i) => `${i === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join(' ')

  // Create fill path (closed polygon)
  const fillPath = showFill
    ? `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${height - paddingY} L ${paddingX} ${height - paddingY} Z`
    : ''

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden="true"
    >
      {showFill && (
        <path
          d={fillPath}
          fill={color}
          fillOpacity={0.15}
        />
      )}
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot */}
      <circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r={2}
        fill={color}
      />
    </svg>
  )
}
