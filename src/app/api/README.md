# API Routes

Next.js API routes following REST principles and OpenAPI 3.0 specification.

## Purpose

Thin controllers that handle HTTP requests, validate inputs, call services, and return responses.

## Structure

```
api/
├── auth/
│   ├── send-link/route.ts      # POST - Send magic link
│   ├── verify/route.ts         # POST - Verify token
│   └── logout/route.ts         # POST - Logout user
├── sessions/
│   ├── route.ts                # GET - List sessions
│   ├── start/route.ts          # POST - Start new session
│   ├── complete/route.ts       # POST - Complete and score
│   └── [id]/route.ts           # GET - Get session detail
├── progress/
│   └── route.ts                # GET - User progress stats
└── account/
    └── route.ts                # DELETE - Delete account
```

## Principles

1. **Thin Controllers**: Business logic lives in services
2. **Consistent Responses**: Use standard format for all responses
3. **Error Handling**: Catch and format errors consistently
4. **Authentication**: Validate JWT on protected routes
5. **Validation**: Use Zod schemas to validate inputs

## Response Format

### Success
```typescript
{
  data: { ... },
  meta?: { pagination?, timestamps? }
}
```

### Error
```typescript
{
  error: {
    code: 'ERROR_CODE',
    message: 'Human readable message',
    details?: any
  }
}
```

## Example Pattern

```typescript
// sessions/start/route.ts
import { NextResponse } from 'next/server'
import { validateAuth } from '@/lib/auth'
import { SessionService } from '@/services/session.service'

export async function POST(req: Request) {
  try {
    const userId = await validateAuth(req)

    const session = await SessionService.createSession(userId)

    return NextResponse.json({ data: session })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Invalid token' } },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to create session' } },
      { status: 500 }
    )
  }
}
```

## HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (valid token, wrong resource)
- `404` - Not Found
- `409` - Conflict (e.g., session already completed)
- `500` - Internal Server Error
