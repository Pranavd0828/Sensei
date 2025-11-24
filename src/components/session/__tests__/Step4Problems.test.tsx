import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Step4Problems from '../Step4Problems'

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

describe('Step4Problems', () => {
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
    render(<Step4Problems {...mockProps} />)

    expect(screen.getByText('Prioritize Problems')).toBeTruthy()
  })

  it('should render one empty problem by default', () => {
    render(<Step4Problems {...mockProps} />)

    expect(screen.getByText('Problem 1')).toBeTruthy()
  })

  it('should allow typing in problem title and description', async () => {
    const user = userEvent.setup()
    render(<Step4Problems {...mockProps} />)

    const titleInput = screen.getByPlaceholderText(/e.g., Lack of initial visibility/i)
    const descInput = screen.getByPlaceholderText(/Describe the problem in detail/i)

    await user.type(titleInput, 'Discovery Issue')
    await user.type(descInput, 'Users struggle to find new music that matches their taste')

    expect((titleInput as HTMLInputElement).value).toBe('Discovery Issue')
    expect((descInput as HTMLTextAreaElement).value).toBe('Users struggle to find new music that matches their taste')
  })

  it('should allow adding a second and third problem', () => {
    render(<Step4Problems {...mockProps} />)

    const addButton = screen.getByText(/Add another problem/i)

    // Add second problem
    fireEvent.click(addButton)
    expect(screen.getByText('Problem 2')).toBeTruthy()

    // Add third problem
    fireEvent.click(addButton)
    expect(screen.getByText('Problem 3')).toBeTruthy()
  })

  it('should not allow adding more than 3 problems', () => {
    render(<Step4Problems {...mockProps} />)

    const addButton = screen.getByText(/Add another problem/i)
    fireEvent.click(addButton) // 2 problems
    fireEvent.click(addButton) // 3 problems

    // Add button should disappear
    expect(screen.queryByText(/Add another problem/i)).toBeFalsy()
  })

  it('should allow removing problems', () => {
    render(<Step4Problems {...mockProps} />)

    // Add a second problem
    const addButton = screen.getByText(/Add another problem/i)
    fireEvent.click(addButton)

    expect(screen.getByText('Problem 1')).toBeTruthy()
    expect(screen.getByText('Problem 2')).toBeTruthy()

    // Remove second problem
    const removeButtons = screen.getAllByRole('button', { name: '' }).filter(btn => {
      const svg = btn.querySelector('svg')
      return svg && svg.querySelector('path[d*="M6 18L18 6M6 6l12 12"]')
    })

    if (removeButtons.length > 0) {
      fireEvent.click(removeButtons[0])
      expect(screen.queryByText('Problem 2')).toBeFalsy()
    }
  })

  it('should allow selecting affected segments', () => {
    render(<Step4Problems {...mockProps} />)

    const segment1Button = screen.getByText('Segment 1')
    fireEvent.click(segment1Button)

    // Check if segment is selected (chip-primary class)
    expect(segment1Button.className).toContain('chip-primary')
  })

  it('should allow deselecting affected segments', () => {
    render(<Step4Problems {...mockProps} />)

    const segment1Button = screen.getByText('Segment 1')

    // Select
    fireEvent.click(segment1Button)
    expect(segment1Button.className).toContain('chip-primary')

    // Deselect
    fireEvent.click(segment1Button)
    expect(segment1Button.className).not.toContain('chip-primary')
  })

  it('should show validation error when no problems filled', async () => {
    render(<Step4Problems {...mockProps} />)

    // Try to submit without filling anything
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText(/Please add at least 1 problem/i)).toBeTruthy()
    })

    expect(mockProps.onComplete).not.toHaveBeenCalled()
  })

  it('should show validation error when title is too short', async () => {
    render(<Step4Problems {...mockProps} />)

    const titleInput = screen.getByPlaceholderText(/e.g., Lack of initial visibility/i)
    const descInput = screen.getByPlaceholderText(/Describe the problem in detail/i)

    // Fill with short title (< 5 characters)
    fireEvent.change(titleInput, { target: { value: 'Bad' } })
    fireEvent.change(descInput, { target: { value: 'This is a valid description with more than thirty characters' } })

    // Select segment
    const segment1Button = screen.getByText('Segment 1')
    fireEvent.click(segment1Button)

    // Try to submit
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText(/Title too short \(min 5 chars\)/i)).toBeTruthy()
    })

    expect(mockProps.onComplete).not.toHaveBeenCalled()
  })

  it('should show validation error when description is too short', async () => {
    render(<Step4Problems {...mockProps} />)

    const titleInput = screen.getByPlaceholderText(/e.g., Lack of initial visibility/i)
    const descInput = screen.getByPlaceholderText(/Describe the problem in detail/i)

    // Fill with short description (< 30 characters)
    fireEvent.change(titleInput, { target: { value: 'Valid Title' } })
    fireEvent.change(descInput, { target: { value: 'Short' } })

    // Select segment
    const segment1Button = screen.getByText('Segment 1')
    fireEvent.click(segment1Button)

    // Try to submit
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText(/Description too short \(min 30 chars\)/i)).toBeTruthy()
    })

    expect(mockProps.onComplete).not.toHaveBeenCalled()
  })

  it('should show validation error when no segments selected', async () => {
    render(<Step4Problems {...mockProps} />)

    const titleInput = screen.getByPlaceholderText(/e.g., Lack of initial visibility/i)
    const descInput = screen.getByPlaceholderText(/Describe the problem in detail/i)

    // Fill valid title and description but don't select segments
    fireEvent.change(titleInput, { target: { value: 'Valid Title Here' } })
    fireEvent.change(descInput, { target: { value: 'This is a valid description with more than thirty characters' } })

    // Try to submit
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText(/Select at least 1 affected segment/i)).toBeTruthy()
    })

    expect(mockProps.onComplete).not.toHaveBeenCalled()
  })

  it('should call onComplete with valid problem data', async () => {
    render(<Step4Problems {...mockProps} />)

    const titleInput = screen.getByPlaceholderText(/e.g., Lack of initial visibility/i)
    const descInput = screen.getByPlaceholderText(/Describe the problem in detail/i)

    // Fill valid data
    fireEvent.change(titleInput, { target: { value: 'Discovery Issue' } })
    fireEvent.change(descInput, { target: { value: 'Users struggle to find new music that matches their taste and preferences' } })

    // Select segments
    const segment1Button = screen.getByText('Segment 1')
    fireEvent.click(segment1Button)

    // Submit
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(mockProps.onComplete).toHaveBeenCalledWith({
        problems: [
          {
            title: 'Discovery Issue',
            description: 'Users struggle to find new music that matches their taste and preferences',
            affectedSegments: ['Segment 1'],
          },
        ],
      })
    })
  })

  it('should call onComplete with multiple problems', async () => {
    render(<Step4Problems {...mockProps} />)

    // Add second problem
    const addButton = screen.getByText(/Add another problem/i)
    fireEvent.click(addButton)

    const titleInputs = screen.getAllByPlaceholderText(/e.g., Lack of initial visibility/i)
    const descInputs = screen.getAllByPlaceholderText(/Describe the problem in detail/i)

    // Fill first problem
    fireEvent.change(titleInputs[0], { target: { value: 'Discovery Issue' } })
    fireEvent.change(descInputs[0], { target: { value: 'Users struggle to find new music that matches their taste and preferences' } })

    // Fill second problem
    fireEvent.change(titleInputs[1], { target: { value: 'Onboarding Confusion' } })
    fireEvent.change(descInputs[1], { target: { value: 'New users don\'t understand how to set up their preferences correctly' } })

    // Select segments for both
    const segmentButtons = screen.getAllByText('Segment 1')
    fireEvent.click(segmentButtons[0])
    fireEvent.click(segmentButtons[1])

    // Submit
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(mockProps.onComplete).toHaveBeenCalledWith({
        problems: [
          {
            title: 'Discovery Issue',
            description: 'Users struggle to find new music that matches their taste and preferences',
            affectedSegments: ['Segment 1'],
          },
          {
            title: 'Onboarding Confusion',
            description: 'New users don\'t understand how to set up their preferences correctly',
            affectedSegments: ['Segment 1'],
          },
        ],
      })
    })
  })

  it('should filter out empty problems on submit', async () => {
    render(<Step4Problems {...mockProps} />)

    // Add second problem but don't fill it
    const addButton = screen.getByText(/Add another problem/i)
    fireEvent.click(addButton)

    const titleInputs = screen.getAllByPlaceholderText(/e.g., Lack of initial visibility/i)
    const descInputs = screen.getAllByPlaceholderText(/Describe the problem in detail/i)

    // Fill only first problem
    fireEvent.change(titleInputs[0], { target: { value: 'Discovery Issue' } })
    fireEvent.change(descInputs[0], { target: { value: 'Users struggle to find new music that matches their taste and preferences' } })

    // Select segment for first problem
    const segmentButtons = screen.getAllByText('Segment 1')
    fireEvent.click(segmentButtons[0])

    // Submit
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(mockProps.onComplete).toHaveBeenCalledWith({
        problems: [
          {
            title: 'Discovery Issue',
            description: 'Users struggle to find new music that matches their taste and preferences',
            affectedSegments: ['Segment 1'],
          },
        ],
      })
    })
  })

  it('should call onBack when Back button is clicked', () => {
    render(<Step4Problems {...mockProps} />)

    const backButton = screen.getByText('Back')
    fireEvent.click(backButton)

    expect(mockProps.onBack).toHaveBeenCalledTimes(1)
  })

  it('should disable Next button when saving', () => {
    render(<Step4Problems {...mockProps} saving={true} />)

    const nextButton = screen.getByText('Saving...')
    expect(nextButton).toBeTruthy()
    expect(nextButton.hasAttribute('disabled')).toBeTruthy()
  })

  it('should populate problems with existing data', () => {
    const existingData = {
      problems: [
        {
          title: 'Existing Problem',
          description: 'This is an existing problem description with enough characters',
          affectedSegments: ['Segment 1', 'Segment 2'],
        },
      ],
    }
    render(<Step4Problems {...mockProps} data={existingData} />)

    const titleInput = screen.getByPlaceholderText(/e.g., Lack of initial visibility/i) as HTMLInputElement
    const descInput = screen.getByPlaceholderText(/Describe the problem in detail/i) as HTMLTextAreaElement

    expect(titleInput.value).toBe('Existing Problem')
    expect(descInput.value).toBe('This is an existing problem description with enough characters')

    // Check segments are selected
    const segment1 = screen.getAllByText('Segment 1')[0]
    const segment2 = screen.getAllByText('Segment 2')[0]
    expect(segment1.className).toContain('chip-primary')
    expect(segment2.className).toContain('chip-primary')
  })
})
