'use client'

import { useRef, useState, type FormEvent } from 'react'
import { ArrowRight, CircleCheck, LoaderCircle } from 'lucide-react'
import { contactSchema, fieldErrors } from '@/lib/validations'
import { buttonClass } from '@/components/ui/button'
import { Field, SpamGuards, describe, focusFirstError, idle, inputClass, postForm, type SubmitState } from './fields'

export function ContactForm() {
  const [state, setState] = useState<SubmitState>(idle)
  const form = useRef<HTMLFormElement>(null)
  const e = state.errors
  const err = (k: string) => e[k]?.[0]

  async function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault()
    const fd = new FormData(ev.currentTarget)
    const parsed = contactSchema.safeParse(Object.fromEntries(fd))
    if (!parsed.success) {
      const errors = fieldErrors(parsed.error)
      setState({ status: 'error', message: 'Please check the highlighted fields.', errors })
      requestAnimationFrame(() => focusFirstError(form.current, errors))
      return
    }
    setState({ ...idle, status: 'submitting' })
    setState(await postForm('/api/contact', fd))
  }

  if (state.status === 'success')
    return (
      <div role="status" className="py-10 text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-red/[0.08] text-red">
          <CircleCheck aria-hidden className="size-8" strokeWidth={1.75} />
        </span>
        <h3 className="mt-6 text-h3">Message sent</h3>
        <p className="mx-auto mt-3 max-w-sm text-muted">{state.message}</p>
      </div>
    )

  return (
    <form ref={form} onSubmit={onSubmit} noValidate className="relative grid gap-5 sm:grid-cols-2">
      <SpamGuards />
      {state.status === 'error' && state.message && (
        <div role="alert" className="rounded-xl border border-red/25 bg-red/[0.05] px-4 py-3 text-sm font-medium text-red sm:col-span-2">
          {state.message}
        </div>
      )}
      <Field id="name" label="Your name" error={err('name')}>
        <input {...describe('name', e)} autoComplete="name" className={`${inputClass} h-13`} />
      </Field>
      <Field id="email" label="Email address" error={err('email')}>
        <input {...describe('email', e)} type="email" autoComplete="email" className={`${inputClass} h-13`} />
      </Field>
      <Field id="phone" label="Phone number" optional error={err('phone')} className="sm:col-span-2">
        <input {...describe('phone', e)} type="tel" autoComplete="tel" className={`${inputClass} h-13`} />
      </Field>
      <Field id="message" label="How can we help?" error={err('message')} className="sm:col-span-2">
        <textarea {...describe('message', e)} rows={6} className={`${inputClass} resize-y py-3.5`} />
      </Field>
      <div className="sm:col-span-2">
        <button type="submit" disabled={state.status === 'submitting'} className={buttonClass('primary', 'w-full sm:w-auto')}>
          {state.status === 'submitting' ? (
            <>
              <LoaderCircle aria-hidden className="size-4 animate-spin" /> Sending…
            </>
          ) : (
            <>
              Send Message <ArrowRight aria-hidden className="size-4 transition-transform group-hover/btn:translate-x-1" />
            </>
          )}
        </button>
      </div>
    </form>
  )
}
