'use client'

import { useRef, useState, type FormEvent } from 'react'
import { ArrowRight, CircleCheck, Download, FileUp, LoaderCircle, Phone } from 'lucide-react'
import { business, services, type ServiceType } from '@/lib/content'
import { bookingSchema, fieldErrors } from '@/lib/validations'
import { ServiceIcon } from '@/components/ui/icons'
import { buttonClass } from '@/components/ui/button'
import { Field, SpamGuards, describe, focusFirstError, idle, inputClass, postForm, type SubmitState } from './fields'

const propertyTypes = ['House', 'Condo', 'Apartment', 'Office', 'Storage unit', 'Other']

const copy: Record<ServiceType, { from: string; to: string; desc: string; descHint: string }> = {
  moving: {
    from: 'Moving from',
    to: 'Moving to',
    desc: 'Tell us about your move',
    descHint: 'Main items, floors, elevator or stairs, parking, anything we should know.',
  },
  delivery: {
    from: 'Pickup location',
    to: 'Delivery location',
    desc: 'Anything else we should know?',
    descHint: 'Timing, order number, pickup instructions or access details.',
  },
  tasks: {
    from: 'Relevant location or area',
    to: '',
    desc: 'Describe your task or errand',
    descHint: 'Stores, shopping list, instructions and any deadlines.',
  },
}

