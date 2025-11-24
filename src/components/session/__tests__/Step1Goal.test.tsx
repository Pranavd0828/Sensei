import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Step1Goal from '../Step1Goal'

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

describe('Step1Goal', () => {
  const mockProps = {
    sessionId: 'session-1',
    prompt: {
      name: 'User Retention',
      company: 'Spotify',
      surface: 'Mobile App',
      context: 'Test context',
    },
    data: undefined,
    onComplete: jest.fn(),
    onBack: jest.fn(),
    saving: false,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render the step header', () => {
    render(<Step1Goal {...mockProps} />)

    expect(screen.getByText('Clarify the Goal')).toBeTruthy()
  })

  it('should display objective options', () => {
    render(<Step1Goal {...mockProps} />)

    expect(screen.getByText('Acquisition')).toBeTruthy()
    expect(screen.getByText('Activation')).toBeTruthy()
    expect(screen.getByText('Retention')).toBeTruthy()
    expect(screen.getByText('Monetization')).toBeTruthy()
    expect(screen.getByText('Engagement')).toBeTruthy()
  })

  it('should allow selecting an objective', async () => {
    render(<Step1Goal {...mockProps} />)

    const acquisitionButton = screen.getByText('Acquisition').closest('button')
    expect(acquisitionButton).toBeTruthy()

    if (acquisitionButton) {
      fireEvent.click(acquisitionButton)
      await waitFor(() => {
        expect(acquisitionButton.className).toContain('border-[#FF6B00]')
      })
    }
  })

  it('should allow typing in the goal sentence', async () => {
    const user = userEvent.setup()
    render(<Step1Goal {...mockProps} />)

    const textarea = screen.getByPlaceholderText(/Example: Increase 7-day retention/i) as HTMLTextAreaElement
    await user.type(textarea, 'Increase user engagement by improving onboarding')

    expect(textarea.value).toBe('Increase user engagement by improving onboarding')
  })

  it('should show validation error when goal is too short', async () => {
    render(<Step1Goal {...mockProps} />)

    // Select objective
    const acquisitionButton = screen.getByText('Acquisition').closest('button')
    if (acquisitionButton) fireEvent.click(acquisitionButton)

    // Type short goal
    const textarea = screen.getByPlaceholderText(/Example: Increase 7-day retention/i)
    fireEvent.change(textarea, { target: { value: 'Too short' } })

    // Try to submit
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText(/Goal should be at least 20 characters/i)).toBeTruthy()
    })

    expect(mockProps.onComplete).not.toHaveBeenCalled()
  })

  it('should call onComplete with valid data', async () => {
    render(<Step1Goal {...mockProps} />)

    // Select objective
    const acquisitionButton = screen.getByText('Acquisition').closest('button')
    if (acquisitionButton) fireEvent.click(acquisitionButton)

    // Type valid goal
    const textarea = screen.getByPlaceholderText(/Example: Increase 7-day retention/i)
    fireEvent.change(textarea, {
      target: { value: 'Increase user engagement by improving the onboarding flow' },
    })

    // Submit
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(mockProps.onComplete).toHaveBeenCalledWith({
        objective: 'ACQUISITION',
        goalSentence: 'Increase user engagement by improving the onboarding flow',
      })
    })
  })
})
