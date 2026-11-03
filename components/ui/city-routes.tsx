/**
 * Animated background: Toronto's street grid (rotated ~16.7°, like the real downtown grid) with
 * delivery routes travelling across it. Pure SVG + CSS, decorative, honours prefers-reduced-motion.
 */
type Tone = 'dark' | 'red' | 'light'

const palette: Record<Tone, { grid: string; major: string; route: string; runner: string; pin: string }> = {
  dark: { grid: 'rgb(255 255 255 / 0.035)', major: 'rgb(255 255 255 / 0.07)', route: 'rgb(228 68 66 / 0.45)', runner: '#ff6b5e', pin: '#e44442' },
  red: { grid: 'rgb(255 255 255 / 0.06)', major: 'rgb(255 255 255 / 0.12)', route: 'rgb(255 255 255 / 0.32)', runner: '#ffffff', pin: '#ffffff' },
  light: { grid: 'rgb(33 31 32 / 0.045)', major: 'rgb(33 31 32 / 0.08)', route: 'rgb(200 16 46 / 0.32)', runner: '#c8102e', pin: '#c8102e' },
}

const S = 90 // block size
const routes = [
  { d: `M${-2 * S} ${3 * S} H${5 * S} V${6 * S} H${11 * S} V${9 * S} H${19 * S}`, dur: '13s', delay: '0s' },
  { d: `M${3 * S} ${-2 * S} V${2 * S} H${9 * S} V${5 * S} H${14 * S} V${12 * S}`, dur: '11s', delay: '-4s' },
  { d: `M${8 * S} ${13 * S} V${8 * S} H${4 * S} V${4 * S} H${-1 * S}`, dur: '15s', delay: '-7s' },
  { d: `M${12 * S} ${-1 * S} V${3 * S} H${17 * S} V${7 * S} H${21 * S}`, dur: '12s', delay: '-2s' },
  { d: `M${16 * S} ${12 * S} V${10 * S} H${10 * S} V${7 * S} H${6 * S}`, dur: '14s', delay: '-9s' },
]
const pins: [number, number, string][] = [
  [11 * S, 6 * S, '0s'],
  [9 * S, 2 * S, '-1.2s'],
  [4 * S, 8 * S, '-2.1s'],
  [17 * S, 3 * S, '-0.6s'],
  [10 * S, 10 * S, '-2.6s'],
]

export function CityRoutes({ tone = 'dark', className = '', fade = true }: { tone?: Tone; className?: string; fade?: boolean }) {
  const c = palette[tone]
  const lines = Array.from({ length: 26 }, (_, i) => (i - 4) * S)
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={fade ? { maskImage: 'radial-gradient(ellipse 75% 70% at 60% 50%, #000 30%, transparent 85%)' } : undefined}
    >
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" fill="none">
        <g transform="rotate(-16.7 800 450) translate(-120 -260) scale(1.22)">
          {lines.map((p, i) => (
            <g key={p} stroke={i % 4 === 0 ? c.major : c.grid} strokeWidth={i % 4 === 0 ? 1.4 : 1}>
              <line x1={p} y1={-6 * S} x2={p} y2={18 * S} />
              <line x1={-6 * S} y1={p} x2={26 * S} y2={p} />
            </g>
          ))}
          {routes.map((r, i) => (
            <g key={i} strokeLinecap="round" strokeLinejoin="round">
              <path d={r.d} stroke={c.route} strokeWidth="1.6" className={`route-line ${i % 2 ? 'rev slow' : ''}`} />
              <path
                d={r.d}
                stroke={c.runner}
                strokeWidth="2.6"
                pathLength={1400}
                className="route-runner"
                style={{ ['--dur' as string]: r.dur, ['--delay' as string]: r.delay }}
              />
            </g>
          ))}
          {pins.map(([x, y, delay]) => (
            <g key={`${x}-${y}`}>
              <circle cx={x} cy={y} r="5" fill={c.pin} opacity="0.5" className="pin-ping" style={{ ['--delay' as string]: delay }} />
              <circle cx={x} cy={y} r="3.2" fill={c.pin} />
            </g>
          ))}
        </g>
      </svg>
    </div>
  )
}
