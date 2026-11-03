'use client'

import { useActionState } from 'react'
import { LoaderCircle, LockKeyhole } from 'lucide-react'
import { loginAction } from '@/app/admin/actions'
import { adminInput, keepValuesSubmit } from './ui'

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, null)
  return (
    <form onSubmit={keepValuesSubmit(action)} className="mt-8 space-y-5">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-semibold">
          Email
        </label>
        <input id="email" name="email" type="email" autoComplete="username" required className={`${adminInput} h-12`} />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-semibold">
          Password
        </label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={`${adminInput} h-12`} />
      </div>
      {state?.error && (
        <p role="alert" className="rounded-lg bg-red/[0.06] px-3.5 py-2.5 text-sm font-medium text-red">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-red font-semibold text-white transition-colors hover:bg-red-deep disabled:opacity-60"
      >
        {pending ? <LoaderCircle aria-hidden className="size-4 animate-spin" /> : <LockKeyhole aria-hidden className="size-4" />}
        Sign in
      </button>
    </form>
  )
}
