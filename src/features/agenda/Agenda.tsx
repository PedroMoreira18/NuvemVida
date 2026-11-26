import { BellRinging, BellSimpleRinging, CalendarPlus, CaretLeft, CaretRight } from '@phosphor-icons/react'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { AnimatePresence, motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useActions } from '@/app/actions'
import { useSession } from '@/app/session'
import { Button } from '@/components/ui/Button'
import { useActiveReminders, useLastCompletionByReminder, useUsersMap } from '@/data/hooks'
import type { Reminder } from '@/data/types'
import { CARE } from '@/lib/care'
import { advance, fmt, reminderStatus } from '@/lib/dates'
import { downloadFile, remindersToIcs } from '@/lib/ics'
import { cn } from '@/lib/utils'
import { askNotificationPermission, notificationsSupported } from './notifications'
import { ReminderCard, useCompleteReminder } from './ReminderCard'

const NONE: Reminder[] = []

const occurrencesBetween = (reminders: Reminder[], from: Date, to: Date) => {
  const days = new Map<string, Reminder[]>()
  for (const r of reminders) {
    let date = new Date(r.dueAt)
    let guard = 0
    while (date <= to && guard++ < 400) {
      if (date >= from) {
        const key = fmt(date.toISOString(), 'yyyy-MM-dd')
        const list = days.get(key) ?? []
        if (!list.includes(r)) days.set(key, [...list, r])
      }
      if (r.recurrence.kind === 'nenhuma') break
      date = advance(date, r.recurrence)
    }
  }
  return days
}

