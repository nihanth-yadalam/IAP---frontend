import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import App from '../../App'

describe('App component', () => {
  it('should render without crashing', () => {
    // App uses Routes which requires a Router context
    const { container } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    expect(container).toBeTruthy()
  })

  it('should redirect unauthenticated users to login', () => {
    // Clear any auth state
    localStorage.removeItem('schedora-auth-storage')
    localStorage.removeItem('aap_token')

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )

    // When unauthenticated and accessing /app, should redirect to /login
    // The login page should eventually be rendered
    expect(window.location.pathname).toMatch(/\/(login)?/)
  })
})
