'use client'

import { useEffect, useRef } from 'react'

interface PulseLineProps {
  intensity?: 'low' | 'medium' | 'high'
  className?: string
}

export default function PulseLine({ intensity = 'low', className = '' }: PulseLineProps) {
  const pathRef = useRef<SVGPathElement>(null)

  // Amplitude based on intensity
  const amplitudes = {
    low: 3,
    medium: 5,
    high: 8,
  }
  const amplitude = amplitudes[intensity]

  useEffect(() => {
    const path = pathRef.current
    if (!path) return

    let animationFrame: number
    let phase = 0

    const animate = () => {
      phase += 0.02

      // Generate smooth wave path
      const points: string[] = []
      const segments = 100
      const width = 1200
      const midY = 15

      for (let i = 0; i <= segments; i++) {
        const x = (i / segments) * width
        // Combine multiple sine waves for organic feel
        const y = midY +
          Math.sin((i / segments) * Math.PI * 4 + phase) * amplitude * 0.6 +
          Math.sin((i / segments) * Math.PI * 2 + phase * 0.7) * amplitude * 0.4

        points.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`)
      }

      path.setAttribute('d', points.join(' '))
      animationFrame = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame)
    }
  }, [amplitude])

  return (
    <svg
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      viewBox="0 0 1200 30"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        ref={pathRef}
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
        className="text-teal-500/10"
      />
    </svg>
  )
}
