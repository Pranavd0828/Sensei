# Types

TypeScript type definitions and interfaces.

## Purpose

Centralized type definitions for the application, including database types, API types, and domain models.

## Files

- `database.types.ts` - Prisma-generated types and extensions
- `api.types.ts` - API request/response types
- `session.types.ts` - Session and step-related types

## Principles

1. **Single Source of Truth**: Types should be defined once
2. **Generate When Possible**: Use Prisma and Zod for type generation
3. **Explicit Over Implicit**: Prefer explicit types over `any`
4. **Shared Types**: Export types that are used across layers
5. **Domain Modeling**: Types should reflect business domain

## Example Pattern

```typescript
// session.types.ts
import { Prisma } from '@prisma/client'

export type SessionWithPrompt = Prisma.SessionGetPayload<{
  include: { prompt: true }
}>

export type ScoringResult = {
  overall_score: number
  scores: Record<string, number>
  feedback: Record<string, string>
  final_summary: string
}

export type StepName =
  | 'goal'
  | 'mission'
  | 'segments'
  | 'problems'
  | 'solutions'
  | 'metrics'
  | 'tradeoffs'
  | 'summary'
```
