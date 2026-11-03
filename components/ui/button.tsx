import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { ComponentProps, ReactNode } from 'react'

type Variant = 'primary' | 'light' | 'outline-light' | 'dark' | 'outline-dark'
const base =
  'group/btn inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full px-6 text-[0.9375rem] font-semibold tracking-[0.01em] transition-[background-color,color,box-shadow,transform,border-color] duration-300 ease-[var(--ease-out-expo)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60'
const variants: Record<Variant, string> = {
  primary: 'bg-red text-white shadow-[0_10px_30px_-12px_rgb(200_16_46/0.7)] hover:bg-red-deep hover:shadow-[0_14px_34px_-12px_rgb(200_16_46/0.85)]',
  light: 'bg-white text-ink hover:bg-cream',
  'outline-light': 'border border-white/45 text-white hover:border-white hover:bg-white/10',
  dark: 'bg-ink text-white hover:bg-ink-2',
  'outline-dark': 'border border-text/25 text-text hover:border-text hover:bg-text/[0.04]',
}

export const buttonClass = (variant: Variant = 'primary', extra = '') => `${base} ${variants[variant]} ${extra}`

const Arrow = () => (
  <ArrowRight aria-hidden className="size-4 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover/btn:translate-x-1" />
)

export function ButtonLink({
  href,
  variant = 'primary',
  arrow = true,
  className = '',
  children,
  ...rest
}: { href: string; variant?: Variant; arrow?: boolean; children: ReactNode } & Omit<ComponentProps<'a'>, 'href'>) {
  const external = /^(https?:|mailto:|tel:)/.test(href) || href.endsWith('.pdf')
  const cls = buttonClass(variant, className)
  const inner = (
    <>
      {children}
      {arrow && <Arrow />}
    </>
  )
  return external ? (
    <a href={href} className={cls} {...rest}>
      {inner}
    </a>
  ) : (
    <Link href={href} className={cls} {...rest}>
      {inner}
    </Link>
  )
}

/** Understated text link with a sliding arrow. */
export function ArrowLink({ href, children, className = '' }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link href={href} className={`group/link inline-flex items-center gap-2 font-semibold text-red ${className}`}>
      <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-500 ease-[var(--ease-out-expo)] group-hover/link:bg-[length:100%_1px]">
        {children}
      </span>
      <ArrowRight aria-hidden className="size-4 transition-transform duration-300 group-hover/link:translate-x-1" />
    </Link>
  )
}
