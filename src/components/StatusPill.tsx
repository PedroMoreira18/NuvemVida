import type { CareStatus } from '@/lib/dates'
import { STATUS } from '@/lib/care'
import { cn } from '@/lib/utils'

export const StatusPill = ({ status, label, className }: { status: CareStatus; label?: string; className?: string }) => (
  <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold', STATUS[status].chip, className)}>
    <span className={cn('size-1.5 rounded-full', STATUS[status].dot, status === 'late' && 'animate-pulse')} />
    {label ?? STATUS[status].label}
  </span>
)
