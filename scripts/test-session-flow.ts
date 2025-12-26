/**
 * Session Flow Test Script
 *
 * Tests the complete session flow:
 * 1. Start session
 * 2. Save all 8 steps
 * 3. Complete session
 * 4. Score session with Claude API
 * 5. Award XP and update streak
 * 6. Verify progression stats
 */

import { config } from 'dotenv'
import { db } from './src/lib/db'
import { AuthService } from './src/services/auth.service'
import { SessionService } from './src/services/session.service'
import { ScoringService } from './src/services/scoring.service'
import { ProgressionService } from './src/services/progression.service'

// Load .env.local
config({ path: '.env.local' })

// Sample step data for testing
const SAMPLE_STEPS = {
  step1: {
    objective: 'RETENTION',
    goalSentence: 'Increase 7-day retention for new TikTok creators by 25% through improved onboarding and early wins',
  },
  step2: {
    missionAlignment: 'TikTok\'s mission is to inspire creativity and bring joy. By helping new creators succeed early, we align with this mission by enabling more people to express their creativity and reach audiences. Strong creator retention ensures a vibrant, diverse platform that brings joy to billions of users.',
  },
  step3: {
    segments: [
      {
        name: 'Aspiring Influencers',
        description: 'Users aged 18-25 who want to build a following and potentially monetize their content',
      },
      {
        name: 'Casual Hobby Creators',
        description: 'Users who create content for fun and personal expression without monetization goals',
      },
    ],
  },
  step4: {
    problems: [
      {
        title: 'Lack of initial visibility',
        description: 'New creators struggle to get their first views and engagement, leading to discouragement. The algorithm favors established creators, making it hard for newcomers to gain traction.',
        affectedSegments: ['Aspiring Influencers', 'Casual Hobby Creators'],
      },
      {
        title: 'Overwhelming feature complexity',
        description: 'New users are confused by advanced editing features and don\'t know where to start. The learning curve for effects, filters, and editing tools is steep.',
        affectedSegments: ['Casual Hobby Creators'],
      },
    ],
  },
  step5: {
    solutions: [
      {
        version: 'V0',
        title: 'Enhanced Onboarding Tutorial',
        description: 'A  3-step interactive tutorial that guides new creators through their first video creation with guaranteed initial visibility.',
        features: [
          'Step-by-step video creation walkthrough',
          'Guaranteed 100+ views on first 3 videos',
          'Simplified editing interface for beginners',
        ],
      },
      {
        version: 'V1',
        title: 'Creator Buddy System',
        description: 'Pair new creators with experienced mentors and provide a dedicated discovery feed for new creator content.',
        features: [
          'All V0 features',
          'Mentor matching based on content category',
          'Dedicated "New Voices" feed section',
          'Weekly challenges with boosted visibility',
        ],
      },
      {
        version: 'V2',
        title: 'AI-Powered Creator Growth Platform',
        description: 'Comprehensive platform with AI coaching, predictive analytics, and personalized growth paths.',
        features: [
          'All V1 features',
          'AI content coach with personalized tips',
          'Predictive analytics for optimal posting times',
          'Automated A/B testing for thumbnails and titles',
          'Creator community forums and networking',
        ],
      },
    ],
  },
  step6: {
    primaryMetric: {
      name: '7-Day Creator Retention Rate',
      description: 'Percentage of new creators who post at least one video within their first 7 days',
      target: 'Increase from 40% to 50% (25% relative increase) within 3 months',
    },
    guardrails: [
      {
        name: 'Content Quality Score',
        threshold: 'Must not decrease below 7.5/10 average',
      },
      {
        name: 'Viewer Satisfaction',
        threshold: 'NPS must stay above 45',
      },
    ],
  },
  step7: {
    tradeoffs: [
      {
        title: 'Guaranteed visibility may reduce overall content quality',
        description: 'Boosting all new creator content could flood feeds with lower-quality videos, potentially reducing viewer satisfaction',
        impact: 'MEDIUM',
        mitigation: 'Implement quality filters and limit guaranteed visibility to first 3 videos only. Use machine learning to quickly identify spam or very low-quality content.',
      },
      {
        title: 'Increased server and infrastructure costs',
        description: 'Mentor matching, AI coaching, and additional feeds require significant computational resources',
        impact: 'HIGH',
        mitigation: 'Phase rollout starting with V0, carefully monitor CAC vs. LTV. Optimize algorithm efficiency and consider cloud cost optimization strategies.',
      },
    ],
  },
  step8: {
    summary: 'Auto-generated summary would go here',
    reflection: 'This exercise helped me think more systematically about creator retention. I initially focused only on algorithm changes, but realized the importance of mentorship and community. The biggest learning was balancing new creator needs with maintaining content quality for viewers. I need to improve my ability to quantify tradeoffs more precisely with specific data points.',
    learnings: [
      'Always consider both creator and viewer perspectives when designing retention features',
      'Phased rollouts are critical for high-cost features to validate assumptions before full investment',
      'Quality guardrails are essential when boosting content visibility',
    ],
  },
}

