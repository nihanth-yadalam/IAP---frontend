import { useEffect, useState } from 'react'

const COLORS = [
  '#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff',
  '#c77dff', '#ff9f1c', '#2ec4b6', '#ff4d6d',
  '#f8961e', '#90be6d',
]

interface Piece {
  id: number
  x: number
  color: string
  delay: number
  size: number
  shape: 'square' | 'circle' | 'triangle'
}

export function Confetti({ active, onDone }: { active: boolean; onDone?: () => void }) {
  const [pieces, setPieces] = useState<Piece[]>([])

  useEffect(() => {
    if (!active) { setPieces([]); return }

    const ps: Piece[] = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 0.5,
      size: 6 + Math.random() * 8,
      shape: (['square', 'circle', 'triangle'] as const)[Math.floor(Math.random() * 3)],
    }))
    setPieces(ps)

    const timer = setTimeout(() => {
      setPieces([])
      onDone?.()
    }, 2000)
    return () => clearTimeout(timer)
  }, [active])

  if (!pieces.length) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {pieces.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: '-20px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.shape !== 'triangle' ? p.color : 'transparent',
            borderRadius: p.shape === 'circle' ? '50%' : p.shape === 'square' ? '2px' : '0',
            borderLeft: p.shape === 'triangle' ? `${p.size / 2}px solid transparent` : undefined,
            borderRight: p.shape === 'triangle' ? `${p.size / 2}px solid transparent` : undefined,
            borderBottom: p.shape === 'triangle' ? `${p.size}px solid ${p.color}` : undefined,
            animationDelay: `${p.delay}s`,
          }}
          className="confetti-piece"
        />
      ))}
      {/* Big central emoji burst */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center animate-bounce-in pointer-events-none select-none">
        <div className="text-6xl animate-celebrate drop-shadow-lg">🎉</div>
        <div className="text-2xl font-bold text-white mt-2 neon-text animate-fade-in" style={{animationDelay:'0.3s'}}>
          Task Complete! ✨
        </div>
      </div>
    </div>
  )
}
