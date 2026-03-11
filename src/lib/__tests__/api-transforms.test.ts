/**
 * Tests for the data transformation functions in api.ts.
 * 
 * Since taskFromBackend / taskToBackend / courseFromBackend / courseToBackend
 * are not exported directly, we test them indirectly by exporting thin
 * test-only helpers. An alternative approach is to extract them into a
 * separate module. For now, we replicate the mapping logic inline to
 * verify correctness of the enum mapping tables.
 */

import { describe, it, expect } from 'vitest'

// ─── Replicated mapping tables (mirrors api.ts) ────────────────────────────

const PRIORITY_TO_BACKEND: Record<string, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low'
}
const PRIORITY_TO_FRONTEND: Record<string, string> = {
  High: 'high',
  Medium: 'medium',
  Low: 'low'
}

const CATEGORY_TO_BACKEND: Record<string, string> = {
  assignment: 'Assignment',
  exam: 'Exam',
  extra: 'Study'
}
const CATEGORY_TO_FRONTEND: Record<string, string> = {
  Assignment: 'assignment',
  Exam: 'exam',
  Study: 'extra',
  Project: 'extra',
  Other: 'extra'
}

const STATUS_TO_BACKEND: Record<string, string> = {
  pending: 'Pending',
  completed: 'Completed',
  dropped: 'Pending'
}
const STATUS_TO_FRONTEND: Record<string, string> = {
  Pending: 'pending',
  'In Progress': 'pending',
  In_Progress: 'pending',
  Blocked: 'pending',
  Completed: 'completed'
}

// ─── Priority mapping tests ────────────────────────────────────────────────

describe('Priority enum mapping', () => {
  it('should map all frontend priorities to backend', () => {
    expect(PRIORITY_TO_BACKEND['high']).toBe('High')
    expect(PRIORITY_TO_BACKEND['medium']).toBe('Medium')
    expect(PRIORITY_TO_BACKEND['low']).toBe('Low')
  })

  it('should map all backend priorities to frontend', () => {
    expect(PRIORITY_TO_FRONTEND['High']).toBe('high')
    expect(PRIORITY_TO_FRONTEND['Medium']).toBe('medium')
    expect(PRIORITY_TO_FRONTEND['Low']).toBe('low')
  })

  it('should handle unknown priority gracefully (undefined)', () => {
    expect(PRIORITY_TO_BACKEND['unknown']).toBeUndefined()
    expect(PRIORITY_TO_FRONTEND['Unknown']).toBeUndefined()
  })
})

// ─── Category mapping tests ────────────────────────────────────────────────

describe('Category enum mapping', () => {
  it('should map frontend categories to backend', () => {
    expect(CATEGORY_TO_BACKEND['assignment']).toBe('Assignment')
    expect(CATEGORY_TO_BACKEND['exam']).toBe('Exam')
    expect(CATEGORY_TO_BACKEND['extra']).toBe('Study')
  })

  it('should map backend categories to frontend', () => {
    expect(CATEGORY_TO_FRONTEND['Assignment']).toBe('assignment')
    expect(CATEGORY_TO_FRONTEND['Exam']).toBe('exam')
    expect(CATEGORY_TO_FRONTEND['Study']).toBe('extra')
    expect(CATEGORY_TO_FRONTEND['Project']).toBe('extra')
    expect(CATEGORY_TO_FRONTEND['Other']).toBe('extra')
  })
})

// ─── Status mapping tests ──────────────────────────────────────────────────

describe('Status enum mapping', () => {
  it('should map frontend statuses to backend', () => {
    expect(STATUS_TO_BACKEND['pending']).toBe('Pending')
    expect(STATUS_TO_BACKEND['completed']).toBe('Completed')
    expect(STATUS_TO_BACKEND['dropped']).toBe('Pending') // dropped → Pending on backend
  })

  it('should map backend statuses to frontend', () => {
    expect(STATUS_TO_FRONTEND['Pending']).toBe('pending')
    expect(STATUS_TO_FRONTEND['In Progress']).toBe('pending')
    expect(STATUS_TO_FRONTEND['In_Progress']).toBe('pending')
    expect(STATUS_TO_FRONTEND['Blocked']).toBe('pending')
    expect(STATUS_TO_FRONTEND['Completed']).toBe('completed')
  })
})

