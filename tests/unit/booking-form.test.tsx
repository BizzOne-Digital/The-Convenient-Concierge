// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { BookingForm } from '@/components/forms/booking-form'

afterEach(cleanup)

describe('BookingForm', () => {
  it('shows moving-specific fields, checklist and assembly notice when Moving is chosen', () => {
    render(<BookingForm variant="full" />)
    expect(screen.queryByLabelText('Moving from')).toBeNull()
    fireEvent.click(screen.getByLabelText('Moving'))
    expect(screen.getByLabelText('Moving from')).toBeTruthy()
    expect(screen.getByLabelText('Moving to')).toBeTruthy()
    expect(screen.getByText(/Download checklist/).closest('a')?.getAttribute('href')).toBe('/documents/tcc-moving-checklist.pdf')
    expect(screen.getByText(/do not offer disassembly or assembly/i)).toBeTruthy()
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
    expect(name.getAttribute('aria-describedby')).toBe('name-error')
  })
})
