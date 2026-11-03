import type { ReactNode } from 'react'

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-serif text-[2.4rem] leading-none">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  )
}

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-[#e8e0da] bg-white ${className}`}>{children}</div>
}

const statusStyles: Record<string, string> = {
  new: 'bg-red text-white',
  contacted: 'bg-amber-100 text-amber-900',
  'in-progress': 'bg-sky-100 text-sky-900',
  completed: 'bg-emerald-100 text-emerald-900',
  archived: 'bg-stone-200 text-stone-700',
  published: 'bg-emerald-100 text-emerald-900',
  draft: 'bg-stone-200 text-stone-700',
}
export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusStyles[status] ?? 'bg-stone-100'}`}>
      {status.replace('-', ' ')}
    </span>
  )
}
