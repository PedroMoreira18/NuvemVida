import { ArrowRight, CheckCircle, Heartbeat, NotePencil, BellSimpleRinging, Warning } from '@phosphor-icons/react'
import { differenceInCalendarDays } from 'date-fns'
import { AnimatePresence } from 'motion/react'
import { Link } from 'react-router-dom'
import { useActions } from '@/app/actions'
import { useSession } from '@/app/session'
import { PetAvatar, UserBadge } from '@/components/PetAvatar'
import { Button } from '@/components/ui/Button'
import { Cloud } from '@/landing/Clouds'
import { useActiveReminders, useCompletions, useLastCompletionByReminder, useUsersMap } from '@/data/hooks'
import type { Reminder } from '@/data/types'
import { CARE } from '@/lib/care'
import { ago, petAge, relativeDue, reminderStatus } from '@/lib/dates'
import { cn, firstName, formatKg } from '@/lib/utils'
import { ReminderCard, useCompleteReminder } from '@/features/agenda/ReminderCard'

const greeting = () => {
  const h = new Date().getHours()
  if (h < 5) return 'Boa noite'
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

const group = (reminders: Reminder[]) => {
  const now = new Date()
  const late: Reminder[] = []
  const soon: Reminder[] = []
  const week: Reminder[] = []
  const later: Reminder[] = []
  for (const r of reminders) {
    const days = differenceInCalendarDays(new Date(r.dueAt), now)
    if (reminderStatus(r, now) === 'late') late.push(r)
    else if (days <= 1) soon.push(r)
    else if (days <= 7) week.push(r)
    else later.push(r)
  }
  return { late, soon, week, later }
}

export const Dashboard = () => {
  const { user, pet, pets, selectPet } = useSession()
  const users = useUsersMap()
  const reminders = useActiveReminders(pet ? [pet.id] : [])
  const allReminders = useActiveReminders(pets.map((p) => p.id))
  const lastByReminder = useLastCompletionByReminder(pet?.id)
  const activity = useCompletions(pet?.id, 4)
  const { complete, confirm } = useCompleteReminder(users)
  const { logEvent, scheduleReminder } = useActions()

  if (!pet || !user || !reminders) return null

  const { late, soon, week, later } = group(reminders)
  const next = reminders.find((r) => reminderStatus(r) !== 'late') ?? reminders[0]
  const facts = [pet.breed, petAge(pet.birthDate), pet.weightKg ? formatKg(pet.weightKg) : undefined].filter(Boolean)

  const section = (title: string, list: Reminder[], tone?: 'late') =>
    list.length > 0 && (
      <section className="mt-9">
        <h2 className={cn('mb-3 flex items-center gap-2 text-lg font-bold', tone === 'late' && 'text-late')}>
          {tone === 'late' && <Warning weight="fill" className="size-5" />}
          {title}
          <span className="font-mono text-sm font-medium text-ink-faint">{list.length}</span>
        </h2>
        <ul className="grid gap-2.5">
          <AnimatePresence initial={false}>
            {list.map((r) => (
              <ReminderCard key={r.id} reminder={r} last={lastByReminder.get(r.id)} users={users} onComplete={complete} />
            ))}
          </AnimatePresence>
        </ul>
      </section>
    )

  return (
    <div>
      <p className="text-sm font-semibold text-ink-faint">
        {greeting()}, {firstName(user.name)}
      </p>

      <header className="mt-3 flex flex-wrap items-center gap-4">
        <PetAvatar pet={pet} className="size-18 sm:size-20" />
        <div className="min-w-0 flex-1">
          <h1 className="text-4xl leading-none font-extrabold sm:text-5xl">{pet.name}</h1>
          <p className="mt-2 text-ink-soft">{facts.join(' · ')}</p>
        </div>
        <Link to="/app/pet" className="hidden text-sm font-semibold text-brand hover:underline sm:block">
          Ver perfil
        </Link>
      </header>

      {(pet.allergies || pet.conditions) && (
        <div className="mt-5 flex flex-wrap gap-2">
          {pet.allergies && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-late-soft px-3 py-1.5 text-sm font-semibold text-late">
              <Warning weight="fill" className="size-4" />
              Alergia: {pet.allergies}
            </span>
          )}
          {pet.conditions && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-soft px-3 py-1.5 text-sm font-semibold text-ink">
              <Heartbeat weight="duotone" className="size-4 text-teal" />
              {pet.conditions}
            </span>
          )}
        </div>
      )}

      <div className="mt-8 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        {next ? (
          <section className="relative overflow-hidden rounded-[2rem] bg-field p-6 text-white shadow-lift sm:p-7">
            <Cloud className="absolute -right-10 -bottom-12 w-60 text-orange" />
            <p className="text-sm font-semibold text-white/75">Próximo cuidado</p>
            <p className="mt-2 font-display text-3xl leading-tight font-bold sm:text-4xl">{next.title}</p>
            <p className="mt-1 text-white/85">
              {relativeDue(next.dueAt)}
              {next.dose && ` · ${next.dose}`}
            </p>
            {lastByReminder.get(next.id) && (
              <p className="mt-3 text-sm text-white/75">
                Última vez: {firstName(users.get(lastByReminder.get(next.id)!.doneBy)?.name ?? 'alguém')},{' '}
                {ago(lastByReminder.get(next.id)!.doneAt)}
              </p>
            )}
            <Button variant="white" className="relative mt-6" onClick={(e) => complete(next, e)}>
              <CheckCircle weight="fill" />
              Marcar como feito
            </Button>
          </section>
        ) : (
          <section className="rounded-[2rem] bg-brand-soft p-7">
            <p className="font-display text-3xl leading-tight font-bold">Vamos montar a carteirinha de {pet.name}?</p>
            <p className="mt-2 text-ink-soft">
              Comece pela última vacina (dá para anexar a foto da carteirinha de papel) ou por um remédio que {pet.name} toma.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button onClick={() => logEvent('vacina')}>
                <NotePencil weight="bold" />
                Registrar vacina
              </Button>
              <Button variant="secondary" onClick={() => scheduleReminder('remedio')}>
                <BellSimpleRinging weight="bold" />
                Lembrete de remédio
              </Button>
            </div>
          </section>
        )}

        <section className="grid content-start gap-3">
          <div className="grid grid-cols-3 gap-2 rounded-[2rem] bg-surface p-2 shadow-card ring-1 ring-line">
            {[
              { n: late.length, label: 'Atrasados', cls: late.length ? 'bg-late-soft text-late' : 'text-ink-faint' },
              { n: soon.length + week.length, label: 'Nesta semana', cls: 'bg-soon-soft text-soon' },
              { n: later.length, label: 'Mais adiante', cls: 'bg-ok-soft text-ok' },
            ].map((s) => (
              <div key={s.label} className={cn('rounded-[1.5rem] px-3 py-4 text-center', s.cls)}>
                <p className="tabular font-display text-3xl font-extrabold">{s.n}</p>
                <p className="text-xs font-bold">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" className="h-auto flex-col items-start gap-1 rounded-3xl p-4 text-left" onClick={() => logEvent()}>
              <NotePencil weight="duotone" className="text-brand" />
              Registrar
            </Button>
            <Button variant="secondary" className="h-auto flex-col items-start gap-1 rounded-3xl p-4 text-left" onClick={() => scheduleReminder()}>
              <BellSimpleRinging weight="duotone" className="text-teal" />
              Lembrete
            </Button>
          </div>
        </section>
      </div>

      {section('Atrasados', late, 'late')}
      {section('Hoje e amanhã', soon)}
      {section('Próximos 7 dias', week)}
      {section('Mais adiante', later.slice(0, 4))}
      {later.length > 4 && (
        <Link to="/app/agenda" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline">
          Ver os outros {later.length - 4} na agenda
          <ArrowRight weight="bold" className="size-4" />
        </Link>
      )}

      {activity.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-3 text-lg font-bold">Quem cuidou por último</h2>
          <ul className="divide-y divide-line rounded-3xl bg-surface px-4 shadow-card ring-1 ring-line">
            {activity.map((c) => {
              const who = users.get(c.doneBy)
              const Icon = CARE[c.type].icon
              return (
                <li key={c.id} className="flex items-center gap-3 py-3">
                  {who && <UserBadge name={who.name} hue={who.hue} />}
                  <p className="min-w-0 flex-1 text-sm">
                    <b>{who ? (who.id === user.id ? 'Você' : firstName(who.name)) : 'Alguém'}</b> · {c.title}
                  </p>
                  <Icon weight="duotone" className={cn('size-5', CARE[c.type].ink)} />
                  <span className="text-xs text-ink-faint">{ago(c.doneAt)}</span>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {pets.length > 1 && (
        <section className="mt-12">
          <h2 className="mb-3 text-lg font-bold">Seus outros pets</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {pets
              .filter((p) => p.id !== pet.id)
              .map((p) => {
                const theirs = (allReminders ?? []).filter((r) => r.petId === p.id)
                const lateCount = theirs.filter((r) => reminderStatus(r) === 'late').length
                const upcoming = theirs.find((r) => reminderStatus(r) !== 'late')
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      selectPet(p.id)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className="flex min-w-64 items-center gap-3 rounded-3xl bg-surface p-3 text-left shadow-card ring-1 ring-line transition-transform hover:-translate-y-0.5"
                  >
                    <PetAvatar pet={p} />
                    <span className="min-w-0">
                      <span className="block font-bold">{p.name}</span>
                      <span className={cn('block truncate text-sm', lateCount ? 'font-semibold text-late' : 'text-ink-soft')}>
                        {lateCount ? `${lateCount} atrasado${lateCount > 1 ? 's' : ''}` : upcoming ? `${upcoming.title}: ${relativeDue(upcoming.dueAt).toLowerCase()}` : 'Tudo em dia'}
                      </span>
                    </span>
                  </button>
                )
              })}
          </div>
        </section>
      )}

      {confirm}
    </div>
  )
}
