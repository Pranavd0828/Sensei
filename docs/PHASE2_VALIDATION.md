# Phase 2: Validation Results

**Date:** 2025-11-12
**Status:** ✅ Complete

This document captures all validation decisions, resolved questions, and technical confirmations before beginning implementation.

---

## 1. PRD Requirements Validation

### 1.1 Open Questions Resolution

From PRD Section 14 - Open Questions:

| Question | Decision | Rationale |
|----------|----------|-----------|
| **Should MVP allow anonymous guest mode?** | ❌ NO - Login mandatory | Simplifies MVP scope, enables proper streak/XP tracking, cleaner data model |
| **Prompt selection: random or spaced?** | ✅ Random within difficulty band | Simple for MVP, can enhance later with spacing logic |
| **Step timeboxing: informational or enforced?** | ✅ Informational only | PRD already specifies this - no enforcement in MVP |
| **Magic link expiration time?** | ✅ 15 minutes | Already specified in PRD Section 4.1.1 |

### 1.2 Additional Decisions

| Decision Area | Choice | Notes |
|---------------|--------|-------|
| **LLM Provider** | Claude API (Anthropic) | Better for product thinking evaluation, structured reasoning |
| **Email Provider** | Console logging (dev), pluggable for prod | No email service needed for MVP development |
| **Feature Flags** | Hard-coded booleans for MVP | Can move to LaunchDarkly post-MVP |
| **Anonymous Sessions** | Not supported | User must be logged in to start a session |
| **Concurrent Sessions** | One "in_progress" per user max | Prevents confusion, simpler state management |

---

## 2. Technical Stack Validation

### 2.1 Core Technologies

| Component | Technology | Version | Justification |
|-----------|-----------|---------|---------------|
| **Framework** | Next.js | 14.2+ | App Router, RSC, excellent DX |
| **Language** | TypeScript | 5.3+ | Type safety, better tooling |
| **Database** | SQLite | 3.x | Local-first, no Docker, easy upgrade to Postgres |
| **ORM** | Prisma | 5.x | Type-safe queries, great migrations |
| **Styling** | Tailwind CSS | 3.4+ | Rapid development, consistency |
| **UI Components** | shadcn/ui | latest | Accessible, customizable, copy-paste |
| **Validation** | Zod | 3.x | Runtime type safety, schema validation |
| **Auth** | JWT + bcrypt | latest | Simple, stateless, secure |
| **LLM** | Claude API | 3.5 Sonnet | Excellent for PM evaluation |
| **State** | React Context | - | Built-in, sufficient for MVP |

### 2.2 Dependencies Confirmed

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@prisma/client": "^5.19.0",
    "@anthropic-ai/sdk": "^0.27.0",
    "zod": "^3.23.0",
    "jsonwebtoken": "^9.0.2",
    "bcrypt": "^5.1.1",
    "@radix-ui/react-*": "latest",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.5.0",
    "lucide-react": "^0.400.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/jsonwebtoken": "^9.0.6",
    "@types/bcrypt": "^5.0.2",
    "typescript": "^5",
    "prisma": "^5.19.0",
    "eslint": "^8",
    "prettier": "^3.3.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

### 2.3 Environment Variables

```bash
# Database
DATABASE_URL="file:./dev.db"

# Authentication
JWT_SECRET="generate-with-openssl-rand-base64-32"
JWT_EXPIRES_IN="7d"
MAGIC_LINK_EXPIRES_IN="15m"

# LLM Provider (Claude)
ANTHROPIC_API_KEY="sk-ant-your-key-here"
ANTHROPIC_MODEL="claude-3-5-sonnet-20241022"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# Email (Development)
EMAIL_PROVIDER="console"

# Optional: For Production
# SENTRY_DSN=""
# ANALYTICS_KEY=""
```

---

## 3. Database Schema Validation

### 3.1 Schema Design Principles

✅ **Validated:**
- Foreign key constraints for data integrity
- Indexes on frequently queried columns
- JSONB for flexible scoring data
- Enums for status fields
- Timestamps for auditing
- UUIDs for primary keys (better for distributed systems later)

### 3.2 Tables Overview

| Table | Purpose | Key Relationships |
|-------|---------|-------------------|
| `users` | User profiles, XP, level | → sessions, xp_events |
| `sessions` | Practice sessions | → users, prompts, steps |
| `steps` | Individual step data | → sessions |
| `prompts` | Product scenarios | → sessions |
| `missions` | Company missions | Referenced by prompts |
| `xp_events` | XP transaction log | → users, sessions |
| `streaks` | Streak tracking | → users (1:1) |
| `auth_tokens` | Magic link tokens | → users |

### 3.3 Schema Validation Checklist

- [x] All PRD tables included (Section 6)
- [x] Relationships properly defined
- [x] Cascading deletes for user data
- [x] Indexes on query paths
- [x] Nullable fields correctly marked
- [x] Default values set appropriately
- [x] Enum types for status fields
- [x] JSONB for flexible data (scoring, metadata)
- [x] Timestamps for created/updated tracking
- [x] Compatible with both SQLite and Postgres

