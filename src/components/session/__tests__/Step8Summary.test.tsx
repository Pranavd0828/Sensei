import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Step8Summary from '../Step8Summary'

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

describe('Step8Summary', () => {
  const mockSteps = {
    1: {
      objective: 'RETENTION',
      goalSentence: 'Increase 7-day retention by improving onboarding',
    },
    3: {
      segments: [
        { name: 'Power Users', description: 'Users who engage daily' },
        { name: 'Casual Users', description: 'Users who engage weekly' },
      ],
    },
  }

  const mockProps = {
    sessionId: 'session-1',
    prompt: {
      name: 'User Retention',
      company: 'Spotify',
      surface: 'Mobile App',
      context: 'Test context',
    },
    steps: mockSteps,
    data: undefined,
    onComplete: jest.fn(),
    onBack: jest.fn(),
    saving: false,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render the step header', () => {
    render(<Step8Summary {...mockProps} />)

    expect(screen.getByText('Summary & Reflection')).toBeTruthy()
  })

  it('should display auto-generated summary', () => {
    render(<Step8Summary {...mockProps} />)

    expect(screen.getByText(/Your Session Summary/i)).toBeTruthy()
    expect(screen.getByText(/Goal: Increase 7-day retention by improving onboarding/i)).toBeTruthy()
    expect(screen.getByText(/Segments: Power Users, Casual Users/i)).toBeTruthy()
  })

  it('should render reflection textarea', () => {
    render(<Step8Summary {...mockProps} />)

    expect(screen.getByPlaceholderText(/What did you learn from this exercise/i)).toBeTruthy()
  })

  it('should render one learning input by default', () => {
    render(<Step8Summary {...mockProps} />)

    const learningInputs = screen.getAllByPlaceholderText(/Learning \d+/i)
    expect(learningInputs.length).toBe(1)
  })

  it('should show character count for reflection', () => {
    render(<Step8Summary {...mockProps} />)

    const reflectionInput = screen.getByPlaceholderText(/What did you learn from this exercise/i)
    fireEvent.change(reflectionInput, { target: { value: 'Test reflection' } })

    expect(screen.getByText(/15\/2000/i)).toBeTruthy()
  })

  it('should allow typing in reflection field', async () => {
    const user = userEvent.setup()
    render(<Step8Summary {...mockProps} />)

    const reflectionInput = screen.getByPlaceholderText(/What did you learn from this exercise/i)
    const reflectionText = 'This exercise helped me understand the importance of structured thinking in product management'

    await user.type(reflectionInput, reflectionText)

    expect((reflectionInput as HTMLTextAreaElement).value).toBe(reflectionText)
  })

  it('should allow adding learnings up to 3', () => {
    render(<Step8Summary {...mockProps} />)

    const addButton = screen.getByText(/\+ Add learning/i)

    // Add second learning
    fireEvent.click(addButton)
    let learningInputs = screen.getAllByPlaceholderText(/Learning \d+/i)
    expect(learningInputs.length).toBe(2)

    // Add third learning
    fireEvent.click(addButton)
    learningInputs = screen.getAllByPlaceholderText(/Learning \d+/i)
    expect(learningInputs.length).toBe(3)

    // Button should disappear
    expect(screen.queryByText(/\+ Add learning/i)).toBeFalsy()
  })

  it('should show validation error when reflection is too short', async () => {
    render(<Step8Summary {...mockProps} />)

    const reflectionInput = screen.getByPlaceholderText(/What did you learn from this exercise/i)
    const learningInputs = screen.getAllByPlaceholderText(/Learning \d+/i)

    // Fill with short reflection (< 100 characters)
    fireEvent.change(reflectionInput, { target: { value: 'Short reflection' } })
    fireEvent.change(learningInputs[0], { target: { value: 'Valid learning with more than twenty characters' } })

    // Try to submit
    const completeButton = screen.getByText('Complete Session')
    fireEvent.click(completeButton)

    await waitFor(() => {
      expect(screen.getByText(/Reflection too short \(min 100 chars\)/i)).toBeTruthy()
    })

    expect(mockProps.onComplete).not.toHaveBeenCalled()
  })

  it('should show validation error when no valid learnings', async () => {
    render(<Step8Summary {...mockProps} />)

    const reflectionInput = screen.getByPlaceholderText(/What did you learn from this exercise/i)
    const learningInputs = screen.getAllByPlaceholderText(/Learning \d+/i)

    // Fill reflection but not learnings
    fireEvent.change(reflectionInput, {
      target: {
        value: 'This is a valid reflection with more than one hundred characters needed for validation to pass successfully',
      },
    })
    fireEvent.change(learningInputs[0], { target: { value: 'Short' } }) // Too short

    // Try to submit
    const completeButton = screen.getByText('Complete Session')
    fireEvent.click(completeButton)

    await waitFor(() => {
      expect(screen.getByText(/Add at least 1 learning \(min 20 chars\)/i)).toBeTruthy()
    })

    expect(mockProps.onComplete).not.toHaveBeenCalled()
  })

  it('should call onComplete with valid data', async () => {
    render(<Step8Summary {...mockProps} />)

    const reflectionInput = screen.getByPlaceholderText(/What did you learn from this exercise/i)
    const learningInputs = screen.getAllByPlaceholderText(/Learning \d+/i)

    const reflectionText =
      'This exercise helped me understand how to think systematically about product problems. I learned to break down complex challenges into manageable steps.'

    const learningText = 'User segmentation is critical for prioritizing features effectively'

    // Fill valid data
    fireEvent.change(reflectionInput, { target: { value: reflectionText } })
    fireEvent.change(learningInputs[0], { target: { value: learningText } })

    // Submit
    const completeButton = screen.getByText('Complete Session')
    fireEvent.click(completeButton)

    await waitFor(() => {
      expect(mockProps.onComplete).toHaveBeenCalledWith({
        summary: expect.stringContaining('Goal: Increase 7-day retention by improving onboarding'),
        reflection: reflectionText,
        learnings: [learningText],
      })
    })
  })

  it('should call onComplete with multiple learnings', async () => {
    render(<Step8Summary {...mockProps} />)

    // Add second learning
    const addButton = screen.getByText(/\+ Add learning/i)
    fireEvent.click(addButton)

    const reflectionInput = screen.getByPlaceholderText(/What did you learn from this exercise/i)
    const learningInputs = screen.getAllByPlaceholderText(/Learning \d+/i)

    const reflectionText =
      'This exercise helped me understand how to think systematically about product problems. I learned to break down complex challenges into manageable steps.'

    // Fill reflection
    fireEvent.change(reflectionInput, { target: { value: reflectionText } })

    // Fill multiple learnings
    fireEvent.change(learningInputs[0], { target: { value: 'User segmentation is critical for prioritizing features' } })
    fireEvent.change(learningInputs[1], { target: { value: 'Metrics should align with business objectives and user value' } })

    // Submit
    const completeButton = screen.getByText('Complete Session')
    fireEvent.click(completeButton)

    await waitFor(() => {
      expect(mockProps.onComplete).toHaveBeenCalledWith({
        summary: expect.any(String),
        reflection: reflectionText,
        learnings: [
          'User segmentation is critical for prioritizing features',
          'Metrics should align with business objectives and user value',
        ],
      })
    })
  })

  it('should filter out empty learnings on submit', async () => {
    render(<Step8Summary {...mockProps} />)

    // Add second learning but don't fill it
    const addButton = screen.getByText(/\+ Add learning/i)
    fireEvent.click(addButton)

    const reflectionInput = screen.getByPlaceholderText(/What did you learn from this exercise/i)
    const learningInputs = screen.getAllByPlaceholderText(/Learning \d+/i)

    const reflectionText =
      'This exercise helped me understand how to think systematically about product problems. I learned to break down complex challenges into manageable steps.'

    // Fill only reflection and first learning
    fireEvent.change(reflectionInput, { target: { value: reflectionText } })
    fireEvent.change(learningInputs[0], { target: { value: 'User segmentation is critical for prioritizing features' } })
    // Leave second learning empty

    // Submit
    const completeButton = screen.getByText('Complete Session')
    fireEvent.click(completeButton)

    await waitFor(() => {
      expect(mockProps.onComplete).toHaveBeenCalledWith({
        summary: expect.any(String),
        reflection: reflectionText,
        learnings: ['User segmentation is critical for prioritizing features'],
      })
    })
  })

  it('should generate summary with goal and segments from previous steps', () => {
    render(<Step8Summary {...mockProps} />)

    const summaryText = screen.getByText(/Goal: Increase 7-day retention by improving onboarding/i)
    expect(summaryText).toBeTruthy()

    const segmentsText = screen.getByText(/Segments: Power Users, Casual Users/i)
    expect(segmentsText).toBeTruthy()
  })

  it('should handle missing step data gracefully', () => {
    const propsWithoutSteps = {
      ...mockProps,
      steps: {},
    }
    render(<Step8Summary {...propsWithoutSteps} />)

    expect(screen.getByText(/Goal not defined/i)).toBeTruthy()
    expect(screen.getByText(/No segments/i)).toBeTruthy()
  })

  it('should call onBack when Back button is clicked', () => {
    render(<Step8Summary {...mockProps} />)

    const backButton = screen.getByText('Back')
    fireEvent.click(backButton)

    expect(mockProps.onBack).toHaveBeenCalledTimes(1)
  })

  it('should disable Complete Session button when saving', () => {
    render(<Step8Summary {...mockProps} saving={true} />)

    const completeButton = screen.getByText('Completing...')
    expect(completeButton).toBeTruthy()
    expect(completeButton.hasAttribute('disabled')).toBeTruthy()
  })

  it('should populate fields with existing data', () => {
    const existingData = {
      reflection: 'This is an existing reflection that was saved previously',
      learnings: ['Existing learning one with enough characters', 'Existing learning two with more characters'],
    }
    render(<Step8Summary {...mockProps} data={existingData} />)

    const reflectionInput = screen.getByPlaceholderText(/What did you learn from this exercise/i) as HTMLTextAreaElement
    expect(reflectionInput.value).toBe('This is an existing reflection that was saved previously')

    const learningInputs = screen.getAllByPlaceholderText(/Learning \d+/i) as HTMLTextAreaElement[]
    expect(learningInputs[0].value).toBe('Existing learning one with enough characters')
    expect(learningInputs[1].value).toBe('Existing learning two with more characters')
  })
})
