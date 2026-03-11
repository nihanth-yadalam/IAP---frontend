/**
 * E2E test: Live infrastructure health checks.
 *
 * Checks that both the backend (CloudFront/Beanstalk) and frontend (Vercel)
 * are reachable and responding correctly.
 *
 * Requires environment variables:
 *   BACKEND_LIVE_URL  (e.g. https://xxxxx.cloudfront.net)
 *   FRONTEND_LIVE_URL (e.g. https://your-app.vercel.app)
 */

import { describe, it, expect } from 'vitest'

const BACKEND_URL = (import.meta.env.VITE_BACKEND_LIVE_URL ?? process.env.BACKEND_LIVE_URL ?? '').replace(/\/$/, '')
const FRONTEND_URL = (import.meta.env.VITE_FRONTEND_LIVE_URL ?? process.env.FRONTEND_LIVE_URL ?? '').replace(/\/$/, '')

describe.skipIf(!BACKEND_URL)('Backend E2E Health', () => {
  it('should return healthy status from /health', async () => {
    const res = await fetch(`${BACKEND_URL}/health`)
    expect(res.ok).toBe(true)

    const data = await res.json()
    expect(data.status).toBe('healthy')
  })

  it('should serve OpenAPI docs', async () => {
    const res = await fetch(`${BACKEND_URL}/api/v1/openapi.json`)
    expect(res.ok).toBe(true)

    const data = await res.json()
    expect(data).toHaveProperty('paths')
  })
})

describe.skipIf(!FRONTEND_URL)('Frontend E2E Health', () => {
  it('should return 200 for the Vercel deployment', async () => {
    const res = await fetch(FRONTEND_URL)
    expect(res.ok).toBe(true)

    const html = await res.text()
    expect(html).toContain('<html')
  })
})
