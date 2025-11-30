# Sensei MVP - Product Sense Practice Game

A web application that helps users practice structured product thinking through an 8-step guided flow with AI-powered feedback.

## 🎯 Vision

Make structured, product-style thinking a daily habit.

## ✨ Features

- **8-Step Practice Flow**: Guided exercises covering goal setting, user segments, problem prioritization, solution ideation, metrics, tradeoffs, and reflection
- **Interactive Kanban Board**: Drag-and-drop feature prioritization (Step 5)
- **AI-Powered Feedback**: LLM-based scoring with detailed feedback on each step
- **Gamification**: XP system, leveling, achievements, and daily streak tracking
- **Progress Tracking**: View past sessions and identify weak areas
- **Magic Link Authentication**: Passwordless login for better UX

## 🏗️ Architecture

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes (REST)
- **Database**: SQLite (local dev) with Prisma ORM
- **AI**: Anthropic Claude API for scoring (with mock fallback)
- **Auth**: JWT-based magic links
- **Testing**: Jest + React Testing Library (unit), Playwright (E2E)

## 📋 Prerequisites

- Node.js 18+ and npm
- Anthropic API key (optional - app works with mock scoring)

## 🚀 Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Set Up Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` and optionally add your Anthropic API key:

```bash
ANTHROPIC_API_KEY="sk-ant-your-api-key-here"  # Optional - mock scoring works without it
```

**Note**: The app includes a mock scoring system, so you can test the full flow without an API key.

### 3. Initialize Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed database with prompts and missions
npx prisma db seed
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
./
├── src/
│   ├── app/              # Next.js App Router (pages + API routes)
│   ├── components/       # React components
│   ├── services/         # Business logic layer
│   ├── schemas/          # Zod validation schemas
│   ├── types/            # TypeScript types
│   ├── contexts/         # React contexts
│   └── lib/              # Utilities and DB client
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed data
├── public/
│   └── openapi.json      # API specification
├── docs/                 # Documentation
├── CLAUDE.md             # Development guide
└── sensei_prd.md         # Product requirements
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed architecture documentation.

## 🔧 Development

### Available Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Database
npx prisma studio        # Open database GUI
npx prisma migrate dev   # Create new migration
npx prisma db seed       # Seed database
npx prisma migrate reset # Reset database (dev only)

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format with Prettier
npm run type-check       # TypeScript type checking
```

### Database Management

View and edit your SQLite database:

```bash
npx prisma studio
```

This opens a GUI at [http://localhost:5555](http://localhost:5555).

### Adding New Prompts

Edit `prisma/seed.ts` and run:

```bash
npx prisma db seed
```

## 🧪 Testing

### Unit Tests (Jest + React Testing Library)

```bash
# Run all unit tests
npm run test

# Watch mode for development
npm run test:watch

# Coverage report
npm run test:coverage
```

**Status**: ✅ 38 tests passing
- API client tests (24 tests)
- Utility function tests (14 tests)

### E2E Tests (Playwright)

```bash
# Run all E2E tests
npm run test:e2e

# Interactive UI mode
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug

