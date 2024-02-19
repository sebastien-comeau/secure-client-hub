import { render } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { axe, toHaveNoViolations } from 'jest-axe'
import {
  ContactSection,
  ContactSectionProps,
} from '../../../components/contact/ContactSection'

expect.extend(toHaveNoViolations)

const mockContactSectionProps = {
  id: 'test-id',
  intro: 'test-intro',
  title: 'test-title',
  details: [
    {
      id: 'test-details-id',
      items: [],
      title: 'test-details-title',
      color: true,
    },
  ],
} satisfies ContactSectionProps

describe('ContactSection', () => {
  it('renders contactSection', () => {
    const primary = render(<ContactSection {...mockContactSectionProps} />)
    expect(primary).toBeTruthy()
  })

  it('has no a11y violations', async () => {
    const { container } = render(
      <ContactSection {...mockContactSectionProps} />
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
