'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { CircleAlert } from 'lucide-react'
import type { FieldErrors } from '@/lib/validations'

export const inputClass =
  'block w-full rounded-xl border border-line bg-[#fbf9f7] px-4 text-[0.9375rem] text-text placeholder:text-muted/70 transition-[border-color,box-shadow,background-color] duration-200 hover:border-[#d9cec7] focus:border-red focus:bg-white focus:outline-none focus:ring-4 focus:ring-red/10 aria-[invalid=true]:border-red aria-[invalid=true]:bg-red/[0.03]'

export function Field({
  id,
  label,
  error,
  hint,
  optional,
  children,
  className = '',
}: {
  id: string
  label: string
  error?: string
  hint?: ReactNode
  optional?: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 flex items-baseline justify-between gap-3 text-[0.875rem] font-semibold text-text">
        <span>{label}</span>
        {optional && <span className="text-xs font-normal text-muted">Optional</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-[0.8125rem] text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 flex items-start gap-1.5 text-[0.8125rem] font-medium text-red">
          <CircleAlert aria-hidden className="mt-0.5 size-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}

/** Accessible attributes for an input tied to its error/hint. */
export const describe = (id: string, errors: FieldErrors, hint = false) => ({
  id,
  name: id,
  'aria-invalid': errors[id] ? true : undefined,
  'aria-describedby': errors[id] ? `${id}-error` : hint ? `${id}-hint` : undefined,
})

/** Honeypot + timing fields shared by public forms. */
export function SpamGuards() {
  // Set in the browser after mount: a server-rendered time would be stale on cached (ISR) pages
  // and real customers would be dropped as spam.
  const startedAt = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (startedAt.current) startedAt.current.value = String(Date.now())
  }, [])
  return (
    <>
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="company">Company (leave blank)</label>
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>
      {/* No defaultValue: on a hidden input React re-applies it on every re-render, wiping the time
          after a failed validation and making the corrected submission look like spam. */}
      <input ref={startedAt} type="hidden" name="startedAt" />
    </>
  )
}

export type SubmitState = { status: 'idle' | 'submitting' | 'success' | 'error'; message: string; errors: FieldErrors }
export const idle: SubmitState = { status: 'idle', message: '', errors: {} }

export async function postForm(endpoint: string, fd: FormData): Promise<SubmitState> {
  try {
    const res = await fetch(endpoint, { method: 'POST', body: fd })
    const json = (await res.json().catch(() => ({}))) as { success?: boolean; message?: string; errors?: FieldErrors }
    if (res.ok && json.success) return { status: 'success', message: json.message ?? 'Thank you!', errors: {} }
    return { status: 'error', message: json.message ?? 'Something went wrong. Please try again.', errors: json.errors ?? {} }
  } catch {
    return { status: 'error', message: 'We could not reach the server. Please check your connection, or call us directly.', errors: {} }
  }
}

export function focusFirstError(form: HTMLFormElement | null, errors: FieldErrors) {
  const first = Object.keys(errors)[0]
  if (first) (form?.querySelector(`[name="${first}"]`) as HTMLElement | null)?.focus()
}
