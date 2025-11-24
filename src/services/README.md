# Services Layer

Business logic layer for the Sensei MVP application.

## Purpose

Services contain all business logic and are the single source of truth for operations. They are called by API routes and can be tested independently.

## Files

- `auth.service.ts` - Authentication logic (magic links, JWT tokens)
- `prompt.service.ts` - Prompt selection and management
- `mission.service.ts` - Company mission retrieval
- `session.service.ts` - Session creation and management
- `scoring.service.ts` - LLM-based scoring and feedback generation
- `xp.service.ts` - XP calculation and leveling logic
- `streak.service.ts` - Streak tracking and updates
- `account.service.ts` - Account deletion and data cleanup

## Principles

1. **Stateless**: Services should not maintain state between calls
2. **Single Responsibility**: Each service handles one domain
3. **Testable**: All services should be unit testable
4. **Type-safe**: Use TypeScript interfaces and Zod validation
5. **Error Handling**: Throw custom errors that API routes can catch

## Example Pattern

```typescript
// scoring.service.ts
import { db } from '@/lib/db'
import { ScoringResult } from '@/types/session.types'

export class ScoringService {
  static async scoreSession(
    promptId: string,
    userInputs: any
  ): Promise<ScoringResult> {
    // 1. Validate inputs
    // 2. Call LLM
    // 3. Parse and validate response
    // 4. Return structured result
  }
}
```