export function BookingForm({ variant = 'full', defaultService }: { variant?: 'full' | 'quick'; defaultService?: ServiceType }) {
  const [service, setService] = useState<ServiceType | ''>(defaultService ?? '')
  const [state, setState] = useState<SubmitState>(idle)
  const [fileName, setFileName] = useState('')
  const form = useRef<HTMLFormElement>(null)
  const today = new Date().toISOString().slice(0, 10)
  const full = variant === 'full'
  const e = state.errors
  const err = (k: string) => e[k]?.[0]
  const t = service ? copy[service] : null

  async function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault()
    const fd = new FormData(ev.currentTarget)
    fd.set('form', variant)
    const parsed = bookingSchema.safeParse(Object.fromEntries([...fd.entries()].filter(([, v]) => typeof v === 'string')))
    if (!parsed.success) {
      const errors = fieldErrors(parsed.error)
      setState({ status: 'error', message: 'Please check the highlighted fields.', errors })
      requestAnimationFrame(() => focusFirstError(form.current, errors))
      return
    }
    setState({ ...idle, status: 'submitting' })
    const result = await postForm('/api/bookings', fd)
    setState(result)
    if (result.status === 'error') requestAnimationFrame(() => focusFirstError(form.current, result.errors))
  }

  if (state.status === 'success')
    return (
      <div role="status" className="py-6 text-center sm:py-10">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-red/[0.08] text-red">
          <CircleCheck aria-hidden className="size-8" strokeWidth={1.75} />
        </span>
        <h3 className="mt-6 text-h3">Request received</h3>
        <p className="mx-auto mt-3 max-w-md text-muted">{state.message}</p>
        <p className="mt-6 text-sm text-muted">
          Need something sooner? Call{' '}
          <a className="font-semibold text-red underline-offset-4 hover:underline" href={`tel:+1${business.phone.replace(/\D/g, '')}`}>
            {business.phone}
          </a>
        </p>
      </div>
    )

  return (
    <form ref={form} onSubmit={onSubmit} noValidate className="relative" aria-describedby="booking-note">
      <SpamGuards />
      {state.status === 'error' && state.message && (
        <div role="alert" className="mb-6 rounded-xl border border-red/25 bg-red/[0.05] px-4 py-3 text-sm font-medium text-red">
          {state.message}
        </div>
      )}

      {full ? (
        <fieldset>
          <legend className="mb-3 text-[0.875rem] font-semibold">What can we help with?</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            {services.map((s) => (
              <label
                key={s.type}
                className="group relative flex cursor-pointer items-center gap-3 rounded-2xl sm:flex-col sm:items-start border border-line bg-[#fbf9f7] p-4 transition-[border-color,background-color,box-shadow] duration-300 hover:border-[#d9cec7] has-[:checked]:border-red has-[:checked]:bg-white has-[:checked]:shadow-[0_0_0_4px_rgb(200_16_46/0.08)] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-red"
              >
                <input
                  type="radio"
                  name="serviceType"
                  value={s.type}
                  checked={service === s.type}
                  onChange={() => setService(s.type)}
                  className="peer sr-only"
                  aria-describedby={err('serviceType') ? 'serviceType-error' : undefined}
                />
                <span className="grid size-10 place-items-center rounded-full bg-red/[0.08] text-red transition-colors peer-checked:bg-red peer-checked:text-white">
                  <ServiceIcon icon={s.icon} className="size-[18px]" />
                </span>
                <span className="font-semibold leading-tight">{s.name}</span>
                <span className="absolute right-4 top-1/2 size-4 -translate-y-1/2 rounded-full sm:top-4 sm:translate-y-0 border border-[#cfc4bd] transition-colors peer-checked:border-[5px] peer-checked:border-red" />
              </label>
            ))}
          </div>
          {err('serviceType') && (
            <p id="serviceType-error" className="mt-2 text-[0.8125rem] font-medium text-red">
              {err('serviceType')}
            </p>
          )}
        </fieldset>
      ) : null}

      <div className={`grid gap-5 sm:grid-cols-2 ${full ? 'mt-7' : ''}`}>
        <Field id="name" label="Full name" error={err('name')} className={full ? '' : 'sm:col-span-2'}>
          <input {...describe('name', e)} autoComplete="name" className={`${inputClass} h-13`} />
        </Field>
        <Field id="email" label="Email address" error={err('email')}>
          <input {...describe('email', e)} type="email" autoComplete="email" inputMode="email" className={`${inputClass} h-13`} />
        </Field>
        <Field id="phone" label="Phone number" error={err('phone')}>
          <input {...describe('phone', e)} type="tel" autoComplete="tel" inputMode="tel" className={`${inputClass} h-13`} />
        </Field>
        {!full && (
          <Field id="serviceType" label="Service" error={err('serviceType')}>
            <select
              {...describe('serviceType', e)}
              value={service}
              onChange={(ev) => setService(ev.target.value as ServiceType)}
              className={`${inputClass} h-13 appearance-none bg-[url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='16'%20height='16'%20fill='none'%20stroke='%236f6967'%20stroke-width='2'%3E%3Cpath%20d='m4%206%204%204%204-4'/%3E%3C/svg%3E")] bg-[position:right_1rem_center] bg-no-repeat pr-10`}
            >
              <option value="" disabled>
                Select a service
              </option>
              {services.map((s) => (
                <option key={s.type} value={s.type}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>
        )}
        <Field id="preferredDate" label="Preferred date" optional error={err('preferredDate')}>
          <input {...describe('preferredDate', e)} type="date" min={today} suppressHydrationWarning className={`${inputClass} h-13`} />
        </Field>

        {full && t && service !== 'tasks' && (
          <>
            <Field id="pickupAddress" label={t.from} error={err('pickupAddress')}>
              <input {...describe('pickupAddress', e)} autoComplete="street-address" className={`${inputClass} h-13`} />
            </Field>
            <Field id="destinationAddress" label={t.to} error={err('destinationAddress')}>
              <input {...describe('destinationAddress', e)} className={`${inputClass} h-13`} />
            </Field>
          </>
        )}
        {full && service === 'tasks' && (
          <Field id="pickupAddress" label={copy.tasks.from} optional error={err('pickupAddress')}>
            <input {...describe('pickupAddress', e)} className={`${inputClass} h-13`} />
          </Field>
        )}
        {full && service === 'moving' && (
          <Field id="propertyType" label="Property type" optional error={err('propertyType')}>
            <select {...describe('propertyType', e)} defaultValue="" className={`${inputClass} h-13`}>
              <option value="">Select…</option>
              {propertyTypes.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </Field>
        )}
        {full && service === 'delivery' && (
          <Field id="itemDetails" label="Item details" error={err('itemDetails')} className="sm:col-span-2" hint="What are we picking up? Size, weight and number of pieces help.">
            <textarea {...describe('itemDetails', e, true)} rows={3} className={`${inputClass} resize-y py-3.5`} />
          </Field>
        )}

        <Field
          id="description"
          label={t && full ? t.desc : 'Short description of your request'}
          error={err('description')}
          hint={t && full ? t.descHint : undefined}
          className="sm:col-span-2"
        >
          <textarea {...describe('description', e, Boolean(t && full))} rows={full ? 5 : 3} className={`${inputClass} resize-y py-3.5`} />
        </Field>

        {full && service === 'moving' && (
          <div className="rounded-2xl border border-dashed border-[#d9cec7] bg-cream/60 p-5 sm:col-span-2">
            <p className="text-[0.875rem] font-semibold">Moving checklist</p>
            <p className="mt-1 text-[0.875rem] text-muted">
              Download our checklist, fill it in and attach it here. Please note we do not offer disassembly or assembly services.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <a href={business.movingChecklistUrl} download className={buttonClass('outline-dark', 'min-h-11 px-5 text-sm')}>
                <Download aria-hidden className="size-4" />
                Download checklist (PDF)
              </a>
              <label className={buttonClass('dark', 'min-h-11 cursor-pointer px-5 text-sm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-red')}>
                <FileUp aria-hidden className="size-4" />
                {fileName ? 'Replace file' : 'Attach completed checklist'}
                <input
                  type="file"
                  name="attachment"
                  accept="application/pdf,image/jpeg,image/png,image/webp,image/gif"
                  className="sr-only"
                  onChange={(ev) => setFileName(ev.target.files?.[0]?.name ?? '')}
                  aria-describedby="attachment-status"
                />
              </label>
              <span id="attachment-status" className="text-sm text-muted" aria-live="polite">
                {fileName || 'PDF or image, up to 4 MB'}
              </span>
            </div>
            {err('attachment') && <p className="mt-2 text-[0.8125rem] font-medium text-red">{err('attachment')}</p>}
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p id="booking-note" className="max-w-sm text-[0.8125rem] leading-relaxed text-muted">
          This sends a booking request, not a confirmed appointment. We will contact you to confirm details and provide a quote.
        </p>
        <button type="submit" disabled={state.status === 'submitting'} className={buttonClass('primary', 'w-full shrink-0 sm:w-auto')}>
          {state.status === 'submitting' ? (
            <>
              <LoaderCircle aria-hidden className="size-4 animate-spin" />
              Sending…
            </>
          ) : (
            <>
              Request a Booking
              <ArrowRight aria-hidden className="size-4 transition-transform group-hover/btn:translate-x-1" />
            </>
          )}
        </button>
      </div>
      {!full && (
        <p className="mt-5 flex items-center gap-2 text-[0.8125rem] text-muted">
          <Phone aria-hidden className="size-3.5" /> Prefer to talk?
          <a href={`tel:+1${business.phone.replace(/\D/g, '')}`} className="font-semibold text-text underline-offset-4 hover:underline">
            {business.phone}
          </a>
        </p>
      )}
    </form>
  )
}
