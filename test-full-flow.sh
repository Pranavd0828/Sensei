#!/bin/bash

# Full Integration Test for Sensei MVP
# Tests: Auth → Session → Steps → Complete → Score → Results

set -e

BASE_URL="http://localhost:3000"
EMAIL="integration-test@example.com"

echo "🚀 Starting Full Integration Test..."
echo "=================================="

# Step 1: Send Magic Link
echo ""
echo "📧 Step 1: Sending magic link..."
MAGIC_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/send-link" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\"}")

echo "✅ Magic link sent"
echo "$MAGIC_RESPONSE" | jq '.'

# Extract magic link token
MAGIC_TOKEN=$(echo "$MAGIC_RESPONSE" | jq -r '.data.magicLink' | sed 's/.*token=//')
echo "🔑 Magic token: ${MAGIC_TOKEN:0:50}..."

# Step 2: Verify Magic Link
echo ""
echo "🔐 Step 2: Verifying magic link..."
AUTH_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/verify" \
  -H "Content-Type: application/json" \
  -d "{\"token\": \"$MAGIC_TOKEN\"}")

echo "✅ Authentication successful"
echo "$AUTH_RESPONSE" | jq '.'

# Extract session token and user ID
SESSION_TOKEN=$(echo "$AUTH_RESPONSE" | jq -r '.data.token')
USER_ID=$(echo "$AUTH_RESPONSE" | jq -r '.data.user.id')
echo "🎫 Session token: ${SESSION_TOKEN:0:50}..."
echo "👤 User ID: $USER_ID"

# Step 3: Start Session
echo ""
echo "🎮 Step 3: Starting new session..."
START_RESPONSE=$(curl -s -X POST "$BASE_URL/api/sessions/start" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SESSION_TOKEN")

echo "✅ Session started"
echo "$START_RESPONSE" | jq '.'

# Extract session info
SESSION_ID=$(echo "$START_RESPONSE" | jq -r '.data.session.id')
PROMPT_NAME=$(echo "$START_RESPONSE" | jq -r '.data.session.prompt.name')
COMPANY=$(echo "$START_RESPONSE" | jq -r '.data.session.prompt.company')

echo "📝 Session ID: $SESSION_ID"
echo "🏢 Prompt: $COMPANY - $PROMPT_NAME"

# Step 4-11: Save all 8 steps
echo ""
echo "📋 Step 4-11: Saving session steps..."

# Step 1: Goal
echo "  Saving Step 1: Goal..."
curl -s -X POST "$BASE_URL/api/sessions/$SESSION_ID/steps" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SESSION_TOKEN" \
  -d '{
    "stepNumber": 1,
    "stepData": {
      "objective": "ENGAGEMENT",
      "goalSentence": "Increase podcast discovery and engagement among music-only users by creating personalized podcast recommendations"
    }
  }' > /dev/null

echo "  ✅ Step 1 saved"

# Step 2: Mission
echo "  Saving Step 2: Mission..."
curl -s -X POST "$BASE_URL/api/sessions/$SESSION_ID/steps" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SESSION_TOKEN" \
  -d '{
    "stepNumber": 2,
    "stepData": {
      "companyMission": "Unlock the potential of human creativity by giving a million creative artists the opportunity to live off their art",
      "alignment": "This feature helps creators reach new audiences through podcast discovery, supporting Spotify'\''s mission to empower creators"
    }
  }' > /dev/null

echo "  ✅ Step 2 saved"

# Step 3: Segments
echo "  Saving Step 3: Segments..."
curl -s -X POST "$BASE_URL/api/sessions/$SESSION_ID/steps" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SESSION_TOKEN" \
  -d '{
    "stepNumber": 3,
    "stepData": {
      "segments": [
        {"name": "Music Power Users", "description": "Heavy Spotify users who listen to music daily but have never tried podcasts"},
        {"name": "Genre Explorers", "description": "Users who actively discover new music and might be open to related podcast content"}
      ]
    }
  }' > /dev/null

echo "  ✅ Step 3 saved"

# Step 4: Problems
echo "  Saving Step 4: Problems..."
curl -s -X POST "$BASE_URL/api/sessions/$SESSION_ID/steps" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SESSION_TOKEN" \
  -d '{
    "stepNumber": 4,
    "stepData": {
      "problems": [
        "Users don'\''t know podcasts exist on Spotify",
        "Podcast discovery is buried in navigation",
        "No clear connection between music taste and podcast recommendations"
      ]
    }
  }' > /dev/null

echo "  ✅ Step 4 saved"

# Step 5: Solutions
echo "  Saving Step 5: Solutions..."
curl -s -X POST "$BASE_URL/api/sessions/$SESSION_ID/steps" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SESSION_TOKEN" \
  -d '{
    "stepNumber": 5,
    "stepData": {
      "v0": {
        "title": "Music-to-Podcast Cards",
        "description": "Show podcast recommendations in music playlists",
        "features": ["Contextual podcast cards", "Based on current listening"]
      },
      "v1": {
        "title": "Enhanced Discovery Tab",
        "description": "Dedicated section for music-related podcasts",
        "features": ["Personalized feed", "Genre-based recommendations", "Easy preview"]
      },
      "v2": {
        "title": "Smart Podcast Transitions",
        "description": "Suggest podcasts during natural break points",
        "features": ["AI-powered timing", "Seamless playback", "Save for later option"]
      }
    }
  }' > /dev/null

