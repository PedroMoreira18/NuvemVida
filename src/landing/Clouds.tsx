import { cn } from '@/lib/utils'

const LOBES: [number, number, number][] = [
  [52, 84, 44],
  [100, 58, 54],
  [152, 80, 44],
  [80, 104, 34],
  [126, 106, 34],
]

export const Cloud = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 200 140" className={cn('pointer-events-none', className)} aria-hidden="true">
    <g fill="currentColor">
      {LOBES.map(([cx, cy, r]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />
      ))}
    </g>
  </svg>
)

export const CloudEdge = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className={cn('pointer-events-none block h-16 w-full sm:h-24', className)} aria-hidden="true">
    <path
      fill="currentColor"
      d="M0 120V70c40-30 90-38 140-20 30-40 100-52 150-20 40-34 110-36 150 4 40-30 100-30 140 0 40-44 120-50 170-10 36-26 96-28 130 6 44-40 120-44 170-4 40-28 100-26 136 8 40-30 96-30 134 0 36-22 80-22 120 2V120Z"
    />
  </svg>
)
