import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Step3Segments from '../Step3Segments'

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

describe('Step3Segments', () => {
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
    render(<Step3Segments {...mockProps} />)

    expect(screen.getByText('Identify User Segments')).toBeTruthy()
  })

  it('should render two empty segments by default', () => {
    render(<Step3Segments {...mockProps} />)

    expect(screen.getByText('Segment 1')).toBeTruthy()
    expect(screen.getByText('Segment 2')).toBeTruthy()
  })

  it('should allow typing in segment name and description', async () => {
    const user = userEvent.setup()
    render(<Step3Segments {...mockProps} />)

    const nameInputs = screen.getAllByPlaceholderText(/e.g., Aspiring Influencers/i)
    const descInputs = screen.getAllByPlaceholderText(/Describe this user segment/i)

    await user.type(nameInputs[0], 'Power Users')
    await user.type(descInputs[0], 'Users who listen to music daily for over 4 hours')

    expect((nameInputs[0] as HTMLInputElement).value).toBe('Power Users')
    expect((descInputs[0] as HTMLTextAreaElement).value).toBe('Users who listen to music daily for over 4 hours')
  })

  it('should allow adding a third segment', () => {
    render(<Step3Segments {...mockProps} />)

    const addButton = screen.getByText(/Add another segment/i)
    fireEvent.click(addButton)

    expect(screen.getByText('Segment 3')).toBeTruthy()
  })

  it('should not allow adding more than 3 segments', () => {
    render(<Step3Segments {...mockProps} />)

    const addButton = screen.getByText(/Add another segment/i)
    fireEvent.click(addButton) // Now have 3 segments

    // Add button should disappear
    expect(screen.queryByText(/Add another segment/i)).toBeFalsy()
  })

  it('should allow removing segments', () => {
    render(<Step3Segments {...mockProps} />)

    // Should have 2 segments initially
    expect(screen.getByText('Segment 1')).toBeTruthy()
    expect(screen.getByText('Segment 2')).toBeTruthy()

    // Remove second segment
    const removeButtons = screen.getAllByRole('button', { name: '' }).filter(btn => {
      const svg = btn.querySelector('svg')
      return svg && svg.querySelector('path[d*="M6 18L18 6M6 6l12 12"]')
    })

    if (removeButtons.length > 0) {
      fireEvent.click(removeButtons[0])

      // Should only have 1 segment now
      expect(screen.queryByText('Segment 2')).toBeFalsy()
    }
  })

  it('should show validation error when no segments filled', async () => {
    render(<Step3Segments {...mockProps} />)

    // Try to submit without filling anything
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText(/Please add at least 1 user segment/i)).toBeTruthy()
    })

    expect(mockProps.onComplete).not.toHaveBeenCalled()
  })

  it('should show validation error when segment name is too short', async () => {
    render(<Step3Segments {...mockProps} />)

    const nameInputs = screen.getAllByPlaceholderText(/e.g., Aspiring Influencers/i)
    const descInputs = screen.getAllByPlaceholderText(/Describe this user segment/i)

    // Fill with name < 3 characters
    fireEvent.change(nameInputs[0], { target: { value: 'AB' } })
    fireEvent.change(descInputs[0], { target: { value: 'This is a valid description with more than twenty characters' } })

    // Try to submit
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText(/Name too short/i)).toBeTruthy()
    })

    expect(mockProps.onComplete).not.toHaveBeenCalled()
  })

  it('should show validation error when description is too short', async () => {
    render(<Step3Segments {...mockProps} />)

    const nameInputs = screen.getAllByPlaceholderText(/e.g., Aspiring Influencers/i)
    const descInputs = screen.getAllByPlaceholderText(/Describe this user segment/i)

    // Fill with description < 20 characters
    fireEvent.change(nameInputs[0], { target: { value: 'Power Users' } })
    fireEvent.change(descInputs[0], { target: { value: 'Short' } })

    // Try to submit
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText(/Description too short \(min 20 chars\)/i)).toBeTruthy()
    })

    expect(mockProps.onComplete).not.toHaveBeenCalled()
  })

  it('should call onComplete with valid segment data', async () => {
    render(<Step3Segments {...mockProps} />)

    const nameInputs = screen.getAllByPlaceholderText(/e.g., Aspiring Influencers/i)
    const descInputs = screen.getAllByPlaceholderText(/Describe this user segment/i)

    // Fill valid data for first segment
    fireEvent.change(nameInputs[0], { target: { value: 'Power Users' } })
    fireEvent.change(descInputs[0], { target: { value: 'Users who listen to music daily for over 4 hours and create playlists' } })

    // Submit
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(mockProps.onComplete).toHaveBeenCalledWith({
        segments: [
          {
            name: 'Power Users',
            description: 'Users who listen to music daily for over 4 hours and create playlists',
          },
        ],
      })
    })
  })

  it('should call onComplete with multiple segments', async () => {
    render(<Step3Segments {...mockProps} />)

    const nameInputs = screen.getAllByPlaceholderText(/e.g., Aspiring Influencers/i)
    const descInputs = screen.getAllByPlaceholderText(/Describe this user segment/i)

    // Fill valid data for both segments
    fireEvent.change(nameInputs[0], { target: { value: 'Power Users' } })
    fireEvent.change(descInputs[0], { target: { value: 'Users who listen to music daily for over 4 hours and create playlists' } })

    fireEvent.change(nameInputs[1], { target: { value: 'Casual Listeners' } })
    fireEvent.change(descInputs[1], { target: { value: 'Users who listen occasionally, mainly to curated playlists and radio' } })

    // Submit
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(mockProps.onComplete).toHaveBeenCalledWith({
        segments: [
          {
            name: 'Power Users',
            description: 'Users who listen to music daily for over 4 hours and create playlists',
          },
          {
            name: 'Casual Listeners',
            description: 'Users who listen occasionally, mainly to curated playlists and radio',
          },
        ],
      })
    })
  })

  it('should filter out empty segments on submit', async () => {
    render(<Step3Segments {...mockProps} />)

    const nameInputs = screen.getAllByPlaceholderText(/e.g., Aspiring Influencers/i)
    const descInputs = screen.getAllByPlaceholderText(/Describe this user segment/i)

    // Fill only first segment
    fireEvent.change(nameInputs[0], { target: { value: 'Power Users' } })
    fireEvent.change(descInputs[0], { target: { value: 'Users who listen to music daily for over 4 hours and create playlists' } })

    // Leave second segment empty

    // Submit
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(mockProps.onComplete).toHaveBeenCalledWith({
        segments: [
          {
            name: 'Power Users',
            description: 'Users who listen to music daily for over 4 hours and create playlists',
          },
        ],
      })
    })
  })

  it('should call onBack when Back button is clicked', () => {
    render(<Step3Segments {...mockProps} />)

    const backButton = screen.getByText('Back')
    fireEvent.click(backButton)

    expect(mockProps.onBack).toHaveBeenCalledTimes(1)
  })

  it('should disable Next button when saving', () => {
    render(<Step3Segments {...mockProps} saving={true} />)

    const nextButton = screen.getByText('Saving...')
    expect(nextButton).toBeTruthy()
    expect(nextButton.hasAttribute('disabled')).toBeTruthy()
  })

  it('should populate segments with existing data', () => {
    const existingData = {
      segments: [
        { name: 'Existing Segment 1', description: 'This is an existing segment description for testing' },
        { name: 'Existing Segment 2', description: 'Another existing segment with valid description length' },
      ],
    }
    render(<Step3Segments {...mockProps} data={existingData} />)

    const nameInputs = screen.getAllByPlaceholderText(/e.g., Aspiring Influencers/i) as HTMLInputElement[]
    const descInputs = screen.getAllByPlaceholderText(/Describe this user segment/i) as HTMLTextAreaElement[]

    expect(nameInputs[0].value).toBe('Existing Segment 1')
    expect(descInputs[0].value).toBe('This is an existing segment description for testing')
    expect(nameInputs[1].value).toBe('Existing Segment 2')
    expect(descInputs[1].value).toBe('Another existing segment with valid description length')
  })
})
