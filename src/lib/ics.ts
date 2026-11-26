import type { Pet, Reminder } from '@/data/types'
import { CARE } from './care'

const stamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

const escape = (text: string) => text.replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\n/g, '\\n')

const rrule = ({ kind, every }: Reminder['recurrence']) => {
  const freq = { horas: 'HOURLY', diaria: 'DAILY', semanal: 'WEEKLY', mensal: 'MONTHLY', anual: 'YEARLY' } as const
  return kind === 'nenhuma' ? undefined : `RRULE:FREQ=${freq[kind]};INTERVAL=${Math.max(1, every)}`
}

export const remindersToIcs = (reminders: Reminder[], pets: Pet[]) => {
  const names = new Map(pets.map((p) => [p.id, p.name]))
  const events = reminders.flatMap((r) => {
    const end = new Date(new Date(r.dueAt).getTime() + 30 * 60_000).toISOString()
    const description = [CARE[r.type].label, r.dose, r.notes].filter(Boolean).join(' · ')
    return [
      'BEGIN:VEVENT',
      `UID:${r.id}@nuvemvida`,
      `DTSTAMP:${stamp(new Date().toISOString())}`,
      `DTSTART:${stamp(r.dueAt)}`,
      `DTEND:${stamp(end)}`,
      `SUMMARY:${escape(`${r.title} · ${names.get(r.petId) ?? 'Pet'}`)}`,
      `DESCRIPTION:${escape(description)}`,
      rrule(r.recurrence),
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escape(r.title)}`,
      `TRIGGER:${r.type === 'remedio' ? '-PT0M' : '-P1D'}`,
      'END:VALARM',
      'END:VEVENT',
    ].filter((line): line is string => !!line)
  })
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Nuvem Vida//PT-BR', 'CALSCALE:GREGORIAN', ...events, 'END:VCALENDAR'].join('\r\n')
}

export const downloadFile = (content: Blob | string, filename: string, mime = 'text/calendar') => {
  const blob = typeof content === 'string' ? new Blob([content], { type: mime }) : content
  const url = URL.createObjectURL(blob)
  const a = Object.assign(document.createElement('a'), { href: url, download: filename })
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