# View test report
npm run test:e2e:report
```

**Status**: ✅ 9/9 session flow tests passing with **real backend integration**!
- Real authentication flow (magic link + JWT)
- Complete 8-step session flow testing
- Back/forward navigation testing
- Form validation tests
- Tests create real users, use actual JWT tokens, interact with live database
- No API mocking - full end-to-end coverage

### Manual Testing

Application running at: [http://localhost:3000](http://localhost:3000)

Test the complete flow:
1. Navigate to login page
2. Enter email and receive magic link (check terminal)
3. Click magic link to authenticate
4. Start a practice session
5. Complete all 8 steps
6. View scoring and feedback

## 📖 Key Flows

### Authentication Flow

1. User enters email on login page
2. System generates magic link token (15 min expiry)
3. Token logged to console (in dev) or sent via email
4. User clicks link → token verified → JWT session created
5. User redirected to home page

### Session Flow

1. User clicks "Start Session" on home page
2. System selects a random prompt based on difficulty
3. User completes 8 steps with guided inputs
4. Answers saved to localStorage (resilient to network issues)
5. User submits session for scoring
6. OpenAI API scores responses with detailed feedback
7. User receives scores, XP, and streak updates
8. Session saved to database

## 🌐 API Endpoints

See [public/openapi.json](public/openapi.json) for complete OpenAPI 3.0 specification.

### Authentication
- `POST /api/auth/send-link` - Send magic link
- `POST /api/auth/verify` - Verify token and login
- `POST /api/auth/logout` - Logout

### Sessions
- `POST /api/sessions/start` - Start new session
- `POST /api/sessions/complete` - Submit and score
- `GET /api/sessions` - List user sessions
- `GET /api/sessions/:id` - Get session detail

### Progress
- `GET /api/progression/stats` - User stats and progress
- `GET /api/progression/xp-history` - XP history

### User & Account
- `GET /api/user/me` - Current user profile
- `PATCH /api/account` - Update profile (display name)
- `DELETE /api/account` - Delete account and all data


## 🔐 Environment Variables

Required variables (see `.env.example`):

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `DATABASE_URL` | SQLite database file | Yes | `file:./dev.db` |
| `JWT_SECRET` | Secret for signing JWTs | Yes | `random-secret-key` |
| `ANTHROPIC_API_KEY` | Anthropic API key for scoring | No* | `sk-ant-...` |
| `NEXT_PUBLIC_APP_URL` | App URL | Yes | `http://localhost:3000` |

*Mock scoring system works without API key

## 📚 Documentation

- [CLAUDE.md](CLAUDE.md) - Development guide (Planning, Validation, Execute, Verify)
- [sensei_prd.md](sensei_prd.md) - Product Requirements Document
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - System architecture
- [public/openapi.json](public/openapi.json) - API specification

## 🚦 Development Status

- [x] **Phase 1: Planning** (COMPLETE)
- [x] **Phase 2: Validation** (COMPLETE)
- [x] **Phase 3: Execute** (COMPLETE)
- [x] **Phase 4: Verify** (IN PROGRESS)

### ✅ Completed Features
- Magic link authentication
- 8-step practice session flow
- AI-powered scoring (with mock fallback)
- Gamification (XP, levels, streaks)
- Progress tracking
- Settings management
- Responsive UI with animations
- **38 passing unit tests**
- **9/9 E2E session tests passing with real backend** 🎉
- Complete test coverage with real authentication

### 🚧 In Progress
- Manual testing and validation
- Production deployment preparation
- Performance optimization

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: SQLite + Prisma ORM
- **Auth**: JWT + Magic Links
- **AI**: OpenAI API
- **Validation**: Zod
- **State**: React Context + localStorage

## 🔄 Upgrade Path

This project is designed for easy migration:

- **SQLite → Postgres**: Change `DATABASE_URL`, run migrations
- **Local → Vercel**: Push to GitHub, deploy to Vercel
- **Console Email → SendGrid**: Swap email service
- **Local Auth → Supabase**: Replace auth service

See [CLAUDE.md](CLAUDE.md) for detailed upgrade path.

## 🐛 Troubleshooting

### Database Issues

```bash
# Reset database and reseed
npx prisma migrate reset

# Regenerate Prisma client
npx prisma generate
```

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### TypeScript Errors

```bash
# Check for type errors
npm run type-check

# Regenerate Prisma types
npx prisma generate
```

## 📝 Contributing

1. Follow the development workflow in [CLAUDE.md](CLAUDE.md)
2. Use conventional commits: `feat:`, `fix:`, `docs:`, etc.
3. Keep services layer testable and independent
4. Validate all inputs with Zod schemas
5. Update OpenAPI spec when changing APIs

## 📄 License

Private project - All rights reserved

## 🙋 Support

For questions or issues:
1. Check [CLAUDE.md](CLAUDE.md) for development guidance
2. Review [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for architecture details
3. Refer to [sensei_prd.md](sensei_prd.md) for product requirements

---

**Built with ❤️ for product managers and aspiring PMs**
