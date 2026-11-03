'use client'

import { createContext, startTransition, useActionState, useContext, useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { CircleAlert, CircleCheck, LoaderCircle } from 'lucide-react'
import type { ActionState } from '@/app/admin/actions'

export const adminInput =
  'block w-full rounded-lg border border-[#e3dad3] bg-white px-3.5 py-2.5 text-[0.9375rem] text-text transition-[border-color,box-shadow] focus:border-red focus:outline-none focus:ring-4 focus:ring-red/10 aria-[invalid=true]:border-red'

const ErrorsCtx = createContext<Record<string, string[] | undefined>>({})

/** Form bound to a server action, with inline success/error feedback and field errors. */
export function AdminForm({
  action,
  children,
  className = '',
  resetOnSuccess = false,
}: {
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>
  children: ReactNode
  className?: string
  resetOnSuccess?: boolean
}) {
  const [state, formAction, pending] = useActionState(action, null)
  const [key, setKey] = useState(0)
  const [seen, setSeen] = useState<ActionState>(null)
  if (state !== seen) {
    setSeen(state)
    if (state?.ok && resetOnSuccess) setKey((k) => k + 1)
  }
  return (
    <ErrorsCtx.Provider value={state?.errors ?? {}}>
      <PendingCtx.Provider value={pending}>
        {/* Submitting via a transition (not `action=`) keeps typed values when validation fails. */}
        <form key={key} onSubmit={keepValuesSubmit(formAction)} className={className}>
          {children}
          <Notice state={state} />
        </form>
      </PendingCtx.Provider>
    </ErrorsCtx.Provider>
  )
}

const PendingCtx = createContext(false)

export function keepValuesSubmit(formAction: (fd: FormData) => void) {
  return (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(() => formAction(fd))
  }
}

export function Notice({ state }: { state: ActionState }) {
  const [hidden, setHidden] = useState<ActionState>(null)
  useEffect(() => {
    if (!state?.ok) return
    const t = setTimeout(() => setHidden(state), 4000)
    return () => clearTimeout(t)
  }, [state])
  if (!state || hidden === state || (!state.message && !state.error)) return <div aria-live="polite" />
  return (
    <div
      role={state.ok ? 'status' : 'alert'}
      aria-live="polite"
      className={`mt-4 flex items-start gap-2 rounded-lg px-3.5 py-2.5 text-sm font-medium ${state.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-red/[0.06] text-red'}`}
    >
      {state.ok ? <CircleCheck aria-hidden className="mt-0.5 size-4 shrink-0" /> : <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />}
      {state.ok ? state.message : state.error}
    </div>
  )
}

export function AdminField({ name, label, children, hint }: { name: string; label: string; children: ReactNode; hint?: ReactNode }) {
  const errors = useContext(ErrorsCtx)
  const err = errors[name]?.[0]
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-semibold">
        {label}
      </label>
      {children}
      {err ? (
        <p id={`${name}-error`} className="mt-1 text-xs font-medium text-red">
          {err}
        </p>
      ) : (
        hint && <p className="mt-1 text-xs text-muted">{hint}</p>
      )}
    </div>
  )
}

export function useFieldError(name: string) {
  return useContext(ErrorsCtx)[name]?.[0]
}

export function SubmitButton({ children, variant = 'primary', className = '' }: { children: ReactNode; variant?: 'primary' | 'ghost'; className?: string }) {
  const pending = useContext(PendingCtx)
  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors disabled:opacity-60 ${
        variant === 'primary' ? 'bg-red text-white hover:bg-red-deep' : 'border border-[#e3dad3] bg-white hover:bg-cream'
      } ${className}`}
    >
      {pending && <LoaderCircle aria-hidden className="size-4 animate-spin" />}
      {children}
    </button>
  )
}

/** Runs a server action after a native confirmation prompt. */
export function ConfirmButton({
  action,
  message,
  children,
  className = '',
}: {
  action: () => Promise<void>
  message: string
  children: ReactNode
  className?: string
}) {
  const [pending, setPending] = useState(false)
  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        if (!window.confirm(message)) return
        setPending(true)
        try {
          await action()
        } finally {
          setPending(false)
        }
      }}
      className={`inline-flex min-h-10 items-center gap-2 rounded-lg px-3.5 text-sm font-semibold text-red transition-colors hover:bg-red/[0.06] disabled:opacity-60 ${className}`}
    >
      {pending && <LoaderCircle aria-hidden className="size-4 animate-spin" />}
      {children}
    </button>
  )
}

export function ActionButton({ action, children, label, className = '' }: { action: () => Promise<void>; children: ReactNode; label: string; className?: string }) {
  const [pending, setPending] = useState(false)
  return (
    <button
      type="button"
      aria-label={label}
      disabled={pending}
      onClick={async () => {
        setPending(true)
        try {
          await action()
        } finally {
          setPending(false)
        }
      }}
      className={`grid size-9 place-items-center rounded-lg border border-[#e3dad3] bg-white text-text transition-colors hover:bg-cream disabled:opacity-40 ${className}`}
    >
      {children}
    </button>
  )
}
