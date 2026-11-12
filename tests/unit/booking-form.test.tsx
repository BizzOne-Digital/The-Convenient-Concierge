// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { BookingForm } from '@/components/forms/booking-form'

afterEach(cleanup)

describe('BookingForm', () => {
  it('shows moving-specific fields, checklist and assembly notice when Moving is chosen', () => {
    render(<BookingForm variant="full" />)
    expect(screen.queryByLabelText('Pickup address')).toBeNull()
    fireEvent.click(screen.getByLabelText('Moving'))
    for (const label of ['Preferred moving date', 'Pickup address', 'Destination address', 'Stairs or elevator', 'Furniture inventory', 'Packing requirements'])
      expect(screen.getByLabelText(label)).toBeTruthy()
    expect(screen.getByLabelText(/Add photos/).getAttribute('multiple')).not.toBeNull()
    expect(screen.getByText(/Download checklist/).closest('a')?.getAttribute('href')).toBe('/documents/tcc-moving-checklist.pdf')
    expect(screen.getByText(/assembly and disassembly are included/i)).toBeTruthy()
  })

  it('shows delivery fields for Pick-up & Delivery', () => {
    render(<BookingForm variant="full" defaultService="delivery" />)
    expect(screen.getByLabelText('Pickup location')).toBeTruthy()
    expect(screen.getByLabelText('Item details')).toBeTruthy()
  })

  it('reports accessible validation errors without sending', async () => {
    render(<BookingForm variant="quick" />)
    fireEvent.click(screen.getByRole('button', { name: /request a booking/i }))
    expect(await screen.findByRole('alert')).toBeTruthy()
    const name = screen.getByLabelText('Full name')
    expect(name.getAttribute('aria-invalid')).toBe('true')
    // The anti-spam start time must survive the error re-render, or the corrected submission is dropped as spam.
    expect((document.querySelector('[name=startedAt]') as HTMLInputElement).value).toMatch(/^\d{13}$/)
    expect(name.getAttribute('aria-describedby')).toBe('name-error')
  })
})
