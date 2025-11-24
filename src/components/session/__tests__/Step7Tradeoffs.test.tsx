import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Step7Tradeoffs from '../Step7Tradeoffs'

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

describe('Step7Tradeoffs', () => {
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
    render(<Step7Tradeoffs {...mockProps} />)

    expect(screen.getByText('Tradeoffs & Risks')).toBeTruthy()
  })

  it('should render one tradeoff by default', () => {
    render(<Step7Tradeoffs {...mockProps} />)

    expect(screen.getByText('Tradeoff 1')).toBeTruthy()
  })

  it('should allow typing in tradeoff fields', async () => {
    const user = userEvent.setup()
    render(<Step7Tradeoffs {...mockProps} />)

    const titleInput = screen.getByPlaceholderText(/Tradeoff title/i)
    const descInput = screen.getByPlaceholderText(/Describe the tradeoff or risk/i)
    const mitigationInput = screen.getByPlaceholderText(/How would you mitigate this/i)

    await user.type(titleInput, 'Development Time vs Launch Speed')
    await user.type(descInput, 'Building all features takes 6 months but market wants solution now')
    await user.type(mitigationInput, 'Launch MVP in 2 months with core features only')

    expect((titleInput as HTMLInputElement).value).toBe('Development Time vs Launch Speed')
    expect((descInput as HTMLTextAreaElement).value).toBe('Building all features takes 6 months but market wants solution now')
    expect((mitigationInput as HTMLTextAreaElement).value).toBe('Launch MVP in 2 months with core features only')
  })

  it('should render impact level buttons', () => {
    render(<Step7Tradeoffs {...mockProps} />)

    expect(screen.getByText('LOW')).toBeTruthy()
    expect(screen.getByText('MEDIUM')).toBeTruthy()
    expect(screen.getByText('HIGH')).toBeTruthy()
  })

  it('should have MEDIUM selected by default', () => {
    render(<Step7Tradeoffs {...mockProps} />)

    const mediumButton = screen.getByText('MEDIUM')
    expect(mediumButton.className).toContain('chip-primary')
  })

  it('should allow changing impact level', () => {
    render(<Step7Tradeoffs {...mockProps} />)

    const highButton = screen.getByText('HIGH')
    fireEvent.click(highButton)

    expect(highButton.className).toContain('chip-primary')
  })

  it('should allow adding tradeoffs up to 5', () => {
    render(<Step7Tradeoffs {...mockProps} />)

    const addButton = screen.getByText(/\+ Add tradeoff/i)

    // Add 4 more tradeoffs (already have 1)
    fireEvent.click(addButton) // 2
    fireEvent.click(addButton) // 3
    fireEvent.click(addButton) // 4
    fireEvent.click(addButton) // 5

    expect(screen.getByText('Tradeoff 5')).toBeTruthy()

    // Button should disappear
    expect(screen.queryByText(/\+ Add tradeoff/i)).toBeFalsy()
  })

  it('should allow removing tradeoffs', () => {
    render(<Step7Tradeoffs {...mockProps} />)

    // Add second tradeoff
    const addButton = screen.getByText(/\+ Add tradeoff/i)
    fireEvent.click(addButton)

    expect(screen.getByText('Tradeoff 2')).toBeTruthy()

    // Remove it
    const removeButtons = screen.getAllByText('Remove')
    fireEvent.click(removeButtons[0])

    expect(screen.queryByText('Tradeoff 2')).toBeFalsy()
  })

  it('should show validation error when less than 2 tradeoffs filled', async () => {
    render(<Step7Tradeoffs {...mockProps} />)

    const titleInput = screen.getByPlaceholderText(/Tradeoff title/i)
    const descInput = screen.getByPlaceholderText(/Describe the tradeoff or risk/i)
    const mitigationInput = screen.getByPlaceholderText(/How would you mitigate this/i)

    // Fill only 1 tradeoff
    fireEvent.change(titleInput, { target: { value: 'Valid Title' } })
    fireEvent.change(descInput, { target: { value: 'This is a valid description with more than thirty characters here' } })
    fireEvent.change(mitigationInput, { target: { value: 'This is a valid mitigation strategy with enough characters' } })

    // Try to submit
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText(/Add at least 2 tradeoffs/i)).toBeTruthy()
    })

    expect(mockProps.onComplete).not.toHaveBeenCalled()
  })

  it('should show validation error when title is too short', async () => {
    render(<Step7Tradeoffs {...mockProps} />)

    // Add second tradeoff
    const addButton = screen.getByText(/\+ Add tradeoff/i)
    fireEvent.click(addButton)

    const titleInputs = screen.getAllByPlaceholderText(/Tradeoff title/i)
    const descInputs = screen.getAllByPlaceholderText(/Describe the tradeoff or risk/i)
    const mitigationInputs = screen.getAllByPlaceholderText(/How would you mitigate this/i)

    // Fill first tradeoff with short title
    fireEvent.change(titleInputs[0], { target: { value: 'Bad' } }) // Too short
    fireEvent.change(descInputs[0], { target: { value: 'This is a valid description with more than thirty characters here' } })
    fireEvent.change(mitigationInputs[0], { target: { value: 'This is a valid mitigation strategy with enough characters' } })

    // Fill second tradeoff properly
    fireEvent.change(titleInputs[1], { target: { value: 'Valid Title' } })
    fireEvent.change(descInputs[1], { target: { value: 'This is another valid description with more than thirty chars' } })
    fireEvent.change(mitigationInputs[1], { target: { value: 'This is another valid mitigation with enough characters' } })

    // Try to submit
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText(/Title too short/i)).toBeTruthy()
    })

    expect(mockProps.onComplete).not.toHaveBeenCalled()
  })

  it('should show validation error when description is too short', async () => {
    render(<Step7Tradeoffs {...mockProps} />)

    // Add second tradeoff
    const addButton = screen.getByText(/\+ Add tradeoff/i)
    fireEvent.click(addButton)

    const titleInputs = screen.getAllByPlaceholderText(/Tradeoff title/i)
    const descInputs = screen.getAllByPlaceholderText(/Describe the tradeoff or risk/i)
    const mitigationInputs = screen.getAllByPlaceholderText(/How would you mitigate this/i)

    // Fill first tradeoff with short description
    fireEvent.change(titleInputs[0], { target: { value: 'Valid Title' } })
    fireEvent.change(descInputs[0], { target: { value: 'Short' } }) // Too short
    fireEvent.change(mitigationInputs[0], { target: { value: 'This is a valid mitigation strategy with enough characters' } })

    // Fill second tradeoff properly
    fireEvent.change(titleInputs[1], { target: { value: 'Another Title' } })
    fireEvent.change(descInputs[1], { target: { value: 'This is another valid description with more than thirty chars' } })
    fireEvent.change(mitigationInputs[1], { target: { value: 'This is another valid mitigation with enough characters' } })

    // Try to submit
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText(/Description too short/i)).toBeTruthy()
    })

    expect(mockProps.onComplete).not.toHaveBeenCalled()
  })

  it('should show validation error when mitigation is too short', async () => {
    render(<Step7Tradeoffs {...mockProps} />)

    // Add second tradeoff
    const addButton = screen.getByText(/\+ Add tradeoff/i)
    fireEvent.click(addButton)

    const titleInputs = screen.getAllByPlaceholderText(/Tradeoff title/i)
    const descInputs = screen.getAllByPlaceholderText(/Describe the tradeoff or risk/i)
    const mitigationInputs = screen.getAllByPlaceholderText(/How would you mitigate this/i)

    // Fill first tradeoff with short mitigation
    fireEvent.change(titleInputs[0], { target: { value: 'Valid Title' } })
    fireEvent.change(descInputs[0], { target: { value: 'This is a valid description with more than thirty characters here' } })
    fireEvent.change(mitigationInputs[0], { target: { value: 'Short' } }) // Too short

    // Fill second tradeoff properly
    fireEvent.change(titleInputs[1], { target: { value: 'Another Title' } })
    fireEvent.change(descInputs[1], { target: { value: 'This is another valid description with more than thirty chars' } })
    fireEvent.change(mitigationInputs[1], { target: { value: 'This is another valid mitigation with enough characters' } })

    // Try to submit
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText(/Mitigation too short/i)).toBeTruthy()
    })

    expect(mockProps.onComplete).not.toHaveBeenCalled()
  })

  it('should call onComplete with valid tradeoff data', async () => {
    render(<Step7Tradeoffs {...mockProps} />)

    // Add second tradeoff
    const addButton = screen.getByText(/\+ Add tradeoff/i)
    fireEvent.click(addButton)

    const titleInputs = screen.getAllByPlaceholderText(/Tradeoff title/i)
    const descInputs = screen.getAllByPlaceholderText(/Describe the tradeoff or risk/i)
    const mitigationInputs = screen.getAllByPlaceholderText(/How would you mitigate this/i)

    // Fill first tradeoff
    fireEvent.change(titleInputs[0], { target: { value: 'Development Speed vs Quality' } })
    fireEvent.change(descInputs[0], { target: { value: 'Building features quickly may compromise code quality and maintainability' } })
    fireEvent.change(mitigationInputs[0], { target: { value: 'Implement code review process and automated testing to maintain quality' } })

    // Change impact to HIGH
    const highButtons = screen.getAllByText('HIGH')
    fireEvent.click(highButtons[0])

    // Fill second tradeoff
    fireEvent.change(titleInputs[1], { target: { value: 'User Privacy vs Personalization' } })
    fireEvent.change(descInputs[1], { target: { value: 'More data collection enables better personalization but reduces privacy' } })
    fireEvent.change(mitigationInputs[1], { target: { value: 'Be transparent about data usage and give users control over settings' } })

    // Submit
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(mockProps.onComplete).toHaveBeenCalledWith({
        tradeoffs: [
          {
            title: 'Development Speed vs Quality',
            description: 'Building features quickly may compromise code quality and maintainability',
            impact: 'HIGH',
            mitigation: 'Implement code review process and automated testing to maintain quality',
          },
          {
            title: 'User Privacy vs Personalization',
            description: 'More data collection enables better personalization but reduces privacy',
            impact: 'MEDIUM',
            mitigation: 'Be transparent about data usage and give users control over settings',
          },
        ],
      })
    })
  })

  it('should filter out empty tradeoffs on submit', async () => {
    render(<Step7Tradeoffs {...mockProps} />)

    // Add third tradeoff but don't fill it
    const addButton = screen.getByText(/\+ Add tradeoff/i)
    fireEvent.click(addButton)
    fireEvent.click(addButton)

    const titleInputs = screen.getAllByPlaceholderText(/Tradeoff title/i)
    const descInputs = screen.getAllByPlaceholderText(/Describe the tradeoff or risk/i)
    const mitigationInputs = screen.getAllByPlaceholderText(/How would you mitigate this/i)

    // Fill only first two tradeoffs
    fireEvent.change(titleInputs[0], { target: { value: 'First Tradeoff' } })
    fireEvent.change(descInputs[0], { target: { value: 'This is the first tradeoff with valid description length' } })
    fireEvent.change(mitigationInputs[0], { target: { value: 'This is the first mitigation with valid length' } })

    fireEvent.change(titleInputs[1], { target: { value: 'Second Tradeoff' } })
    fireEvent.change(descInputs[1], { target: { value: 'This is the second tradeoff with valid description' } })
    fireEvent.change(mitigationInputs[1], { target: { value: 'This is the second mitigation with valid length' } })

    // Leave third tradeoff empty

    // Submit
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(mockProps.onComplete).toHaveBeenCalledWith({
        tradeoffs: expect.arrayContaining([
          expect.objectContaining({ title: 'First Tradeoff' }),
          expect.objectContaining({ title: 'Second Tradeoff' }),
        ]),
      })
    })

    // Should only have 2 tradeoffs, not 3
    const call = mockProps.onComplete.mock.calls[0][0]
    expect(call.tradeoffs.length).toBe(2)
  })

  it('should call onBack when Back button is clicked', () => {
    render(<Step7Tradeoffs {...mockProps} />)

    const backButton = screen.getByText('Back')
    fireEvent.click(backButton)

    expect(mockProps.onBack).toHaveBeenCalledTimes(1)
  })

  it('should disable Next button when saving', () => {
    render(<Step7Tradeoffs {...mockProps} saving={true} />)

    const nextButton = screen.getByText('Saving...')
    expect(nextButton).toBeTruthy()
    expect(nextButton.hasAttribute('disabled')).toBeTruthy()
  })

  it('should populate tradeoffs with existing data', () => {
    const existingData = {
      tradeoffs: [
        {
          title: 'Existing Tradeoff 1',
          description: 'This is an existing tradeoff description with enough characters',
          impact: 'HIGH',
          mitigation: 'This is an existing mitigation strategy with valid length',
        },
        {
          title: 'Existing Tradeoff 2',
          description: 'This is another existing tradeoff description with valid length',
          impact: 'LOW',
          mitigation: 'This is another existing mitigation with enough characters',
        },
      ],
    }
    render(<Step7Tradeoffs {...mockProps} data={existingData} />)

    const titleInputs = screen.getAllByPlaceholderText(/Tradeoff title/i) as HTMLInputElement[]
    const descInputs = screen.getAllByPlaceholderText(/Describe the tradeoff or risk/i) as HTMLTextAreaElement[]

    expect(titleInputs[0].value).toBe('Existing Tradeoff 1')
    expect(descInputs[0].value).toBe('This is an existing tradeoff description with enough characters')
    expect(titleInputs[1].value).toBe('Existing Tradeoff 2')

    // Check impact levels are selected correctly
    const highButtons = screen.getAllByText('HIGH')
    const lowButtons = screen.getAllByText('LOW')
    expect(highButtons[0].className).toContain('chip-primary')
    expect(lowButtons[1].className).toContain('chip-primary')
  })
})
