import { Building2, Clock3, HeartHandshake, MapPin } from 'lucide-react'
import { trustPoints } from '@/lib/content'

const icons = { building: Building2, heart: HeartHandshake, clock: Clock3, pin: MapPin }

export function TrustStrip() {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4 lg:gap-x-0">
      {trustPoints.map((p, i) => {
        const Icon = icons[p.icon]
        return (
          <li
            key={p.title}
            className={`flex flex-col items-start gap-3 sm:flex-row sm:gap-4 sm:px-6 ${i % 2 === 1 ? 'sm:border-l sm:border-line' : ''} ${i > 0 ? 'lg:border-l lg:border-line' : ''}`}
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-full border border-red/25 text-red">
              <Icon aria-hidden className="size-5" strokeWidth={1.75} />
            </span>
            <span>
              <span className="block text-[0.9375rem] font-semibold leading-tight">{p.title}</span>
              <span className="mt-1 block text-[0.8125rem] leading-snug text-muted">{p.text}</span>
            </span>
          </li>
        )
      })}
    </ul>
  )
}
