import { ClipboardCheck, House, Truck, type LucideProps } from 'lucide-react'
import { business, type Service } from '@/lib/content'

export function ServiceIcon({ icon, ...props }: { icon: Service['icon'] } & LucideProps) {
  const Icon = icon === 'moving' ? House : icon === 'delivery' ? Truck : ClipboardCheck
  return <Icon aria-hidden strokeWidth={1.75} {...props} />
}

// Brand glyphs (lucide no longer ships brand icons).
export function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M13.5 21v-7.5h2.5l.4-3H13.5V8.6c0-.9.25-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5V21h3z" />
    </svg>
  )
}
export function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function SocialLinks({ className = '' }: { className?: string }) {
  return (
    <ul className={`flex items-center gap-2 ${className}`}>
      {business.social.map(({ label, href }) => ({ label, href, Icon: label === 'Facebook' ? FacebookIcon : InstagramIcon })).map(({ label, href, Icon }) => (
        <li key={label}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${label} (opens in a new tab)`}
            className="grid size-11 place-items-center rounded-full border border-white/15 text-white/80 transition-colors hover:border-white/40 hover:bg-white/5 hover:text-white"
          >
            <Icon className="size-[18px]" />
          </a>
        </li>
      ))}
    </ul>
  )
}
