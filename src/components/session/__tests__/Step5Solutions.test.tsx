import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Step5Solutions from '../Step5Solutions'

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

describe('Step5Solutions', () => {
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
    render(<Step5Solutions {...mockProps} />)

    expect(screen.getByText('Ideate Solutions')).toBeTruthy()
  })

  it('should render three solution versions by default', () => {
    render(<Step5Solutions {...mockProps} />)

    expect(screen.getByText('V0')).toBeTruthy()
    expect(screen.getByText('V1')).toBeTruthy()
    expect(screen.getByText('V2')).toBeTruthy()
    expect(screen.getByText('MVP')).toBeTruthy()
    expect(screen.getByText('Enhanced')).toBeTruthy()
    expect(screen.getByText('Complete')).toBeTruthy()
  })

  it('should allow typing in solution title and description', async () => {
    const user = userEvent.setup()
    render(<Step5Solutions {...mockProps} />)

    const titleInputs = screen.getAllByPlaceholderText(/Solution title/i)
    const descInputs = screen.getAllByPlaceholderText(/Describe the solution/i)

    await user.type(titleInputs[0], 'Quick Win Solution')
    await user.type(descInputs[0], 'A minimal viable product that delivers core value quickly')

    expect((titleInputs[0] as HTMLInputElement).value).toBe('Quick Win Solution')
    expect((descInputs[0] as HTMLTextAreaElement).value).toBe('A minimal viable product that delivers core value quickly')
  })

  it('should render two feature inputs by default for each solution', () => {
    render(<Step5Solutions {...mockProps} />)

    const featureInputs = screen.getAllByPlaceholderText(/Feature \d+/i)
    // 3 solutions × 2 features = 6 inputs
    expect(featureInputs.length).toBe(6)
  })

  it('should allow adding features up to 5 per solution', () => {
    render(<Step5Solutions {...mockProps} />)

    const addFeatureButtons = screen.getAllByText(/\+ Add feature/i)

    // Click add feature for first solution
    fireEvent.click(addFeatureButtons[0]) // 3 features
    fireEvent.click(addFeatureButtons[0]) // 4 features
    fireEvent.click(addFeatureButtons[0]) // 5 features

    const featureInputs = screen.getAllByPlaceholderText(/Feature \d+/i)
    // First solution should have 5 features now (5 + 2 + 2 = 9 total)
    expect(featureInputs.length).toBeGreaterThanOrEqual(9)
  })

  it('should show validation error when title is too short', async () => {
    render(<Step5Solutions {...mockProps} />)

    const titleInputs = screen.getAllByPlaceholderText(/Solution title/i)
    const descInputs = screen.getAllByPlaceholderText(/Describe the solution/i)
    const featureInputs = screen.getAllByPlaceholderText(/Feature \d+/i)

    // Fill with short title (< 5 characters)
    fireEvent.change(titleInputs[0], { target: { value: 'MVP' } })
    fireEvent.change(descInputs[0], { target: { value: 'This is a valid description with more than fifty characters here' } })
    fireEvent.change(featureInputs[0], { target: { value: 'Valid feature one' } })
    fireEvent.change(featureInputs[1], { target: { value: 'Valid feature two' } })

    // Fill other solutions to pass validation
    fireEvent.change(titleInputs[1], { target: { value: 'Enhanced Solution' } })
    fireEvent.change(descInputs[1], { target: { value: 'This is another valid description with more than fifty characters' } })
    fireEvent.change(featureInputs[2], { target: { value: 'Valid feature' } })
    fireEvent.change(featureInputs[3], { target: { value: 'Another feature' } })

    fireEvent.change(titleInputs[2], { target: { value: 'Complete Solution' } })
    fireEvent.change(descInputs[2], { target: { value: 'This is yet another valid description with more than fifty chars' } })
    fireEvent.change(featureInputs[4], { target: { value: 'Feature here' } })
    fireEvent.change(featureInputs[5], { target: { value: 'Last feature' } })

    // Try to submit
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText(/Title too short/i)).toBeTruthy()
    })

    expect(mockProps.onComplete).not.toHaveBeenCalled()
  })

  it('should show validation error when description is too short', async () => {
    render(<Step5Solutions {...mockProps} />)

    const titleInputs = screen.getAllByPlaceholderText(/Solution title/i)
    const descInputs = screen.getAllByPlaceholderText(/Describe the solution/i)
    const featureInputs = screen.getAllByPlaceholderText(/Feature \d+/i)

    // Fill with short description (< 50 characters)
    fireEvent.change(titleInputs[0], { target: { value: 'Valid Title' } })
    fireEvent.change(descInputs[0], { target: { value: 'Short' } })
    fireEvent.change(featureInputs[0], { target: { value: 'Valid feature one' } })
    fireEvent.change(featureInputs[1], { target: { value: 'Valid feature two' } })

    // Fill other solutions
    fireEvent.change(titleInputs[1], { target: { value: 'Enhanced Solution' } })
    fireEvent.change(descInputs[1], { target: { value: 'This is another valid description with more than fifty characters' } })
    fireEvent.change(featureInputs[2], { target: { value: 'Valid feature' } })
    fireEvent.change(featureInputs[3], { target: { value: 'Another feature' } })

    fireEvent.change(titleInputs[2], { target: { value: 'Complete Solution' } })
    fireEvent.change(descInputs[2], { target: { value: 'This is yet another valid description with more than fifty chars' } })
    fireEvent.change(featureInputs[4], { target: { value: 'Feature here' } })
    fireEvent.change(featureInputs[5], { target: { value: 'Last feature' } })

    // Try to submit
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText(/Description too short \(min 50 chars\)/i)).toBeTruthy()
    })

    expect(mockProps.onComplete).not.toHaveBeenCalled()
  })

  it('should show validation error when less than 2 valid features', async () => {
    render(<Step5Solutions {...mockProps} />)

    const titleInputs = screen.getAllByPlaceholderText(/Solution title/i)
    const descInputs = screen.getAllByPlaceholderText(/Describe the solution/i)
    const featureInputs = screen.getAllByPlaceholderText(/Feature \d+/i)

    // Fill with only 1 valid feature (< 2 required)
    fireEvent.change(titleInputs[0], { target: { value: 'Valid Title' } })
    fireEvent.change(descInputs[0], { target: { value: 'This is a valid description with more than fifty characters here' } })
    fireEvent.change(featureInputs[0], { target: { value: 'Valid feature one' } })
    fireEvent.change(featureInputs[1], { target: { value: 'Short' } }) // Too short

    // Fill other solutions properly
    fireEvent.change(titleInputs[1], { target: { value: 'Enhanced Solution' } })
    fireEvent.change(descInputs[1], { target: { value: 'This is another valid description with more than fifty characters' } })
    fireEvent.change(featureInputs[2], { target: { value: 'Valid feature' } })
    fireEvent.change(featureInputs[3], { target: { value: 'Another feature' } })

    fireEvent.change(titleInputs[2], { target: { value: 'Complete Solution' } })
    fireEvent.change(descInputs[2], { target: { value: 'This is yet another valid description with more than fifty chars' } })
    fireEvent.change(featureInputs[4], { target: { value: 'Feature here' } })
    fireEvent.change(featureInputs[5], { target: { value: 'Last feature' } })

    // Try to submit
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText(/Need at least 2 features \(min 10 chars each\)/i)).toBeTruthy()
    })

    expect(mockProps.onComplete).not.toHaveBeenCalled()
  })

  it('should call onComplete with valid solution data', async () => {
    render(<Step5Solutions {...mockProps} />)

    const titleInputs = screen.getAllByPlaceholderText(/Solution title/i)
    const descInputs = screen.getAllByPlaceholderText(/Describe the solution/i)
    const featureInputs = screen.getAllByPlaceholderText(/Feature \d+/i)

    // Fill all three solutions with valid data
    // V0
    fireEvent.change(titleInputs[0], { target: { value: 'Quick Win MVP' } })
    fireEvent.change(descInputs[0], { target: { value: 'A minimal viable product that delivers core value quickly to users' } })
    fireEvent.change(featureInputs[0], { target: { value: 'Basic music discovery' } })
    fireEvent.change(featureInputs[1], { target: { value: 'Simple playlist creation' } })

    // V1
    fireEvent.change(titleInputs[1], { target: { value: 'Enhanced Platform' } })
    fireEvent.change(descInputs[1], { target: { value: 'Building on MVP with personalization and better recommendations engine' } })
    fireEvent.change(featureInputs[2], { target: { value: 'AI-powered recommendations' } })
    fireEvent.change(featureInputs[3], { target: { value: 'Social sharing features' } })

    // V2
    fireEvent.change(titleInputs[2], { target: { value: 'Complete Solution' } })
    fireEvent.change(descInputs[2], { target: { value: 'Full-featured platform with all bells and whistles for power users' } })
    fireEvent.change(featureInputs[4], { target: { value: 'Advanced analytics dashboard' } })
    fireEvent.change(featureInputs[5], { target: { value: 'Premium tier features' } })

    // Submit
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(mockProps.onComplete).toHaveBeenCalledWith({
        solutions: [
          {
            version: 'V0',
            title: 'Quick Win MVP',
            description: 'A minimal viable product that delivers core value quickly to users',
            features: ['Basic music discovery', 'Simple playlist creation'],
          },
          {
            version: 'V1',
            title: 'Enhanced Platform',
            description: 'Building on MVP with personalization and better recommendations engine',
            features: ['AI-powered recommendations', 'Social sharing features'],
          },
          {
            version: 'V2',
            title: 'Complete Solution',
            description: 'Full-featured platform with all bells and whistles for power users',
            features: ['Advanced analytics dashboard', 'Premium tier features'],
          },
        ],
      })
    })
  })

  it('should filter out empty features on submit', async () => {
    render(<Step5Solutions {...mockProps} />)

    const titleInputs = screen.getAllByPlaceholderText(/Solution title/i)
    const descInputs = screen.getAllByPlaceholderText(/Describe the solution/i)
    const featureInputs = screen.getAllByPlaceholderText(/Feature \d+/i)

    // Add extra feature to first solution
    const addFeatureButtons = screen.getAllByText(/\+ Add feature/i)
    fireEvent.click(addFeatureButtons[0])

    // Fill solutions but leave some features empty
    fireEvent.change(titleInputs[0], { target: { value: 'Quick Win MVP' } })
    fireEvent.change(descInputs[0], { target: { value: 'A minimal viable product that delivers core value quickly to users' } })
    fireEvent.change(featureInputs[0], { target: { value: 'Basic music discovery' } })
    fireEvent.change(featureInputs[1], { target: { value: 'Simple playlist creation' } })
    fireEvent.change(featureInputs[2], { target: { value: '' } }) // Empty feature

    // V1
    const updatedFeatureInputs = screen.getAllByPlaceholderText(/Feature \d+/i)
    fireEvent.change(titleInputs[1], { target: { value: 'Enhanced Platform' } })
    fireEvent.change(descInputs[1], { target: { value: 'Building on MVP with personalization and better recommendations engine' } })
    fireEvent.change(updatedFeatureInputs[3], { target: { value: 'AI-powered recommendations' } })
    fireEvent.change(updatedFeatureInputs[4], { target: { value: 'Social sharing features' } })

    // V2
    fireEvent.change(titleInputs[2], { target: { value: 'Complete Solution' } })
    fireEvent.change(descInputs[2], { target: { value: 'Full-featured platform with all bells and whistles for power users' } })
    fireEvent.change(updatedFeatureInputs[5], { target: { value: 'Advanced analytics dashboard' } })
    fireEvent.change(updatedFeatureInputs[6], { target: { value: 'Premium tier features' } })

    // Submit
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(mockProps.onComplete).toHaveBeenCalledWith({
        solutions: expect.arrayContaining([
          expect.objectContaining({
            version: 'V0',
            features: expect.not.arrayContaining(['']),
          }),
        ]),
      })
    })
  })

  it('should call onBack when Back button is clicked', () => {
    render(<Step5Solutions {...mockProps} />)

    const backButton = screen.getByText('Back')
    fireEvent.click(backButton)

    expect(mockProps.onBack).toHaveBeenCalledTimes(1)
  })

  it('should disable Next button when saving', () => {
    render(<Step5Solutions {...mockProps} saving={true} />)

    const nextButton = screen.getByText('Saving...')
    expect(nextButton).toBeTruthy()
    expect(nextButton.hasAttribute('disabled')).toBeTruthy()
  })

  it('should populate solutions with existing data', () => {
    const existingData = {
      solutions: [
        {
          version: 'V0',
          title: 'Existing V0',
          description: 'This is an existing V0 description with more than fifty characters',
          features: ['Existing feature 1', 'Existing feature 2'],
        },
        {
          version: 'V1',
          title: 'Existing V1',
          description: 'This is an existing V1 description with more than fifty characters',
          features: ['Existing feature 3', 'Existing feature 4'],
        },
        {
          version: 'V2',
          title: 'Existing V2',
          description: 'This is an existing V2 description with more than fifty characters',
          features: ['Existing feature 5', 'Existing feature 6'],
        },
      ],
    }
    render(<Step5Solutions {...mockProps} data={existingData} />)

    const titleInputs = screen.getAllByPlaceholderText(/Solution title/i) as HTMLInputElement[]
    const descInputs = screen.getAllByPlaceholderText(/Describe the solution/i) as HTMLTextAreaElement[]

    expect(titleInputs[0].value).toBe('Existing V0')
    expect(descInputs[0].value).toBe('This is an existing V0 description with more than fifty characters')
    expect(titleInputs[1].value).toBe('Existing V1')
    expect(titleInputs[2].value).toBe('Existing V2')
  })
})
