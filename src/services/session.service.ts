/**
 * Session Service
 *
 * Handles session creation, prompt selection, step management, and session completion
 */

import { db } from '@/lib/db'
import { Session, Prompt, Step } from '@prisma/client'
import { validateStep } from '@/schemas/steps.schema'

// ============================================================================
// Types
// ============================================================================

export interface SessionWithDetails extends Session {
  prompt: Prompt
  steps: Step[]
}

export interface StartSessionResult {
  session: SessionWithDetails
  currentStepNumber: number
}

// ============================================================================
// Constants
// ============================================================================

const STEP_NAMES = ['goal', 'mission', 'segments', 'problems', 'solutions', 'metrics', 'tradeoffs', 'summary']

// ============================================================================
// Session Service
// ============================================================================

export class SessionService {
  /**
   * Start a new practice session
   * Selects a random prompt based on user's level and creates a session
   */
  static async startSession(userId: string): Promise<StartSessionResult> {
    // Get user to determine difficulty range
    const user = await db.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Check if user has an active session
    const activeSession = await db.session.findFirst({
      where: {
        userId,
        status: 'in_progress',
      },
    })

    if (activeSession) {
      throw new Error('You already have an active session. Complete it before starting a new one.')
    }

    // Determine difficulty range based on user level
    const difficulty = this.getDifficultyForLevel(user.level)

    // Select a random prompt with the appropriate difficulty
    const prompt = await this.selectRandomPrompt(difficulty)

    if (!prompt) {
      throw new Error(`No prompts available for difficulty ${difficulty}`)
    }

    // Create new session
    const session = await db.session.create({
      data: {
        userId,
        promptId: prompt.id,
        status: 'in_progress',
        companySkin: prompt.company,
      },
      include: {
        prompt: true,
        steps: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    })

    return {
      session,
      currentStepNumber: 1
    }
  }

  /**
   * Save step data
   */
  static async saveStep(
    sessionId: string,
    userId: string,
    stepNumber: number,
    stepData: unknown
  ): Promise<{ session: Session; nextStep: number | null }> {
    // Get session
    const session = await db.session.findUnique({
      where: { id: sessionId },
      include: {
        steps: true,
      },
    })

    if (!session) {
      throw new Error('Session not found')
    }

    if (session.userId !== userId) {
      throw new Error('Unauthorized')
    }

    if (session.status !== 'in_progress') {
      throw new Error('Session is not in progress')
    }

    // Validate step number
    if (stepNumber < 1 || stepNumber > 8) {
      throw new Error(`Invalid step number: ${stepNumber}`)
    }

    // Validate step data
    const validatedData = validateStep(stepNumber, stepData)

    // Get step name
    const stepName = STEP_NAMES[stepNumber - 1]

    // Check if step already exists
    const existingStep = await db.step.findUnique({
      where: {
        sessionId_stepName: {
          sessionId,
          stepName,
        },
      },
    })

    if (existingStep) {
      // Update existing step
      await db.step.update({
        where: { id: existingStep.id },
        data: {
          userInput: JSON.stringify(validatedData),
        },
      })
    } else {
      // Create new step
      await db.step.create({
        data: {
          sessionId,
          stepName,
          userInput: JSON.stringify(validatedData),
        },
      })
    }

    // Calculate next step
    const nextStep = stepNumber < 8 ? stepNumber + 1 : null

    return {
      session,
      nextStep,
    }
  }

  /**
   * Get session by ID with all details
   */
  static async getSession(
    sessionId: string,
    userId: string
  ): Promise<SessionWithDetails | null> {
    const session = await db.session.findUnique({
      where: { id: sessionId },
      include: {
        prompt: true,
        steps: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    })

    if (!session) {
      return null
    }

    if (session.userId !== userId) {
      throw new Error('Unauthorized')
    }

    return session
  }

  /**
   * Get all sessions for a user
   */
  static async getUserSessions(
    userId: string,
    options?: {
      status?: string
      limit?: number
      offset?: number
    }
  ): Promise<{ sessions: SessionWithDetails[]; total: number }> {
    const where = {
      userId,
      ...(options?.status && { status: options.status }),
    }

    const [sessions, total] = await Promise.all([
      db.session.findMany({
        where,
        include: {
          prompt: true,
          steps: {
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
        orderBy: {
          startedAt: 'desc',
        },
        take: options?.limit ?? 20,
        skip: options?.offset ?? 0,
      }),
      db.session.count({ where }),
    ])

    return { sessions, total }
  }

  /**
   * Complete a session (called after step 8 is saved)
   * This marks the session as ready for scoring
   */
  static async completeSession(sessionId: string, userId: string): Promise<Session> {
    const session = await db.session.findUnique({
      where: { id: sessionId },
      include: {
        steps: true,
      },
    })

    if (!session) {
      throw new Error('Session not found')
    }

    if (session.userId !== userId) {
      throw new Error('Unauthorized')
    }

    if (session.status !== 'in_progress') {
      throw new Error('Session is not in progress')
    }

    // Verify all 8 steps are completed
    if (session.steps.length !== 8) {
      throw new Error('All 8 steps must be completed before finishing the session')
    }

    // Update session status
    const updatedSession = await db.session.update({
      where: { id: sessionId },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
    })

    return updatedSession
  }

  /**
   * Delete a session (user can abandon a session)
   */
  static async deleteSession(sessionId: string, userId: string): Promise<void> {
    const session = await db.session.findUnique({
      where: { id: sessionId },
    })

    if (!session) {
      throw new Error('Session not found')
    }

    if (session.userId !== userId) {
      throw new Error('Unauthorized')
    }

    // Don't allow deleting completed sessions that have been scored
    if (session.status === 'completed' && session.overallScore !== null) {
      throw new Error('Cannot delete a scored session')
    }

    await db.session.delete({
      where: { id: sessionId },
    })
  }

  /**
   * Get user's active session
   */
  static async getActiveSession(userId: string): Promise<(SessionWithDetails & { currentStepNumber: number }) | null> {
    const session = await db.session.findFirst({
      where: {
        userId,
        status: 'in_progress',
      },
      include: {
        prompt: true,
        steps: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    })

    if (!session) {
      return null
    }

    // Calculate current step number based on completed steps
    const currentStepNumber = session.steps.length + 1

    return {
      ...session,
      currentStepNumber: Math.min(currentStepNumber, 8),
    }
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  /**
   * Determine difficulty range based on user level
   */
  private static getDifficultyForLevel(level: number): number {
    // Level 1-3: Easy prompts (difficulty 1-2)
    if (level <= 3) {
      return Math.random() < 0.7 ? 1 : 2
    }
    // Level 4-7: Medium prompts (difficulty 2-3)
    if (level <= 7) {
      return Math.random() < 0.7 ? 2 : 3
    }
    // Level 8+: Hard prompts (difficulty 3)
    return 3
  }

  /**
   * Select a random prompt with the given difficulty
   */
  private static async selectRandomPrompt(difficulty: number): Promise<Prompt | null> {
    // Get all prompts with the target difficulty
    const prompts = await db.prompt.findMany({
      where: { difficulty },
    })

    if (prompts.length === 0) {
      return null
    }

    // Select random prompt
    const randomIndex = Math.floor(Math.random() * prompts.length)
    return prompts[randomIndex]
  }

  /**
   * Generate summary for step 8 based on previous steps
   */
  static generateSummary(steps: Step[]): string {
    if (steps.length < 7) {
      throw new Error('Cannot generate summary without steps 1-7')
    }

    try {
      // Parse step data
      const step1 = JSON.parse(steps[0].userInput as string)
      const step3 = JSON.parse(steps[2].userInput as string)
      const step4 = JSON.parse(steps[3].userInput as string)
      const step5 = JSON.parse(steps[4].userInput as string)
      const step6 = JSON.parse(steps[5].userInput as string)

      // Generate summary
      const summary = `
# Practice Session Summary

## Goal
**Objective:** ${step1.objective}
**Goal:** ${step1.goalSentence}

## User Segments
${step3.segments.map((s: any) => `- **${s.name}:** ${s.description}`).join('\n')}

## Key Problems
${step4.problems.map((p: any, i: number) => `${i + 1}. **${p.title}:** ${p.description}`).join('\n')}

## Proposed Solutions
${step5.solutions.map((s: any) => `### ${s.version}: ${s.title}\n${s.description}\n**Features:**\n${s.features.map((f: string) => `- ${f}`).join('\n')}`).join('\n\n')}

## Success Metrics
**Primary Metric:** ${step6.primaryMetric.name}
- Target: ${step6.primaryMetric.target}

**Guardrails:**
${step6.guardrails.map((g: any) => `- ${g.name}: ${g.threshold}`).join('\n')}
      `.trim()

      return summary
    } catch (error) {
      console.error('Error generating summary:', error)
      return 'Summary generation failed. Please review your answers.'
    }
  }
}
