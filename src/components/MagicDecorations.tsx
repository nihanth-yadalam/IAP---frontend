/**
 * MagicDecorations — subtle twinkling white ✦ stars only, no other decorations.
 */

const STARS = [
  { top: '8%',  left: '5%',  delay: '0s',    size: '0.9rem' },
  { top: '14%', left: '22%', delay: '0.6s',  size: '1rem'   },
  { top: '20%', left: '68%', delay: '1.2s',  size: '0.75rem'},
  { top: '28%', left: '88%', delay: '0.3s',  size: '1.1rem' },
  { top: '35%', left: '40%', delay: '2s',    size: '0.8rem' },
  { top: '42%', left: '6%',  delay: '1.5s',  size: '1rem'   },
  { top: '50%', left: '80%', delay: '0.9s',  size: '0.9rem' },
  { top: '55%', left: '55%', delay: '2.5s',  size: '0.7rem' },
  { top: '62%', left: '18%', delay: '0.4s',  size: '1.1rem' },
  { top: '70%', left: '72%', delay: '1.8s',  size: '0.8rem' },
  { top: '76%', left: '32%', delay: '0.7s',  size: '0.9rem' },
  { top: '82%', left: '91%', delay: '1.1s',  size: '0.75rem'},
  { top: '88%', left: '48%', delay: '2.2s',  size: '1rem'   },
  { top: '93%', left: '10%', delay: '0.5s',  size: '0.85rem'},
]

export function MagicDecorations() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0 select-none" aria-hidden>
      {STARS.map((s, i) => (
        <span
          key={i}
          className="absolute text-white/40 dark:text-white/25 animate-twinkle"
          style={{
            top: s.top,
            left: s.left,
            animationDelay: s.delay,
            fontSize: s.size,
          }}
        >
          ✦
        </span>
      ))}
    </div>
  )
}

/** SparkleIcon — small inline ✦ for buttons */
export function SparkleIcon({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-block animate-twinkle ${className}`} aria-hidden>✦</span>
  )
}

/** MagicWandIcon — animated wand for AI features */
export function MagicWandIcon({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`} aria-hidden>
      <span className="animate-wiggle inline-block">🪄</span>
      <span className="animate-twinkle inline-block text-xs" style={{ animationDelay: '0.3s' }}>✦</span>
    </span>
  )
}

/** TaskCompleteFlash — instant celebration overlay */
export function TaskCompleteFlash() {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      <div className="relative flex flex-col items-center gap-3 animate-scale-in">
        <span className="text-8xl animate-celebrate drop-shadow-2xl">🎊</span>
        <div className="text-3xl font-black gradient-text neon-text tracking-tight">
          Awesome work! ✦
        </div>
      </div>
    </div>
  )
}
