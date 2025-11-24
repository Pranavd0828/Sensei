# Sensei MVP - Project Structure

Complete directory tree and file organization for the Sensei MVP application.

## 📁 Directory Tree

```
./
├── .env.example                 # Environment variable template
├── .eslintrc.json               # ESLint configuration
├── .gitignore                   # Git ignore rules
├── .prettierrc                  # Prettier configuration
├── GETTING_STARTED.md           # Onboarding guide
├── MIGRATION_GUIDE.md           # Moving the project between machines
├── README.md                    # Project overview and setup
├── CLAUDE.md                    # Development playbook
├── sensei_prd.md                # Product requirements
├── TESTING.md                   # Testing guide
├── package.json                 # Dependencies and scripts
├── package-lock.json            # Locked dependency versions
├── tsconfig.json                # TypeScript configuration
├── next.config.js               # Next.js configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── postcss.config.js            # PostCSS configuration
├── jest.config.js               # Jest setup
├── playwright.config.ts         # Playwright config
├── docs/                        # Architecture and planning docs
├── prisma/                      # Database schema and migrations
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── public/
│   └── openapi.json             # API specification
└── src/
    ├── app/                     # Next.js app router (pages + API routes)
    ├── components/              # UI components
    ├── contexts/                # React contexts
    ├── lib/                     # Utilities and db client
    ├── schemas/                 # Zod validation
    ├── services/                # Business logic
    └── types/                   # Shared TypeScript types
```

## 📄 Key Files Explained

### Root Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Dependencies, scripts, project metadata |
| `tsconfig.json` | TypeScript compiler configuration |
| `next.config.js` | Next.js framework configuration |
| `tailwind.config.ts` | Tailwind CSS theme and plugins |
| `.env.example` | Environment variable template |
| `.env.local` | Local secrets (gitignored) |
| `.gitignore` | Files to exclude from git |

### Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Project overview and quick start |
| `CLAUDE.md` | Development guide (Planning → Verify) |
| `sensei_prd.md` | Product requirements document |
| `docs/ARCHITECTURE.md` | System architecture deep dive |
| `docs/API.md` | API usage examples |
| `docs/DEVELOPMENT.md` | Development workflow guide |

### Database Files

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Database schema definition |
| `prisma/seed.ts` | Seed data script (prompts, missions) |
| `prisma/dev.db` | SQLite database file (gitignored) |
| `prisma/migrations/` | Database version control |

### Application Code

#### App Router (`src/app/`)
Next.js 14 file-based routing. Each folder with a `page.tsx` becomes a route.

- **Pages**: User-facing routes
- **API Routes**: Backend endpoints (`route.ts` files)

#### Components (`src/components/`)
Reusable React components organized by domain:

- `ui/` - Base shadcn/ui components
- `auth/` - Authentication-specific
- `session/` - Session flow components
- `common/` - Shared across app

#### Services (`src/services/`)
Business logic layer. All services are stateless and export static methods:

```typescript
export class SessionService {
  static async createSession(userId: string) { ... }
  static async completeSession(sessionId: string) { ... }
}
```

#### Schemas (`src/schemas/`)
Zod validation schemas for runtime type checking:

```typescript
export const Step1Schema = z.object({
  objective_category: z.enum([...]),
  goal_sentence: z.string().min(10)
})
```

#### Types (`src/types/`)
TypeScript type definitions and interfaces:

```typescript
export type SessionWithPrompt = Prisma.SessionGetPayload<{
  include: { prompt: true }
}>
```

#### Contexts (`src/contexts/`)
React Context providers for global state:

- `AuthContext` - User authentication state
- `SessionContext` - Current session state

#### Lib (`src/lib/`)
Utility functions and singletons:

- `db.ts` - Prisma client singleton
- `auth.ts` - JWT utilities
- `api-client.ts` - Frontend API wrapper

## 🎯 File Naming Conventions

### Components
- PascalCase: `SessionCard.tsx`, `LoadingSpinner.tsx`
- Suffix with component type: `LoginForm.tsx`, `StepProgress.tsx`

