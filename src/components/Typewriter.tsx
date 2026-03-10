import { useEffect, useState } from 'react'

interface TypewriterProps {
  texts: string[]
  /** ms each character takes */
  speed?: number
  /** ms to pause before erasing */
  pauseMs?: number
  className?: string
}

/**
 * Typewriter — cycles through an array of strings, typing and erasing each.
 */
export function Typewriter({ texts, speed = 55, pauseMs = 1800, className = '' }: TypewriterProps) {
  const [display, setDisplay] = useState('')
  const [textIndex, setTextIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [erasing, setErasing] = useState(false)

  useEffect(() => {
    const current = texts[textIndex] ?? ''

    if (!erasing) {
      if (charIndex < current.length) {
        const t = setTimeout(() => setCharIndex(i => i + 1), speed)
        setDisplay(current.slice(0, charIndex + 1))
        return () => clearTimeout(t)
      } else {
        const t = setTimeout(() => setErasing(true), pauseMs)
        return () => clearTimeout(t)
      }
    } else {
      if (charIndex > 0) {
        const t = setTimeout(() => {
          setCharIndex(i => i - 1)
          setDisplay(current.slice(0, charIndex - 1))
        }, speed / 2)
        return () => clearTimeout(t)
      } else {
        setErasing(false)
        setTextIndex(i => (i + 1) % texts.length)
      }
    }
  }, [charIndex, erasing, textIndex, texts, speed, pauseMs])

  return (
    <span className={`typewriter-cursor ${className}`}>
      {display}
    </span>
  )
}
