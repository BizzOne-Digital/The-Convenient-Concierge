'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useReducedMotion } from 'motion/react'

// Illustrative examples drawn from the real service list.
const items = [
  { task: 'Collect Marketplace find', meta: 'Pick-up & Delivery' },
  { task: 'Weekly grocery run', meta: 'Tasks & Errands' },
  { task: 'Move sofa to storage', meta: 'Moving' },
  { task: 'Gift & card for Mom', meta: 'Tasks & Errands' },
  { task: 'Drop off donations', meta: 'Pick-up & Delivery' },
]

/** Decorative "today's list" that checks itself off: the brand promise, shown rather than told. */
export function HeroList() {
  const reduce = useReducedMotion()
  const [done, setDone] = useState(0)

  useEffect(() => {
    if (reduce) return
    let t: ReturnType<typeof setTimeout>
    const step = (n: number) => {
      t = setTimeout(
        () => {
          const next = n >= items.length + 2 ? 0 : n + 1
          setDone(next)
          step(next)
        },
        n === 0 ? 1400 : n > items.length ? 2200 : 1250,
      )
    }
    step(0)
    return () => clearTimeout(t)
  }, [reduce])

  const shown = reduce ? items.length : Math.min(done, items.length)
  const complete = shown === items.length

  return (
    <div aria-hidden className="relative mx-auto w-full max-w-[22rem] select-none">
      {/* Clock arc from the logo: draws in, with a dot that orbits once per minute */}
      <svg viewBox="0 0 400 400" className="absolute -inset-[18%] h-[136%] w-[136%] overflow-visible" fill="none">
        <path d="M200 26 A174 174 0 1 1 61 95" stroke="#e44442" strokeWidth="1.6" strokeLinecap="round" pathLength={1} className="arc-draw" opacity="0.9" />
        <path d="M52 78 L61 95 L79 88" stroke="#e44442" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="rise" style={{ ['--d' as string]: 2300 }} />
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((a) => (
          <line key={a} x1="200" y1="14" x2="200" y2={a % 90 === 0 ? 30 : 22} stroke="rgb(255 255 255 / 0.28)" strokeWidth="1.4" transform={`rotate(${a} 200 200)`} />
        ))}
        <g className="orbit">
          <circle cx="200" cy="26" r="4.5" fill="#e44442" />
          <circle cx="200" cy="26" r="11" fill="#e44442" opacity="0.18" />
        </g>
      </svg>

      <div className="relative rotate-[-2.5deg] rounded-[14px] bg-[#fdfcfa] px-7 pb-7 pt-8 text-text shadow-paper">
        {/* paper clip */}
        <span className="absolute -top-3 left-1/2 h-7 w-16 -translate-x-1/2 rounded-md bg-red shadow-[0_6px_14px_-6px_rgb(169_15_37/0.8)]" />
        <div className="flex items-center justify-between">
          <p className="font-serif text-[1.9rem] italic leading-none">Today&rsquo;s list</p>
          <Image src="/images/brand/clock-mark.png" alt="" width={60} height={60} className="h-8 w-auto opacity-90" />
        </div>
        <ul className="mt-6 space-y-[0.95rem]">
          {items.map((it, i) => {
            const checked = i < shown
            return (
              <li key={it.task} className="flex items-start gap-3.5">
                <span
                  className={`mt-0.5 grid size-[22px] shrink-0 place-items-center rounded-full border-[1.5px] transition-all duration-500 ease-[var(--ease-out-expo)] ${
                    checked ? 'scale-100 border-red bg-red' : 'border-[#cbbfb7] bg-transparent'
                  }`}
                >
                  <svg viewBox="0 0 16 16" className="size-3" fill="none">
                    <path
                      d="M3.5 8.5l3 3 6-7"
                      stroke="#fff"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      pathLength={1}
                      style={{ strokeDasharray: 1, strokeDashoffset: checked ? 0 : 1, transition: 'stroke-dashoffset .45s .15s cubic-bezier(.16,1,.3,1)' }}
                    />
                  </svg>
                </span>
                <span className="min-w-0">
                  <span className="relative block text-[0.98rem] font-medium leading-snug">
                    <span className={`transition-colors duration-500 ${checked ? 'text-muted' : ''}`}>{it.task}</span>
                    <span
                      className="absolute left-0 top-[55%] h-[1.5px] w-full origin-left rounded-full bg-red/80 transition-transform duration-700 ease-[var(--ease-out-expo)]"
                      style={{ transform: `scaleX(${checked ? 1 : 0})` }}
                    />
                  </span>
                  <span className="mt-0.5 block text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-muted/80">{it.meta}</span>
                </span>
              </li>
            )
          })}
        </ul>
        <div className="mt-6 flex items-end justify-between border-t border-dashed border-line pt-5">
          <p className="text-[0.8rem] leading-snug text-muted">
            Handled by
            <br />
            <span className="font-semibold text-text">The Convenient Concierge</span>
          </p>
          <p
            className={`-rotate-6 rounded-md border-2 border-red px-2.5 py-0.5 font-serif text-[1.6rem] italic leading-none text-red transition-all duration-700 ease-[var(--ease-out-expo)] ${
              complete ? 'scale-100 opacity-100' : 'scale-125 opacity-0'
            }`}
          >
            Done.
          </p>
        </div>
      </div>
    </div>
  )
}
