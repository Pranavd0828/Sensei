# Manual Testing Checklist

**Date Created:** November 13, 2025
**Status:** Ready for Testing
**Prerequisites:** Development server running on http://localhost:3000

---

## Pre-Testing Setup

- [ ] Development server is running (`npm run dev`)
- [ ] Database is seeded with prompts (`npm run db:seed` if needed)
- [ ] Browser DevTools console open to check for errors
- [ ] Clear browser cache if testing after major changes

---

## Test Suite 1: Landing Page & Authentication

### 1.1 Landing Page
**URL:** http://localhost:3000

- [ ] Page loads without errors
- [ ] Hero section displays with "Sensei" branding
- [ ] Orange (#FF6B00) primary color is visible
- [ ] Dark theme is active
- [ ] "Get Started" or "Sign In" button is visible
- [ ] Animations work smoothly (Framer Motion)
- [ ] No console errors in DevTools

### 1.2 Authentication Flow
**URL:** http://localhost:3000/login

- [ ] Click "Get Started" or "Sign In"
- [ ] Email input field is visible
- [ ] Enter a test email: `test@example.com`
- [ ] Click "Send Magic Link"
- [ ] Success message appears: "Check your email"
- [ ] Switch to terminal running `npm run dev`
- [ ] Find magic link in console output (look for "🔐 Magic Link Generated")
- [ ] Copy the magic link URL
- [ ] Paste magic link into browser address bar
- [ ] User is redirected to dashboard
- [ ] No errors in console

**Expected Console Output:**
```
🔐 Magic Link Generated: http://localhost:3000/auth/verify?token=...
```

---

## Test Suite 2: Dashboard

### 2.1 Dashboard Overview
**URL:** http://localhost:3000/dashboard

- [ ] Dashboard loads after successful login
- [ ] User info displays in header (email/name)
- [ ] Current level displays (e.g., "Level 1")
- [ ] Current XP displays (e.g., "0 XP")
- [ ] Streak information shows (e.g., "0 day streak")
- [ ] "Start Practice" button is prominent and clickable
- [ ] Navigation menu is visible (Dashboard, Progress, Settings)

### 2.2 Navigation
- [ ] Click "Progress" link → navigates to progress page
- [ ] Click "Settings" link → navigates to settings page
- [ ] Click "Dashboard" link → returns to dashboard
- [ ] All navigation transitions are smooth

---

## Test Suite 3: Practice Session Flow (All 8 Steps)

### 3.1 Start Session
**Starting Point:** Dashboard

- [ ] Click "Start Practice" button
- [ ] Random prompt loads
- [ ] Prompt details display (company, surface, objective)
- [ ] Step 1 interface loads
- [ ] Progress indicator shows "Step 1 of 8"

### 3.2 Step 1: Clarify Goal
- [ ] Five objective buttons visible: Acquisition, Activation, Retention, Monetization, Engagement
- [ ] Click an objective (e.g., "Retention")
- [ ] Selected button highlights in orange
- [ ] Goal textarea appears
- [ ] Enter goal text: "Increase 7-day retention by improving onboarding experience for new users"
- [ ] Character count shows (should be > 20 characters)
- [ ] Try clicking "Next" with short text → validation error appears
- [ ] Enter valid text (20+ chars) → "Next" button works
- [ ] Click "Next" → moves to Step 2

### 3.3 Step 2: Align to Mission
- [ ] Company mission displays at top
- [ ] Mission alignment textarea is visible
- [ ] Enter text: "By improving early user experience, we help more people discover and connect with music they love, which aligns with our mission to bring joy through audio experiences to millions of users worldwide."
- [ ] Character count shows (50+ characters required)
- [ ] Try submitting with < 50 chars → validation error
- [ ] Enter valid text → "Next" works
- [ ] "Back" button returns to Step 1
- [ ] Click "Next" → moves to Step 3

### 3.4 Step 3: Identify User Segments
- [ ] Two empty segment cards display by default
- [ ] Each segment has name and description fields
- [ ] Fill Segment 1:
  - Name: "Power Users"
  - Description: "Users who listen daily for 4+ hours and create playlists actively"
- [ ] Fill Segment 2:
  - Name: "Casual Listeners"
  - Description: "Users who listen 2-3 times per week, mainly to curated playlists"
- [ ] "+ Add another segment" button visible
- [ ] Click to add Segment 3
- [ ] After 3 segments, add button disappears
- [ ] Test removing a segment (X button)
- [ ] Validation works (min 1 segment, name 3+ chars, description 20+ chars)
- [ ] Click "Next" → moves to Step 4

### 3.5 Step 4: Prioritize Problems
- [ ] One empty problem card displays by default
- [ ] Fill Problem 1:
  - Title: "Lack of initial visibility"
  - Description: "New creators struggle to get their first listeners because the algorithm favors established content"
  - Affected Segments: Select "Power Users" and "Casual Listeners"
- [ ] "+ Add another problem" button works
- [ ] Add 2-3 problems total
- [ ] Priority indicator shows (Priority: 1, Priority: 2, etc.)
- [ ] Up/down arrows to reorder problems work
- [ ] Remove button works
- [ ] Validation works (title 5+ chars, description 30+ chars, 1+ segment selected)
- [ ] Click "Next" → moves to Step 5

### 3.6 Step 5: Ideate Solutions
- [ ] Three solution cards display (V0, V1, V2)
- [ ] Each labeled: MVP, Enhanced, Complete
- [ ] Fill V0 (MVP):
  - Title: "Quick Win"
  - Description: "A minimal viable product that delivers core value quickly to validate our hypothesis"
  - Features: Add 2+ features (10+ chars each)
- [ ] Fill V1 (Enhanced):
  - Title: "Enhanced Platform"
  - Description: "Building on MVP with personalization and better recommendation engine for sustained engagement"
  - Features: Add 2+ features
- [ ] Fill V2 (Complete):
  - Title: "Complete Solution"
  - Description: "Full-featured platform with all bells and whistles including analytics and creator tools"
  - Features: Add 2+ features
- [ ] "+ Add feature" button works (up to 5 per solution)
- [ ] Validation works (title 5+ chars, description 50+ chars, 2+ features 10+ chars each)
- [ ] Click "Next" → moves to Step 6

### 3.7 Step 6: Define Metrics
- [ ] Primary Metric section visible
- [ ] Fill Primary Metric:
  - Name: "7-Day Retention Rate"
  - Description: "Percentage of users who return within 7 days of signup"
  - Target: "Increase from 40% to 50% in 3 months"
- [ ] Guardrail Metrics section visible (1 default)
- [ ] Fill Guardrail 1:
  - Name: "NPS Score"
  - Threshold: "Must stay above 45"
- [ ] "+ Add guardrail" button works (up to 3)
- [ ] Validation works (metric name 3+ chars, description 20+ chars, target 5+ chars)
- [ ] Click "Next" → moves to Step 7

### 3.8 Step 7: Tradeoffs and Risks
- [ ] One tradeoff card displays by default
- [ ] Fill Tradeoff 1:
  - Title: "Development Speed vs Quality"
  - Description: "Building features quickly may compromise code quality and maintainability"
  - Impact: Select "HIGH" (buttons: LOW, MEDIUM, HIGH)
  - Mitigation: "Implement code review process and automated testing to maintain quality standards"
- [ ] "+ Add tradeoff" button works
- [ ] Add at least 2 tradeoffs (validation requires 2 minimum)
- [ ] Impact level buttons work and show selection
- [ ] Remove button works (but must keep at least 1)
- [ ] Validation works (title 5+ chars, description 30+ chars, mitigation 30+ chars)
- [ ] Click "Next" → moves to Step 8

### 3.9 Step 8: Summary and Reflection
- [ ] Auto-generated summary displays showing:
  - Goal from Step 1
  - Segments from Step 3
- [ ] Reflection textarea visible
- [ ] Fill Reflection (100+ chars):
  - "This exercise helped me understand how to think systematically about product problems. I learned to break down complex challenges into manageable steps and consider multiple perspectives including user needs, business goals, and technical constraints."
- [ ] Key Learnings section visible (1 default)
- [ ] Fill Learning 1:
  - "User segmentation is critical for prioritizing features effectively and ensuring solutions address real needs"
- [ ] "+ Add learning" button works (up to 3)
- [ ] Character counter shows for reflection
- [ ] Validation works (reflection 100+ chars, learnings 20-500 chars)
- [ ] "Complete Session" button visible (with orange glow)
- [ ] Click "Complete Session" → triggers scoring

---

## Test Suite 4: Scoring & Results

### 4.1 Scoring Process
- [ ] After completing Step 8, scoring begins
- [ ] Loading indicator or progress message shows
- [ ] Wait for scoring to complete (mock scoring is instant)
- [ ] Console shows: "🎭 Using mock scoring for step: [stepname]"

### 4.2 Results Page
**URL:** http://localhost:3000/session/[sessionId]/results

- [ ] Results page loads automatically
- [ ] Overall score displays (e.g., "85/100")
- [ ] Performance level shows (e.g., "Strong")
- [ ] XP earned displays (e.g., "170 XP")
- [ ] Step-by-step breakdown visible
- [ ] Each step shows:
  - Step name
  - Score (/100)
  - Feedback text
  - Strengths (2-3 points)
  - Improvements (2-3 points)
- [ ] All 8 steps are scored
- [ ] Scores are realistic (70-100 range)
- [ ] "Start New Session" button visible
- [ ] Click button → returns to dashboard

---

## Test Suite 5: Progress Page

### 5.1 Progress Overview
**URL:** http://localhost:3000/progress

- [ ] Page loads without errors
- [ ] Current level displays with progress bar
- [ ] XP to next level shows
- [ ] Total XP displays
- [ ] Streak information displays (days, last practice date)
- [ ] Session history section visible

### 5.2 Session History
- [ ] Completed session(s) appear in history
- [ ] Each session shows:
  - Date/time
  - Prompt name
  - Score
  - XP earned
- [ ] Click on a session → shows details or navigates to results
- [ ] Sessions sorted by date (most recent first)

---

## Test Suite 6: Settings Page

### 6.1 Profile Settings
**URL:** http://localhost:3000/settings

- [ ] Settings page loads
- [ ] Display name field shows current name (or empty)
- [ ] Edit display name
- [ ] Email displays (read-only)
- [ ] Account creation date displays
- [ ] Changes can be saved

### 6.2 Account Actions
- [ ] "Logout" button visible
- [ ] Click "Logout" → redirects to landing page
- [ ] User session is cleared
- [ ] "Delete Account" button visible (warning color)
- [ ] **DO NOT TEST DELETE** (destructive action)

---

## Test Suite 7: Responsive Design

### 7.1 Mobile Viewport (375px)
- [ ] Open DevTools → Toggle device toolbar
- [ ] Set to iPhone SE or similar (375px width)
- [ ] Landing page renders correctly
- [ ] Dashboard is usable
- [ ] Session flow works on mobile
- [ ] Forms are usable
- [ ] Buttons are tappable
- [ ] No horizontal scroll
- [ ] Text is readable

### 7.2 Tablet Viewport (768px)
- [ ] Set viewport to iPad (768px)
- [ ] All pages render correctly
- [ ] Navigation adapts properly
- [ ] Forms have good spacing
- [ ] Cards layout adjusts

### 7.3 Desktop Viewport (1920px)
- [ ] Set viewport to desktop (1920px)
- [ ] Content doesn't stretch too wide
- [ ] Good use of space
- [ ] Readable and aesthetically pleasing

---

## Test Suite 8: Error Handling

### 8.1 Validation Errors
- [ ] Try submitting forms with invalid data
- [ ] Error messages display clearly in red
- [ ] Error messages are helpful and specific
- [ ] Errors clear when input is fixed

### 8.2 Network Errors (Optional)
- [ ] Disable network in DevTools
- [ ] Try actions that require API calls
- [ ] Error messages appear
- [ ] App doesn't crash
- [ ] Re-enable network → app recovers

---

## Test Suite 9: Performance & UX

### 9.1 Loading States
- [ ] Buttons show "Saving..." or "Loading..." states
- [ ] Buttons are disabled during saves
- [ ] No double-submission possible
- [ ] Loading indicators are smooth

### 9.2 Animations
- [ ] Page transitions are smooth
- [ ] Framer Motion animations work
- [ ] No janky or choppy animations
- [ ] Animations enhance UX, not distract

### 9.3 Dark Mode
- [ ] Dark theme is consistent across all pages
- [ ] Text is readable on dark backgrounds
- [ ] Orange accent color (#FF6B00) stands out
- [ ] No white flashes on page transitions

---

## Test Suite 10: Database Persistence

### 10.1 Data Saving
- [ ] Start a session, complete Step 1
- [ ] Refresh the browser
- [ ] Data from Step 1 is preserved
- [ ] Can continue from where you left off

### 10.2 Multiple Sessions
- [ ] Complete one full session
- [ ] Start another session
- [ ] Both sessions appear in progress page
- [ ] Session history shows both
- [ ] Scores are saved correctly

---

## Common Issues & Troubleshooting

### Issue: Magic Link Not Showing
**Solution:** Check terminal where `npm run dev` is running. Look for "🔐 Magic Link Generated" message.

### Issue: Session Won't Start
**Solution:** Check database for existing active session. Clear with:
```bash
sqlite3 ./prisma/dev.db "DELETE FROM sessions WHERE status='in_progress';"
```

### Issue: Validation Errors
**Solution:** Ensure minimum character counts are met. Check browser console for detailed errors.

### Issue: Styling Broken
**Solution:** Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

### Issue: Scoring Fails
**Solution:** Check server console for errors. Verify mock scoring is enabled (no API key).

---

## Test Results Summary

**Date Tested:** ___________
**Tester:** ___________
**Browser:** ___________
**Outcome:** PASS / FAIL

**Critical Issues Found:**
- [ ] None
- [ ] List any critical issues

**Minor Issues Found:**
- [ ] None
- [ ] List any minor issues

**Notes:**
_____________________________________
_____________________________________
_____________________________________

---

## Next Steps After Testing

1. **If all tests pass:** Ready for deployment!
2. **If issues found:** Document them and fix before deploying
3. **Performance check:** Use Lighthouse in DevTools for performance audit
4. **Accessibility check:** Use axe DevTools for accessibility audit

---

**Testing Complete!** ✅

The Sensei MVP is ready for production deployment once all tests pass.
