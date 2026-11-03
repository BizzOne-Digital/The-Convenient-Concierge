import Image from 'next/image'
import { CityRoutes } from '@/components/ui/city-routes'

const TAGLINE = 'Life gets busy. Let us handle the details.'

// Runs before first paint: shows the splash once per session, never for reduced-motion users or without JS.
// Click or Escape skips it; it removes itself after the sequence.
const SCRIPT = `(function(){try{var d=document.documentElement;if(sessionStorage.getItem('tcc-splash')||matchMedia('(prefers-reduced-motion: reduce)').matches)return;sessionStorage.setItem('tcc-splash','1');d.dataset.splash='on';var off=function(){d.dataset.splash='done'};setTimeout(off,3500);addEventListener('keydown',function(e){if(e.key==='Escape')off()});document.addEventListener('click',function(e){if(e.target.closest&&e.target.closest('#tcc-splash'))off()})}catch(e){}})()`

const ticks = Array.from({ length: 12 }, (_, i) => i * 30)

export function Splash() {
  let n = 0
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />
      <div id="tcc-splash" aria-hidden className="grain">
        <CityRoutes tone="dark" className="splash-grid" />

        <div className="splash-stage">
          <svg className="splash-clock" viewBox="0 0 200 200" fill="none">
            <circle cx="100" cy="100" r="78" stroke="rgb(255 255 255 / 0.06)" strokeWidth="1" />
            {ticks.map((a, i) => (
              <g key={a} transform={`rotate(${a} 100 100)`}>
                <line
                  className="splash-tick"
                  style={{ ['--i' as string]: i }}
                  x1="100"
                  y1="30"
                  x2="100"
                  y2={a % 90 === 0 ? 44 : 38}
                  stroke={a % 90 === 0 ? '#ffffff' : 'rgb(255 255 255 / 0.45)'}
                  strokeWidth={a % 90 === 0 ? 2.4 : 1.6}
                  strokeLinecap="round"
                />
              </g>
            ))}
            <path className="splash-arc" d="M100 12 A88 88 0 1 1 33 43" stroke="#e44442" strokeWidth="5" strokeLinecap="round" pathLength={1} />
            <path className="splash-arrow" d="M20 34 L33 43 L40 28" stroke="#e44442" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            <line className="splash-hour" x1="100" y1="100" x2="100" y2="66" stroke="#e44442" strokeWidth="5" strokeLinecap="round" />
            <line className="splash-minute" x1="100" y1="100" x2="100" y2="46" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
            <circle cx="100" cy="100" r="6" fill="#e44442" />
          </svg>

          <Image className="splash-logo" src="/images/brand/logo-on-dark.png" alt="" width={900} height={498} sizes="340px" loading="eager" />

          <p className="splash-tagline">
            {TAGLINE.split(' ').map((word, w) => (
              <span key={w} className="splash-word">
                {[...word].map((ch) => (
                  <span key={n} className="splash-char" style={{ ['--i' as string]: n++ }}>
                    {ch}
                  </span>
                ))}
              </span>
            ))}
          </p>
        </div>

        <div className="splash-meta">
          <span>Moving · Deliveries · Tasks &amp; Errands</span>
          <span className="splash-count" />
        </div>
        <div className="splash-progress">
          <span />
        </div>
        <div className="splash-ring" />
      </div>
    </>
  )
}
