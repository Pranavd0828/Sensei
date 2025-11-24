/**
 * Scoring Service
 *
 * Integrates with Claude API to score user responses
 */

import Anthropic from '@anthropic-ai/sdk'
import { db } from '@/lib/db'
import { Step, Prompt } from '@prisma/client'

// ============================================================================
// Types
// ============================================================================

export interface StepScore {
  stepName: string
  score: number
  feedback: string
  strengths: string[]
  improvements: string[]
}

export interface ScoringResult {
  overallScore: number
  stepScores: StepScore[]
  summary: string
  xpEarned: number
}

// ============================================================================
// Scoring Service
// ============================================================================

export class ScoringService {
  private static anthropic: Anthropic | null = null

  /**
   * Get Anthropic client (lazy initialization)
   */
  private static getClient(): Anthropic | null {
    if (!this.anthropic) {
      const apiKey = process.env.ANTHROPIC_API_KEY
      if (!apiKey || apiKey === 'sk-ant-your-anthropic-api-key-here') {
        console.warn('⚠️  ANTHROPIC_API_KEY not configured - using mock scoring')
        return null
      }
      this.anthropic = new Anthropic({ apiKey })
    }
    return this.anthropic
  }

  /**
   * Check if using mock scoring
   */
  private static useMockScoring(): boolean {
    const apiKey = process.env.ANTHROPIC_API_KEY
    return !apiKey || apiKey === 'sk-ant-your-anthropic-api-key-here'
  }

  /**
   * Score a completed session using Claude API
   */
  static async scoreSession(sessionId: string): Promise<ScoringResult> {
    // Get session with all steps and prompt
    const session = await db.session.findUnique({
      where: { id: sessionId },
      include: {
        steps: {
          orderBy: {
            createdAt: 'asc',
          },
        },
        prompt: true,
      },
    })

    if (!session) {
      throw new Error('Session not found')
    }

    if (session.status !== 'completed') {
      throw new Error('Session must be completed before scoring')
    }

    if (session.steps.length !== 8) {
      throw new Error('All 8 steps must be completed')
    }

    // Score each step
    const stepScores: StepScore[] = []

    for (const step of session.steps) {
      const score = await this.scoreStep(step, session.prompt)
      stepScores.push(score)
    }

    // Calculate overall score (weighted average)
    const overallScore = this.calculateOverallScore(stepScores)

    // Generate summary
    const summary = this.generateScoringSummary(stepScores, overallScore)

    // Calculate XP earned
    const xpEarned = this.calculateXP(overallScore, session.prompt.difficulty)

    // Update session with scores
    await db.session.update({
      where: { id: sessionId },
      data: {
        overallScore,
        scoringJson: JSON.stringify({ stepScores, summary }),
        scoringStatus: 'success',
      },
    })

    return {
      overallScore,
      stepScores,
      summary,
      xpEarned,
    }
  }

  /**
   * Score an individual step using Claude API or mock scoring
   */
  private static async scoreStep(
    step: Step,
    prompt: Prompt
  ): Promise<StepScore> {
    // Parse step data
    const stepData = JSON.parse(step.userInput as string)

    // Use mock scoring if API key not configured
    if (this.useMockScoring()) {
      return this.mockScoreStep(step, stepData, prompt)
    }

    const client = this.getClient()
    if (!client) {
      return this.mockScoreStep(step, stepData, prompt)
    }

    // Build scoring prompt based on step name
    const scoringPrompt = this.buildScoringPrompt(step.stepName, stepData, prompt)

    try {
      // Call Claude API
      const message = await client.messages.create({
        model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: scoringPrompt,
          },
        ],
      })

      // Parse Claude's response
      const responseText =
        message.content[0].type === 'text' ? message.content[0].text : ''

      // Extract score and feedback from response
      const result = this.parseClaudeResponse(responseText, step.stepName)

      // Update step with score
      await db.step.update({
        where: { id: step.id },
        data: {
          score: result.score,
          feedback: JSON.stringify({
            text: result.feedback,
            strengths: result.strengths,
            improvements: result.improvements,
          }),
        },
      })