### Services
- PascalCase with `.service.ts`: `SessionService.ts`
- Export class with static methods

### Schemas
- PascalCase with `.schema.ts`: `StepSchema.ts`
- Export const schemas and inferred types

### Types
- PascalCase with `.types.ts`: `SessionTypes.ts`
- Export type aliases and interfaces

### API Routes
- `route.ts` for API endpoints
- Folder name matches URL path

### Pages
- `page.tsx` for routes
- `layout.tsx` for layouts
- `loading.tsx` for loading states
- `error.tsx` for error boundaries

## 🔍 Finding Files

### "Where should I put...?"

| What | Where |
|------|-------|
| Business logic | `src/services/` |
| API endpoint | `src/app/api/` |
| React component | `src/components/` |
| Validation schema | `src/schemas/` |
| Type definition | `src/types/` |
| Database model | `prisma/schema.prisma` |
| Utility function | `src/lib/utils.ts` |
| Global state | `src/contexts/` |
| Page route | `src/app/` |

### "How do I...?"

| Task | File to Edit |
|------|--------------|
| Add new database table | `prisma/schema.prisma` |
| Add API endpoint | `src/app/api/*/route.ts` |
| Add page route | `src/app/*/page.tsx` |
| Add validation | `src/schemas/*.schema.ts` |
| Add business logic | `src/services/*.service.ts` |
| Modify UI component | `src/components/**/*.tsx` |
| Change auth logic | `src/services/auth.service.ts` |
| Update scoring | `src/services/scoring.service.ts` |

## 📦 Module Dependencies

```
Frontend (Components)
    ↓
Contexts (State Management)
    ↓
API Client (src/lib/api-client.ts)
    ↓
API Routes (src/app/api)
    ↓
Services (Business Logic)
    ↓
Schemas (Validation) + Prisma (Database)
```

**Key Principle**: Dependencies flow downward. Services never import from components or API routes.

## 🏗️ Adding New Features

### Example: Adding a "Favorites" Feature

1. **Database** (`prisma/schema.prisma`)
   - Add `favorites` table
   - Run migration

2. **Types** (`src/types/database.types.ts`)
   - Define `Favorite` type

3. **Schema** (`src/schemas/favorites.schema.ts`)
   - Create validation schema

4. **Service** (`src/services/favorites.service.ts`)
   - Implement business logic

5. **API Route** (`src/app/api/favorites/route.ts`)
   - Create endpoint

6. **Component** (`src/components/session/FavoriteButton.tsx`)
   - Build UI

7. **Integration**
   - Add to session detail page
   - Update API client

## 🧹 Code Organization Principles

1. **Separation of Concerns**: Each layer has a specific responsibility
2. **Single Responsibility**: Each file does one thing well
3. **Dependency Direction**: Always downward (UI → Services → DB)
4. **Colocation**: Related files live together
5. **Type Safety**: TypeScript everywhere with strict mode

## 📏 File Size Guidelines

- Components: < 300 lines (split if larger)
- Services: < 500 lines (one domain per file)
- API Routes: < 150 lines (thin controllers)
- Schemas: < 200 lines (split by domain)

## 🔄 Imports Convention

```typescript
// External dependencies first
import { NextResponse } from 'next/server'
import { z } from 'zod'

// Internal absolute imports (using @/ alias)
import { SessionService } from '@/services/session.service'
import { SessionSchema } from '@/schemas/session.schema'
import { validateAuth } from '@/lib/auth'

// Types last
import type { SessionWithPrompt } from '@/types/session.types'
```

## 🎨 Styling Organization

- Global styles: `src/app/globals.css`
- Tailwind config: `tailwind.config.ts`
- Component styles: Inline Tailwind classes
- Shared utilities: `src/lib/utils.ts` (cn helper)

---

**This structure is optimized for**:
- Human readability
- AI agent navigation
- Scalability
- Maintainability
- Testing

Last Updated: 2025-11-12
