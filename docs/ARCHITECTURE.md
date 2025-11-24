# Sensei MVP - System Architecture

## Overview

Sensei is a full-stack web application built with Next.js 14+, featuring a local-first architecture for development and easy upgradability to cloud infrastructure.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Next.js App Router (React Components)              │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │   │
│  │  │  Pages   │  │ Context  │  │   UI     │          │   │
│  │  │  Routes  │  │  State   │  │Components│          │   │
│  │  └──────────┘  └──────────┘  └──────────┘          │   │
│  └─────────────────────────────────────────────────────┘   │
│                           ↕                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            Next.js API Routes (Backend)             │   │
│  │  ┌──────────────────────────────────────────────┐  │   │
│  │  │  Auth  │ Sessions │ Progress │ Account       │  │   │
│  │  └──────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
│                           ↕                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Services Layer                          │   │
│  │  Business Logic | Data Validation | External APIs   │   │
│  └─────────────────────────────────────────────────────┘   │
│                           ↕                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                Prisma ORM                            │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
    ┌──────────────────────────────────────────┐
    │     SQLite Database (Local Dev)          │
    │  Users | Sessions | Steps | Prompts      │
    └──────────────────────────────────────────┘
                            ↕
    ┌──────────────────────────────────────────┐
    │         External Services                │
    │  OpenAI API (Scoring)                    │
    └──────────────────────────────────────────┘
