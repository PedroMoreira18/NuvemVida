import { DotsThree, MagnifyingGlass, NotePencil, Trash } from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'motion/react'
import { lazy, Suspense, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useActions } from '@/app/actions'
import { useSession } from '@/app/session'
import { UserBadge } from '@/components/PetAvatar'
import { ClinicSeal, VaccineSticker } from '@/components/Stamp'
import { Button } from '@/components/ui/Button'
import { Sheet } from '@/components/ui/Sheet'
import { useDocuments, useEvents, useUsersMap } from '@/data/hooks'
import { deleteEvent } from '@/data/repo'
import type { CareType, HealthEvent, PetDocument } from '@/data/types'
import { CARE, CARE_ORDER } from '@/lib/care'
import { fmt, longDate } from '@/lib/dates'
import { cn, firstName, formatKg } from '@/lib/utils'
import { DocumentThumb } from '@/features/documents/DocumentThumb'

const WeightChart = lazy(() => import('./WeightChart').then((m) => ({ default: m.WeightChart })))

type Filter = 'tudo' | CareType

const TONES = ['brand', 'teal', 'mint', 'orange'] as const

const VaccineCard = ({ events }: { events: HealthEvent[] }) => {
  const vaccines = events.filter((e) => e.type === 'vacina')
  if (!vaccines.length) return null
  return (
    <section className="rounded-[2rem] bg-surface p-5 shadow-card ring-1 ring-line sm:p-7">
      <div className="flex items-baseline justify-between border-b-2 border-ink pb-3">
        <h2 className="text-lg font-bold">Carteirinha de vacinação</h2>
        <p className="font-mono text-xs text-ink-faint">{vaccines.length} DOSES</p>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3">
        {vaccines.map((v, i) => (
          <motion.div
            key={v.id}
            initial={{ opacity: 0, scale: 1.25, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: i % 2 ? 2.5 : -2.5 }}
            transition={{ delay: i * 0.07, type: 'spring', stiffness: 380, damping: 24 }}
            className="relative mx-auto"
          >
            <VaccineSticker
              vaccine={v.title.replace(/ aplicada$/, '')}
              maker={v.clinic ?? 'Uso veterinário'}
              lot={v.notes?.match(/Lote (\S+?)\.?\s/)?.[1]}
              date={fmt(v.date, 'dd/MM/yyyy')}
              tone={TONES[i % TONES.length]}
              className="w-36 sm:w-40"
            />
            {v.vet && (
              <ClinicSeal
                clinic={v.clinic ?? 'Clínica veterinária'}
                vet={v.vet}
                className="absolute -right-4 -bottom-6 size-20 opacity-80 mix-blend-multiply dark:mix-blend-screen"
                style={{ transform: `rotate(${(i * 37) % 60 - 30}deg)` }}
              />
            )}
          </motion.div>
        ))}
      </div>
    </section>
  )
}

const EventItem = ({ event, docs, author }: { event: HealthEvent; docs: PetDocument[]; author?: { name: string; hue: number } }) => {
  const meta = CARE[event.type]
  const Icon = meta.icon
  const [menu, setMenu] = useState(false)
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="relative grid grid-cols-[3rem_1fr] gap-6 sm:grid-cols-[4rem_1fr] sm:gap-8"
    >
      <div className="pt-4 text-right">
        <p className="tabular font-display text-2xl leading-none font-extrabold">{fmt(event.date, 'dd')}</p>
        <p className="font-mono text-[0.65rem] text-ink-faint uppercase">{fmt(event.date, 'MMM')}</p>
      </div>
      <article className="relative rounded-3xl bg-surface p-4 shadow-card ring-1 ring-line sm:p-5">
        <span className={cn('absolute top-6 -left-[calc(0.75rem+0.375rem)] size-3 rounded-full ring-4 ring-ground sm:-left-[calc(1rem+0.375rem)]', meta.dot)} />
        <div className="flex items-start gap-3">
          <span className={cn('grid size-10 shrink-0 place-items-center rounded-xl', meta.tint, meta.ink)}>
            <Icon weight="duotone" className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold tracking-wide text-ink-faint uppercase">{meta.label}</p>
            <h3 className="font-sans text-base font-bold tracking-normal">
              {event.title}
              {event.weightKg && <span className="ml-2 font-mono text-brand">{formatKg(event.weightKg)}</span>}
            </h3>
          </div>
          <button type="button" onClick={() => setMenu(true)} className="-mt-1 -mr-1 grid size-9 place-items-center rounded-full text-ink-faint hover:bg-surface-2" aria-label="Opções do registro">
            <DotsThree weight="bold" className="size-5" />
          </button>
        </div>
        {event.notes && <p className="mt-3 leading-relaxed text-ink-soft">{event.notes}</p>}
        {(event.vet || event.clinic) && (
          <p className="mt-2 text-sm text-ink-faint">{[event.vet, event.clinic].filter(Boolean).join(' · ')}</p>
        )}
        {docs.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {docs.map((d) => (
              <DocumentThumb key={d.id} doc={d} showName className="max-w-full" />
            ))}
          </div>
        )}
        {author && (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-faint">
            <UserBadge name={author.name} hue={author.hue} className="size-5 text-[0.55rem]" />
            Registrado por {firstName(author.name)}
          </p>
        )}
      </article>
      <Sheet open={menu} onOpenChange={setMenu} title={event.title} description={longDate(event.date)}>
        <Button
          variant="danger"
          size="lg"
          className="w-full"
          onClick={async () => {
            setMenu(false)
            await deleteEvent(event.id)
            toast('Registro apagado do histórico.')
          }}
        >
          <Trash weight="bold" />
          Apagar registro
        </Button>
      </Sheet>
    </motion.li>
  )
}

