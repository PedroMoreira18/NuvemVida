import { useId, type CSSProperties } from 'react'
import { cn } from '@/lib/utils'

const perforationMask =
  'radial-gradient(circle, transparent 3px, #000 3.6px) -6px -6px / 12px 12px round, linear-gradient(#000 0 0) 6px 6px / calc(100% - 12px) calc(100% - 12px) no-repeat'

const perforation: CSSProperties = {
  WebkitMask: perforationMask,
  mask: perforationMask,
}

type StickerProps = {
  vaccine: string
  maker?: string
  lot?: string
  date: string
  tone?: 'brand' | 'teal' | 'orange' | 'mint'
  className?: string
  style?: CSSProperties
}

const TONES = {
  brand: { band: '#9403a6', paper: '#fffdff' },
  teal: { band: '#2aa49c', paper: '#fbfffe' },
  orange: { band: '#f08a0c', paper: '#fffdf8' },
  mint: { band: '#5b9aae', paper: '#fbfdff' },
}

export const VaccineSticker = ({ vaccine, maker = 'Uso veterinário', lot, date, tone = 'brand', className, style }: StickerProps) => {
  const t = TONES[tone]
  return (
    <div
      className={cn('w-44 select-none drop-shadow-[0_8px_14px_rgb(42_18_51/0.18)]', className)}
      style={style}
      aria-label={`Selo da vacina ${vaccine}, ${date}`}
      role="img"
    >
      <div className="p-[3px]" style={{ ...perforation, background: t.paper }}>
        <div className="px-3 pt-2.5 pb-2 text-white" style={{ background: t.band }}>
          <p className="font-display text-[1.05rem] leading-tight font-bold tracking-[-0.02em]">{vaccine}</p>
          <p className="text-[0.62rem] font-semibold tracking-wide uppercase opacity-85">{maker}</p>
        </div>
        <div className="flex items-end justify-between gap-2 px-3 pt-2 pb-2.5 text-[#2a1233]">
          <div className="font-mono text-[0.62rem] leading-snug">
            {lot && <p>LOTE {lot}</p>}
            <p>{date}</p>
          </div>
          <Barcode />
        </div>
      </div>
    </div>
  )
}

const Barcode = () => (
  <svg viewBox="0 0 40 16" className="h-4 w-10 text-[#2a1233]" aria-hidden="true">
    {[0, 3, 5, 9, 11, 14, 18, 20, 23, 27, 29, 32, 35, 38].map((x, i) => (
      <rect key={x} x={x} y="0" width={i % 3 === 0 ? 2 : 1} height="16" fill="currentColor" />
    ))}
  </svg>
)

type SealProps = { clinic: string; vet: string; className?: string; style?: CSSProperties; color?: string }

export const ClinicSeal = ({ clinic, vet, className, style, color = 'var(--teal)' }: SealProps) => {
  const id = useId().replace(/:/g, '')
  return (
    <svg viewBox="0 0 120 120" className={cn('size-28', className)} style={{ color, ...style }} aria-hidden="true">
      <defs>
        <path id={`ring-${id}`} d="M60 60 m-43 0 a43 43 0 1 1 86 0 a43 43 0 1 1 -86 0" />
        <filter id={`ink-${id}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.4 1.55" />
          <feComposite in="SourceGraphic" operator="in" />
        </filter>
      </defs>
      <g filter={`url(#ink-${id})`} fill="none" stroke="currentColor">
        <circle cx="60" cy="60" r="56" strokeWidth="3" />
        <circle cx="60" cy="60" r="33" strokeWidth="1.5" />
        <text fill="currentColor" stroke="none" fontSize="10.5" fontWeight="700" letterSpacing="1.6" fontFamily="var(--font-sans)">
          <textPath href={`#ring-${id}`} startOffset="0">
            {`${clinic.toUpperCase()} · `.repeat(2).slice(0, 52)}
          </textPath>
        </text>
        <text x="60" y="57" textAnchor="middle" fill="currentColor" stroke="none" fontSize="9" fontWeight="700" fontFamily="var(--font-sans)">
          {vet.split(' ').slice(0, 2).join(' ')}
        </text>
        <text x="60" y="70" textAnchor="middle" fill="currentColor" stroke="none" fontSize="7.5" fontFamily="var(--font-mono)">
          CRMV-PE
        </text>
      </g>
    </svg>
  )
}