```

## Layer Responsibilities

### 1. Frontend Layer (React/Next.js)

**Location**: `src/app/*`, `src/components/*`

**Responsibilities**:
- Render UI components
- Handle user interactions
- Manage client-side state (React Context + localStorage)
- Form validation (Zod schemas)
- Navigate between routes

**Key Technologies**:
- Next.js 14 App Router
- React Server Components + Client Components
- Tailwind CSS + shadcn/ui
- React Context API for global state
- localStorage for session persistence

**State Management**:
```typescript
AuthContext    → User authentication state
SessionContext → Current session state (8 steps)
```

### 2. API Layer (Next.js API Routes)

**Location**: `src/app/api/*`

**Responsibilities**:
- HTTP request handling
- JWT authentication validation
- Input validation (Zod)
- Call services layer
- Format responses
- Error handling

**Principles**:
- Thin controllers (no business logic)
- Consistent response format
- Middleware for auth validation
- OpenAPI 3.0 compliant

**Example Flow**:
```
Request → Auth Middleware → Validate Input → Call Service → Format Response
```

### 3. Services Layer

**Location**: `src/services/*`

**Responsibilities**:
- All business logic
- Database operations via Prisma
- External API calls (OpenAI)
- Data transformations
- Complex calculations (XP, streaks)

**Services**:
- `AuthService` - Magic links, JWT generation
- `SessionService` - Session lifecycle management
- `PromptService` - Prompt selection logic
- `ScoringService` - LLM scoring and validation
- `XPService` - XP calculation and leveling
- `StreakService` - Streak tracking
- `AccountService` - Account deletion

**Principles**:
- Stateless functions
- Single responsibility
- Independently testable
- Type-safe with Zod validation

### 4. Data Layer (Prisma + SQLite)

**Location**: `prisma/schema.prisma`, `src/lib/db.ts`

**Responsibilities**:
- Data persistence
- Schema migrations
- Type generation
- Query building

**Key Entities**:
```
users → sessions → steps
users → xp_events
users → streaks
prompts
missions
auth_tokens
```

**Relationships**:
- One user has many sessions
- One session has many steps
- One session references one prompt
- One prompt references one mission (company)

## Data Flow Examples

### Creating a New Session

```
1. User clicks "Start Session"
   ↓
2. Frontend → POST /api/sessions/start
   ↓
3. API validates JWT token
   ↓
4. API calls SessionService.createSession(userId)
   ↓
5. SessionService:
   - Calls PromptService.selectPrompt(userId)
   - Creates session in DB via Prisma
   - Returns session + prompt
   ↓
6. API returns JSON response
   ↓
7. Frontend stores in SessionContext + localStorage
   ↓
8. Navigate to Step 1
```

### Completing a Session

```
1. User completes Step 8 and clicks "Submit"
   ↓
2. Frontend validates all step inputs
   ↓
3. Frontend → POST /api/sessions/complete
   Body: { session_id, user_inputs }
   ↓
4. API validates JWT and inputs
   ↓
5. API calls SessionService.completeSession()
   ↓
6. SessionService:
   - Validates session status
   - Calls ScoringService.scoreSession()
     → OpenAI API call with rubric
     → Parse and validate JSON response
     → Retry on failure or use fallback
   - Updates session in DB
   - Calls XPService.awardXP()
   - Calls StreakService.updateStreak()
   ↓
7. API returns scoring results + XP + streak
   ↓
8. Frontend displays results screen
   ↓
9. Frontend clears localStorage session
```

## Authentication Flow

### Sign Up / Login (Magic Link)

```
1. User enters email
   ↓
2. Frontend → POST /api/auth/send-link
   ↓
3. AuthService generates JWT token (15 min expiry)
   ↓
4. Store token in auth_tokens table
   ↓
5. Send "magic link" email (console log in dev)
   ↓
6. User clicks link → /auth/verify?token=xxx
   ↓
7. Frontend → POST /api/auth/verify
   ↓
8. AuthService validates token
   ↓
9. Generate long-lived JWT (7 days)
   ↓
10. Return JWT to frontend
    ↓
11. Store in httpOnly cookie or localStorage
    ↓
12. Redirect to /home
```

### Protected Routes

```
Every API request:
1. Extract JWT from Authorization header
2. Verify signature with JWT_SECRET
3. Check expiration
4. Extract userId
5. Proceed with request or return 401
```

## Database Schema

See `prisma/schema.prisma` for full schema.

### Key Tables

**users**
```sql
id, email, display_name, level, total_xp, best_streak, created_at
```

**sessions**
```sql
id, user_id, prompt_id, status, overall_score, scoring_json,
started_at, completed_at
```

**steps**
```sql
id, session_id, step_name, user_input, score, feedback, duration_ms
```

**prompts**
```sql
id, name, company, mission, surface, objective, constraint,
difficulty, prompt_text
```

**streaks**
```sql
user_id, current_streak, best_streak, last_activity_date
```

## External Dependencies

### OpenAI API
- **Purpose**: Scoring user responses with AI feedback
- **Usage**: Called by ScoringService
- **Fallback**: Default scores if API fails
- **Rate Limiting**: Not implemented in MVP (handled by OpenAI)

### Email Service (Future)
- **MVP**: Console logging
- **Production**: SendGrid, Resend, or AWS SES
- **Purpose**: Send magic links

## Security Considerations

1. **JWT Secrets**: Stored in environment variables
2. **API Key Protection**: OpenAI key never exposed to frontend
3. **SQL Injection**: Prevented by Prisma parameterized queries
4. **XSS**: Prevented by React's built-in escaping
5. **CSRF**: Not needed (stateless JWT auth)
6. **Data Access**: Users can only access their own sessions

## Performance Considerations

### Database
- Indexes on `(user_id, started_at)` for sessions
- Indexes on `(session_id, step_name)` for steps
- SQLite sufficient for MVP (<1000 users)

### API Response Times
- Target: < 200ms for most endpoints
- Scoring: < 4s (p95) due to LLM latency

### Caching (Future)
- Mission data (5 min cache)
- Prompt data (in-memory cache)
- Redis for production scaling

## Monitoring & Observability

### Logging
- API request logs (route, user, duration, status)
- Service operation logs
- LLM call logs (without sensitive data)

### Analytics Events
- `user_signed_up`
- `session_started`
- `session_completed`
- `scoring_failed`

### Error Tracking
- Console errors in dev
- Sentry for production (future)

## Deployment Architecture (Future)

### Development
```
Local Machine → Next.js Dev Server → SQLite
```

### Production (Post-MVP)
```
Vercel Edge → Next.js → Vercel Postgres
                      → OpenAI API
                      → SendGrid Email
```

## Upgrade Path

### Phase 1 → Phase 2
1. SQLite → Postgres (Prisma supports both)
2. Local auth → Supabase Auth
3. Console email → SendGrid/Resend
4. Local env → Vercel deployment
5. Single LLM model → Multi-provider

### Minimal Changes Required
- Update DATABASE_URL in .env
- Swap AuthService implementation
- Add email service implementation
- Deploy to Vercel

## Testing Strategy

### Unit Tests
- Services layer (Jest)
- Utility functions
- Validation schemas

### Integration Tests
- API endpoints (Supertest)
- Database operations

### E2E Tests (Optional)
- Critical user flows (Playwright)
- Login → Session → Results flow

## Development Workflow

```
1. Update Prisma schema
2. Generate migration: npx prisma migrate dev
3. Update services
4. Update API routes
5. Update frontend components
6. Test locally
7. Commit with conventional commits
```

## File Organization Principles

1. **Colocation**: Related files live together
2. **Separation of Concerns**: Each layer has clear boundaries
3. **Single Responsibility**: Each file has one purpose
4. **Type Safety**: TypeScript everywhere
5. **Validation**: Zod at boundaries

## Questions & Decisions

**Q: Why SQLite instead of Postgres?**
A: Simplicity for local dev. No Docker required. Easy upgrade path.

**Q: Why services layer instead of direct DB calls in API routes?**
A: Testability, reusability, separation of concerns.

**Q: Why localStorage for session state?**
A: Resilience against network issues and tab closes.

**Q: Why magic links instead of passwords?**
A: Better UX, no password management, more secure.

---

Last Updated: 2025-11-12