export const History = () => {
  const { pet } = useSession()
  const events = useEvents(pet?.id)
  const docs = useDocuments(pet?.id) ?? []
  const users = useUsersMap()
  const { logEvent } = useActions()
  const [filter, setFilter] = useState<Filter>('tudo')
  const [query, setQuery] = useState('')

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (events ?? []).filter(
      (e) =>
        (filter === 'tudo' || e.type === filter) &&
        (!q || [e.title, e.notes, e.vet, e.clinic].some((t) => t?.toLowerCase().includes(q))),
    )
  }, [events, filter, query])

  const byYear = useMemo(() => {
    const groups = new Map<string, HealthEvent[]>()
    for (const e of visible) {
      const year = fmt(e.date, 'yyyy')
      groups.set(year, [...(groups.get(year) ?? []), e])
    }
    return [...groups]
  }, [visible])

  if (!pet || !events) return null
  const docsByEvent = (id: string) => docs.filter((d) => d.eventId === id)
  const counts = Object.fromEntries(CARE_ORDER.map((t) => [t, events.filter((e) => e.type === t).length]))

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold sm:text-5xl">Histórico</h1>
          <p className="mt-2 text-ink-soft">
            Tudo o que já aconteceu com {pet.name}, do mais recente ao mais antigo.
          </p>
        </div>
        <Button onClick={() => logEvent(filter === 'tudo' ? undefined : filter)}>
          <NotePencil weight="bold" />
          Registrar
        </Button>
      </header>

      <div className="sticky top-[4.25rem] z-20 -mx-4 mt-6 bg-ground/90 px-4 py-3 backdrop-blur-xl sm:-mx-8 sm:px-8 lg:top-0">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(['tudo', ...CARE_ORDER] as Filter[]).map((f) => {
            const active = f === filter
            const count = f === 'tudo' ? events.length : counts[f]
            if (f !== 'tudo' && !count) return null
            return (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                aria-pressed={active}
                className={cn(
                  'inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors',
                  active ? 'bg-ink text-ground' : 'bg-surface text-ink-soft ring-1 ring-line hover:text-ink',
                )}
              >
                {f === 'tudo' ? 'Tudo' : CARE[f].plural}
                <span className={cn('font-mono text-xs', active ? 'opacity-70' : 'text-ink-faint')}>{count}</span>
              </button>
            )
          })}
        </div>
        <label className="relative mt-2 block">
          <MagnifyingGlass className="pointer-events-none absolute top-1/2 left-4 size-4.5 -translate-y-1/2 text-ink-faint" />
          <span className="sr-only">Buscar no histórico</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome, veterinário, anotação…"
            className="h-11 w-full rounded-full border border-line bg-surface pr-4 pl-11 text-sm placeholder:text-ink-faint focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15"
          />
        </label>
      </div>

      <div className="mt-6 grid gap-5">
        {(filter === 'tudo' || filter === 'vacina') && !query && <VaccineCard events={events} />}
        {(filter === 'tudo' || filter === 'peso') && !query && (
          <Suspense fallback={<div className="h-64 rounded-[2rem] bg-surface-2" />}>
            <WeightChart events={events} />
          </Suspense>
        )}
      </div>

      {visible.length === 0 ? (
        <div className="mt-10 grid place-items-center rounded-[2rem] border-2 border-dashed border-line px-6 py-14 text-center">
          <NotePencil weight="duotone" className="size-12 text-brand" />
          <p className="mt-4 font-display text-2xl font-bold">
            {events.length ? 'Nada encontrado' : `O histórico de ${pet.name} começa aqui`}
          </p>
          <p className="mt-2 max-w-sm text-ink-soft">
            {events.length
              ? 'Tente outra palavra ou outro filtro.'
              : 'Registre a última vacina ou consulta. Pode anexar a foto da carteirinha de papel.'}
          </p>
          {!events.length && (
            <Button className="mt-6" onClick={() => logEvent('vacina')}>
              Registrar a primeira vacina
            </Button>
          )}
        </div>
      ) : (
        <div className="mt-10 grid gap-10">
          {byYear.map(([year, list]) => (
            <section key={year}>
              <h2 className="mb-4 font-mono text-sm font-bold tracking-widest text-ink-faint">{year}</h2>
              <ol className="relative grid gap-4 before:absolute before:top-2 before:bottom-2 before:left-[calc(3rem+0.75rem-1px)] before:w-0.5 before:rounded-full before:bg-line sm:before:left-[calc(4rem+1rem-1px)]">
                <AnimatePresence initial={false}>
                  {list.map((e) => (
                    <EventItem key={e.id} event={e} docs={docsByEvent(e.id)} author={users.get(e.createdBy)} />
                  ))}
                </AnimatePresence>
              </ol>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
