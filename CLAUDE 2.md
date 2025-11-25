# CLAUDE Development Guide

A concise four-phase workflow for building and improving Sensei. Use this as the default playbook when planning changes.

## Phase 1 — Plan
- Align on vision, audience, and success metrics (see sensei_prd.md)
- Confirm stack: Next.js 14 (App Router), Prisma + SQLite, Tailwind, JWT magic links, Anthropic (with mock fallback)
- Map data model (users, sessions, steps, scores, progression) and API surface
- Sketch primary flows: auth → start session → 8 steps → scoring → progress
- Capture open questions and risks

## Phase 2 — Validate
- Install deps, generate Prisma client, run migrations and seed data
- Validate API contracts and inputs with Zod schemas
- Verify auth primitives: magic link generation/verification, JWT issuing, session persistence
- Ensure mock scoring works without external keys
- Update docs when assumptions change

## Phase 3 — Execute
- Build or update UI shells (navigation, layout, toasts)
- Implement auth pages and API routes (send-link, verify, logout)
- Implement session services and routes (start, step save, complete, score, fetch history)
- Build 8-step UI components with validation + autosave behaviors
- Implement progression systems (XP, streaks, levels) and persistence
- Keep services thin, testable, and separated from transport concerns

## Phase 4 — Verify
- Run quality gates: `npm run lint`, `npm run type-check`, `npm test`, `npm run test:e2e`
- Manual QA: login via magic link, start/resume session, complete all steps, submit for scoring, view results, review progress/settings
- Non-functional: basic performance sanity (no blocking calls on render), accessibility checks on critical flows
- Deployment readiness: env variables present, database migrated/seeded, mock vs live scoring clear

## Definition of Done
- Feature is covered by validation (Zod) and happy-path error handling
- Relevant docs updated (README, docs/, sensei_prd.md, OpenAPI if endpoints change)
- Tests and linters passing or noted with rationale
- Rollback/recovery path considered for data-affecting changes
