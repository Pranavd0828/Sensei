import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Step2Mission from '../Step2Mission'

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

describe('Step2Mission', () => {
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
    render(<Step2Mission {...mockProps} />)

    expect(screen.getByText('Align to Mission')).toBeTruthy()
  })

  it('should display company mission', () => {
    render(<Step2Mission {...mockProps} />)

    expect(screen.getByText(/Spotify Mission/i)).toBeTruthy()
    expect(screen.getByText(/mission is to inspire creativity/i)).toBeTruthy()
  })

  it('should allow typing in the mission alignment textarea', async () => {
    const user = userEvent.setup()
    render(<Step2Mission {...mockProps} />)

    const textarea = screen.getByPlaceholderText(/By helping new creators succeed/i) as HTMLTextAreaElement
    await user.type(textarea, 'This goal aligns with our mission because it helps users discover music.')

    expect(textarea.value).toBe('This goal aligns with our mission because it helps users discover music.')
  })

  it('should show character count', () => {
    render(<Step2Mission {...mockProps} />)

    const textarea = screen.getByPlaceholderText(/By helping new creators succeed/i)
    fireEvent.change(textarea, { target: { value: 'Test' } })

    expect(screen.getByText(/4\/1000 characters/i)).toBeTruthy()
  })

  it('should show validation error when text is empty', async () => {
    render(<Step2Mission {...mockProps} />)

    // Try to submit without typing
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText(/Please explain the mission alignment/i)).toBeTruthy()
    })

    expect(mockProps.onComplete).not.toHaveBeenCalled()
  })

  it('should show validation error when text is too short', async () => {
    render(<Step2Mission {...mockProps} />)

    // Type short text (< 50 characters)
    const textarea = screen.getByPlaceholderText(/By helping new creators succeed/i)
    fireEvent.change(textarea, { target: { value: 'Too short' } })

    // Try to submit
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText(/Please provide more detail \(at least 50 characters\)/i)).toBeTruthy()
    })

    expect(mockProps.onComplete).not.toHaveBeenCalled()
  })

  it('should show validation error when text is too long', async () => {
    render(<Step2Mission {...mockProps} />)

    // Type text over 1000 characters
    const longText = 'a'.repeat(1001)
    const textarea = screen.getByPlaceholderText(/By helping new creators succeed/i)
    fireEvent.change(textarea, { target: { value: longText } })

    // Try to submit
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText(/Please keep it under 1000 characters/i)).toBeTruthy()
    })

    expect(mockProps.onComplete).not.toHaveBeenCalled()
  })

  it('should call onComplete with valid data', async () => {
    render(<Step2Mission {...mockProps} />)

    // Type valid mission alignment (>= 50 characters)
    const textarea = screen.getByPlaceholderText(/By helping new creators succeed/i)
    const validText = 'This goal aligns perfectly with our mission to inspire creativity and bring joy to people worldwide through music discovery.'
    fireEvent.change(textarea, { target: { value: validText } })

    // Submit
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(mockProps.onComplete).toHaveBeenCalledWith({
        missionAlignment: validText,
      })
    })
  })

  it('should call onBack when Back button is clicked', () => {
    render(<Step2Mission {...mockProps} />)

    const backButton = screen.getByText('Back')
    fireEvent.click(backButton)

    expect(mockProps.onBack).toHaveBeenCalledTimes(1)
  })

  it('should disable Next button when saving', () => {
    render(<Step2Mission {...mockProps} saving={true} />)

    const nextButton = screen.getByText('Saving...')
    expect(nextButton).toBeTruthy()
    expect(nextButton.hasAttribute('disabled')).toBeTruthy()
  })

  it('should populate textarea with existing data', () => {
    const existingData = {
      missionAlignment: 'This is existing mission alignment text that was saved before.',
    }
    render(<Step2Mission {...mockProps} data={existingData} />)

    const textarea = screen.getByPlaceholderText(/By helping new creators succeed/i) as HTMLTextAreaElement
    expect(textarea.value).toBe(existingData.missionAlignment)
  })
})
