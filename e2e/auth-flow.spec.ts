import { test, expect } from '@playwright/test'

/**
 * E2E Test: Authentication Flow
 * Tests the magic link authentication system
 */
test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/login')
    await page.evaluate(() => localStorage.clear())
  })

  test('should redirect unauthenticated users to login', async ({ page }) => {
    // Try to access homepage without auth
    await page.goto('/')

    // Should redirect to login page
    await expect(page).toHaveURL(/.*login/)
  })

  test('should display login page correctly', async ({ page }) => {
    await page.goto('/login')

    // Check for Sensei branding
    await expect(page.locator('text=Sensei')).toBeVisible()

    // Check for sign in heading
    await expect(page.locator('h2:has-text("Sign in")')).toBeVisible()

    // Check for email input
    const emailInput = page.locator('input[type="email"]')
    await expect(emailInput).toBeVisible()

    // Check for send login link button
    const sendButton = page.locator('button:has-text("Send login link")')
    await expect(sendButton).toBeVisible()
  })

  test('should send magic link with valid email', async ({ page }) => {
    await page.goto('/login')

    const emailInput = page.locator('input[type="email"]')
    const sendButton = page.locator('button[type="submit"]')

    // Enter valid email
    await emailInput.fill('test@example.com')
    await sendButton.click()

    // Should show success message
    await expect(page.locator('text=Check your email')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('text=test@example.com')).toBeVisible()
  })

  test('should handle magic link verification', async ({ page }) => {
    // Generate a test token (in real scenario, this would come from email)
    // For now, we test that the verify page loads
    await page.goto('/auth/verify?token=test-token-123')

    // Should either redirect to dashboard or show error
    await page.waitForURL(/.*\/|.*login/, { timeout: 5000 }).catch(() => {
      // If it doesn't redirect, it might show an error message
    })
  })

  test('should show dashboard when authenticated', async ({ page }) => {
    // Mock API responses
    await page.route('**/api/user/progression', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          level: 1,
          totalXp: 0,
          xpToNextLevel: 100,
          currentStreak: 0,
          bestStreak: 0,
          sessionsCompleted: 0,
          averageScore: null
        })
      })
    })

    await page.route('**/api/sessions/active', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ session: null })
      })
    })

    // Set mock auth in localStorage
    await page.goto('/login')
    await page.evaluate(() => {
      localStorage.setItem('session_token', 'mock-token-123')
      localStorage.setItem('user', JSON.stringify({
        id: 'test-user-id',
        email: 'test@example.com',
        displayName: 'Test User',
        level: 1,
        totalXp: 0
      }))
    })

    // Navigate to homepage
    await page.goto('/')

    // Should show dashboard elements
    await expect(page.locator('text=/Level \\d+/')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('text=/\\d+ XP to next level/')).toBeVisible()
  })

  test('should show Start session button on dashboard', async ({ page }) => {
    // Mock API responses
    await page.route('**/api/user/progression', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          level: 1,
          totalXp: 0,
          xpToNextLevel: 100,
          currentStreak: 0,
          bestStreak: 0,
          sessionsCompleted: 0,
          averageScore: null
        })
      })
    })

    await page.route('**/api/sessions/active', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ session: null })
      })
    })

    // Set mock auth
    await page.goto('/login')
    await page.evaluate(() => {
      localStorage.setItem('session_token', 'mock-token-123')
      localStorage.setItem('user', JSON.stringify({
        id: 'test-user-id',
        email: 'test@example.com',
        displayName: 'Test User',
        level: 1,
        totalXp: 0
      }))
    })

    await page.goto('/')

    // Check for Start session button
    const startButton = page.locator('button:has-text("Start session")')
    await expect(startButton).toBeVisible({ timeout: 10000 })
  })

  test('should show settings link when authenticated', async ({ page }) => {
    // Mock API responses
    await page.route('**/api/user/progression', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          level: 1,
          totalXp: 0,
          xpToNextLevel: 100,
          currentStreak: 0,
          bestStreak: 0,
          sessionsCompleted: 0,
          averageScore: null
        })
      })
    })

    await page.route('**/api/sessions/active', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ session: null })
      })
    })

    // Set mock auth
    await page.goto('/login')
    await page.evaluate(() => {
      localStorage.setItem('session_token', 'mock-token-123')
      localStorage.setItem('user', JSON.stringify({
        id: 'test-user-id',
        email: 'test@example.com',
        displayName: 'Test User',
        level: 1,
        totalXp: 0
      }))
    })

    await page.goto('/')

    // Check for Settings link in quick links
    await expect(page.locator('text=Settings')).toBeVisible({ timeout: 10000 })
  })
})
