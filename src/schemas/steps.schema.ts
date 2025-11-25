/**
 * Zod Validation Schemas for 8-Step Session Flow
 *
 * Defines validation rules for each step of the practice session
 */

import { z } from 'zod'

// ============================================================================
// Step 1: Clarify Goal
// ============================================================================

export const Step1Schema = z.object({
  objective: z.enum(['ACQUISITION', 'ACTIVATION', 'RETENTION', 'MONETIZATION', 'ENGAGEMENT'], {
    errorMap: () => ({ message: 'Please select a valid objective category' }),
  }),
  goalSentence: z.string().optional().default(''),
})

export type Step1Data = z.infer<typeof Step1Schema>

// ============================================================================
// Step 2: Align to Mission
// ============================================================================

// Allow both compact format (single field) and detailed format (two fields)
export const Step2Schema = z.union([
  // Option 1: Simple format with just alignment text
  z.object({
    missionAlignment: z
      .string()
      .min(0)
      .max(1000, 'Mission alignment must not exceed 1000 characters')
      .optional()
      .default(''),
    picks: z.any().optional(),
  }),
  // Option 2: Detailed format with company mission and alignment
  z.object({
    companyMission: z.string().min(20).max(500).optional(),
    alignment: z
      .string()
      .min(30, 'Alignment explanation must be at least 30 characters') // Relaxed from 50
      .max(1000, 'Alignment explanation must not exceed 1000 characters'),
  }),
])

export type Step2Data = z.infer<typeof Step2Schema>

// ============================================================================
// Step 3: Identify User Segments
// ============================================================================

const UserSegmentSchema = z.object({
  name: z
    .string()
    .min(3, 'Segment name must be at least 3 characters')
    .max(100, 'Segment name must not exceed 100 characters'),
  description: z
    .string()
    .min(20, 'Segment description must be at least 20 characters')
    .max(500, 'Segment description must not exceed 500 characters'),
})

export const Step3Schema = z.object({
  segments: z
    .union([
      z.array(UserSegmentSchema),
      z.array(z.string().min(2)).min(1).max(3),
    ])
    .refine((segments) => {
      const names = segments.map((s: any) => (typeof s === 'string' ? s.toLowerCase() : s.name.toLowerCase()))
      return new Set(names).size === names.length
    }, { message: 'Segment names must be unique' }),
})

export type Step3Data = z.infer<typeof Step3Schema>
export type UserSegment = z.infer<typeof UserSegmentSchema>

// ============================================================================
// Step 4: Prioritize Problems
// ============================================================================

const ProblemSchema = z.object({
  title: z
    .string()
    .min(5, 'Problem title must be at least 5 characters')
    .max(150, 'Problem title must not exceed 150 characters')
    .optional(),
  description: z
    .string()
    .min(10, 'Problem description must be at least 10 characters') // Relaxed from 30
    .max(800, 'Problem description must not exceed 800 characters')
    .optional(),
  affectedSegments: z
    .array(z.string())
    .min(0) // Made optional
    .max(3, 'Maximum 3 affected segments allowed')
    .optional(),
})

// Allow simple string array OR full problem objects
export const Step4Schema = z.object({
  problems: z.union([
    // Option 1: Array of strings (simple mode)
    z.array(z.string().min(10).max(500)).min(1).max(5),
    // Option 2: Array of full problem objects (detailed mode)
    z
      .array(ProblemSchema)
      .min(1, 'At least 1 problem is required')
      .max(5, 'Maximum 5 problems allowed'),
  ]),
})

export type Step4Data = z.infer<typeof Step4Schema>
export type Problem = z.infer<typeof ProblemSchema>

// ============================================================================
// Step 5: Ideate Solutions
// ============================================================================

const SolutionSchema = z.object({
  version: z.enum(['V0', 'V1', 'V2']).optional(),
  title: z
    .string()
    .min(5, 'Solution title must be at least 5 characters')
    .max(150, 'Solution title must not exceed 150 characters'),
  description: z
    .string()
    .min(20, 'Solution description must be at least 20 characters') // Relaxed from 50
    .max(1000, 'Solution description must not exceed 1000 characters'),
  features: z
    .array(z.string().min(5).max(200)) // Relaxed from 10
    .min(1, 'At least 1 feature is required') // Relaxed from 2
    .max(10, 'Maximum 10 features allowed'), // Increased from 5
})

// Allow both array format and object format (v0/v1/v2 keys)
export const Step5Schema = z.union([
  // Option 1: Array format with solutions array
  z.object({
    solutions: z
      .array(SolutionSchema)
      .min(1, 'At least 1 solution is required')
      .max(3, 'Maximum 3 solutions allowed'),
  }),
  // Option 2: Object format with v0, v1, v2 keys
  z.object({
    v0: SolutionSchema.optional(),
    v1: SolutionSchema.optional(),
    v2: SolutionSchema.optional(),
  }).refine(
    (data) => data.v0 || data.v1 || data.v2,
    {
      message: 'At least one solution version is required',
    }
  ),
])