export const Agenda = () => {
  const { pet, pets } = useSession()
  const users = useUsersMap()
  const { scheduleReminder } = useActions()
  const { complete, confirm } = useCompleteReminder(users)
  const [month, setMonth] = useState(() => startOfMonth(new Date()))
  const [selected, setSelected] = useState(() => new Date())
  const [direction, setDirection] = useState(0)
  const [permission, setPermission] = useState(() => (notificationsSupported() ? Notification.permission : 'denied'))
  const reminders = useActiveReminders(pet ? [pet.id] : []) ?? NONE
  const lastByReminder = useLastCompletionByReminder(pet?.id)

  const { days, byDay } = useMemo(() => {
    const start = startOfWeek(startOfMonth(month))
    const end = endOfWeek(endOfMonth(month))
    return { days: eachDayOfInterval({ start, end }), byDay: occurrencesBetween(reminders, start, end) }
  }, [reminders, month])
  const selectedKey = fmt(selected.toISOString(), 'yyyy-MM-dd')
  const dayList = byDay.get(selectedKey) ?? []

  if (!pet) return null

  const go = (delta: number) => {
    setDirection(delta)
    setMonth((m) => addMonths(m, delta))
  }

  const exportIcs = () => {
    downloadFile(remindersToIcs(reminders, pets), `lembretes-${pet.name.toLowerCase()}.ics`)
    toast.success('Arquivo da agenda baixado.', { description: 'Abra o arquivo para importar no Google Agenda ou no Calendário.' })
  }

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold sm:text-5xl">Agenda</h1>
          <p className="mt-2 text-ink-soft">Os cuidados programados de {pet.name}.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={exportIcs} disabled={!reminders.length}>
            <CalendarPlus weight="bold" />
            <span className="hidden sm:inline">Levar para minha agenda</span>
            <span className="sm:hidden">.ics</span>
          </Button>
          <Button onClick={() => scheduleReminder()}>
            <BellSimpleRinging weight="bold" />
            Novo lembrete
          </Button>
        </div>
      </header>

      {permission === 'default' && (
        <button
          type="button"
          onClick={async () => setPermission((await askNotificationPermission()) as NotificationPermission)}
          className="mt-6 flex w-full items-center gap-3 rounded-3xl bg-teal-soft p-4 text-left"
        >
          <BellRinging weight="duotone" className="size-7 shrink-0 text-teal" />
          <span className="flex-1">
            <b className="block">Ativar avisos neste aparelho</b>
            <span className="text-sm text-ink-soft">Remédio avisa na hora; vacina e consulta, um dia antes.</span>
          </span>
          <CaretRight weight="bold" className="size-4 text-ink-faint" />
        </button>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        <section className="self-start rounded-[2rem] bg-surface p-4 shadow-card ring-1 ring-line sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold first-letter:uppercase">{fmt(month.toISOString(), "MMMM 'de' yyyy")}</h2>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon-sm" onClick={() => go(-1)} aria-label="Mês anterior">
                <CaretLeft weight="bold" />
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={() => go(1)} aria-label="Próximo mês">
                <CaretRight weight="bold" />
              </Button>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-7 text-center text-xs font-bold text-ink-faint">
            {['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'].map((d) => (
              <span key={d} className="py-1">{d}</span>
            ))}
          </div>
          <div className="relative overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false} custom={direction}>
              <motion.div
                key={month.toISOString()}
                custom={direction}
                initial={{ opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -40 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="grid grid-cols-7 gap-1"
              >
                {days.map((day) => {
                  const key = fmt(day.toISOString(), 'yyyy-MM-dd')
                  const items = byDay.get(key) ?? []
                  const isSelected = isSameDay(day, selected)
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelected(day)}
                      aria-pressed={isSelected}
                      aria-label={`${fmt(day.toISOString(), "d 'de' MMMM")}${items.length ? `, ${items.length} lembrete(s)` : ''}`}
                      className={cn(
                        'relative flex aspect-square flex-col items-center justify-center rounded-2xl text-sm font-semibold transition-colors',
                        !isSameMonth(day, month) && 'text-ink-faint/50',
                        isSelected ? 'bg-brand text-white dark:text-brand-deep' : 'hover:bg-surface-2',
                        isToday(day) && !isSelected && 'ring-2 ring-brand ring-inset',
                      )}
                    >
                      <span className="tabular">{fmt(day.toISOString(), 'd')}</span>
                      <span className="absolute bottom-1.5 flex gap-0.5">
                        {items.slice(0, 3).map((r) => (
                          <span
                            key={r.id}
                            className={cn('size-1.5 rounded-full', isSelected ? 'bg-white' : CARE[r.type].dot)}
                          />
                        ))}
                      </span>
                    </button>
                  )
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold first-letter:uppercase">{fmt(selected.toISOString(), "EEEE, d 'de' MMMM")}</h2>
          {dayList.length ? (
            <ul className="grid gap-2.5">
              {dayList.map((r) => (
                <ReminderCard key={r.id} reminder={r} last={lastByReminder.get(r.id)} users={users} onComplete={complete} />
              ))}
            </ul>
          ) : (
            <p className="rounded-3xl border-2 border-dashed border-line p-6 text-center text-ink-soft">Nada marcado para esse dia.</p>
          )}
        </section>
      </div>

      <section className="mt-12">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
          Todos os lembretes
          <span className="font-mono text-sm font-medium text-ink-faint">{reminders.length}</span>
        </h2>
        {reminders.length ? (
          <ul className="grid gap-2.5 lg:grid-cols-2">
            <AnimatePresence initial={false}>
              {reminders.map((r) => (
                <ReminderCard key={r.id} reminder={r} last={lastByReminder.get(r.id)} users={users} onComplete={complete} />
              ))}
            </AnimatePresence>
          </ul>
        ) : (
          <div className="rounded-[2rem] border-2 border-dashed border-line p-10 text-center">
            <BellSimpleRinging weight="duotone" className="mx-auto size-12 text-teal" />
            <p className="mt-3 font-display text-2xl font-bold">Nenhum lembrete ainda</p>
            <p className="mt-1 text-ink-soft">Comece pelo remédio de uso contínuo ou pela próxima vacina.</p>
            <Button className="mt-5" onClick={() => scheduleReminder('remedio')}>
              Criar o primeiro lembrete
            </Button>
          </div>
        )}
        {reminders.some((r) => reminderStatus(r) === 'late') && (
          <p className="mt-3 text-sm text-ink-faint">Lembretes atrasados continuam aqui até alguém marcar como feito.</p>
        )}
      </section>
      {confirm}
    </div>
  )
}