      return result
    } catch (error) {
      console.error(`Error scoring step ${step.stepName}:`, error)
      // Return default score on error
      return {
        stepName: step.stepName,
        score: 50,
        feedback: 'Unable to score this step due to an error.',
        strengths: [],
        improvements: ['Unable to provide feedback at this time.'],
      }
    }
  }

  /**
   * Mock scoring for development/testing without API key
   */
  private static async mockScoreStep(
    step: Step,
    stepData: any,
    prompt: Prompt
  ): Promise<StepScore> {
    console.log(`🎭 Using mock scoring for step: ${step.stepName}`)

    // Generate deterministic but varied scores based on step content
    const contentLength = JSON.stringify(stepData).length
    const baseScore = 70 + (contentLength % 20)

    const mockScores: Record<string, StepScore> = {
      goal: {
        stepName: 'goal',
        score: baseScore,
        feedback: 'Your goal is clear and well-defined. Consider adding more specific success metrics to make it even more measurable.',
        strengths: [
          'Clear objective selection',
          'Concise goal statement',
        ],
        improvements: [
          'Add quantifiable targets',
          'Consider timeframe constraints',
        ],
      },
      mission: {
        stepName: 'mission',
        score: baseScore + 5,
        feedback: 'Good connection to company mission. The alignment shows strategic thinking and understanding of broader business objectives.',
        strengths: [
          'Strong mission alignment',
          'Strategic perspective',
        ],
        improvements: [
          'Provide more specific examples',
          'Connect to measurable outcomes',
        ],
      },
      segments: {
        stepName: 'segments',
        score: baseScore + 3,
        feedback: 'User segments are well-defined with clear characteristics. Consider adding more behavioral or demographic details to refine targeting.',
        strengths: [
          'Distinct segment definitions',
          'Relevant to the goal',
        ],
        improvements: [
          'Add more specific characteristics',
          'Include size estimates',
        ],
      },
      problems: {
        stepName: 'problems',
        score: baseScore + 7,
        feedback: 'Problems are specific and actionable. Good prioritization logic connecting user pain points to business impact.',
        strengths: [
          'Clear problem identification',
          'Well-prioritized list',
        ],
        improvements: [
          'Quantify problem impact',
          'Add validation evidence',
        ],
      },
      solutions: {
        stepName: 'solutions',
        score: baseScore + 8,
        feedback: 'Solutions show good progression from V0 to V2. Features are well-defined and demonstrate incremental value delivery.',
        strengths: [
          'Progressive solution thinking',
          'Actionable features',
          'Balanced feasibility and innovation',
        ],
        improvements: [
          'Add technical feasibility notes',
          'Estimate resource requirements',
        ],
      },
      metrics: {
        stepName: 'metrics',
        score: baseScore + 10,
        feedback: 'Metrics are well-chosen and measurable. Primary metric aligns with goal and guardrails protect against negative outcomes.',
        strengths: [
          'Clear success metrics',
          'Appropriate guardrails',
          'Realistic targets',
        ],
        improvements: [
          'Add secondary metrics',
          'Define measurement methodology',
        ],
      },
      tradeoffs: {
        stepName: 'tradeoffs',
        score: baseScore + 6,
        feedback: 'Tradeoffs demonstrate mature product thinking. Mitigation strategies are practical and show risk awareness.',
        strengths: [
          'Realistic tradeoff identification',
          'Thoughtful mitigation strategies',
        ],
        improvements: [
          'Quantify impact more precisely',
          'Add contingency plans',
        ],
      },
      summary: {
        stepName: 'summary',
        score: baseScore + 4,
        feedback: 'Good reflection on the process. Learnings show self-awareness and growth mindset.',
        strengths: [
          'Thoughtful reflection',
          'Actionable learnings',
        ],
        improvements: [
          'Connect learnings to future application',
          'Be more specific about insights',
        ],
      },
    }

    const result = mockScores[step.stepName] || {
      stepName: step.stepName,
      score: baseScore,
      feedback: 'Good work on this step. Continue practicing to refine your product sense.',
      strengths: ['Clear thinking', 'Structured approach'],
      improvements: ['Add more depth', 'Consider edge cases'],
    }

    // Update step with mock score
    await db.step.update({
      where: { id: step.id },
      data: {
        score: result.score,
        feedback: JSON.stringify({
          text: result.feedback,
          strengths: result.strengths,
          improvements: result.improvements,
        }),
      },
    })

    return result
  }

  /**
   * Build scoring prompt for Claude based on step name
   */
  private static buildScoringPrompt(
    stepName: string,
    stepData: any,
    prompt: Prompt
  ): string {
    const baseContext = `
You are evaluating a Product Manager's practice session response.

**Prompt Context:**
Company: ${prompt.company}
Surface: ${prompt.surface}
Objective: ${prompt.objective}
Difficulty: ${prompt.difficulty}/3
Prompt: ${prompt.promptText}

**Evaluation Criteria:**
- Clarity and structure (20%)
- Depth of thinking (30%)
- Strategic alignment (30%)
- Practicality and feasibility (20%)

Please provide:
1. Score (0-100)
2. 2-3 key strengths
3. 2-3 areas for improvement
4. Brief feedback (2-3 sentences)

Format your response as JSON:
{
  "score": <number>,
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "feedback": "Brief feedback here"
}
`

    // Step-specific evaluation
    const stepPrompts: Record<string, string> = {
      goal: `
**Step 1: Clarify Goal**

User's Response:
- Objective: ${stepData.objective}
- Goal: ${stepData.goalSentence}

Evaluate how well the user:
1. Selected the appropriate objective category
2. Articulated a clear, measurable goal
3. Aligned the goal with the prompt's context
`,
      mission: `
**Step 2: Align to Mission**

User's Response:
${stepData.missionAlignment}

Evaluate how well the user:
1. Connected the goal to the company's mission
2. Demonstrated understanding of company values
3. Justified the strategic importance
`,
      segments: `
**Step 3: Identify User Segments**

User's Response:
${stepData.segments.map((s: any) => `- ${s.name}: ${s.description}`).join('\n')}

Evaluate how well the user:
1. Identified distinct, relevant user segments
2. Described segments with specificity
3. Chose segments that align with the goal
`,
      problems: `
**Step 4: Prioritize Problems**

User's Response:
${stepData.problems.map((p: any) => `- ${p.title}: ${p.description}\n  Affects: ${p.affectedSegments.join(', ')}`).join('\n')}

Evaluate how well the user:
1. Identified meaningful, specific problems
2. Connected problems to user segments
3. Demonstrated problem prioritization logic
`,
      solutions: `
**Step 5: Ideate Solutions**

User's Response:
${stepData.solutions.map((s: any) => `${s.version}: ${s.title}\n${s.description}\nFeatures: ${s.features.join(', ')}`).join('\n\n')}

Evaluate how well the user:
1. Created progressive solution versions (V0 → V1 → V2)
2. Balanced feasibility with innovation
3. Defined clear, actionable features
`,
      metrics: `
**Step 6: Define Metrics**

User's Response:
Primary: ${stepData.primaryMetric.name} - ${stepData.primaryMetric.description}
Target: ${stepData.primaryMetric.target}
Guardrails: ${stepData.guardrails.map((g: any) => `${g.name} (${g.threshold})`).join(', ')}

Evaluate how well the user:
1. Selected an appropriate primary metric
2. Set realistic, measurable targets
3. Defined relevant guardrail metrics
`,
      tradeoffs: `
**Step 7: Tradeoffs and Risks**

User's Response:
${stepData.tradeoffs.map((t: any) => `- ${t.title} (${t.impact})\n  ${t.description}\n  Mitigation: ${t.mitigation}`).join('\n')}

Evaluate how well the user:
1. Identified realistic tradeoffs and risks
2. Assessed impact levels appropriately
3. Proposed practical mitigation strategies
`,
      summary: `
**Step 8: Summary and Reflection**

User's Response:
Reflection: ${stepData.reflection}
Learnings: ${stepData.learnings.join(', ')}

Evaluate how well the user:
1. Demonstrated self-awareness and learning
2. Reflected on their approach
3. Identified actionable learnings
`,
    }

    return baseContext + (stepPrompts[stepName] || '')
  }

  /**
   * Parse Claude's JSON response
   */
  private static parseClaudeResponse(responseText: string, stepName: string): StepScore {
    try {
      // Extract JSON from response (Claude sometimes adds text around it)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }

      const parsed = JSON.parse(jsonMatch[0])

      return {
        stepName,
        score: Math.max(0, Math.min(100, parsed.score || 50)),
        feedback: parsed.feedback || 'No feedback provided.',
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
        improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
      }
    } catch (error) {
      console.error('Error parsing Claude response:', error)
      return {
        stepName,
        score: 50,
        feedback: 'Unable to parse scoring feedback.',
        strengths: [],
        improvements: [],
      }
    }
  }

  /**
   * Calculate overall score from step scores
   */
  private static calculateOverallScore(stepScores: StepScore[]): number {
    // Weighted scoring: steps 3-7 are more important
    const weights: Record<string, number> = {
      goal: 1,
      mission: 1,
      segments: 1.5,
      problems: 1.5,
      solutions: 1.5,
      metrics: 1.5,
      tradeoffs: 1.5,
      summary: 1,
    }

    let totalWeightedScore = 0
    let totalWeight = 0

    stepScores.forEach((step) => {
      const weight = weights[step.stepName] || 1
      totalWeightedScore += step.score * weight
      totalWeight += weight
    })

    return Math.round(totalWeightedScore / totalWeight)
  }

  /**
   * Generate scoring summary
   */
  private static generateScoringSummary(stepScores: StepScore[], overallScore: number): string {
    const performanceLevel =
      overallScore >= 90
        ? 'Exceptional'
        : overallScore >= 80
          ? 'Strong'
          : overallScore >= 70
            ? 'Good'
            : overallScore >= 60
              ? 'Adequate'
              : 'Needs Improvement'

    const topStrengths = stepScores
      .flatMap((s) => s.strengths)
      .slice(0, 3)
      .join(', ')

    const topImprovements = stepScores
      .flatMap((s) => s.improvements)
      .slice(0, 3)
      .join(', ')

    return `
**Overall Score: ${overallScore}/100 (${performanceLevel})**

**Top Strengths:**
${topStrengths || 'N/A'}

**Areas for Improvement:**
${topImprovements || 'N/A'}

Continue practicing to refine your product sense skills!
    `.trim()
  }

  /**
   * Calculate XP earned based on score and difficulty
   */
  private static calculateXP(overallScore: number, difficulty: number): number {
    const BASE_XP = 100
    const MIN_XP = 50
    const scoreMultiplier = overallScore / 100
    const xp = BASE_XP * difficulty * scoreMultiplier
    return Math.max(Math.round(xp), MIN_XP)
  }
}
