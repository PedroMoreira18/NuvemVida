import { Check, DotsThree, Trash, Warning } from '@phosphor-icons/react'
import confetti from 'canvas-confetti'
import { motion } from 'motion/react'
import { useState, type MouseEvent } from 'react'
import { toast } from 'sonner'
import { useSession } from '@/app/session'
import { UserBadge } from '@/components/PetAvatar'
import { StatusPill } from '@/components/StatusPill'
import { Button } from '@/components/ui/Button'
import { Sheet } from '@/components/ui/Sheet'
import { db } from '@/data/db'
import { completeReminder, deleteReminder, findRecentDuplicate, undoCompletion } from '@/data/repo'
import type { Completion, Pet, Reminder, User } from '@/data/types'
import { CARE } from '@/lib/care'
import { recurrenceLabel, relativeDue, reminderStatus, timeOf, ago } from '@/lib/dates'
import { cn, firstName } from '@/lib/utils'

const burst = (x: number, y: number) => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  confetti({
    particleCount: 70,
    spread: 70,
    startVelocity: 32,
    scalar: 0.9,
    ticks: 160,
    origin: { x: x / window.innerWidth, y: y / window.innerHeight },
    colors: ['#9403a6', '#fe971a', '#4cbfb8', '#b4fcde', '#5b9aae'],
    disableForReducedMotion: true,
  })
}

export const useCompleteReminder = (users: Map<string, User>) => {
  const { user } = useSession()
  const [pending, setPending] = useState<{ reminder: Reminder; duplicate: Completion; at: [number, number] }>()

  const run = async (reminder: Reminder, at: [number, number]) => {
    if (!user) return
    const completion = await completeReminder(reminder, user.id)
    burst(...at)
    toast.success(`${reminder.title}: feito!`, {
      description: reminder.recurrence.kind === 'nenhuma' ? 'Foi para o histórico.' : 'O próximo já está agendado.',
      action: { label: 'Desfazer', onClick: () => undoCompletion(completion, reminder) },
    })
  }

  const complete = async (reminder: Reminder, e: MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const at: [number, number] = [rect.left + rect.width / 2, rect.top + rect.height / 2]
    const duplicate = await findRecentDuplicate(reminder)
    if (duplicate) setPending({ reminder, duplicate, at })
    else await run(reminder, at)
  }

  const who = pending ? users.get(pending.duplicate.doneBy) : undefined
  const confirm = (
    <Sheet open={!!pending} onOpenChange={(o) => !o && setPending(undefined)} title="Essa dose já foi dada">
      {pending && (
        <div className="grid gap-5">
          <div className="flex gap-3 rounded-2xl bg-soon-soft p-4">
            <Warning weight="fill" className="size-6 shrink-0 text-soon" />
            <p className="leading-relaxed">
              {who?.id === user?.id ? 'Você' : `${who ? firstName(who.name) : 'Alguém'}`} marcou{' '}
              <b>{pending.reminder.title}</b> às <b>{timeOf(pending.duplicate.doneAt)}</b> ({ago(pending.duplicate.doneAt)}). Dar de
              novo pode ser uma dose em dobro.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Button variant="secondary" size="lg" onClick={() => setPending(undefined)}>
              Não, já foi dado
            </Button>
            <Button
              variant="danger"
              size="lg"
              onClick={async () => {
                const p = pending
                setPending(undefined)
                await run(p.reminder, p.at)
              }}
            >
              Registrar mesmo assim
            </Button>
          </div>
        </div>
      )}
    </Sheet>
  )

  return { complete, confirm }
}

type CardProps = {
  reminder: Reminder
  pet?: Pet
  last?: Completion
  users: Map<string, User>
  onComplete: (r: Reminder, e: MouseEvent) => void
  showPet?: boolean
}

export const ReminderCard = ({ reminder, pet, last, users, onComplete, showPet = false }: CardProps) => {
  const status = reminderStatus(reminder)
  const meta = CARE[reminder.type]
  const Icon = meta.icon
  const lastBy = last ? users.get(last.doneBy) : undefined
  const [menu, setMenu] = useState(false)

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
      className={cn(
        'group relative flex items-center gap-3 rounded-3xl bg-surface p-3 pr-2 shadow-card ring-1 ring-line sm:gap-4 sm:p-4',
        status === 'late' && 'ring-late/40',
      )}
    >
      <span className={cn('grid size-12 shrink-0 place-items-center rounded-2xl', meta.tint, meta.ink)}>
        <Icon weight="duotone" className="size-6" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className="font-bold">{reminder.title}</p>
          {showPet && pet && <span className="text-xs font-semibold text-ink-faint">· {pet.name}</span>}
        </div>
        <p className={cn('text-sm', status === 'late' ? 'font-semibold text-late' : 'text-ink-soft')}>
          {relativeDue(reminder.dueAt)}
          {reminder.dose && <span className="text-ink-faint"> · {reminder.dose}</span>}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <StatusPill status={status} />
          <span className="text-xs text-ink-faint">{recurrenceLabel(reminder.recurrence)}</span>
          {last && lastBy && (
            <span className="inline-flex items-center gap-1.5 text-xs text-ink-faint">
              <UserBadge name={lastBy.name} hue={lastBy.hue} className="size-5 text-[0.55rem]" />
              {firstName(lastBy.name)} · {timeOf(last.doneAt)}
            </span>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={(e) => onComplete(reminder, e)}
        className="grid size-12 shrink-0 place-items-center rounded-full border-2 border-line text-ink-faint transition-[background-color,border-color,color,transform] duration-200 hover:border-ok hover:bg-ok hover:text-white active:scale-90"
        aria-label={`Marcar ${reminder.title} como feito`}
        title="Marcar como feito"
      >
        <Check weight="bold" className="size-5" />
      </button>
      <button
        type="button"
        onClick={() => setMenu(true)}
        className="grid size-9 shrink-0 place-items-center rounded-full text-ink-faint hover:bg-surface-2"
        aria-label="Mais opções"
      >
        <DotsThree weight="bold" className="size-5" />
      </button>
      <Sheet open={menu} onOpenChange={setMenu} title={reminder.title} description={`${recurrenceLabel(reminder.recurrence)} · ${relativeDue(reminder.dueAt)}`}>
        <div className="grid gap-2">
          {reminder.notes && <p className="rounded-2xl bg-surface-2 p-4 text-sm">{reminder.notes}</p>}
          <Button
            variant="danger"
            size="lg"
            onClick={async () => {
              setMenu(false)
              await deleteReminder(reminder.id)
              toast('Lembrete apagado.', {
                action: { label: 'Desfazer', onClick: () => db.reminders.put(reminder) },
              })
            }}
          >
            <Trash weight="bold" />
            Apagar lembrete
          </Button>
        </div>
      </Sheet>
    </motion.li>
  )
}
