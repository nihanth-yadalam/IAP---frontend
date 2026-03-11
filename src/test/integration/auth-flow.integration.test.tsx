/**
 * Integration test: Auth flow with context.
 *
 * Tests the AuthProvider's login/signup/logout lifecycle
 * with mocked API responses.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, act, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import React from 'react'

// Mock the api module
vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
  setAuthToken: vi.fn(),
}))

import { api, setAuthToken } from '@/lib/api'
import { AuthProvider, useAuth } from '@/context/auth'

const mockedApi = vi.mocked(api)
const mockedSetAuthToken = vi.mocked(setAuthToken)

// Helper component to expose auth state
function AuthDisplay() {
  const auth = useAuth()
  return (
    <div>
      <span data-testid="is-authed">{String(auth.isAuthed)}</span>
      <span data-testid="user-email">{auth.user?.email ?? 'none'}</span>
      <button data-testid="logout-btn" onClick={auth.logout}>
        Logout
      </button>
    </div>
  )
}

describe('Auth Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    // Default: no token stored, refreshMe will skip
    mockedApi.get.mockRejectedValue(new Error('Not authed'))
  })

  it('should start unauthenticated when no token is stored', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <AuthDisplay />
          </AuthProvider>
        </BrowserRouter>
      )
    })

    expect(screen.getByTestId('is-authed').textContent).toBe('false')
    expect(screen.getByTestId('user-email').textContent).toBe('none')
  })

  it('should clear token on logout', async () => {
    // Simulate a stored token
    localStorage.setItem('aap_token', 'some-token')

    // Mock refreshMe call
    mockedApi.get.mockResolvedValueOnce({
      data: {
        id: '1',
        email: 'user@example.com',
        username: 'user',
        name: 'User',
        profile: {},
        google_linked: false,
      },
    })

    await act(async () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <AuthDisplay />
          </AuthProvider>
        </BrowserRouter>
      )
    })

    // Logout
    await act(async () => {
      screen.getByTestId('logout-btn').click()
    })

    expect(screen.getByTestId('is-authed').textContent).toBe('false')
    expect(localStorage.getItem('aap_token')).toBeNull()
  })
})
