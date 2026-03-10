import { useEffect, useRef } from 'react'

interface ProgressRingProps {
  /** 0–100 */
  value: number
  size?: number
  strokeWidth?: number
  label?: string
  sublabel?: string
  color?: string
}

/**
 * Animated SVG progress ring that draws itself from 0 → value on mount.
 */
export function ProgressRing({
  value,
  size = 120,
  strokeWidth = 10,
  label,
  sublabel,
  color = 'url(#ring-gradient)',
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  const circleRef = useRef<SVGCircleElement>(null)

  useEffect(() => {
    if (!circleRef.current) return
    // start fully offset, then transition to target
    circleRef.current.style.strokeDashoffset = String(circumference)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (circleRef.current) circleRef.current.style.strokeDashoffset = String(offset)
      })
    })
  }, [value, offset, circumference])

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c77dff" />
            <stop offset="50%" stopColor="#4d96ff" />
            <stop offset="100%" stopColor="#6bcb77" />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        {/* Fill */}
        <circle
          ref={circleRef}
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          className="progress-ring-circle drop-shadow-md"
        />
      </svg>
      {/* Centre label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        {label && <span className="text-xl font-black gradient-text animate-number-pop">{label}</span>}
        {sublabel && <span className="text-[10px] text-muted-foreground font-medium mt-0.5">{sublabel}</span>}
      </div>
    </div>
  )
}
