import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Step6Metrics from '../Step6Metrics'

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

describe('Step6Metrics', () => {
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
    render(<Step6Metrics {...mockProps} />)

    expect(screen.getByText('Define Success Metrics')).toBeTruthy()
  })

  it('should render primary metric section', () => {
    render(<Step6Metrics {...mockProps} />)

    expect(screen.getByText('Primary Metric')).toBeTruthy()
    expect(screen.getByPlaceholderText(/Metric name \(e.g./i)).toBeTruthy()
    expect(screen.getByPlaceholderText(/Describe how you'll measure it/i)).toBeTruthy()
    expect(screen.getByPlaceholderText(/Target \(e.g./i)).toBeTruthy()
  })

  it('should render guardrail metrics section', () => {
    render(<Step6Metrics {...mockProps} />)

    expect(screen.getByText('Guardrail Metrics')).toBeTruthy()
  })

  it('should render one guardrail by default', () => {
    render(<Step6Metrics {...mockProps} />)

    const guardrailInputs = screen.getAllByPlaceholderText(/Guardrail metric name/i)
    expect(guardrailInputs.length).toBe(1)
  })

  it('should allow typing in primary metric fields', async () => {
    const user = userEvent.setup()
    render(<Step6Metrics {...mockProps} />)

    const nameInput = screen.getByPlaceholderText(/Metric name \(e.g./i)
    const descInput = screen.getByPlaceholderText(/Describe how you'll measure it/i)
    const targetInput = screen.getByPlaceholderText(/Target \(e.g./i)

    await user.type(nameInput, '7-Day Retention Rate')
    await user.type(descInput, 'Percentage of users who return within 7 days')
    await user.type(targetInput, 'Increase from 40% to 50% in 3 months')

    expect((nameInput as HTMLInputElement).value).toBe('7-Day Retention Rate')
    expect((descInput as HTMLTextAreaElement).value).toBe('Percentage of users who return within 7 days')
    expect((targetInput as HTMLInputElement).value).toBe('Increase from 40% to 50% in 3 months')
  })

  it('should allow adding guardrails up to 3', () => {
    render(<Step6Metrics {...mockProps} />)

    const addButton = screen.getByText(/\+ Add guardrail/i)

    // Add second guardrail
    fireEvent.click(addButton)
    let guardrailInputs = screen.getAllByPlaceholderText(/Guardrail metric name/i)
    expect(guardrailInputs.length).toBe(2)

    // Add third guardrail
    fireEvent.click(addButton)
    guardrailInputs = screen.getAllByPlaceholderText(/Guardrail metric name/i)
    expect(guardrailInputs.length).toBe(3)

    // Button should disappear
    expect(screen.queryByText(/\+ Add guardrail/i)).toBeFalsy()
  })

  it('should show validation error when primary metric name is too short', async () => {
    render(<Step6Metrics {...mockProps} />)

    const nameInput = screen.getByPlaceholderText(/Metric name \(e.g./i)
    const descInput = screen.getByPlaceholderText(/Describe how you'll measure it/i)
    const targetInput = screen.getByPlaceholderText(/Target \(e.g./i)

    // Fill with short name (< 3 characters)
    fireEvent.change(nameInput, { target: { value: 'AB' } })
    fireEvent.change(descInput, { target: { value: 'Valid description here with more than twenty characters' } })
    fireEvent.change(targetInput, { target: { value: 'Valid target' } })

    // Try to submit
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText(/Metric name required/i)).toBeTruthy()
    })

    expect(mockProps.onComplete).not.toHaveBeenCalled()
  })

  it('should show validation error when primary metric description is too short', async () => {
    render(<Step6Metrics {...mockProps} />)

    const nameInput = screen.getByPlaceholderText(/Metric name \(e.g./i)
    const descInput = screen.getByPlaceholderText(/Describe how you'll measure it/i)
    const targetInput = screen.getByPlaceholderText(/Target \(e.g./i)

    // Fill with short description (< 20 characters)
    fireEvent.change(nameInput, { target: { value: 'Valid Metric Name' } })
    fireEvent.change(descInput, { target: { value: 'Short' } })
    fireEvent.change(targetInput, { target: { value: 'Valid target' } })

    // Try to submit
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText(/Description too short/i)).toBeTruthy()
    })

    expect(mockProps.onComplete).not.toHaveBeenCalled()
  })

  it('should show validation error when primary metric target is too short', async () => {
    render(<Step6Metrics {...mockProps} />)

    const nameInput = screen.getByPlaceholderText(/Metric name \(e.g./i)
    const descInput = screen.getByPlaceholderText(/Describe how you'll measure it/i)
    const targetInput = screen.getByPlaceholderText(/Target \(e.g./i)

    // Fill with short target (< 5 characters)
    fireEvent.change(nameInput, { target: { value: 'Valid Metric Name' } })
    fireEvent.change(descInput, { target: { value: 'Valid description here with more than twenty characters' } })
    fireEvent.change(targetInput, { target: { value: '50%' } })

    // Try to submit
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText(/Target required/i)).toBeTruthy()
    })

    expect(mockProps.onComplete).not.toHaveBeenCalled()
  })

  it('should show validation error when guardrail has name but no threshold', async () => {
    render(<Step6Metrics {...mockProps} />)

    const nameInput = screen.getByPlaceholderText(/Metric name \(e.g./i)
    const descInput = screen.getByPlaceholderText(/Describe how you'll measure it/i)
    const targetInput = screen.getByPlaceholderText(/Target \(e.g./i)

    // Fill primary metric properly
    fireEvent.change(nameInput, { target: { value: 'Valid Metric Name' } })
    fireEvent.change(descInput, { target: { value: 'Valid description here with more than twenty characters' } })
    fireEvent.change(targetInput, { target: { value: 'Valid target value' } })

    // Fill guardrail name but not threshold
    const guardrailNameInput = screen.getByPlaceholderText(/Guardrail metric name/i)
    const guardrailThresholdInput = screen.getByPlaceholderText(/Threshold/i)
    fireEvent.change(guardrailNameInput, { target: { value: 'NPS Score' } })
    fireEvent.change(guardrailThresholdInput, { target: { value: 'Bad' } }) // Too short

    // Try to submit
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText(/Threshold required/i)).toBeTruthy()
    })

    expect(mockProps.onComplete).not.toHaveBeenCalled()
  })

  it('should call onComplete with valid metric data', async () => {
    render(<Step6Metrics {...mockProps} />)

    const nameInput = screen.getByPlaceholderText(/Metric name \(e.g./i)
    const descInput = screen.getByPlaceholderText(/Describe how you'll measure it/i)
    const targetInput = screen.getByPlaceholderText(/Target \(e.g./i)

    // Fill primary metric
    fireEvent.change(nameInput, { target: { value: '7-Day Retention Rate' } })
    fireEvent.change(descInput, { target: { value: 'Percentage of users who return within 7 days of signup' } })
    fireEvent.change(targetInput, { target: { value: 'Increase from 40% to 50% in 3 months' } })

    // Fill one guardrail
    const guardrailNameInput = screen.getByPlaceholderText(/Guardrail metric name/i)
    const guardrailThresholdInput = screen.getByPlaceholderText(/Threshold/i)
    fireEvent.change(guardrailNameInput, { target: { value: 'NPS Score' } })
    fireEvent.change(guardrailThresholdInput, { target: { value: 'Must stay above 45' } })

    // Submit
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(mockProps.onComplete).toHaveBeenCalledWith({
        primaryMetric: {
          name: '7-Day Retention Rate',
          description: 'Percentage of users who return within 7 days of signup',
          target: 'Increase from 40% to 50% in 3 months',
        },
        guardrails: [
          {
            name: 'NPS Score',
            threshold: 'Must stay above 45',
          },
        ],
      })
    })
  })

  it('should call onComplete with multiple guardrails', async () => {
    render(<Step6Metrics {...mockProps} />)

    // Add second guardrail
    const addButton = screen.getByText(/\+ Add guardrail/i)
    fireEvent.click(addButton)

    const nameInput = screen.getByPlaceholderText(/Metric name \(e.g./i)
    const descInput = screen.getByPlaceholderText(/Describe how you'll measure it/i)
    const targetInput = screen.getByPlaceholderText(/Target \(e.g./i)

    // Fill primary metric
    fireEvent.change(nameInput, { target: { value: '7-Day Retention Rate' } })
    fireEvent.change(descInput, { target: { value: 'Percentage of users who return within 7 days of signup' } })
    fireEvent.change(targetInput, { target: { value: 'Increase from 40% to 50% in 3 months' } })

    // Fill guardrails
    const guardrailNameInputs = screen.getAllByPlaceholderText(/Guardrail metric name/i)
    const guardrailThresholdInputs = screen.getAllByPlaceholderText(/Threshold/i)

    fireEvent.change(guardrailNameInputs[0], { target: { value: 'NPS Score' } })
    fireEvent.change(guardrailThresholdInputs[0], { target: { value: 'Must stay above 45' } })

    fireEvent.change(guardrailNameInputs[1], { target: { value: 'Churn Rate' } })
    fireEvent.change(guardrailThresholdInputs[1], { target: { value: 'Must stay below 5%' } })

    // Submit
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(mockProps.onComplete).toHaveBeenCalledWith({
        primaryMetric: {
          name: '7-Day Retention Rate',
          description: 'Percentage of users who return within 7 days of signup',
          target: 'Increase from 40% to 50% in 3 months',
        },
        guardrails: [
          {
            name: 'NPS Score',
            threshold: 'Must stay above 45',
          },
          {
            name: 'Churn Rate',
            threshold: 'Must stay below 5%',
          },
        ],
      })
    })
  })

  it('should filter out empty guardrails on submit', async () => {
    render(<Step6Metrics {...mockProps} />)

    // Add second guardrail but don't fill it
    const addButton = screen.getByText(/\+ Add guardrail/i)
    fireEvent.click(addButton)

    const nameInput = screen.getByPlaceholderText(/Metric name \(e.g./i)
    const descInput = screen.getByPlaceholderText(/Describe how you'll measure it/i)
    const targetInput = screen.getByPlaceholderText(/Target \(e.g./i)

    // Fill primary metric
    fireEvent.change(nameInput, { target: { value: '7-Day Retention Rate' } })
    fireEvent.change(descInput, { target: { value: 'Percentage of users who return within 7 days of signup' } })
    fireEvent.change(targetInput, { target: { value: 'Increase from 40% to 50% in 3 months' } })

    // Fill only first guardrail
    const guardrailNameInputs = screen.getAllByPlaceholderText(/Guardrail metric name/i)
    const guardrailThresholdInputs = screen.getAllByPlaceholderText(/Threshold/i)

    fireEvent.change(guardrailNameInputs[0], { target: { value: 'NPS Score' } })
    fireEvent.change(guardrailThresholdInputs[0], { target: { value: 'Must stay above 45' } })

    // Leave second guardrail empty

    // Submit
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(mockProps.onComplete).toHaveBeenCalledWith({
        primaryMetric: expect.any(Object),
        guardrails: [
          {
            name: 'NPS Score',
            threshold: 'Must stay above 45',
          },
        ],
      })
    })
  })

  it('should call onBack when Back button is clicked', () => {
    render(<Step6Metrics {...mockProps} />)

    const backButton = screen.getByText('Back')
    fireEvent.click(backButton)

    expect(mockProps.onBack).toHaveBeenCalledTimes(1)
  })

  it('should disable Next button when saving', () => {
    render(<Step6Metrics {...mockProps} saving={true} />)

    const nextButton = screen.getByText('Saving...')
    expect(nextButton).toBeTruthy()
    expect(nextButton.hasAttribute('disabled')).toBeTruthy()
  })

  it('should populate metrics with existing data', () => {
    const existingData = {
      primaryMetric: {
        name: 'Existing Metric',
        description: 'This is an existing metric description',
        target: 'Existing target value',
      },
      guardrails: [
        {
          name: 'Existing Guardrail 1',
          threshold: 'Existing threshold 1',
        },
        {
          name: 'Existing Guardrail 2',
          threshold: 'Existing threshold 2',
        },
      ],
    }
    render(<Step6Metrics {...mockProps} data={existingData} />)

    const nameInput = screen.getByPlaceholderText(/Metric name \(e.g./i) as HTMLInputElement
    const descInput = screen.getByPlaceholderText(/Describe how you'll measure it/i) as HTMLTextAreaElement
    const targetInput = screen.getByPlaceholderText(/Target \(e.g./i) as HTMLInputElement

    expect(nameInput.value).toBe('Existing Metric')
    expect(descInput.value).toBe('This is an existing metric description')
    expect(targetInput.value).toBe('Existing target value')

    const guardrailNameInputs = screen.getAllByPlaceholderText(/Guardrail metric name/i) as HTMLInputElement[]
    expect(guardrailNameInputs[0].value).toBe('Existing Guardrail 1')
    expect(guardrailNameInputs[1].value).toBe('Existing Guardrail 2')
  })
})
