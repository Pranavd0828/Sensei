import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // ============================================================================
  // MISSIONS - Company mission statements
  // ============================================================================
  console.log('📝 Seeding missions...')

  const missions = [
    {
      company: 'TikTok',
      missionText: 'Inspire creativity and bring joy',
    },
    {
      company: 'Spotify',
      missionText: 'Unlock the potential of human creativity by giving a million creative artists the opportunity to live off their art and billions of fans the opportunity to enjoy and be inspired by it',
    },
    {
      company: 'Notion',
      missionText: 'Make toolmaking ubiquitous',
    },
    {
      company: 'Airbnb',
      missionText: 'Create a world where anyone can belong anywhere',
    },
    {
      company: 'Stripe',
      missionText: 'Increase the GDP of the internet',
    },
    {
      company: 'Discord',
      missionText: 'Create a place where everyone can find belonging',
    },
    {
      company: 'Figma',
      missionText: 'Make design accessible to all',
    },
    {
      company: 'LinkedIn',
      missionText: 'Create economic opportunity for every member of the global workforce',
    },
    {
      company: 'Duolingo',
      missionText: 'Develop the best education in the world and make it universally available',
    },
    {
      company: 'Slack',
      missionText: 'Make work life simpler, more pleasant, and more productive',
    },
  ]

  for (const mission of missions) {
    await prisma.mission.upsert({
      where: { company: mission.company },
      update: mission,
      create: mission,
    })
  }

  console.log(`✅ Seeded ${missions.length} missions`)

  // ============================================================================
  // PROMPTS - Product sense scenarios
  // ============================================================================
  console.log('📝 Seeding prompts...')

  const prompts = [
    // ========== TikTok Prompts ==========
    {
      name: 'TikTok Creator Onboarding',
      company: 'TikTok',
      surface: 'Creator Tools',
      objective: 'Retention',
      difficulty: 2,
      constraint: JSON.stringify(['Data retention: 30 days', 'International launch required']),
      promptText:
        'New TikTok creators have a 40% drop-off rate within the first 7 days of joining the platform. Design an onboarding improvement to increase 30-day creator retention by 15%.',
    },
    {
      name: 'TikTok Live Streaming Growth',
      company: 'TikTok',
      surface: 'Live',
      objective: 'Engagement',
      difficulty: 3,
      constraint: JSON.stringify(['Must work on mobile', 'Max 2 new features']),
      promptText:
        'TikTok Live has lower engagement than competitors. Only 5% of daily active users engage with live streams. Design a feature to double live stream engagement within 6 months.',
    },
    {
      name: 'TikTok Sound Discovery',
      company: 'TikTok',
      surface: 'Discovery',
      objective: 'Growth',
      difficulty: 1,
      constraint: JSON.stringify(['No additional server costs']),
      promptText:
        'Users struggle to discover trending sounds early. Design a feature to help users find and use trending sounds 48 hours before they peak.',
    },

    // ========== Spotify Prompts ==========
    {
      name: 'Spotify Podcast Discovery',
      company: 'Spotify',
      surface: 'Podcasts',
      objective: 'Engagement',
      difficulty: 2,
      constraint: JSON.stringify(['Must integrate with existing recommendation engine']),
      promptText:
        'Only 30% of Spotify users who listen to music have tried podcasts. Design a feature to increase podcast adoption among music listeners by 25%.',
    },
    {
      name: 'Spotify Artist-Fan Connection',
      company: 'Spotify',
      surface: 'Artist Tools',
      objective: 'Retention',
      difficulty: 3,
      constraint: JSON.stringify(['Revenue share model required', 'Artists must opt-in']),
      promptText:
        'Artists want deeper connections with their superfans. Design a feature that enables artists to engage with their top 1% of listeners while maintaining platform scalability.',
    },
    {
      name: 'Spotify Family Plan Sharing',
      company: 'Spotify',
      surface: 'Subscription',
      objective: 'Monetization',
      difficulty: 2,
      constraint: JSON.stringify(['Must prevent abuse', 'Keep support costs low']),
      promptText:
        '15% of Family Plan subscribers share accounts with non-household members, costing $200M annually. Design a solution to reduce abuse while maintaining user satisfaction.',
    },

    // ========== Notion Prompts ==========
    {
      name: 'Notion Template Marketplace',
      company: 'Notion',
      surface: 'Templates',
      objective: 'Growth',
      difficulty: 2,
      constraint: JSON.stringify(['Creator payments required', '3-month timeline']),
      promptText:
        'Users spend 2+ hours building their first workspace. Design a template marketplace that reduces time-to-value for new users by 70%.',
    },
    {
      name: 'Notion Real-time Collaboration',
      company: 'Notion',
      surface: 'Editor',
      objective: 'Quality / Trust',
      difficulty: 3,
      constraint: JSON.stringify(['Max 100ms latency', 'Offline support required']),
      promptText:
        'Teams report frustration with collaboration conflicts. 25% of edits result in merge conflicts. Design improvements to make real-time collaboration feel seamless.',
    },
    {
      name: 'Notion Mobile Experience',
      company: 'Notion',
      surface: 'Mobile App',
      objective: 'Engagement',
      difficulty: 2,
      constraint: JSON.stringify(['iOS and Android parity', 'Performance budget']),
      promptText:
        'Mobile DAU is only 30% of desktop DAU. Users say "Notion is too slow on mobile." Design mobile-specific improvements to increase mobile DAU by 50%.',
    },

    // ========== Airbnb Prompts ==========
    {
      name: 'Airbnb Host Earnings Transparency',
      company: 'Airbnb',
      surface: 'Host Dashboard',
      objective: 'Retention',
      difficulty: 2,
      constraint: JSON.stringify(['Must be privacy-compliant', 'No new data collection']),
      promptText:
        'New hosts struggle to set competitive prices. 40% of listings are priced incorrectly, leading to low booking rates. Design a feature to help hosts optimize pricing.',
    },
    {
      name: 'Airbnb Guest Safety',
      company: 'Airbnb',
      surface: 'Booking Flow',
      objective: 'Quality / Trust',
      difficulty: 3,
      constraint: JSON.stringify(['Legal compliance required', 'Global rollout']),
      promptText:
        'Safety concerns prevent 20% of potential guests from booking. Design features to increase guest confidence in safety without adding friction to the booking process.',
    },
    {
      name: 'Airbnb Experiences Growth',
      company: 'Airbnb',
      surface: 'Experiences',
      objective: 'Growth',
      difficulty: 2,
      constraint: JSON.stringify(['Host quality standards', 'Insurance considerations']),
      promptText:
        'Airbnb Experiences has 10x lower awareness than core lodging. Design a strategy to increase Experiences bookings by 3x in the next year.',
    },

    // ========== Stripe Prompts ==========
    {
      name: 'Stripe Payment Success Rate',
      company: 'Stripe',
      surface: 'Checkout',
      objective: 'Quality / Trust',
      difficulty: 3,
      constraint: JSON.stringify(['PCI compliance', 'Fraud prevention maintained']),
      promptText:
        'Payment success rates vary by 5-10% across merchants. A 1% improvement = $500M GMV. Design features to increase payment success rates for struggling merchants.',
    },
    {
      name: 'Stripe Developer Onboarding',
      company: 'Stripe',
      surface: 'Developer Platform',
      objective: 'Growth',
      difficulty: 2,
      constraint: JSON.stringify(['API backward compatibility', 'Documentation updates']),
      promptText:
        'Developer time-to-first-payment averages 8 hours. Design an onboarding experience that gets developers to their first test transaction in under 30 minutes.',
    },
    {
      name: 'Stripe Fraud Detection',
      company: 'Stripe',
      surface: 'Radar',
      objective: 'Cost',
      difficulty: 3,
      constraint: JSON.stringify(['False positive rate < 2%', 'Real-time processing']),
      promptText:
        'Fraud costs merchants $800M annually. Current Radar blocks 60% of fraud. Design improvements to increase fraud detection to 85% while maintaining low false positives.',
    },

    // ========== Discord Prompts ==========
    {
      name: 'Discord Server Discovery',
      company: 'Discord',
      surface: 'Discovery',
      objective: 'Growth',
      difficulty: 2,
      constraint: JSON.stringify(['Moderation at scale', 'COPPA compliance']),
      promptText:
        '70% of new users never join a second server. Design a discovery feature that helps new users find 3+ relevant servers in their first week.',
    },
    {
      name: 'Discord Voice Channel Usage',
      company: 'Discord',
      surface: 'Voice',
      objective: 'Engagement',
      difficulty: 2,
      constraint: JSON.stringify(['Audio quality maintained', 'Mobile performance']),
      promptText:
        'Only 40% of Discord members use voice channels. Text-only users churn 2x faster. Design features to increase voice channel adoption by 30%.',
    },
    {
      name: 'Discord Creator Monetization',
      company: 'Discord',
      surface: 'Server Tools',
      objective: 'Monetization',
      difficulty: 3,
      constraint: JSON.stringify(['Revenue share model', 'Platform fees', 'Payment processing']),
      promptText:
        'Server owners want to monetize communities. Design a monetization platform that enables creators to earn while keeping Discord free for users.',
    },

    // ========== Figma Prompts ==========
    {
      name: 'Figma Component Library Sharing',
      company: 'Figma',
      surface: 'Design Systems',
      objective: 'Engagement',
      difficulty: 2,
      constraint: JSON.stringify(['Version control', 'Permission management']),
      promptText:
        'Design teams struggle to maintain consistent component libraries across projects. Design features to make design system management 3x easier.',
    },
    {
      name: 'Figma Developer Handoff',
      company: 'Figma',
      surface: 'Dev Mode',
      objective: 'Quality / Trust',
      difficulty: 3,
      constraint: JSON.stringify(['Code generation quality', 'Framework support']),
      promptText:
        'Developers spend 40% of implementation time translating designs. Design features to reduce designer-developer handoff time by 50%.',
    },
    {
      name: 'Figma Education Onboarding',
      company: 'Figma',
      surface: 'Onboarding',
      objective: 'Growth',
      difficulty: 1,
      constraint: JSON.stringify(['Self-serve experience', 'No live support required']),
      promptText:
        'New users take 5 days to create their first meaningful design. Design an onboarding experience that gets users productive in under 1 hour.',
    },

    // ========== LinkedIn Prompts ==========
    {
      name: 'LinkedIn Job Match Quality',
      company: 'LinkedIn',
      surface: 'Jobs',
      objective: 'Quality / Trust',
      difficulty: 3,
      constraint: JSON.stringify(['Privacy-compliant', 'Fair matching algorithms']),
      promptText:
        'Job seekers apply to 50+ positions with 2% response rate. Design features to increase job match quality and application response rates by 3x.',
    },
    {
      name: 'LinkedIn Learning Integration',
      company: 'LinkedIn',
      surface: 'Learning',
      objective: 'Engagement',
      difficulty: 2,
      constraint: JSON.stringify(['Content partnerships', 'Certification standards']),
      promptText:
        'Only 10% of LinkedIn members use Learning. Design features to increase course completion and skill development among active job seekers.',
    },
    {
      name: 'LinkedIn Creator Monetization',
      company: 'LinkedIn',
      surface: 'Creator Tools',
      objective: 'Monetization',
      difficulty: 3,
      constraint: JSON.stringify(['Professional context', 'B2B focus', 'Quality control']),
      promptText:
        'Top creators want to monetize their professional content. Design a creator monetization program that maintains LinkedIn\'s professional brand.',
    },

    // ========== Duolingo Prompts ==========
    {
      name: 'Duolingo Streak Recovery',
      company: 'Duolingo',
      surface: 'Gamification',
      objective: 'Retention',
      difficulty: 2,
      constraint: JSON.stringify(['Maintain motivation', 'No P2W mechanics']),
      promptText:
        '60% of users who lose their streak never return. Design a streak recovery feature that brings back lapsed users without devaluing daily commitment.',
    },
    {
      name: 'Duolingo Conversation Practice',
      company: 'Duolingo',
      surface: 'Learning',
      objective: 'Quality / Trust',
      difficulty: 3,
      constraint: JSON.stringify(['AI quality', 'Language coverage', 'Cost per conversation']),
      promptText:
        'Users struggle with real conversations despite completing lessons. Design AI-powered conversation practice that improves speaking confidence by 50%.',
    },
    {
      name: 'Duolingo Family Plan',
      company: 'Duolingo',
      surface: 'Subscription',
      objective: 'Monetization',
      difficulty: 2,
      constraint: JSON.stringify(['Family verification', 'Progress separation', 'Pricing']),
      promptText:
        'Families want to learn together but don\'t want to pay for multiple subscriptions. Design a Family Plan that increases ARPU by 30% while growing subscribers.',
    },

    // ========== Slack Prompts ==========
    {
      name: 'Slack Message Overload',
      company: 'Slack',
      surface: 'Messaging',
      objective: 'Engagement',
      difficulty: 2,
      constraint: JSON.stringify(['No algorithmic feed', 'User control']),
      promptText:
        'Users in large workspaces receive 200+ messages/day. 40% of messages go unread. Design features to help users manage message overload and reduce missed important messages by 70%.',
    },
    {
      name: 'Slack External Collaboration',
      company: 'Slack',
      surface: 'Channels',
      objective: 'Growth',
      difficulty: 3,
      constraint: JSON.stringify(['Security requirements', 'Cross-organization privacy']),
      promptText:
        'Teams work with external partners via email and shared channels. Design external collaboration features that bring 50% of external communication into Slack.',
    },
    {
      name: 'Slack Meeting Reduction',
      company: 'Slack',
      surface: 'Huddles',
      objective: 'Engagement',
      difficulty: 2,
      constraint: JSON.stringify(['Audio quality', 'Calendar integration', 'Recording compliance']),
      promptText:
        'Teams spend 30% of time in meetings that could be async. Design features to replace 50% of short meetings with asynchronous Slack communication.',
    },

    // ========== Additional Cross-Company Prompts ==========
    {
      name: 'Universal Search Enhancement',
      company: 'Notion',
      surface: 'Search',
      objective: 'Engagement',
      difficulty: 2,
      constraint: JSON.stringify(['Sub-second response time', 'Privacy-preserving']),
      promptText:
        'Users can\'t find their content 30% of the time. Design search improvements that increase successful content retrieval by 50%.',
    },
    {
      name: 'Mobile-First Redesign',
      company: 'Figma',
      surface: 'Mobile App',
      objective: 'Growth',
      difficulty: 3,
      constraint: JSON.stringify(['Feature parity', 'Performance', 'Touch interactions']),
      promptText:
        'Mobile usage is 10x lower than desktop. Design a mobile-first experience that makes Figma viable for on-the-go design work.',
    },
    {
      name: 'AI-Powered Recommendations',
      company: 'Spotify',
      surface: 'Discover',
      objective: 'Engagement',
      difficulty: 3,
      constraint: JSON.stringify(['Diversity requirements', 'Explainability', 'Artist fairness']),
      promptText:
        'Users skip 40% of Discover Weekly tracks. Design AI improvements that increase playlist completion rate by 30% while maintaining artist diversity.',
    },
  ]

  for (const prompt of prompts) {
    await prisma.prompt.create({
      data: prompt,
    })
  }

  console.log(`✅ Seeded ${prompts.length} prompts`)

  // ============================================================================
  // Summary
  // ============================================================================
  console.log('\n🎉 Database seeding completed successfully!')
  console.log(`
📊 Summary:
   • ${missions.length} company missions
   • ${prompts.length} product sense prompts
   • Difficulty distribution:
     - Easy (1): ${prompts.filter((p) => p.difficulty === 1).length} prompts
     - Medium (2): ${prompts.filter((p) => p.difficulty === 2).length} prompts
     - Hard (3): ${prompts.filter((p) => p.difficulty === 3).length} prompts
`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
