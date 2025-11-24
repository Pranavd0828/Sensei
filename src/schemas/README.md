# Schemas

Zod validation schemas for runtime type checking and validation.

## Purpose

Schemas provide runtime validation for all external inputs (API requests, user forms, LLM responses) and ensure type safety throughout the application.

## Files

- `auth.schema.ts` - Authentication request/response schemas
- `session.schema.ts` - Session creation and completion schemas
- `steps.schema.ts` - Individual step validation schemas (1-8)
- `api.schema.ts` - Common API patterns (pagination, errors)

## Principles

1. **Validate at Boundaries**: All external inputs must be validated
2. **Fail Fast**: Invalid data should be rejected immediately
3. **Type Inference**: Use Zod's type inference for TypeScript types
4. **Reusable**: Create base schemas that can be composed
5. **Clear Errors**: Provide helpful error messages

## Example Pattern

```typescript
// steps.schema.ts
import { z } from 'zod'

export const Step1Schema = z.object({
  objective_category: z.enum([
    'Growth',
    'Engagement',
    'Retention',
    'Monetization',
    'Cost',
    'Quality / Trust'
  ]),
  goal_sentence: z.string().min(10, 'Goal must be at least 10 characters')
})

export type Step1Input = z.infer<typeof Step1Schema>
```

## Usage in API Routes

```typescript
import { Step1Schema } from '@/schemas/steps.schema'

export async function POST(req: Request) {
  const body = await req.json()
  const validated = Step1Schema.parse(body) // Throws if invalid
  // ... proceed with validated data
}
```
