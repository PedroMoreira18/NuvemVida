import { FirstAidKit, Pill, Scales, Stethoscope, Syringe, TestTube } from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import type { CareType, MemberRole } from '@/data/types'
import type { CareStatus } from './dates'

type CareMeta = { label: string; plural: string; icon: Icon; tint: string; ink: string; dot: string }

export const CARE: Record<CareType, CareMeta> = {
  vacina: { label: 'Vacina', plural: 'Vacinas', icon: Syringe, tint: 'bg-brand-soft', ink: 'text-brand', dot: 'bg-brand' },
  remedio: { label: 'Remédio', plural: 'Remédios', icon: Pill, tint: 'bg-teal-soft', ink: 'text-teal', dot: 'bg-teal' },
  consulta: { label: 'Consulta', plural: 'Consultas', icon: Stethoscope, tint: 'bg-ok-soft', ink: 'text-ok', dot: 'bg-ok' },
  exame: { label: 'Exame', plural: 'Exames', icon: TestTube, tint: 'bg-soon-soft', ink: 'text-soon', dot: 'bg-soon' },
  peso: { label: 'Peso', plural: 'Pesagens', icon: Scales, tint: 'bg-surface-2', ink: 'text-ink-soft', dot: 'bg-ink-faint' },
  outro: { label: 'Cuidado', plural: 'Outros cuidados', icon: FirstAidKit, tint: 'bg-surface-2', ink: 'text-ink-soft', dot: 'bg-ink-faint' },
}

export const CARE_ORDER: CareType[] = ['vacina', 'remedio', 'consulta', 'exame', 'peso', 'outro']

export const STATUS: Record<CareStatus, { label: string; chip: string; dot: string }> = {
  late: { label: 'Atrasado', chip: 'bg-late-soft text-late', dot: 'bg-late' },
  soon: { label: 'Chegando', chip: 'bg-soon-soft text-soon', dot: 'bg-soon' },
  ok: { label: 'Em dia', chip: 'bg-ok-soft text-ok', dot: 'bg-ok' },
}

export const ROLE_LABEL: Record<MemberRole, string> = {
  tutor: 'Tutor',
  familia: 'Família',
  cuidador: 'Cuidador',
}

