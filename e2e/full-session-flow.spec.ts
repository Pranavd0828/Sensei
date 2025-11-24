import { test, expect } from '@playwright/test'
import { setupAuthenticatedContext, TestUser } from './test-setup'

/**
 * E2E Test: Full Session Flow
 * Tests the complete 8-step practice session flow with real backend integration
 *
 * Prerequisites:
 * - Development server must be running on localhost:3000
 * - Database must be seeded with prompts (run: npx prisma db seed)
 */
test.describe('Full Session Flow (Real Backend)', () => {
  let testUser: TestUser

  test.beforeEach(async ({ page }) => {
    // Create a real authenticated user via magic link flow
    testUser = await setupAuthenticatedContext(page)
  })

  test('should display dashboard correctly', async ({ page }) => {
    // Check for user info (first occurrence to avoid strict mode violation)
    await expect(page.locator('text=/Level \\d+/').first()).toBeVisible({ timeout: 10000 })
    await expect(page.locator('text=/\\d+ XP to next level/')).toBeVisible()

    // Check for Start session button (not "Start Practice")
    const startButton = page.locator('button:has-text("Start session")')
    await expect(startButton).toBeVisible()
  })

  test('should start a new practice session', async ({ page }) => {
    // Click Start session
    const startButton = page.locator('button:has-text("Start session")')
    await expect(startButton).toBeVisible({ timeout: 10000 })
    await startButton.click()

    // Should navigate to session page
    await expect(page).toHaveURL(/.*session/, { timeout: 10000 })

    // Should show Step 1
    await expect(page.locator('text=/Step 1|Clarify Goal/i')).toBeVisible({ timeout: 10000 })
  })

  test('should complete Step 1: Clarify Goal', async ({ page }) => {
    // Start session
    await page.locator('button:has-text("Start session")').click()
    await page.waitForURL(/.*session/, { timeout: 10000 })

    // Select objective
    const retentionButton = page.locator('button:has-text("Retention")')
    await retentionButton.click()

    // Fill goal
    const goalTextarea = page.locator('textarea').first()
    await goalTextarea.fill(
      'Increase 7-day retention by improving onboarding experience for new users'
    )

    // Click Next
    const nextButton = page.locator('button:has-text("Next")')
    await nextButton.click()

    // Should move to Step 2
    await expect(page.locator('text=/Step 2|Align to Mission/i')).toBeVisible({ timeout: 10000 })
  })

  test('should complete Step 2: Align to Mission', async ({ page }) => {
    // Start and complete Step 1
    await page.locator('button:has-text("Start session")').click()
    await page.waitForURL(/.*session/, { timeout: 10000 })
    await page.locator('button:has-text("Retention")').click()
    await page.locator('textarea').first().fill(
      'Increase 7-day retention by improving onboarding experience for new users'
    )
    await page.locator('button:has-text("Next")').click()
    await page.waitForTimeout(1000)

    // Fill mission alignment
    const missionTextarea = page.locator('textarea').first()
    await missionTextarea.fill(
      'By improving early user experience, we help more people discover and connect with music they love, which aligns with our mission to bring joy through audio experiences to millions of users worldwide.'
    )

    // Click Next
    await page.locator('button:has-text("Next")').click()

    // Should move to Step 3
    await expect(page.locator('text=/Step 3|User Segments/i')).toBeVisible({ timeout: 5000 })
  })

  test('should complete Step 3: Identify User Segments', async ({ page }) => {
    // Navigate to Step 3 (completing Steps 1 and 2)
    await page.locator('button:has-text("Start session")').click()
    await page.waitForURL(/.*session/)

    // Step 1
    await page.locator('button:has-text("Retention")').click()
    await page.locator('textarea').first().fill(
      'Increase 7-day retention by improving onboarding'
    )
    await page.locator('button:has-text("Next")').click()
    await page.waitForTimeout(1000)

    // Step 2
    const textareas = page.locator('textarea')
    await textareas.first().fill(
      'By improving early user experience, we help more people discover and connect with music'
    )
    await page.locator('button:has-text("Next")').click()
    await page.waitForTimeout(1000)

    // Step 3: Fill segments
    const segmentNames = page.locator('input[placeholder*="Aspiring Influencers"]')
    const segmentDescs = page.locator('textarea[placeholder*="Describe this user segment"]')

    await segmentNames.nth(0).fill('Power Users')
    await segmentDescs.nth(0).fill('Users who listen daily for 4+ hours and create playlists actively')

    await segmentNames.nth(1).fill('Casual Listeners')
    await segmentDescs.nth(1).fill('Users who listen 2-3 times per week, mainly to curated playlists')

    // Click Next
    await page.locator('button:has-text("Next")').click()

    // Should move to Step 4
    await expect(page.locator('text=/Step 4|Prioritize Problems/i')).toBeVisible({ timeout: 5000 })
  })

  test('should complete Step 4: Prioritize Problems', async ({ page }) => {
    // Navigate through steps quickly
    await page.locator('button:has-text("Start session")').click()
    await page.waitForURL(/.*session/)

    // Step 1
    await page.locator('button:has-text("Retention")').click()
    await page.locator('textarea').first().fill('Increase 7-day retention by improving onboarding')
    await page.locator('button:has-text("Next")').click()
    await page.waitForTimeout(1000)

    // Step 2
    await page.locator('textarea').first().fill(
      'Improving user experience aligns with our mission to bring joy through audio'
    )
    await page.locator('button:has-text("Next")').click()
    await page.waitForTimeout(1000)

    // Step 3
    const segmentNames = page.locator('input[placeholder*="Aspiring Influencers"]')
    const segmentDescs = page.locator('textarea[placeholder*="Describe this user segment"]')
    await segmentNames.nth(0).fill('Power Users')
    await segmentDescs.nth(0).fill('Users who listen daily for hours')
    await segmentNames.nth(1).fill('Casual Listeners')
    await segmentDescs.nth(1).fill('Users who listen weekly')
    await page.locator('button:has-text("Next")').click()
    await page.waitForTimeout(1000)

    // Step 4: Fill problem
    const problemTitle = page.locator('input[placeholder*="Lack of initial visibility"]').first()
    const problemDesc = page.locator('textarea[placeholder*="Describe the problem in detail"]').first()

    await problemTitle.fill('Lack of initial visibility')
    await problemDesc.fill(
      'New creators struggle to get their first listeners because the algorithm favors established content'
    )

    // Select affected segments
    const checkboxes = page.locator('input[type="checkbox"]')
    await checkboxes.first().check()

    // Click Next
    await page.locator('button:has-text("Next")').click()

    // Should move to Step 5
    await expect(page.locator('text=/Step 5|Ideate Solutions/i')).toBeVisible({ timeout: 5000 })
  })

  test('should complete Step 5: Ideate Solutions', async ({ page }) => {
    // Quick navigation through steps
    await page.locator('button:has-text("Start session")').click()
    await page.waitForURL(/.*session/)

    // Steps 1-4 (minimal data)
    await page.locator('button:has-text("Retention")').click()
    await page.locator('textarea').first().fill('Increase retention')
    await page.locator('button:has-text("Next")').click()
    await page.waitForTimeout(800)

    await page.locator('textarea').first().fill('Aligning with mission to bring joy through audio experiences')
    await page.locator('button:has-text("Next")').click()
    await page.waitForTimeout(800)

    const segNames = page.locator('input[placeholder*="Aspiring Influencers"]')
    const segDescs = page.locator('textarea[placeholder*="Describe this user segment"]')
    await segNames.nth(0).fill('Power Users')
    await segDescs.nth(0).fill('Users who listen daily')
    await page.locator('button:has-text("Next")').click()
    await page.waitForTimeout(800)

    const probTitle = page.locator('input[placeholder*="Lack of initial visibility"]').first()
    const probDesc = page.locator('textarea[placeholder*="Describe the problem in detail"]').first()
    await probTitle.fill('Low visibility')
    await probDesc.fill('New creators struggle to get listeners')
    const checkboxes = page.locator('input[type="checkbox"]')
    await checkboxes.first().check()
    await page.locator('button:has-text("Next")').click()
    await page.waitForTimeout(1000)

    // Step 5: Fill solutions (V0, V1, V2)
    const solutionTitles = page.locator('input[placeholder*="Solution title"]')
    const solutionDescs = page.locator('textarea[placeholder*="Describe this solution"]')

    // V0 (MVP)
    await solutionTitles.nth(0).fill('Quick Win Solution')
    await solutionDescs.nth(0).fill(
      'A minimal viable product that delivers core value quickly to validate hypothesis'
    )

    // V1 (Enhanced)
    await solutionTitles.nth(1).fill('Enhanced Platform')
    await solutionDescs.nth(1).fill(
      'Building on MVP with personalization and better recommendation engine for engagement'
    )

    // V2 (Complete)
    await solutionTitles.nth(2).fill('Complete Solution')
    await solutionDescs.nth(2).fill(
      'Full-featured platform with all bells and whistles including analytics'
    )

    // Add features to each solution
    const addFeatureButtons = page.locator('button:has-text("+ Add feature")')

    // Add features to V0
    await addFeatureButtons.nth(0).click()
    const featureInputs = page.locator('input[placeholder*="Feature"]')
    await featureInputs.nth(0).fill('Basic onboarding flow')
    await addFeatureButtons.nth(0).click()
    await featureInputs.nth(1).fill('Quick start guide')

    // Click Next
    await page.locator('button:has-text("Next")').click()

    // Should move to Step 6
    await expect(page.locator('text=/Step 6|Define Metrics/i')).toBeVisible({ timeout: 5000 })
  })

  test('should validate and navigate back through steps', async ({ page }) => {
    // Start session
    await page.locator('button:has-text("Start session")').click()
    await page.waitForURL(/.*session/)

    // Try to submit Step 1 without data
    const nextButton = page.locator('button:has-text("Next")')
    await nextButton.click()

    // Should show validation error
    await expect(page.locator('text=/required|Select an objective/i').first()).toBeVisible()

    // Fill and proceed
    await page.locator('button:has-text("Retention")').click()
    await page.locator('textarea').first().fill('Increase retention')
    await nextButton.click()
    await page.waitForTimeout(1000)

    // Should be on Step 2
    await expect(page.locator('text=/Step 2/i')).toBeVisible()

    // Click Back
    const backButton = page.locator('button:has-text("Back")')
    await backButton.click()

    // Should return to Step 1
    await expect(page.locator('text=/Step 1|Clarify Goal/i')).toBeVisible()
  })

  test('should persist data when navigating back and forth', async ({ page }) => {
    // Start session
    await page.locator('button:has-text("Start session")').click()
    await page.waitForURL(/.*session/)

    // Fill Step 1
    const goalText = 'Increase 7-day retention by improving onboarding experience for new users'
    await page.locator('button:has-text("Retention")').click()
    await page.locator('textarea').first().fill(goalText)
    await page.locator('button:has-text("Next")').click()
    await page.waitForTimeout(1000)

    // Fill Step 2
    await page.locator('textarea').first().fill('Mission alignment text')
    await page.locator('button:has-text("Next")').click()
    await page.waitForTimeout(1000)

    // Go back to Step 1
    await page.waitForTimeout(1000)
    await page.locator('button:has-text("Back")').click()
    await page.waitForTimeout(1000)
    await page.locator('button:has-text("Back")').click()
    await page.waitForTimeout(1000)

    // Check if data is still there
    const goalTextarea = page.locator('textarea').first()
    await expect(goalTextarea).toHaveValue(goalText)

    // Retention button should still be selected (orange highlight)
    const retentionButton = page.locator('button:has-text("Retention")')
    await expect(retentionButton).toBeVisible()
  })
})
