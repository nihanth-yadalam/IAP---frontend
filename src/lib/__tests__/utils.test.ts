import { describe, it, expect } from 'vitest'
import { cn } from '../utils'

describe('cn (className merge utility)', () => {
  it('should merge class names correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('should handle conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible')
  })

  it('should handle undefined and null values', () => {
    expect(cn('base', undefined, null, 'end')).toBe('base end')
  })

  it('should merge conflicting tailwind classes (last wins)', () => {
    // tailwind-merge deduplicates: "p-4" + "p-2" → "p-2"
    expect(cn('p-4', 'p-2')).toBe('p-2')
  })

  it('should merge tailwind color classes', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('should handle empty arguments', () => {
    expect(cn()).toBe('')
  })

  it('should handle array inputs via clsx', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar')
  })

  it('should handle object notation via clsx', () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz')
  })
})