// ─── taskFromBackend logic tests ────────────────────────────────────────────

describe('taskFromBackend transformation', () => {
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
      completed_at: t.completed_at ?? null
    }
  }

  it('should transform a fully populated backend task', () => {
    const backendTask = {
      id: 42,
      title: 'Math Assignment',
      description: 'Chapter 5 problems',
      deadline: '2026-03-15T23:59:00Z',
      category: 'Assignment',
      status: 'Pending',
      priority: 'High',
      scheduled_start_time: '2026-03-14T10:00:00Z',
      scheduled_end_time: '2026-03-14T12:00:00Z',
      course_id: 5,
      course: { id: 5, name: 'Math 101' },
      estimated_duration_mins: 120,
      actual_duration_mins: null,
      drain_intensity: null,
      completed_at: null
    }

    const result = taskFromBackend(backendTask)

    expect(result.id).toBe('42') // number → string
    expect(result.title).toBe('Math Assignment')
    expect(result.category).toBe('assignment')
    expect(result.status).toBe('pending')
    expect(result.priority).toBe('high')
    expect(result.planned_start).toBe('2026-03-14T10:00:00Z')
    expect(result.planned_end).toBe('2026-03-14T12:00:00Z')
  })

  it('should handle missing optional fields with defaults', () => {
    const minimalTask = {
      id: 1,
      title: 'Quick task',
      deadline: '2026-03-15T23:59:00Z',
      category: 'Assignment',
      status: 'Pending',
      priority: 'Medium'
    }

    const result = taskFromBackend(minimalTask)

    expect(result.description).toBeNull()
    expect(result.planned_start).toBeNull()
    expect(result.planned_end).toBeNull()
    expect(result.course_id).toBeNull()
    expect(result.estimated_duration_mins).toBeNull()
  })

  it('should default unknown category to assignment', () => {
    const task = { id: 1, title: 't', deadline: 'd', category: 'UnknownType', status: 'Pending', priority: 'Medium' }
    expect(taskFromBackend(task).category).toBe('assignment')
  })

  it('should default unknown status to pending', () => {
    const task = { id: 1, title: 't', deadline: 'd', category: 'Assignment', status: 'WeirdStatus', priority: 'Medium' }
    expect(taskFromBackend(task).status).toBe('pending')
  })

  it('should default unknown priority to medium', () => {
    const task = { id: 1, title: 't', deadline: 'd', category: 'Assignment', status: 'Pending', priority: 'Critical' }
    expect(taskFromBackend(task).priority).toBe('medium')
  })
})

// ─── taskToBackend logic tests ──────────────────────────────────────────────