### 3.4 Key Constraints

**Business Rules Enforced:**
1. One user can have multiple sessions
2. One session belongs to one user and one prompt
3. One session can have multiple steps (8 max)
4. Session status must be: "in_progress" | "completed" | "abandoned"
5. Only one "in_progress" session per user (enforced in service layer)
6. Scores are 0-5 for steps, 0-100 for overall
7. Magic link tokens expire after 15 minutes
8. Streak updates once per day per user

---

## 4. API Design Validation

### 4.1 REST Principles Confirmed

✅ **Validated:**
- Resource-based URLs (`/api/sessions`, not `/api/getSessions`)
- HTTP verbs map to CRUD operations
- Consistent response format (data/error envelope)
- JWT bearer token authentication
- Proper HTTP status codes
- Idempotent operations where appropriate

### 4.2 Endpoint Validation

| Endpoint | Method | Auth | Purpose | Status Code |
|----------|--------|------|---------|-------------|
| `/api/auth/send-link` | POST | No | Send magic link | 200 |
| `/api/auth/verify` | POST | No | Verify token | 200 / 401 |
| `/api/auth/logout` | POST | Yes | Logout user | 200 |
| `/api/sessions/start` | POST | Yes | Create session | 201 |
| `/api/sessions/complete` | POST | Yes | Submit & score | 200 |
| `/api/sessions` | GET | Yes | List sessions | 200 |
| `/api/sessions/:id` | GET | Yes | Get session | 200 / 404 |
| `/api/progress` | GET | Yes | User progress | 200 |
| `/api/account` | DELETE | Yes | Delete account | 204 |

### 4.3 Response Format Standard

**Success:**
```json
{
  "data": { ... },
  "meta": {
    "timestamp": "2024-11-12T19:00:00Z",
    "requestId": "uuid"
  }
}
```

**Error:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable message",
    "details": { ... }
  }
}
```

**Error Codes:**
- `UNAUTHORIZED` - 401
- `FORBIDDEN` - 403
- `NOT_FOUND` - 404
- `VALIDATION_ERROR` - 400
- `CONFLICT` - 409
- `INTERNAL_ERROR` - 500

---

## 5. Authentication & Security Validation

### 5.1 Auth Flow Validated

**Magic Link Flow:**
```
1. User enters email → validate format
2. Generate JWT token (15 min expiry)
3. Store in auth_tokens table with user_id
4. Send link via console.log (dev) / email (prod)
5. User clicks link → verify token
6. Issue long-lived JWT (7 days)
7. Store in httpOnly cookie (preferred) or localStorage
8. All API requests include JWT in Authorization header
```

### 5.2 Security Checklist

- [x] JWT secrets in environment variables (never committed)
- [x] Magic links expire (15 minutes)
- [x] Session JWTs expire (7 days)
- [x] Passwords not used (magic links only)
- [x] API keys never exposed to frontend
- [x] SQL injection prevented (Prisma parameterized queries)
- [x] XSS prevented (React escaping)
- [x] CSRF not needed (stateless JWT)
- [x] User can only access own data (validated in services)
- [x] HTTPS required in production (enforced by Vercel)

### 5.3 Data Access Rules

| Resource | Access Rule |
|----------|-------------|
| Sessions | User can only see/modify their own |
| Steps | Tied to session ownership |
| XP Events | User can only see their own |
| Streaks | User can only see their own |
| Prompts | Public (read-only for all authenticated users) |
| Missions | Public (read-only for all authenticated users) |

---

## 6. Scoring System Validation

### 6.1 Claude API Integration

**Model:** `claude-3-5-sonnet-20241022`

**Why Claude?**
- Excellent at structured reasoning and evaluation
- Strong product thinking capabilities
- JSON mode support for structured output
- Cost-effective compared to GPT-4
- Better context handling for rubric-based scoring

### 6.2 Scoring Rubric Design

**Input to Claude:**
```typescript
{
  prompt: string,        // Full product scenario
  mission: string,       // Company mission
  userInputs: {          // All 8 steps
    goal: { ... },
    mission_alignment: string,
    segments: string[],
    problems: string[],
    solutions: { v0, v1, v2 },
    metrics: { ... },
    tradeoffs: [ ... ],
    summary: string
  }
}
```

**Output from Claude:**
```typescript
{
  overall_score: number,     // 0-100
  scores: {                  // Per-step scores (0-5)
    goal: number,
    mission: number,
    segments: number,
    problems: number,
    solutions: number,
    metrics: number,
    tradeoffs: number,
    summary: number
  },
  feedback: {                // Per-step feedback
    goal: string,
    mission: string,
    // ... etc
  },
  strengths: string[],       // 2-3 key strengths
  improvements: string[],    // 2-3 improvement areas
  final_summary: string      // Overall assessment
}
```

### 6.3 Scoring Criteria (Per Step)

**Score 5 (Excellent):**
- Demonstrates deep product thinking
- Clear strategic reasoning
- Well-structured and complete
- Shows user empathy and data awareness

**Score 3-4 (Good):**
- Solid thinking with minor gaps
- Addresses key points
- Room for more depth or structure

**Score 1-2 (Needs Work):**
- Superficial or incomplete
- Missing key elements
- Lacks strategic thinking

**Score 0:**
- No meaningful response
- Off-topic or nonsensical

### 6.4 Fallback Strategy

**If Claude API fails:**
1. Retry once with exponential backoff
2. If still failing, use fallback scores:
   - All steps: 3/5 (average)
   - Overall: 60/100
   - Feedback: "AI scoring temporarily unavailable. Your response was saved."
3. Mark session with `scoring_status: "fallback"` flag
4. Log error for monitoring

---

## 7. XP & Streak System Validation

### 7.1 XP Calculation

**Formula:**
```
base_xp = 100
difficulty_multiplier = prompt.difficulty (1, 2, or 3)
score_multiplier = overall_score / 100

