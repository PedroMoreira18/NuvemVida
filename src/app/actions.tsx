import { BellSimpleRinging, NotePencil } from '@phosphor-icons/react'
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { CareType } from '@/data/types'
import { ReminderForm } from '@/features/agenda/ReminderForm'
import { EventForm } from '@/features/history/EventForm'
import { Sheet } from '@/components/ui/Sheet'

type Actions = {
  openAddMenu: () => void
  logEvent: (type?: CareType) => void
  scheduleReminder: (type?: CareType) => void
}

const ActionsContext = createContext<Actions | null>(null)

type Open = { kind: 'menu' | 'event' | 'reminder'; type?: CareType } | null

const COPY = {
  menu: { title: 'Adicionar', description: undefined },
  event: { title: 'Registrar no histórico', description: 'Algo que já aconteceu: vacina aplicada, consulta, exame, pesagem.' },
  reminder: { title: 'Novo lembrete', description: 'Algo que vai acontecer. A gente avisa antes.' },
}

const AddMenu = ({ onPick }: { onPick: (kind: 'event' | 'reminder') => void }) => {
  const options = [
    { kind: 'event' as const, label: 'Registrar algo que aconteceu', hint: 'Vacina aplicada, consulta, exame, peso', icon: NotePencil },
    { kind: 'reminder' as const, label: 'Criar um lembrete', hint: 'Remédio, próxima vacina, retorno', icon: BellSimpleRinging },
  ]
  return (
    <div className="grid gap-2">
      {options.map((o) => (
        <button
          key={o.kind}
          type="button"
          onClick={() => onPick(o.kind)}
          className="flex items-center gap-4 rounded-2xl bg-surface p-4 text-left shadow-card ring-1 ring-line transition-shadow hover:shadow-lift"
        >
          <span className="grid size-12 place-items-center rounded-2xl bg-brand-soft text-brand">
            <o.icon weight="duotone" className="size-6" />
          </span>
          <span>
            <span className="block font-bold">{o.label}</span>
            <span className="block text-sm text-ink-soft">{o.hint}</span>
          </span>
        </button>
      ))}
    </div>
  )
}

export const ActionsProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState<Open>(null)
  const close = useCallback(() => setOpen(null), [])

  const value = useMemo<Actions>(
    () => ({
      openAddMenu: () => setOpen({ kind: 'menu' }),
      logEvent: (type) => setOpen({ kind: 'event', type }),
      scheduleReminder: (type) => setOpen({ kind: 'reminder', type }),
    }),
    [],
  )

  const copy = COPY[open?.kind ?? 'menu']

  return (
    <ActionsContext.Provider value={value}>
      {children}
      <Sheet open={!!open} onOpenChange={(o) => !o && close()} title={copy.title} description={copy.description}>
        {open?.kind === 'menu' && <AddMenu onPick={(kind) => setOpen({ kind })} />}
        {open?.kind === 'event' && <EventForm initialType={open.type} onDone={close} />}
        {open?.kind === 'reminder' && <ReminderForm initialType={open.type} onDone={close} />}
      </Sheet>
    </ActionsContext.Provider>
  )
}

export const useActions = () => {
  const actions = useContext(ActionsContext)
  if (!actions) throw new Error('useActions precisa estar dentro de <ActionsProvider>')
  return actions
}
