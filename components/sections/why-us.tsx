import Image from 'next/image'
import { about } from '@/lib/content'
import { ButtonLink } from '@/components/ui/button'
import { Reveal } from '@/components/ui/reveal'
import { SafeImage } from '@/components/ui/safe-image'

const principles = [
  { title: 'We shop, move, pick up & deliver', text: 'Whatever needs doing around your home or office, we get it to you when you need it.' },
  { title: 'Relationships, not transactions', text: "Our concierges get to know you, so you know what you're getting each and every time." },
  { title: 'Homes and businesses alike', text: 'From residential moves to corporate and event deliveries.' },
]

export function WhyUs({ image }: { image: string }) {
  return (
    <section className="section-y relative overflow-hidden bg-cream" aria-labelledby="why-title">
      <div className="container-x grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
        <Reveal className="relative">
          <div className="relative aspect-[5/4] overflow-hidden rounded-[22px] bg-ink-2 shadow-lift sm:aspect-[4/3.4] lg:aspect-[4/4.6]">
            <SafeImage
              src={image}
              fallback="/images/photos/couple-at-home.jpg"
              alt="A couple relaxing together at home"
              fill
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="object-cover object-[50%_35%]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(200deg,transparent_45%,rgb(16_16_18/0.7))]" />
            <div className="absolute bottom-7 right-7 text-right text-white sm:bottom-9 sm:right-9">
              <p className="font-serif text-[clamp(2rem,1.4rem+2vw,3rem)] italic leading-[0.95]">
                Your time.
                <br />
                Our priority.
              </p>
              <svg viewBox="0 0 220 24" className="swash ml-auto mt-2 w-40 sm:w-48" fill="none" aria-hidden>
                <path d="M4 17C52 7 118 4 216 9" stroke="#e44442" strokeWidth="3" strokeLinecap="round" pathLength={1} />
              </svg>
            </div>
          </div>
          {/* Layered inset: real moving-day photo from the client */}
          <div className="absolute -bottom-10 -left-4 hidden w-[38%] overflow-hidden rounded-[16px] border-[6px] border-cream shadow-lift md:block lg:-left-10">
            <Image src="/images/services/moving-boxes.jpg" alt="" width={800} height={583} sizes="20vw" className="aspect-[4/3] h-auto w-full object-cover" />
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="text-eyebrow eyebrow-rule text-red">Why choose us</p>
          <h2 id="why-title" className="mt-6 text-h2">
            More Time for <span className="em-red">What Matters</span>
          </h2>
          <p className="mt-7 text-lead text-muted">
            We&rsquo;re more than a service. We&rsquo;re your convenience partner. We understand how busy life gets at home and work. Our
            customer-service-focused approach is built around understanding your needs, building relationships, and taking care of the details.
          </p>
          <ol className="mt-9 space-y-6">
            {principles.map((p, i) => (
              <li key={p.title} className="grid grid-cols-[2.5rem_1fr] gap-x-3 border-t border-line pt-6">
                <span className="font-serif text-xl italic text-red">0{i + 1}</span>
                <span>
                  <span className="block font-semibold">{p.title}</span>
                  <span className="mt-1 block text-[0.9375rem] leading-relaxed text-muted">{p.text}</span>
                </span>
              </li>
            ))}
          </ol>
          <ButtonLink href="/about" variant="dark" className="mt-10">
            Learn More About Us
          </ButtonLink>
          <p className="sr-only">{about.clients}</p>
        </Reveal>
      </div>
    </section>
  )
}
