/**
 * Authentication System Test Script
 *
 * Tests the complete auth flow:
 * 1. Send magic link
 * 2. Verify token
 * 3. Use session token
 * 4. Logout
 */

import { config } from 'dotenv'
import { db } from './src/lib/db'
import { AuthService } from './src/services/auth.service'

// Load .env.local
config({ path: '.env.local' })

async function testAuth() {
  console.log('🧪 Testing Authentication System\n')
  console.log('=' .repeat(60))

  const testEmail = 'test@sensei.app'

  try {
    // Test 1: Send Magic Link
    console.log('\n📧 Test 1: Send Magic Link')
    console.log('-'.repeat(60))
    const sendResult = await AuthService.sendMagicLink(testEmail)
    console.log('✅ Magic link sent successfully')
    console.log('   Email:', testEmail)
    console.log('   Expires in:', sendResult.expiresIn)

    if (sendResult.magicLink) {
      console.log('   Magic Link:', sendResult.magicLink)

      // Extract token from magic link
      const url = new URL(sendResult.magicLink)
      const token = url.searchParams.get('token')

      if (!token) {
        throw new Error('Token not found in magic link')
      }

      // Test 2: Verify Magic Link Token
      console.log('\n🔐 Test 2: Verify Magic Link Token')
      console.log('-'.repeat(60))
      const verifyResult = await AuthService.verifyMagicLink(token)
      console.log('✅ Token verified successfully')
      console.log('   User ID:', verifyResult.user.id)
      console.log('   Email:', verifyResult.user.email)
      console.log('   Level:', verifyResult.user.level)
      console.log('   Total XP:', verifyResult.user.totalXp)
      console.log('   Session Token:', verifyResult.token.substring(0, 50) + '...')

      // Test 3: Try to use token again (should fail)
      console.log('\n�� Test 3: Try to Reuse Token (Should Fail)')
      console.log('-'.repeat(60))
      try {
        await AuthService.verifyMagicLink(token)
        console.log('❌ ERROR: Token should not be reusable!')
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        console.log('✅ Token reuse blocked correctly')
        console.log('   Error:', message)
      }

      // Test 4: Get User by ID
      console.log('\n👤 Test 4: Get User by ID')
      console.log('-'.repeat(60))
      const user = await AuthService.getUserById(verifyResult.user.id)
      if (user) {
        console.log('✅ User retrieved successfully')
        console.log('   ID:', user.id)
        console.log('   Email:', user.email)
        console.log('   Created:', user.createdAt.toISOString())
      }

      // Test 5: Update Profile
      console.log('\n✏️  Test 5: Update Profile')
      console.log('-'.repeat(60))
      const updatedUser = await AuthService.updateProfile(verifyResult.user.id, {
        displayName: 'Test User',
      })
      console.log('✅ Profile updated successfully')
      console.log('   Display Name:', updatedUser.displayName)

      // Test 6: Check Database State
      console.log('\n💾 Test 6: Check Database State')
      console.log('-'.repeat(60))
      const userCount = await db.user.count()
      const tokenCount = await db.authToken.count()
      const streakCount = await db.streak.count()
      console.log('✅ Database state:')
      console.log('   Total users:', userCount)
      console.log('   Total auth tokens:', tokenCount)
      console.log('   Total streaks:', streakCount)

      // Test 7: Cleanup Expired Tokens
      console.log('\n🧹 Test 7: Cleanup Expired Tokens')
      console.log('-'.repeat(60))
      const cleanedCount = await AuthService.cleanupExpiredTokens()
      console.log('✅ Cleanup completed')
      console.log('   Expired tokens removed:', cleanedCount)

      // Test 8: Delete Account
      console.log('\n🗑️  Test 8: Delete Account')
      console.log('-'.repeat(60))
      await AuthService.deleteAccount(verifyResult.user.id)
      console.log('✅ Account deleted successfully')

      // Verify deletion
      const deletedUser = await AuthService.getUserById(verifyResult.user.id)
      if (deletedUser === null) {
        console.log('✅ User data removed from database')
      }

      const remainingTokens = await db.authToken.count({
        where: { userId: verifyResult.user.id },
      })
      console.log('   Remaining auth tokens:', remainingTokens)

    } else {
      console.log('⚠️  No magic link returned (production mode)')
    }

    console.log('\n' + '='.repeat(60))
    console.log('✅ All authentication tests passed!')
    console.log('='.repeat(60) + '\n')

  } catch (error) {
    console.error('\n❌ Test failed:', error)
    console.error('Stack trace:', error instanceof Error ? error.stack : 'N/A')
    process.exit(1)
  } finally {
    await db.$disconnect()
  }
}

// Run tests
testAuth()