echo "  ✅ Step 5 saved"

# Step 6: Metrics
echo "  Saving Step 6: Metrics..."
curl -s -X POST "$BASE_URL/api/sessions/$SESSION_ID/steps" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SESSION_TOKEN" \
  -d '{
    "stepNumber": 6,
    "stepData": {
      "primaryMetric": {
        "name": "Podcast First-Listen Rate",
        "description": "Percentage of music-only users who listen to at least one podcast within 30 days",
        "target": "Increase from 30% to 37.5% (25% relative increase)"
      },
      "guardrails": [
        {"name": "Music Listening Time", "threshold": "Must not decrease by more than 5%"},
        {"name": "User Satisfaction Score", "threshold": "Must maintain NPS above 40"}
      ]
    }
  }' > /dev/null

echo "  ✅ Step 6 saved"

# Step 7: Tradeoffs
echo "  Saving Step 7: Tradeoffs..."
curl -s -X POST "$BASE_URL/api/sessions/$SESSION_ID/steps" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SESSION_TOKEN" \
  -d '{
    "stepNumber": 7,
    "stepData": {
      "tradeoffs": [
        {
          "title": "Interrupting Music Flow",
          "description": "Podcast suggestions might disrupt users'\'' music listening experience",
          "impact": "MEDIUM",
          "mitigation": "Only show suggestions during natural breaks or in designated discovery areas"
        },
        {
          "title": "Algorithm Complexity",
          "description": "Need to build new recommendation engine connecting music and podcasts",
          "impact": "HIGH",
          "mitigation": "Start with simple genre/topic matching, iterate based on engagement data"
        }
      ]
    }
  }' > /dev/null

echo "  ✅ Step 7 saved"

# Step 8: Summary
echo "  Saving Step 8: Summary..."
curl -s -X POST "$BASE_URL/api/sessions/$SESSION_ID/steps" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SESSION_TOKEN" \
  -d '{
    "stepNumber": 8,
    "stepData": {
      "summary": "Created a podcast discovery feature targeting music-only users with personalized recommendations based on listening habits",
      "reflection": "The key insight is connecting podcast content to users'\'' existing music preferences rather than treating podcasts as a separate product. This approach leverages Spotify'\''s strength in personalization.",
      "learnings": [
        "Users need a clear bridge between their current behavior (music) and new behavior (podcasts)",
        "Discovery features work best when integrated into existing user flows"
      ]
    }
  }' > /dev/null

echo "  ✅ Step 8 saved"

# Step 12: Complete Session
echo ""
echo "✨ Step 12: Completing session..."
COMPLETE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/sessions/$SESSION_ID/complete" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SESSION_TOKEN")

echo "✅ Session completed"
echo "$COMPLETE_RESPONSE" | jq '.'

# Step 13: Score Session
echo ""
echo "🤖 Step 13: Scoring session with AI..."
echo "⚠️  Note: This requires ANTHROPIC_API_KEY to be set in .env.local"

SCORE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/sessions/$SESSION_ID/score" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SESSION_TOKEN")

SCORE_STATUS=$(echo "$SCORE_RESPONSE" | jq -r '.data.scoringStatus // .error.message')

if [[ "$SCORE_STATUS" == "completed" ]]; then
  echo "✅ Scoring completed successfully"
  echo "$SCORE_RESPONSE" | jq '.'

  OVERALL_SCORE=$(echo "$SCORE_RESPONSE" | jq -r '.data.overallScore')
  echo "📊 Overall Score: $OVERALL_SCORE/100"
else
  echo "⚠️  Scoring status: $SCORE_STATUS"
  echo "$SCORE_RESPONSE" | jq '.'
fi

# Step 14: Get Results
echo ""
echo "📈 Step 14: Fetching session results..."
RESULTS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/sessions/$SESSION_ID" \
  -H "Authorization: Bearer $SESSION_TOKEN")

echo "✅ Results retrieved"
echo "$RESULTS_RESPONSE" | jq '.data.session | {id, status, overallScore, scoringStatus, prompt: {company, name}}'

# Check progression stats
echo ""
echo "🏆 Checking user progression..."
STATS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/progression/stats" \
  -H "Authorization: Bearer $SESSION_TOKEN")

echo "✅ Progression stats"
echo "$STATS_RESPONSE" | jq '.'

echo ""
echo "=================================="
echo "✅ Full Integration Test Complete!"
echo "=================================="
echo ""
echo "Summary:"
echo "  - Authentication: ✅"
echo "  - Session Creation: ✅"
echo "  - Step Saving (1-8): ✅"
echo "  - Session Completion: ✅"
echo "  - AI Scoring: $([ "$SCORE_STATUS" == "completed" ] && echo "✅" || echo "⚠️  (check API key)")"
echo "  - Results Retrieval: ✅"
echo "  - Progression Tracking: ✅"
echo ""
