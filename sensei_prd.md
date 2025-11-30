# Sensei Product Requirements (MVP)

Sensei helps PM candidates and product builders practice structured thinking through an 8-step flow with AI feedback and light gamification.

## 1. Vision & Goals
- Make product-sense practice a daily habit with tight feedback loops
- Provide realistic prompts and scoring that mirror interview expectations
- Track streaks, XP, and weak areas so users know where to focus next

## 2. Target Users
- PM candidates preparing for product/design/strategy interviews
- Practicing PMs who want a lightweight daily drill to stay sharp

## 3. Core Experience
- **Auth:** Magic-link login (passwordless) with JWT sessions
- **Start session:** User taps "Start" to receive a prompt based on difficulty
- **8-step flow:**
  1. Clarify goal & objective
  2. Align to mission/company strategy
  3. Identify target segments
  4. Prioritize core problems
  5. Ideate solutions (Interactive Kanban Board)
  6. Define success metrics
  7. Analyze tradeoffs/risks
  8. Summarize recommendation
- **Autosave:** Step inputs persisted locally and to backend per-step where possible
- **Submission:** User submits completed session for scoring
- **Feedback:** AI (Anthropic) scores each step with strengths + improvements; mock fallback available
- **Gamification:** XP, levels, achievements, streak tracking; optional leaderboard stub
- **Progress:** History of sessions, scores, XP earned, streak status
- **Settings:** Manage account, delete data, toggle mock vs live scoring, manage email

## 4. Functional Requirements
- Send and verify magic links; expire tokens after configurable window
- JWT issuance and verification for API routes
- Session lifecycle: start → save step data → complete → score → retrieve results
- Scoring service accepts all step inputs and returns per-step + overall scores
- Progress endpoints aggregate XP, streak, and latest sessions
- Seed data includes sample prompts/missions for multiple difficulties
- Mock scoring must work when no API key is present

## 5. Non-Functional Requirements
- **Reliability:** No data loss on refresh; autosave to localStorage and DB where applicable
- **Performance:** Pages load under ~1s on modern laptops; API routes respond within a few hundred ms for mock scoring
- **Security:** Secrets in env files; JWT signed with strong secret; magic links single-use and time-bound
- **Accessibility:** Semantic HTML on forms, focus states, labeled inputs/buttons
- **Testability:** Services and schemas covered by unit tests; happy-path E2E for auth + session flow

## 6. Success Metrics (initial)
- Daily active practice sessions
- Session completion rate (start → submit)
- 7-day streak retention
- Average score lift across last 5 sessions

## 7. Out of Scope (for MVP)
- Real email delivery (console logging only in dev)
- Multiplayer/review features
- Mobile apps
- Payments/monetization

## 8. Appendices
- See `public/openapi.json` for endpoint details
- See `docs/ARCHITECTURE.md` and `docs/PROJECT_STRUCTURE.md` for system and folder layout