export type Step5Data = z.infer<typeof Step5Schema>
export type Solution = z.infer<typeof SolutionSchema>

// ============================================================================
// Step 6: Define Metrics
// ============================================================================

const MetricSchema = z.object({
  name: z
    .string()
    .min(3, 'Metric name must be at least 3 characters')
    .max(100, 'Metric name must not exceed 100 characters'),
  description: z
    .string()
    .min(20, 'Metric description must be at least 20 characters')
    .max(500, 'Metric description must not exceed 500 characters'),
  target: z
    .string()
    .min(5, 'Target must be at least 5 characters')
    .max(200, 'Target must not exceed 200 characters'),
})

const GuardrailMetricSchema = z.object({
  name: z
    .string()
    .min(3, 'Guardrail name must be at least 3 characters')
    .max(100, 'Guardrail name must not exceed 100 characters'),
  threshold: z
    .string()
    .min(5, 'Threshold must be at least 5 characters')
    .max(200, 'Threshold must not exceed 200 characters'),
})

export const Step6Schema = z.object({
  primaryMetric: MetricSchema,
  guardrails: z
    .array(GuardrailMetricSchema)
    .min(1, 'At least 1 guardrail metric is required')
    .max(3, 'Maximum 3 guardrail metrics allowed'),
})

export type Step6Data = z.infer<typeof Step6Schema>
export type Metric = z.infer<typeof MetricSchema>
export type GuardrailMetric = z.infer<typeof GuardrailMetricSchema>

// ============================================================================
// Step 7: Tradeoffs and Risks
// ============================================================================

const TradeoffSchema = z.object({
  title: z
    .string()
    .min(5, 'Tradeoff title must be at least 5 characters')
    .max(150, 'Tradeoff title must not exceed 150 characters'),
  description: z
    .string()
    .min(30, 'Tradeoff description must be at least 30 characters')
    .max(800, 'Tradeoff description must not exceed 800 characters'),
  impact: z.enum(['LOW', 'MEDIUM', 'HIGH'], {
    errorMap: () => ({ message: 'Impact must be LOW, MEDIUM, or HIGH' }),
  }),
  mitigation: z
    .string()
    .min(30, 'Mitigation strategy must be at least 30 characters')
    .max(800, 'Mitigation strategy must not exceed 800 characters'),
})

export const Step7Schema = z.object({
  tradeoffs: z
    .array(TradeoffSchema)
    .min(2, 'At least 2 tradeoffs are required')
    .max(5, 'Maximum 5 tradeoffs allowed'),
})

export type Step7Data = z.infer<typeof Step7Schema>
export type Tradeoff = z.infer<typeof TradeoffSchema>

// ============================================================================
// Step 8: Summary and Reflection
// ============================================================================

export const Step8Schema = z.object({
  summary: z.string().min(1, 'Summary is required'), // Auto-generated
  reflection: z
    .string()
    .min(100, 'Reflection must be at least 100 characters')
    .max(2000, 'Reflection must not exceed 2000 characters')
    .refine((val) => val.trim().length > 0, {
      message: 'Reflection cannot be empty',
    }),
  learnings: z
    .array(z.string().min(20).max(500))
    .min(1, 'At least 1 learning is required')
    .max(3, 'Maximum 3 learnings allowed'),
})

export type Step8Data = z.infer<typeof Step8Schema>

// ============================================================================
// Complete Session Data
// ============================================================================

export const CompleteSessionSchema = z.object({
  sessionId: z.string().uuid(),
  step1: Step1Schema,
  step2: Step2Schema,
  step3: Step3Schema,
  step4: Step4Schema,
  step5: Step5Schema,
  step6: Step6Schema,
  step7: Step7Schema,
  step8: Step8Schema,
})

export type CompleteSessionData = z.infer<typeof CompleteSessionSchema>

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Validate a specific step's data
 */
export function validateStep(stepNumber: number, data: unknown) {
  const schemas = {
    1: Step1Schema,
    2: Step2Schema,
    3: Step3Schema,
    4: Step4Schema,
    5: Step5Schema,
    6: Step6Schema,
    7: Step7Schema,
    8: Step8Schema,
  }

  const schema = schemas[stepNumber as keyof typeof schemas]
  if (!schema) {
    throw new Error(`Invalid step number: ${stepNumber}`)
  }

  return schema.parse(data)
}

/**
 * Get validation schema for a specific step
 */
export function getStepSchema(stepNumber: number) {
  const schemas = {
    1: Step1Schema,
    2: Step2Schema,
    3: Step3Schema,
    4: Step4Schema,
    5: Step5Schema,
    6: Step6Schema,
    7: Step7Schema,
    8: Step8Schema,
  }

  return schemas[stepNumber as keyof typeof schemas]
}
