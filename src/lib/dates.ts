import {
  addDays,
  addHours,
  addMonths,
  addWeeks,
  addYears,
  differenceInCalendarDays,
  differenceInMonths,
  differenceInYears,
  format,
  formatDistanceToNowStrict,
  isToday,
  isTomorrow,
  isYesterday,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Recurrence, Reminder } from '@/data/types'

export type CareStatus = 'late' | 'soon' | 'ok'

export const fmt = (iso: string | Date, pattern: string) =>
  format(typeof iso === 'string' ? new Date(iso) : iso, pattern, { locale: ptBR })

export const shortDate = (iso: string) => fmt(iso, "d 'de' MMM")
export const longDate = (iso: string) => fmt(iso, "d 'de' MMMM 'de' yyyy")
export const timeOf = (iso: string) => fmt(iso, 'HH:mm')

export const advance = (date: Date, recurrence: Recurrence) => {
  const every = Math.max(1, recurrence.every)
  switch (recurrence.kind) {
    case 'horas': return addHours(date, every)
    case 'diaria': return addDays(date, every)
    case 'semanal': return addWeeks(date, every)
    case 'mensal': return addMonths(date, every)
    case 'anual': return addYears(date, every)
    default: return date
  }
}

export const nextOccurrenceAfter = (dueAt: string, recurrence: Recurrence, after = new Date()) => {
  let next = advance(new Date(dueAt), recurrence)
  while (next <= after) next = advance(next, recurrence)
  return next
}

export const reminderStatus = (reminder: Pick<Reminder, 'dueAt' | 'recurrence'>, now = new Date()): CareStatus => {
  const due = new Date(reminder.dueAt)
  if (due < now) return 'late'
  const soonWindowHours = reminder.recurrence.kind === 'horas' ? 2 : 72
  return due.getTime() - now.getTime() <= soonWindowHours * 3_600_000 ? 'soon' : 'ok'
}

export const relativeDue = (iso: string, now = new Date()) => {
  const due = new Date(iso)
  const days = differenceInCalendarDays(due, now)
  const hasTime = fmt(iso, 'HH:mm') !== '00:00'
  const at = hasTime ? ` às ${timeOf(iso)}` : ''
  if (isToday(due)) return due < now ? `Hoje${at}, já passou` : `Hoje${at}`
  if (isTomorrow(due)) return `Amanhã${at}`
  if (isYesterday(due)) return `Ontem${at}`
  if (days < 0) return `Atrasado há ${-days} dias`
  if (days <= 6) return `${fmt(iso, 'EEEE')}${at}`
  if (days <= 45) return `Em ${days} dias · ${shortDate(iso)}`
  if (days < 330) return `Em ${Math.round(days / 30.4)} meses · ${shortDate(iso)}`
  const years = Math.round(days / 365)
  return `Daqui a ${years === 1 ? '1 ano' : `${years} anos`} · ${fmt(iso, "MMM 'de' yyyy")}`
}

export const ago = (iso: string) => formatDistanceToNowStrict(new Date(iso), { locale: ptBR, addSuffix: true })

export const petAge = (birthDate?: string) => {
  if (!birthDate) return undefined
  const birth = new Date(birthDate)
  const years = differenceInYears(new Date(), birth)
  if (years >= 1) return years === 1 ? '1 ano' : `${years} anos`
  const months = differenceInMonths(new Date(), birth)
  return months <= 1 ? '1 mês' : `${months} meses`
}

export const recurrenceLabel = ({ kind, every }: Recurrence) => {
  const n = Math.max(1, every)
  switch (kind) {
    case 'horas': return `A cada ${n}h`
    case 'diaria': return n === 1 ? 'Todo dia' : `A cada ${n} dias`
    case 'semanal': return n === 1 ? 'Toda semana' : `A cada ${n} semanas`
    case 'mensal': return n === 1 ? 'Todo mês' : `A cada ${n} meses`
    case 'anual': return n === 1 ? 'Todo ano' : `A cada ${n} anos`
    default: return 'Uma vez'
  }
}

export const toLocalInput = (iso: string) => fmt(iso, "yyyy-MM-dd'T'HH:mm")
export const toDateInput = (iso: string) => fmt(iso, 'yyyy-MM-dd')
