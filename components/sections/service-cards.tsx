import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { services } from '@/lib/content'
import { ServiceIcon } from '@/components/ui/icons'
import { SafeImage } from '@/components/ui/safe-image'
import { Reveal } from '@/components/ui/reveal'

export function ServiceCards({ images, className = '' }: { images: Record<string, string>; className?: string }) {
  return (
    <ul className={`grid gap-5 md:grid-cols-3 lg:gap-7 ${className}`}>
      {services.map((s, i) => (
        <Reveal as="li" key={s.slug} delay={i * 0.08}>
          <article className="group relative flex h-full flex-col overflow-hidden rounded-[18px] bg-paper shadow-card ring-1 ring-black/[0.03] transition-[box-shadow,translate] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1.5 hover:shadow-lift">
            <div className="relative aspect-[16/11] overflow-hidden bg-ink">
              <SafeImage
                src={images[s.type] ?? s.images[0]!.src}
                fallback={s.images[0]!.src}
                alt={s.images[0]!.alt}
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-[1.05]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/45 via-transparent to-transparent" />
              <span className="absolute left-5 top-5 font-serif text-lg italic text-white/90">0{i + 1}</span>
            </div>
            <div className="relative flex flex-1 flex-col px-6 pb-7 pt-11 sm:px-7">
              <span className="absolute -top-7 left-6 grid size-14 place-items-center rounded-full bg-red text-white shadow-[0_10px_24px_-10px_rgb(200_16_46/0.8)] ring-[6px] ring-paper sm:left-7">
                <ServiceIcon icon={s.icon} className="size-6" />
              </span>
              <h3 className="text-[1.5rem] font-semibold leading-tight tracking-[-0.01em]">{s.name}</h3>
              <p className="mt-3 flex-1 text-[0.9375rem] leading-relaxed text-muted">{s.summary}</p>
              <Link
                href={`/services/${s.slug}`}
                className="mt-6 inline-flex items-center gap-2 text-[0.9375rem] font-semibold text-red after:absolute after:inset-0 after:content-['']"
              >
                {s.cardCta}
                <ArrowRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </article>
        </Reveal>
      ))}
    </ul>
  )
}
