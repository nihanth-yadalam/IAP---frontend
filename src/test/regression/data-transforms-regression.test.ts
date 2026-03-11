/**
 * Regression test: Data transformation edge cases.
 *
 * Covers edge cases beyond the existing api-transforms unit tests:
 * null fields, unknown enums, empty arrays, numeric ID coercion.
 */

import { describe, it, expect } from 'vitest'

// Replicated mapping tables (mirrors api.ts) for isolated testing
const PRIORITY_TO_FRONTEND: Record<string, string> = {
  High: 'high',
  Medium: 'medium',
  Low: 'low',
}
const CATEGORY_TO_FRONTEND: Record<string, string> = {
  Assignment: 'assignment',
  Exam: 'exam',
  Study: 'extra',
  Project: 'extra',
  Other: 'extra',
}
const STATUS_TO_FRONTEND: Record<string, string> = {
  Pending: 'pending',
  'In Progress': 'pending',
  In_Progress: 'pending',
  Blocked: 'pending',
  Completed: 'completed',
}

function taskFromBackend(t: any): any {
  return {
    id: String(t.id),
    title: t.title,
    description: t.description ?? null,
    deadline: t.deadline,
    category: CATEGORY_TO_FRONTEND[t.category] ?? 'assignment',
    status: STATUS_TO_FRONTEND[t.status] ?? 'pending',
    priority: PRIORITY_TO_FRONTEND[t.priority] ?? 'medium',
    planned_start: t.scheduled_start_time ?? null,
    planned_end: t.scheduled_end_time ?? null,
    course_id: t.course_id ?? null,
    course: t.course ?? null,
    estimated_duration_mins: t.estimated_duration_mins ?? null,
    actual_duration_mins: t.actual_duration_mins ?? null,
    drain_intensity: t.drain_intensity ?? null,
    completed_at: t.completed_at ?? null,
  }
}

function courseFromBackend(c: any): any {
  return {
    id: String(c.id),
    name: c.name,
    code:
      c.code ??
      c.name
        ?.split(/\s+/)
        .map((w: string) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 4) ??
      '',
    color: c.color_code ?? '#6366f1',
    term: c.term ?? '',
    is_archived: c.is_archived ?? false,
  }
}

// ─── Task edge cases ───────────────────────────────────────────────────

describe('Task Transformation Regression', () => {
  it('should handle a task with ALL optional fields null', () => {
    const task = {
      id: 100,
      title: 'Minimal',
      deadline: '2026-03-15T00:00:00Z',
      category: 'Assignment',
      status: 'Pending',
      priority: 'Medium',
      description: null,
      scheduled_start_time: null,
      scheduled_end_time: null,
      course_id: null,
      course: null,
      estimated_duration_mins: null,
      actual_duration_mins: null,
      drain_intensity: null,
      completed_at: null,
    }

    const result = taskFromBackend(task)
    expect(result.id).toBe('100')
    expect(result.description).toBeNull()
    expect(result.planned_start).toBeNull()
    expect(result.planned_end).toBeNull()
    expect(result.course_id).toBeNull()
    expect(result.course).toBeNull()
    expect(result.estimated_duration_mins).toBeNull()
    expect(result.actual_duration_mins).toBeNull()
    expect(result.drain_intensity).toBeNull()
    expect(result.completed_at).toBeNull()
  })

  it('should never crash on completely empty object', () => {
    // Edge case: what if backend sends garbage?
    const task = { id: 0, title: '' }
    const result = taskFromBackend(task)
    expect(result.id).toBe('0')
    expect(result.title).toBe('')
    expect(result.category).toBe('assignment') // default
    expect(result.status).toBe('pending') // default
    expect(result.priority).toBe('medium') // default
  })

  it('should coerce numeric IDs to strings consistently', () => {
    const ids = [0, 1, 999, 1000000]
    for (const id of ids) {
      expect(taskFromBackend({ id, title: 'x' }).id).toBe(String(id))
    }
  })

  it('should handle "In Progress" status with space', () => {
    const task = { id: 1, title: 'x', status: 'In Progress' }
    expect(taskFromBackend(task).status).toBe('pending')
  })

  it('should handle "In_Progress" status with underscore', () => {
    const task = { id: 1, title: 'x', status: 'In_Progress' }
    expect(taskFromBackend(task).status).toBe('pending')
  })

  it('should handle "Blocked" status', () => {
    const task = { id: 1, title: 'x', status: 'Blocked' }
    expect(taskFromBackend(task).status).toBe('pending')
  })
})

// ─── Course edge cases ─────────────────────────────────────────────────

describe('Course Transformation Regression', () => {
  it('should truncate generated code to 4 characters', () => {
    const course = { id: 1, name: 'Introduction To Computer Science Fundamentals' }
    const result = courseFromBackend(course)
    expect(result.code.length).toBeLessThanOrEqual(4)
    expect(result.code).toBe('ITCS') // first 4 initials
  })

  it('should handle single-word course name', () => {
    const course = { id: 1, name: 'Mathematics' }
    const result = courseFromBackend(course)
    expect(result.code).toBe('M')
  })

  it('should use default color when color_code is null', () => {
    const course = { id: 1, name: 'Test', color_code: null }
    expect(courseFromBackend(course).color).toBe('#6366f1')
  })

  it('should use default color when color_code is undefined', () => {
    const course = { id: 1, name: 'Test' }
    expect(courseFromBackend(course).color).toBe('#6366f1')
  })

  it('should coerce course ID to string', () => {
    expect(courseFromBackend({ id: 42, name: 'X' }).id).toBe('42')
    expect(courseFromBackend({ id: 0, name: 'X' }).id).toBe('0')
  })
})
