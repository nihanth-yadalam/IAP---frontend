import { ReactNode, useRef, MouseEvent } from 'react'
import { cn } from '@/lib/utils'

interface RippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  className?: string
  rippleColor?: string
}

/**
 * RippleButton — a button that shows a ripple wave from the click point.
 */
export function RippleButton({ children, className, rippleColor, onClick, ...props }: RippleButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null)

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    const btn = btnRef.current
    if (!btn) return

    const rect = btn.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ripple = document.createElement('span')
    ripple.className = 'ripple-circle'
    if (rippleColor) ripple.style.background = rippleColor
    ripple.style.left = `${x}px`
    ripple.style.top = `${y}px`
    btn.appendChild(ripple)

    ripple.addEventListener('animationend', () => ripple.remove())
    onClick?.(e)
  }

  return (
    <button
      ref={btnRef}
      className={cn('ripple-btn', className)}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  )
}
