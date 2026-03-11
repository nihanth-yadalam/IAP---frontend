import { describe, it, expect } from 'vitest'
import { hasConflict, rankTasksForGap, type FixedSlot } from '../scheduling'
import type { Task } from '@/stores/useTaskStore'

// ─── Helper: create a minimal Task ──────────────────────────────────────────
function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: '1',
    title: 'Test Task',
    category: 'assignment',
    deadline: '2026-03-15T23:59:00Z',
    status: 'pending',
    priority: 'medium',
    planned_start: null,
    planned_end: null,
    ...overrides
  }
}

// ─── hasConflict ────────────────────────────────────────────────────────────

describe('hasConflict', () => {
  describe('with existing tasks', () => {
    it('should return true when proposed time overlaps an existing task', () => {
      const existingTasks = [
        makeTask({
          id: '10',
          status: 'pending',
          planned_start: '2026-03-12T10:00:00Z',
          planned_end: '2026-03-12T12:00:00Z'
        })
      ]

      // Proposed: 11:00–13:00 overlaps with 10:00–12:00
      const proposedStart = new Date('2026-03-12T11:00:00Z')
      const proposedEnd = new Date('2026-03-12T13:00:00Z')

      expect(hasConflict(proposedStart, proposedEnd, existingTasks)).toBe(true)
    })

    it('should return false when proposed time does NOT overlap', () => {
      const existingTasks = [
        makeTask({
          id: '10',
          status: 'pending',
          planned_start: '2026-03-12T10:00:00Z',
          planned_end: '2026-03-12T12:00:00Z'
        })
      ]

      // Proposed: 13:00–14:00 — no overlap
      const proposedStart = new Date('2026-03-12T13:00:00Z')
      const proposedEnd = new Date('2026-03-12T14:00:00Z')

      expect(hasConflict(proposedStart, proposedEnd, existingTasks)).toBe(false)
    })

    it('should ignore completed tasks', () => {
      const existingTasks = [
        makeTask({
          id: '10',
          status: 'completed',
          planned_start: '2026-03-12T10:00:00Z',
          planned_end: '2026-03-12T12:00:00Z'
        })
      ]

      const proposedStart = new Date('2026-03-12T10:00:00Z')
      const proposedEnd = new Date('2026-03-12T12:00:00Z')

      expect(hasConflict(proposedStart, proposedEnd, existingTasks)).toBe(false)
    })

    it('should ignore tasks without planned times', () => {
      const existingTasks = [
        makeTask({
          id: '10',
          status: 'pending',
          planned_start: null,
          planned_end: null
        })
      ]

      const proposedStart = new Date('2026-03-12T10:00:00Z')
      const proposedEnd = new Date('2026-03-12T12:00:00Z')

      expect(hasConflict(proposedStart, proposedEnd, existingTasks)).toBe(false)
    })
  })

  describe('with fixed slots', () => {
    it('should return true when proposed time overlaps a fixed slot', () => {
      // Wednesday = JS getDay() 3, the function maps it → 2 (Mon=0 system)
      // The function checks BOTH mappings, so a slot with day_of_week matching
      // either the mapped or raw JS day will trigger
      const fixedSlots: FixedSlot[] = [
        { day_of_week: 3, start_hour: 9, end_hour: 11 } // JS-day-based match for Wednesday
      ]

      // Wednesday 2026-03-11 at 10:00–11:30 (overlap with 9–11)
      const proposedStart = new Date('2026-03-11T10:00:00')
      const proposedEnd = new Date('2026-03-11T11:30:00')

      expect(hasConflict(proposedStart, proposedEnd, [], fixedSlots)).toBe(true)
    })

    it('should return false when proposed time is outside the fixed slot', () => {
      const fixedSlots: FixedSlot[] = [
        { day_of_week: 3, start_hour: 9, end_hour: 11 }
      ]

      // Wednesday 2026-03-11 at 12:00–13:00 — no overlap
      const proposedStart = new Date('2026-03-11T12:00:00')
      const proposedEnd = new Date('2026-03-11T13:00:00')

      expect(hasConflict(proposedStart, proposedEnd, [], fixedSlots)).toBe(false)
    })

    it('should handle fixed slots with string time format', () => {
      const fixedSlots: FixedSlot[] = [
        { day_of_week: 3, start_time: '09:00:00', end_time: '11:00:00' }
      ]

      const proposedStart = new Date('2026-03-11T10:00:00')
      const proposedEnd = new Date('2026-03-11T11:30:00')

      expect(hasConflict(proposedStart, proposedEnd, [], fixedSlots)).toBe(true)
    })
  })

  it('should return false when no tasks or fixed slots exist', () => {
    const proposedStart = new Date('2026-03-12T10:00:00')
    const proposedEnd = new Date('2026-03-12T12:00:00')

    expect(hasConflict(proposedStart, proposedEnd, [])).toBe(false)
  })
})

// ─── rankTasksForGap ────────────────────────────────────────────────────────

describe('rankTasksForGap', () => {
  it('should return null when no tasks are available', () => {
    expect(rankTasksForGap(30, [])).toBeNull()
  })

  it('should return the highest priority task', () => {
    const tasks = [
      makeTask({ id: '1', priority: 'low', deadline: '2026-03-12T23:59:00Z' }),
      makeTask({ id: '2', priority: 'high', deadline: '2026-03-15T23:59:00Z' }),
      makeTask({ id: '3', priority: 'medium', deadline: '2026-03-13T23:59:00Z' })
    ]

    const result = rankTasksForGap(60, tasks)
    expect(result).not.toBeNull()
    expect(result!.id).toBe('2')
  })

  it('should rank by earliest deadline when priorities are equal', () => {
    const tasks = [
      makeTask({ id: '1', priority: 'high', deadline: '2026-03-15T23:59:00Z' }),
      makeTask({ id: '2', priority: 'high', deadline: '2026-03-12T23:59:00Z' }),
      makeTask({ id: '3', priority: 'high', deadline: '2026-03-20T23:59:00Z' })
    ]

    const result = rankTasksForGap(60, tasks)
    expect(result).not.toBeNull()
    expect(result!.id).toBe('2') // earliest deadline
  })

  it('should filter out tasks without ids', () => {
    const tasks = [
      makeTask({ id: '', priority: 'high', deadline: '2026-03-12T23:59:00Z' }),
      makeTask({ id: '2', priority: 'medium', deadline: '2026-03-15T23:59:00Z' })
    ]

    const result = rankTasksForGap(60, tasks)
    expect(result).not.toBeNull()
    expect(result!.id).toBe('2')
  })

  it('should handle single task', () => {
    const tasks = [
      makeTask({ id: '1', priority: 'low', deadline: '2026-03-12T23:59:00Z' })
    ]

    const result = rankTasksForGap(30, tasks)
    expect(result).not.toBeNull()
    expect(result!.id).toBe('1')
  })
})
