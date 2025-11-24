# Complete Setup & Testing Guide

This guide walks through completing all remaining setup and testing tasks for the Sensei MVP.

## Status Overview

✅ **Completed:**
- Backend implementation (auth, sessions, scoring, progression)
- Database setup with 33 seeded prompts
- Unit tests (38 tests passing)
- Integration tests (all 8 steps saving)
- Validation schema fixes

⏳ **Remaining:**
1. Get AI Scoring Working
2. Test Frontend Manually
3. Add Component Tests for Steps 2-8
4. Build Production & Deploy
5. Add E2E Tests

---

## Task 1: Get AI Scoring Working

### Current Status
The scoring system is built but requires a valid Anthropic API key to function.

### Steps to Complete

#### 1.1 Get Anthropic API Key
1. Go to [https://console.anthropic.com/](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-ant-`)

#### 1.2 Update Environment File
Edit `.env.local` and replace the placeholder:

```bash
# Before
ANTHROPIC_API_KEY="sk-ant-your-anthropic-api-key-here"

# After
ANTHROPIC_API_KEY="sk-ant-api03-your-actual-key-here"
```

#### 1.3 Restart Development Server
The server needs to restart to load the new environment variable:

```bash
# Kill the current server (Ctrl+C)
# Then restart
npm run dev
```

#### 1.4 Test Scoring

Run the integration test to verify scoring works:

```bash
bash test-full-flow.sh
```

Expected output:
```
🤖 Step 13: Scoring session with AI...
✅ Scoring completed successfully
📊 Overall Score: XX/100
```

Alternatively, test manually:
```bash
# Get a completed session ID from the database
SESSION_ID="your-session-id-here"

# Score it
curl -X POST "http://localhost:3000/api/sessions/$SESSION_ID/score" \
  -H "Authorization: Bearer $YOUR_TOKEN"
```

### Verification

- [ ] API key added to `.env.local`
- [ ] Server restarted
- [ ] Scoring endpoint returns scores (not errors)
- [ ] Scores appear in database and API responses

---

## Task 2: Test Frontend Manually

### Current Status
Server is running on `http://localhost:3000` but we haven't tested the UI yet.

### Testing Checklist

#### 2.1 Landing Page & Auth
- [ ] Open `http://localhost:3000` in browser
- [ ] Landing page displays correctly
- [ ] Enter email and submit
- [ ] Check terminal for magic link (EMAIL_PROVIDER="console")
- [ ] Copy magic link from terminal
- [ ] Paste into browser to authenticate
- [ ] Verify successful redirect

#### 2.2 Dashboard
- [ ] Dashboard loads after login
- [ ] "Start Practice" button is visible
- [ ] Navigation works (Dashboard, Progress, Settings)
- [ ] User info displays correctly (level, XP)

#### 2.3 Session Flow (All 8 Steps)
- [ ] Click "Start Practice"
- [ ] Verify random prompt loads
- [ ] **Step 1 - Goal:** Select objective, enter goal (20+ chars), submit
- [ ] **Step 2 - Mission:** Enter mission alignment (50+ chars), submit
- [ ] **Step 3 - Segments:** Add 1-3 user segments with descriptions, submit
- [ ] **Step 4 - Problems:** Add 1-5 problems, submit
- [ ] **Step 5 - Solutions:** Add solution with features, submit
- [ ] **Step 6 - Metrics:** Define primary metric and guardrails, submit
- [ ] **Step 7 - Tradeoffs:** Add 2+ tradeoffs with mitigation, submit
- [ ] **Step 8 - Summary:** Write reflection and learnings, submit

#### 2.4 Results Page
- [ ] Session completion triggers scoring
- [ ] Results page loads
- [ ] Overall score displays
- [ ] Step-by-step breakdown shows
- [ ] Feedback for each step appears
- [ ] "Start New Session" button works

#### 2.5 Progress Page
- [ ] Navigate to Progress page
- [ ] Current level displays
- [ ] XP progress bar shows
- [ ] Streak information displays
- [ ] Session history shows completed sessions
- [ ] Click on a session to view details

#### 2.6 Settings Page
- [ ] Navigate to Settings
- [ ] Display name can be edited
- [ ] Email displays correctly
- [ ] Account creation date shows
- [ ] Logout button works
- [ ] Delete account button shows (don't test!)

#### 2.7 Responsive Design
- [ ] Test on mobile viewport (DevTools)
- [ ] Test on tablet viewport
- [ ] Navigation adapts to mobile
- [ ] Forms work on all screen sizes

### Common Issues & Fixes

**Issue: Magic link not showing**
- Check terminal where `npm run dev` is running
- Look for "🔐 Magic Link Generated" message

**Issue: Session won't start**
- Check for existing active session: `/api/progression/stats`
- Clear it from database if needed: `sqlite3 ./prisma/dev.db "DELETE FROM sessions WHERE status='in_progress';"`

**Issue: Validation errors**
- Ensure minimum character counts are met
- Check browser console for detailed error messages

**Issue: Styling looks broken**
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- Check browser console for CSS errors

---

## Task 3: Add Component Tests (Steps 2-8)

### Current Status
Only Step1Goal has tests. Need to add tests for the remaining 7 steps.

### Implementation Plan

Create test files following the Step1Goal pattern:

#### 3.1 Step 2 - Mission Test
```bash
# Create file
touch src/components/session/__tests__/Step2Mission.test.tsx
```

Test coverage:
- Renders mission alignment textarea
- Shows validation error for short text (< 50 chars)
- Accepts valid mission alignment
- Calls onComplete with correct data structure

#### 3.2 Step 3 - Segments Test
```bash
touch src/components/session/__tests__/Step3Segments.test.tsx
```

Test coverage:
- Allows adding segments (up to 3)
- Validates segment name (min 3 chars)
- Validates segment description (min 20 chars)
- Prevents duplicate segment names
- Allows removing segments
- Calls onComplete with segments array

#### 3.3 Step 4 - Problems Test
```bash
touch src/components/session/__tests__/Step4Problems.test.tsx
```

Test coverage:
- Allows adding problems (1-5)
- Validates problem description (min 10 chars)
- Allows removing problems
- Calls onComplete with problems array

#### 3.4 Step 5 - Solutions Test
```bash
touch src/components/session/__tests__/Step5Solutions.test.tsx
```

Test coverage:
- Creates solution with title, description, features
- Validates title (min 5 chars)
- Validates description (min 20 chars)
- Allows adding/removing features
- Calls onComplete with solution data

#### 3.5 Step 6 - Metrics Test
```bash
touch src/components/session/__tests__/Step6Metrics.test.tsx
```

Test coverage:
- Creates primary metric
- Validates metric fields
- Allows adding guardrails (1-3)
- Validates guardrail fields
- Calls onComplete with metrics data

#### 3.6 Step 7 - Tradeoffs Test
```bash
touch src/components/session/__tests__/Step7Tradeoffs.test.tsx
```

Test coverage:
- Allows adding tradeoffs (2-5)
- Validates tradeoff fields
- Allows selecting impact level
- Validates mitigation strategy
- Calls onComplete with tradeoffs array

#### 3.7 Step 8 - Summary Test
```bash
touch src/components/session/__tests__/Step8Summary.test.tsx
```

Test coverage:
- Renders summary (auto-generated)
- Validates reflection (min 100 chars)
- Allows adding learnings (1-3)
- Validates learning length (20-500 chars)
- Calls onComplete with summary data

### Template Structure

Each test should follow this structure:

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StepXComponent from '../StepXComponent'

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

describe('StepXComponent', () => {
  const mockProps = {
    sessionId: 'test-session-id',
    prompt: { /* test prompt */ },
    data: undefined,
    onComplete: jest.fn(),
    onBack: jest.fn(),
    saving: false,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render the step', () => {
    render(<StepXComponent {...mockProps} />)
    // Assertions
  })

  it('should validate input', async () => {
    render(<StepXComponent {...mockProps} />)
    // Test validation
  })

  it('should submit valid data', async () => {
    render(<StepXComponent {...mockProps} />)
    // Test submission
  })
})
```

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

### Target Coverage
- Overall: 80%+
- Components: 70%+
- Critical paths: 90%+

---

## Task 4: Build Production & Deploy

### 4.1 Pre-Build Checklist

- [ ] All tests passing (`npm test`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] Linting passes (`npm run lint`)
- [ ] Environment variables documented
- [ ] Database migrations ready for production

### 4.2 Build Locally

```bash
# Run production build
npm run build

# Test production build locally
npm start
```

Fix any build errors before deploying.

### 4.3 Deploy to Vercel (Recommended)

#### Setup
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Configure environment variables:
   - `DATABASE_URL` (production database)
   - `JWT_SECRET`
   - `ANTHROPIC_API_KEY`
   - `EMAIL_PROVIDER` ("smtp" for production)
   - SMTP settings (if using email)

#### Environment Variables
```bash
DATABASE_URL="postgresql://..."
JWT_SECRET="your-production-secret"
ANTHROPIC_API_KEY="sk-ant-..."
ANTHROPIC_MODEL="claude-3-5-sonnet-20241022"
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"
EMAIL_PROVIDER="smtp"
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASS="your-sendgrid-api-key"
SMTP_FROM="noreply@yourdomain.com"
```

#### Database Migration
```bash
# Connect to production database
DATABASE_URL="postgresql://..." npm run db:migrate

# Seed production prompts
DATABASE_URL="postgresql://..." npm run db:seed
```

#### Deploy
Vercel will automatically deploy on push to main branch.

### 4.4 Alternative: Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Create new project from GitHub repo
3. Add PostgreSQL database service
4. Set environment variables
5. Deploy

### 4.5 Post-Deploy Verification

- [ ] App loads at production URL
- [ ] Authentication works (magic links sent)
- [ ] Can create and complete session
- [ ] Scoring works
- [ ] Database persists data
- [ ] No console errors

---

## Task 5: Add E2E Tests with Playwright

### 5.1 Install Playwright

```bash
npm install -D @playwright/test
npx playwright install
```

### 5.2 Configure Playwright

Create `playwright.config.ts`:

```typescript
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### 5.3 Create E2E Test Suite

```bash
mkdir e2e
touch e2e/full-session-flow.spec.ts
```

Example test:

```typescript
import { test, expect } from '@playwright/test'

test('complete session flow', async ({ page }) => {
  // 1. Landing page
  await page.goto('/')
  await expect(page).toHaveTitle(/Sensei/)

  // 2. Enter email
  await page.fill('input[type="email"]', 'test@example.com')
  await page.click('button:has-text("Send Magic Link")')

  // 3. Check for success message
  await expect(page.locator('text=Check your email')).toBeVisible()

  // Note: In E2E tests, you'd need to mock the magic link
  // or set up a test email service

  // 4. Navigate to dashboard (assume logged in)
  await page.goto('/dashboard')

  // 5. Start session
  await page.click('button:has-text("Start Practice")')

  // 6. Complete Step 1
  await page.click('button:has-text("Acquisition")')
  await page.fill('textarea', 'Test goal sentence with more than twenty characters')
  await page.click('button:has-text("Next")')

  // 7-14. Complete remaining steps...

  // 15. Verify results page
  await expect(page.locator('text=Overall Score')).toBeVisible()
})
```

### 5.4 Run E2E Tests

```bash
# Run tests
npx playwright test

# Run in UI mode
npx playwright test --ui

# Run specific test
npx playwright test e2e/full-session-flow.spec.ts
```

### 5.5 E2E Test Coverage

Create tests for:
- [ ] Full session flow (happy path)
- [ ] Authentication flow
- [ ] Validation errors
- [ ] Navigation between pages
- [ ] Session persistence
- [ ] Scoring and results display
- [ ] Progress page
- [ ] Settings page

---

## Quick Reference

### Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm test                 # Run unit tests
npm run build            # Build for production

# Database
npm run db:migrate       # Run migrations
npm run db:seed          # Seed database
npm run db:studio        # Open Prisma Studio

# Testing
bash test-full-flow.sh   # Integration test
npm run test:coverage    # Test coverage
npx playwright test      # E2E tests
```

### Current URLs

- Dev: `http://localhost:3000`
- API: `http://localhost:3000/api/*`
- Prisma Studio: `http://localhost:5555`

### Important Files

- Environment: `.env.local`
- Database: `./prisma/dev.db`
- Tests: `src/**/__tests__/**`
- Schemas: `src/schemas/steps.schema.ts`

---

## Next Steps After Completion

1. **Monitor in Production**
   - Set up error tracking (Sentry)
   - Add analytics (PostHog, Mixpanel)
   - Monitor API performance

2. **Iterate Based on Feedback**
   - Collect user feedback
   - A/B test different prompts
   - Optimize scoring algorithm

3. **Scale Features**
   - Add more prompts
   - Implement leaderboards
   - Add social features (share results)
   - Premium features

4. **Optimize Performance**
   - Add caching
   - Optimize database queries
   - Implement rate limiting

Good luck! 🚀