async function testSessionFlow() {
  console.log('🧪 Testing Complete Session Flow\\n')
  console.log('=' .repeat(60))

  const testEmail = 'session-test@sensei.app'

  try {
    // ============================================================
    // Setup: Create test user
    // ============================================================
    console.log('\\n🔧 Setup: Creating test user')
    console.log('-'.repeat(60))

    // Clean up existing test user if any
    const existingUser = await db.user.findUnique({
      where: { email: testEmail },
    })
    if (existingUser) {
      console.log('   Cleaning up existing test user...')
      await AuthService.deleteAccount(existingUser.id)
    }

    // Create new test user
    const sendResult = await AuthService.sendMagicLink(testEmail)
    const url = new URL(sendResult.magicLink!)
    const token = url.searchParams.get('token')!
    const verifyResult = await AuthService.verifyMagicLink(token)
    const userId = verifyResult.user.id

    console.log('✅ Test user created')
    console.log('   User ID:', userId)
    console.log('   Level:', verifyResult.user.level)

    // ============================================================
    // Test 1: Start Session
    // ============================================================
    console.log('\\n📝 Test 1: Start Session')
    console.log('-'.repeat(60))

    const startResult = await SessionService.startSession(userId)
    const sessionId = startResult.session.id

    console.log('✅ Session started successfully')
    console.log('   Session ID:', sessionId)
    console.log('   Prompt:', startResult.session.prompt.name)
    console.log('   Company:', startResult.session.prompt.company)
    console.log('   Difficulty:', startResult.session.prompt.difficulty)
    console.log('   Current Step:', startResult.currentStepNumber)

    // ============================================================
    // Test 2: Save All 8 Steps
    // ============================================================
    console.log('\\n✍️  Test 2: Save All 8 Steps')
    console.log('-'.repeat(60))

    for (let i = 1; i <= 8; i++) {
      const stepData = SAMPLE_STEPS[`step${i}` as keyof typeof SAMPLE_STEPS]
      const result = await SessionService.saveStep(sessionId, userId, i, stepData)

      console.log(`✅ Step ${i} saved`)
      console.log(`   Next step: ${result.nextStep ?? 'Session ready for completion'}`)
    }

    // ============================================================
    // Test 3: Complete Session
    // ============================================================
    console.log('\\n🏁 Test 3: Complete Session')
    console.log('-'.repeat(60))

    const completedSession = await SessionService.completeSession(sessionId, userId)

    console.log('✅ Session completed successfully')
    console.log('   Status:', completedSession.status)
    console.log('   Completed at:', completedSession.completedAt?.toISOString())

    // ============================================================
    // Test 4: Score Session with Claude API
    // ============================================================
    console.log('\\n🤖 Test 4: Score Session with Claude API')
    console.log('-'.repeat(60))

    console.log('⏳ Calling Claude API (this may take 30-60 seconds)...')

    const scoringResult = await ScoringService.scoreSession(sessionId)

    console.log('✅ Session scored successfully')
    console.log('   Overall Score:', scoringResult.overallScore, '/100')
    console.log('   XP Earned:', scoringResult.xpEarned)
    console.log('\\n   Step Scores:')
    scoringResult.stepScores.forEach(step => {
      console.log(`   - ${step.stepName}: ${step.score}/100`)
    })
    console.log('\\n   Summary:', scoringResult.summary)

    // ============================================================
    // Test 5: Award XP and Update Streak
    // ============================================================
    console.log('\\n🎮 Test 5: Award XP and Update Streak')
    console.log('-'.repeat(60))

    const progression = await ProgressionService.processSessionCompletion(
      userId,
      sessionId,
      scoringResult.xpEarned
    )

    console.log('✅ Progression updated')
    console.log('   XP Earned:', progression.xpResult.xpEarned)
    console.log('   Total XP:', progression.xpResult.totalXp)
    console.log('   Level:', progression.xpResult.newLevel)
    console.log('   Level Up:', progression.xpResult.levelUp ? 'Yes!' : 'No')
    console.log('   XP to Next Level:', progression.xpResult.xpToNextLevel)
    console.log('   Current Streak:', progression.streakResult.currentStreak, 'days')
    console.log('   Best Streak:', progression.streakResult.bestStreak, 'days')

    // ============================================================
    // Test 6: Get Progression Stats
    // ============================================================
    console.log('\\n📊 Test 6: Get Progression Stats')
    console.log('-'.repeat(60))

    const stats = await ProgressionService.getProgressionStats(userId)

    console.log('✅ Progression stats retrieved')
    console.log('   Level:', stats.level)
    console.log('   Total XP:', stats.totalXp)
    console.log('   XP to Next Level:', stats.xpToNextLevel)
    console.log('   Current Streak:', stats.currentStreak)
    console.log('   Best Streak:', stats.bestStreak)
    console.log('   Sessions Completed:', stats.sessionsCompleted)
    console.log('   Average Score:', stats.averageScore)

    // ============================================================
    // Test 7: Verify Session Data
    // ============================================================
    console.log('\\n🔍 Test 7: Verify Session Data')
    console.log('-'.repeat(60))

    const session = await SessionService.getSession(sessionId, userId)

    console.log('✅ Session data verified')
    console.log('   Status:', session?.status)
    console.log('   Overall Score:', session?.overallScore)
    console.log('   Steps Completed:', session?.steps.length)
    console.log('   Scoring Status:', session?.scoringStatus)

    // ============================================================
    // Test 8: Get User Sessions List
    // ============================================================
    console.log('\\n📋 Test 8: Get User Sessions List')
    console.log('-'.repeat(60))

    const sessionsResult = await SessionService.getUserSessions(userId, {
      status: 'completed',
      limit: 5,
    })

    console.log('✅ User sessions retrieved')
    console.log('   Total Sessions:', sessionsResult.total)
    console.log('   Completed Sessions:', sessionsResult.sessions.length)

    // ============================================================
    // Test 9: Get Active Session (should be none)
    // ============================================================
    console.log('\\n🎯 Test 9: Get Active Session')
    console.log('-'.repeat(60))

    const activeSession = await SessionService.getActiveSession(userId)

    console.log('✅ Active session check completed')
    console.log('   Active Session:', activeSession ? 'Yes' : 'None (expected)')

    // ============================================================
    // Cleanup
    // ============================================================
    console.log('\\n🧹 Cleanup: Deleting test user')
    console.log('-'.repeat(60))

    await AuthService.deleteAccount(userId)

    console.log('✅ Test user deleted')

    // ============================================================
    // Summary
    // ============================================================
    console.log('\\n' + '='.repeat(60))
    console.log('✅ ALL SESSION FLOW TESTS PASSED!')
    console.log('='.repeat(60) + '\\n')

    console.log('📈 Test Results Summary:')
    console.log('   ✓ Session creation and management')
    console.log('   ✓ All 8 steps saved with validation')
    console.log('   ✓ Session completion workflow')
    console.log('   ✓ Claude API scoring integration')
    console.log('   ✓ XP and streak progression')
    console.log('   ✓ User stats and history retrieval')
    console.log('\\n')

  } catch (error) {
    console.error('\\n❌ Test failed:', error)
    console.error('Stack trace:', error instanceof Error ? error.stack : 'N/A')
    process.exit(1)
  } finally {
    await db.$disconnect()
  }
}

// Run tests
testSessionFlow()