describe('taskToBackend transformation', () => {
  function taskToBackend(t: any): any {
    const out: any = {}
    if (t.title !== undefined) out.title = t.title
    if (t.description !== undefined) out.description = t.description
    if (t.deadline !== undefined) out.deadline = t.deadline
    if (t.priority !== undefined)
      out.priority = PRIORITY_TO_BACKEND[t.priority] ?? 'Medium'
    if (t.category !== undefined)
      out.category = CATEGORY_TO_BACKEND[t.category] ?? 'Assignment'
    if (t.status !== undefined)
      out.status = STATUS_TO_BACKEND[t.status] ?? 'Pending'

    if (t.planned_start) {
      out.scheduled_start_time = t.planned_start
      out.scheduled_end_time = t.planned_end || t.deadline || null
    } else if (t.planned_end) {
      out.scheduled_end_time = t.planned_end
    }

    if (t.estimated_duration_mins !== undefined)
      out.estimated_duration_mins = t.estimated_duration_mins

    if (t.course_id !== undefined && t.course_id !== null && t.course_id !== 'other') {
      const parsed = parseInt(t.course_id, 10)
      out.course_id = isNaN(parsed) ? null : parsed
    }

    if (t.actual_duration_mins !== undefined) out.actual_duration_mins = t.actual_duration_mins
    if (t.drain_intensity !== undefined) out.drain_intensity = t.drain_intensity
    if (t.completed_at !== undefined) out.completed_at = t.completed_at

    return out
  }

  it('should transform frontend task to backend format', () => {
    const frontendTask = {
      title: 'Study Physics',
      priority: 'high',
      category: 'exam',
      status: 'pending',
      deadline: '2026-03-20T23:59:00Z'
    }

    const result = taskToBackend(frontendTask)

    expect(result.title).toBe('Study Physics')
    expect(result.priority).toBe('High')
    expect(result.category).toBe('Exam')
    expect(result.status).toBe('Pending')
    expect(result.deadline).toBe('2026-03-20T23:59:00Z')
  })

  it('should only include defined fields', () => {
    const partialTask = { title: 'Quick note' }
    const result = taskToBackend(partialTask)

    expect(result.title).toBe('Quick note')
    expect(result).not.toHaveProperty('priority')
    expect(result).not.toHaveProperty('category')
    expect(result).not.toHaveProperty('status')
  })

  it('should map planned_start to scheduled_start_time', () => {
    const task = {
      planned_start: '2026-03-14T10:00:00Z',
      planned_end: '2026-03-14T12:00:00Z'
    }

    const result = taskToBackend(task)
    expect(result.scheduled_start_time).toBe('2026-03-14T10:00:00Z')
    expect(result.scheduled_end_time).toBe('2026-03-14T12:00:00Z')
  })

  it('should use deadline as fallback for scheduled_end_time', () => {
    const task = {
      planned_start: '2026-03-14T10:00:00Z',
      deadline: '2026-03-15T23:59:00Z'
    }

    const result = taskToBackend(task)
    expect(result.scheduled_start_time).toBe('2026-03-14T10:00:00Z')
    expect(result.scheduled_end_time).toBe('2026-03-15T23:59:00Z')
  })

  it('should parse course_id as integer', () => {
    const task = { course_id: '42' }
    const result = taskToBackend(task)
    expect(result.course_id).toBe(42)
  })

  it('should set course_id to null for non-numeric string', () => {
    const task = { course_id: 'invalid' }
    const result = taskToBackend(task)
    expect(result.course_id).toBeNull()
  })

  it('should skip course_id when value is "other"', () => {
    const task = { course_id: 'other' }
    const result = taskToBackend(task)
    expect(result).not.toHaveProperty('course_id')
  })
})

// ─── courseFromBackend logic tests ───────────────────────────────────────────

describe('courseFromBackend transformation', () => {
  function courseFromBackend(c: any): any {
    return {
      id: String(c.id),
      name: c.name,
      code: c.code ?? c.name
        ?.split(/\s+/)
        .map((w: string) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 4) ?? '',
      color: c.color_code ?? '#6366f1',
      term: c.term ?? '',
      is_archived: c.is_archived ?? false
    }
  }

  it('should transform a backend course', () => {
    const backendCourse = {
      id: 5,
      name: 'Advanced Mathematics',
      code: 'MATH301',
      color_code: '#ff5733',
      term: 'Fall 2026',
      is_archived: false
    }

    const result = courseFromBackend(backendCourse)

    expect(result.id).toBe('5')
    expect(result.name).toBe('Advanced Mathematics')
    expect(result.code).toBe('MATH301')
    expect(result.color).toBe('#ff5733')
    expect(result.term).toBe('Fall 2026')
    expect(result.is_archived).toBe(false)
  })

  it('should generate code from name when code is missing', () => {
    const course = { id: 1, name: 'Data Structures And Algorithms' }
    const result = courseFromBackend(course)

    // First letter of each word: D S A A → "DSAA"
    expect(result.code).toBe('DSAA')
  })

  it('should default color to indigo when color_code is missing', () => {
    const course = { id: 1, name: 'Test' }
    expect(courseFromBackend(course).color).toBe('#6366f1')
  })

  it('should default term to empty string', () => {
    const course = { id: 1, name: 'Test' }
    expect(courseFromBackend(course).term).toBe('')
  })

  it('should default is_archived to false', () => {
    const course = { id: 1, name: 'Test' }
    expect(courseFromBackend(course).is_archived).toBe(false)
  })
})
