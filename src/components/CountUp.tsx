import { useEffect, useRef, useState } from 'react'

interface CountUpProps {
  to: number
  duration?: number
  suffix?: string
  prefix?: string
  className?: string
}

/**
 * CountUp — animates a number from 0 to `to` over `duration` ms.
 */
export function CountUp({ to, duration = 1000, suffix = '', prefix = '', className = '' }: CountUpProps) {
  const [current, setCurrent] = useState(0)
  const raf = useRef<number | null>(null)
  const start = useRef<number | null>(null)

  useEffect(() => {
    start.current = null
    const step = (timestamp: number) => {
      if (!start.current) start.current = timestamp
      const progress = Math.min((timestamp - start.current) / duration, 1)
      // ease-out quad
      const eased = 1 - (1 - progress) * (1 - progress)
      setCurrent(Math.floor(eased * to))
      if (progress < 1) raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
  }, [to, duration])

  return (
    <span className={`animate-number-pop ${className}`}>
      {prefix}{current}{suffix}
    </span>
  )
}
