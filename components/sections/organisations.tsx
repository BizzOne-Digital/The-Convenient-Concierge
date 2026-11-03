import { organisations } from '@/lib/content'
import { Reveal } from '@/components/ui/reveal'

/** Editorial client index: text wordmarks only (no third-party logos reproduced). */
export function Organisations({ headingLevel = 'h2' }: { headingLevel?: 'h2' | 'h3' }) {
  const H = headingLevel
  return (
    <section className="section-y bg-paper" aria-labelledby="orgs-title">
      <div className="container-x">
        <Reveal className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="text-eyebrow eyebrow-rule text-red">Trusted by</p>
            <H id="orgs-title" className="mt-6 max-w-3xl text-h2">
              Organisations we&rsquo;ve had the pleasure of <span className="em-red">working with</span>
            </H>
          </div>
          <p className="max-w-md text-muted lg:justify-self-end">
            From colleges and law firms to restaurants, real estate teams, design studios and productions. Corporate clients who count on us for
            deliveries, moves and errands.
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <ol className="mt-14 columns-1 gap-x-12 sm:columns-2 lg:columns-3">
            {organisations.map((name, i) => (
              <li key={name} className="group flex break-inside-avoid items-baseline gap-4 border-t border-line py-4">
                <span className="w-7 shrink-0 text-xs font-semibold tabular-nums text-muted transition-colors group-hover:text-red">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="font-serif text-[1.35rem] leading-tight transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1">
                  {name}
                </span>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  )
}
