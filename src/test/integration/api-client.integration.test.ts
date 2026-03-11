/**
 * Integration test: API client fetch + transform pipeline.
 *
 * Mocks axios responses and verifies that the api client correctly
 * fetches, transforms, and returns data in the frontend format.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'

// Mock axios before importing api
vi.mock('axios', () => {
  const mockInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    defaults: { headers: { common: {} } },
    interceptors: {
      response: { use: vi.fn() },
      request: { use: vi.fn() },
    },
  }
  return {
    default: {
      create: vi.fn(() => mockInstance),
      ...mockInstance,
    },
  }
})

// Get the mock instance
const mockAxios = axios.create() as any

describe('API Client Integration - Tasks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch tasks and transform backend format to frontend format', async () => {
    const backendTasks = [
      {
        id: 1,
        title: 'Math HW',
        description: 'Chapter 5',
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
        completed_at: null,
      },
    ]

    mockAxios.get.mockResolvedValueOnce({ data: backendTasks })

    // Import api after mocking
    const { api } = await import('@/lib/api')
    const result = await api.get('/tasks')

    expect(result.data).toHaveLength(1)
    const task = result.data[0]
    expect(task.id).toBe('1') // number → string
    expect(task.priority).toBe('high') // High → high
    expect(task.category).toBe('assignment') // Assignment → assignment
    expect(task.status).toBe('pending') // Pending → pending
    expect(task.planned_start).toBe('2026-03-14T10:00:00Z')
    expect(task.planned_end).toBe('2026-03-14T12:00:00Z')
  })

  it('should handle empty task list from backend', async () => {
    mockAxios.get.mockResolvedValueOnce({ data: [] })

    const { api } = await import('@/lib/api')
    const result = await api.get('/tasks')

    expect(result.data).toEqual([])
  })
})

describe('API Client Integration - Courses', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch courses and transform to frontend format', async () => {
    const backendCourses = [
      {
        id: 10,
        name: 'Data Structures',
        color_code: '#ff5733',
        code: 'DS101',
        term: 'Spring 2026',
        is_archived: false,
      },
    ]

    mockAxios.get.mockResolvedValueOnce({ data: backendCourses })

    const { api } = await import('@/lib/api')
    const result = await api.get('/courses')

    expect(result.data).toHaveLength(1)
    const course = result.data[0]
    expect(course.id).toBe('10') // number → string
    expect(course.name).toBe('Data Structures')
    expect(course.color).toBe('#ff5733') // color_code → color
    expect(course.code).toBe('DS101')
  })
})

describe('API Client Integration - Auth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should handle login and return access token', async () => {
    mockAxios.post.mockResolvedValueOnce({
      data: { access_token: 'test-token-123', token_type: 'bearer' },
    })
    // Mock the timezone PUT call that happens after login
    mockAxios.put.mockResolvedValueOnce({ data: {} })

    const { api } = await import('@/lib/api')
    const result = await api.post('/auth/login', {
      login: 'test@example.com',
      password: 'password123',
    })

    expect(result.data.access_token).toBe('test-token-123')
    expect(result.data.token_type).toBe('bearer')
  })

  it('should handle GET /auth/me and flatten profile data', async () => {
    mockAxios.get.mockResolvedValueOnce({
      data: {
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
        google_linked: false,
        profile: {
          full_name: 'Test User',
          university: 'MIT',
          major: 'CS',
          onboarding_data: {
            chronotype: 'morning',
            work_style: 'focused',
            preferred_session_mins: 45,
          },
        },
      },
    })

    const { api } = await import('@/lib/api')
    const result = await api.get('/auth/me')

    expect(result.data.id).toBe('1')
    expect(result.data.email).toBe('test@example.com')
    expect(result.data.name).toBe('Test User')
    expect(result.data.university).toBe('MIT')
    expect(result.data.chronotype).toBe('morning')
    expect(result.data.google_linked).toBe(false)
  })
})