xp_awarded = base_xp * difficulty_multiplier * score_multiplier

Example:
- Difficulty 2 prompt
- Score 78/100
- XP = 100 * 2 * 0.78 = 156 XP
```

**Minimum XP:** 50 (for completing any session, even with low score)

### 7.2 Leveling System

**XP Required per Level:**
```
Level 1: 0 XP
Level 2: 200 XP
Level 3: 500 XP
Level 4: 1000 XP
Level 5: 1800 XP
Level 6: 2800 XP
Level 7: 4000 XP
...
Formula: XP_needed = level^2 * 100
```

**Level Up Triggers:**
- Check after every session completion
- Update user.level if threshold crossed
- Show celebration animation in UI

### 7.3 Streak Logic

**Streak Update Rules:**
```typescript
const today = new Date().toDateString()
const lastActivity = streak.last_activity_date

if (lastActivity === today) {
  // Same day - no change
  return current_streak
} else if (lastActivity === yesterday) {
  // Consecutive day - increment
  current_streak += 1
  best_streak = Math.max(current_streak, best_streak)
} else {
  // Streak broken - reset
  current_streak = 1
}

last_activity_date = today
```

**Considerations:**
- Timezone: Use user's local date (handle in frontend)
- Multiple sessions per day: Only first counts for streak
- Streak protection: Not in MVP (can add "freeze" later)

---

## 8. Validation Checklist Results

### 8.1 Requirements Coverage

- [x] All user stories from PRD Section 3 mapped
- [x] All 8-step flow requirements clear
- [x] Authentication flow validated
- [x] Scoring logic defined
- [x] XP and streak calculations confirmed
- [x] Error handling scenarios covered
- [x] Data model supports all features

### 8.2 Technical Validation

- [x] Database schema supports all features
- [x] API endpoints align with PRD
- [x] Authentication flow is secure
- [x] LLM integration strategy clear
- [x] State management approach defined
- [x] Error boundaries planned
- [x] Loading states considered

### 8.3 Open Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Claude API rate limits | Medium | Implement retry + fallback scoring |
| Large LLM response time | Low | Show loading state, timeout at 10s |
| SQLite performance at scale | Low | MVP only, easy Postgres migration |
| Magic link deliverability | Medium | Console logging for dev, test email in prod |
| Session state loss | Low | localStorage backup + server sync |

---

## 9. Acceptance Criteria Validation

From PRD Section 13 - all confirmed achievable:

### MVP Success Criteria

1. ✅ **User can sign up and log in**
   - Magic link flow designed
   - JWT auth validated

2. ✅ **User can complete 8-step session**
   - All step schemas defined
   - Validation rules clear
   - localStorage backup planned

3. ✅ **Scoring returns structured feedback**
   - Claude API integration designed
   - Fallback strategy in place
   - 95%+ success target achievable

4. ✅ **Sessions persist in database**
   - Prisma schema complete
   - Relationships validated

5. ✅ **Progress tracking works**
   - XP calculation defined
   - Streak logic validated
   - API endpoints designed

6. ✅ **Account deletion works**
   - Cascade deletes planned
   - Service method designed

---

## 10. Next Steps: Phase 3 Bootstrap

**Ready to proceed with:**

1. ✅ Initialize Next.js project
2. ✅ Set up Prisma with validated schema
3. ✅ Install all confirmed dependencies
4. ✅ Create seed data (30+ prompts)
5. ✅ Begin Sprint 1: Foundation & Auth

**All validation complete. Green light for implementation! 🚀**

---

**Validation Sign-off:**
- Requirements: ✅ Complete
- Technical Design: ✅ Validated
- Dependencies: ✅ Confirmed
- Risks: ✅ Identified and mitigated
- Ready for Phase 3: ✅ YES

**Next Document:** [Prisma Schema](../prisma/schema.prisma)
