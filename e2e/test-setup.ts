/**
 * E2E Test Setup Utilities
 * Handles authentication and test data setup
 */

import { Page } from '@playwright/test'

export interface TestUser {
  email: string
  token: string
  userId: string
}

/**
 * Authenticate a test user by going through the magic link flow
 */
export async function authenticateTestUser(page: Page): Promise<TestUser> {
  const testEmail = `test-${Date.now()}@example.com`

  // Call API directly to get magic link (in dev mode)
  const response = await page.request.post('http://localhost:3000/api/auth/send-link', {
    data: { email: testEmail }
  })

  const data = await response.json()

  // Check for errors
  if (data.error) {
    throw new Error(`API Error: ${data.error.message}`)
  }

  // Extract magic link from response (in dev mode, it's included)
  // Response structure: { data: { message, expiresIn, magicLink } }
  if (!data.data || !data.data.magicLink) {
    throw new Error('Failed to get magic link in development mode. Make sure NODE_ENV=development')
  }

  // Navigate to the magic link
  await page.goto(data.data.magicLink)

  // Should redirect to dashboard with session token in localStorage
  await page.waitForURL(/\/(dashboard)?$/, { timeout: 10000 })

  // Extract token from localStorage
  const userData = await page.evaluate(() => {
    const token = localStorage.getItem('session_token')
    const user = localStorage.getItem('user')
    return { token, user: user ? JSON.parse(user) : null }
  })

  if (!userData.token || !userData.user) {
    throw new Error('Failed to extract authentication data from localStorage')
  }

  return {
    email: testEmail,
    token: userData.token,
    userId: userData.user.id
  }
}

/**
 * Setup authenticated context for tests
 */
export async function setupAuthenticatedContext(page: Page): Promise<TestUser> {
  const testUser = await authenticateTestUser(page)

  // Verify authentication worked
  await page.goto('/')
  await page.locator('text=/Level \\d+/').first().waitFor({ timeout: 5000 })

  return testUser
}

/**
 * Clean up test data after tests
 * (Optional - depends on if you want to keep test data or not)
 */
export async function cleanupTestUser(page: Page, userId: string) {
  // This would call a cleanup API endpoint
  // For now, we'll skip cleanup as SQLite database can be reset
}
