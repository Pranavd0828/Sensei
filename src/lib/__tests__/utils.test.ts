// Utility functions tests

describe('Score Color Utilities', () => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-[#B5E550]'
    if (score >= 60) return 'text-[#FF9A3D]'
    return 'text-[#FF6B00]'
  }

  it('should return green for scores >= 80', () => {
    expect(getScoreColor(80)).toBe('text-[#B5E550]')
    expect(getScoreColor(90)).toBe('text-[#B5E550]')
    expect(getScoreColor(100)).toBe('text-[#B5E550]')
  })

  it('should return orange for scores >= 60 and < 80', () => {
    expect(getScoreColor(60)).toBe('text-[#FF9A3D]')
    expect(getScoreColor(70)).toBe('text-[#FF9A3D]')
    expect(getScoreColor(79)).toBe('text-[#FF9A3D]')
  })

  it('should return red for scores < 60', () => {
    expect(getScoreColor(0)).toBe('text-[#FF6B00]')
    expect(getScoreColor(30)).toBe('text-[#FF6B00]')
    expect(getScoreColor(59)).toBe('text-[#FF6B00]')
  })
})

describe('Score Label Utilities', () => {
  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Exceptional'
    if (score >= 80) return 'Strong'
    if (score >= 70) return 'Good'
    if (score >= 60) return 'Adequate'
    return 'Needs Work'
  }

  it('should return correct labels for score ranges', () => {
    expect(getScoreLabel(95)).toBe('Exceptional')
    expect(getScoreLabel(85)).toBe('Strong')
    expect(getScoreLabel(75)).toBe('Good')
    expect(getScoreLabel(65)).toBe('Adequate')
    expect(getScoreLabel(50)).toBe('Needs Work')
  })

  it('should handle boundary values correctly', () => {
    expect(getScoreLabel(90)).toBe('Exceptional')
    expect(getScoreLabel(89)).toBe('Strong')
    expect(getScoreLabel(80)).toBe('Strong')
    expect(getScoreLabel(79)).toBe('Good')
    expect(getScoreLabel(70)).toBe('Good')
    expect(getScoreLabel(69)).toBe('Adequate')
    expect(getScoreLabel(60)).toBe('Adequate')
    expect(getScoreLabel(59)).toBe('Needs Work')
  })
})

describe('Date Formatting Utilities', () => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  it('should format dates correctly', () => {
    expect(formatDate('2024-01-15T10:00:00Z')).toMatch(/Jan 1[45]/)
    expect(formatDate('2024-12-25T10:00:00Z')).toMatch(/Dec 2[45]/)
  })
})

describe('Display Name Utilities', () => {
  const getDisplayName = (user: { displayName?: string | null; email?: string }) => {
    if (user?.displayName) return user.displayName
    if (user?.email) return user.email.split('@')[0]
    return 'User'
  }

  it('should use displayName if available', () => {
    expect(getDisplayName({ displayName: 'John Doe', email: 'john@example.com' })).toBe('John Doe')
  })

  it('should extract username from email if no displayName', () => {
    expect(getDisplayName({ email: 'john@example.com' })).toBe('john')
    expect(getDisplayName({ displayName: null, email: 'jane.doe@company.com' })).toBe('jane.doe')
  })

  it('should return default User if no data', () => {
    expect(getDisplayName({})).toBe('User')
    expect(getDisplayName({ displayName: null })).toBe('User')
  })
})

describe('XP Progress Utilities', () => {
  const calculateXpProgress = (currentXp: number, xpToNext: number) => {
    if (xpToNext === 0) return 0
    return (currentXp / xpToNext) * 100
  }

  it('should calculate XP progress percentage correctly', () => {
    expect(calculateXpProgress(250, 1000)).toBe(25)
    expect(calculateXpProgress(500, 1000)).toBe(50)
    expect(calculateXpProgress(750, 1000)).toBe(75)
    expect(calculateXpProgress(1000, 1000)).toBe(100)
  })

  it('should handle edge cases', () => {
    expect(calculateXpProgress(0, 1000)).toBe(0)
    expect(calculateXpProgress(100, 0)).toBe(0)
  })
})

describe('Validation Utilities', () => {
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  it('should validate correct email formats', () => {
    expect(validateEmail('test@example.com')).toBe(true)
    expect(validateEmail('user.name@company.co.uk')).toBe(true)
    expect(validateEmail('test+tag@domain.org')).toBe(true)
  })

  it('should reject invalid email formats', () => {
    expect(validateEmail('invalid')).toBe(false)
    expect(validateEmail('invalid@')).toBe(false)
    expect(validateEmail('@domain.com')).toBe(false)
    expect(validateEmail('test@')).toBe(false)
    expect(validateEmail('test @example.com')).toBe(false)
  })
})

describe('Text Length Validation', () => {
  const validateTextLength = (text: string, min: number, max?: number) => {
    const trimmed = text.trim()
    if (trimmed.length < min) return false
    if (max && trimmed.length > max) return false
    return true
  }

  it('should validate minimum length', () => {
    expect(validateTextLength('Hello', 3)).toBe(true)
    expect(validateTextLength('Hi', 3)).toBe(false)
    expect(validateTextLength('   Text   ', 4)).toBe(true) // Trimmed length
  })

  it('should validate maximum length', () => {
    expect(validateTextLength('Hello', 3, 10)).toBe(true)
    expect(validateTextLength('This is a very long text', 3, 10)).toBe(false)
  })

  it('should handle edge cases', () => {
    expect(validateTextLength('', 1)).toBe(false)
    expect(validateTextLength('   ', 1)).toBe(false)
    expect(validateTextLength('X', 1, 1)).toBe(true)
  })
})
