import { ArrowLeft, Heartbeat, Paperclip, Printer, TextAa, Warning } from '@phosphor-icons/react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useState, type ReactNode } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useSession } from '@/app/session'
import { LogoMark } from '@/components/brand/Logo'
import { PetAvatar } from '@/components/PetAvatar'
import { Button } from '@/components/ui/Button'
import { db } from '@/data/db'
import { useActiveReminders, useDocuments, useEvents, useMembers, useUsersMap } from '@/data/hooks'
import type { HealthEvent } from '@/data/types'
import { ROLE_LABEL } from '@/lib/care'
import { fmt, petAge, recurrenceLabel } from '@/lib/dates'
import { cn, formatKg } from '@/lib/utils'

const SPECIES = { cachorro: 'Cão', gato: 'Gato', outro: 'Pet' }

const Block = ({ title, children, className }: { title: string; children: ReactNode; className?: string }) => (
  <section className={cn('break-inside-avoid', className)}>
    <h2 className="border-b-2 border-ink pb-2 font-sans text-[0.8em] font-extrabold tracking-[0.12em] text-ink-soft uppercase">{title}</h2>
    {children}
  </section>
)

const Rows = ({ events, docsFor, empty }: { events: HealthEvent[]; docsFor: (id: string) => number; empty: string }) =>
  events.length ? (
    <ul>
      {events.map((e) => (
        <li key={e.id} className="grid grid-cols-[6.5em_1fr] gap-4 border-b border-dashed border-line py-3">
          <span className="tabular font-mono text-[0.85em] text-ink-soft">{fmt(e.date, 'dd/MM/yyyy')}</span>
          <div>
            <p className="font-bold">
              {e.title}
              {docsFor(e.id) > 0 && (
                <span className="ml-2 inline-flex items-center gap-1 align-middle text-[0.7em] font-semibold text-brand">
                  <Paperclip weight="bold" />
                  {docsFor(e.id)}
                </span>
              )}
            </p>
            {e.notes && <p className="text-[0.9em] leading-snug text-ink-soft">{e.notes}</p>}
            {(e.vet || e.clinic) && <p className="text-[0.8em] text-ink-faint">{[e.vet, e.clinic].filter(Boolean).join(' · ')}</p>}
          </div>
        </li>
      ))}
    </ul>
  ) : (
    <p className="py-3 text-ink-faint">{empty}</p>
  )

export const VetView = () => {
  const { petId = '' } = useParams()
  const { user, ready, pets } = useSession()
  const pet = useLiveQuery(() => db.pets.get(petId), [petId])
  const events = useEvents(petId) ?? []
  const docs = useDocuments(petId) ?? []
  const reminders = useActiveReminders([petId]) ?? []
  const members = useMembers(petId)
  const users = useUsersMap()
  const [large, setLarge] = useState(false)

  if (ready && (!user || !pets.some((p) => p.id === petId))) return <Navigate to="/app" replace />
  if (!pet) return <div className="min-h-dvh bg-ground" />

  const of = (type: HealthEvent['type']) => events.filter((e) => e.type === type)
  const docsFor = (id: string) => docs.filter((d) => d.eventId === id).length
  const meds = reminders.filter((r) => r.type === 'remedio')
  const nextVaccine = (title: string) =>
    reminders.find((r) => r.type === 'vacina' && r.title.toLowerCase().startsWith(title.toLowerCase().replace(/ \(.*$/, '').replace(/ aplicada$/, '')))
  const weights = of('peso').filter((e) => e.weightKg)
  const facts = [SPECIES[pet.species], pet.sex === 'macho' ? 'macho' : pet.sex === 'femea' ? 'fêmea' : undefined, pet.breed, petAge(pet.birthDate), pet.weightKg ? formatKg(pet.weightKg) : undefined].filter(Boolean)

  return (
    <div className="min-h-dvh bg-surface text-ink print:bg-white">
      <div className="no-print sticky top-0 z-10 border-b border-line bg-surface/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center gap-2 px-4 py-3 sm:px-8">
          <Button asChild variant="ghost" size="sm">
            <Link to="/app">
              <ArrowLeft weight="bold" />
              Voltar
            </Link>
          </Button>
          <span className="flex-1" />
          <Button variant={large ? 'soft' : 'ghost'} size="sm" onClick={() => setLarge((l) => !l)} aria-pressed={large}>
            <TextAa weight="bold" />
            Letra maior
          </Button>
          <Button size="sm" onClick={() => window.print()}>
            <Printer weight="bold" />
            Imprimir ou PDF
          </Button>
        </div>
      </div>

      <main className={cn('mx-auto max-w-4xl px-5 py-10 sm:px-8', large ? 'text-[1.3rem]' : 'text-[1.05rem]')}>
        <header className="flex flex-wrap items-center gap-5">
          <PetAvatar pet={pet} className="size-[5.5em]" />
          <div className="flex-1">
            <h1 className="text-[3em] leading-none font-extrabold">{pet.name}</h1>
            <p className="mt-2 text-[1.05em] text-ink-soft">{facts.join(' · ')}</p>
          </div>
          <div className="text-right text-[0.8em] text-ink-faint">
            <p>Resumo de saúde</p>
            <p className="font-mono">{fmt(new Date().toISOString(), 'dd/MM/yyyy HH:mm')}</p>
          </div>
        </header>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <div className={cn('rounded-3xl p-5', pet.allergies ? 'bg-late-soft text-late' : 'bg-surface-2 text-ink-soft')}>
            <p className="flex items-center gap-2 text-[0.75em] font-extrabold tracking-[0.12em] uppercase">
              <Warning weight="fill" />
              Alergias
            </p>
            <p className="mt-1 text-[1.4em] font-bold">{pet.allergies ?? 'Nenhuma conhecida'}</p>
          </div>
          <div className="rounded-3xl bg-teal-soft p-5">
            <p className="flex items-center gap-2 text-[0.75em] font-extrabold tracking-[0.12em] text-teal uppercase">
              <Heartbeat weight="duotone" />
              Condições
            </p>
            <p className="mt-1 text-[1.15em] font-bold">{pet.conditions ?? 'Nenhuma registrada'}</p>
          </div>
        </div>

        <div className="mt-10 grid gap-10">
          <Block title="Remédios em uso">
            {meds.length ? (
              <ul>
                {meds.map((m) => (
                  <li key={m.id} className="flex flex-wrap items-baseline justify-between gap-2 border-b border-dashed border-line py-3">
                    <span className="text-[1.15em] font-bold">{m.title}</span>
                    <span className="text-ink-soft">{[m.dose, recurrenceLabel(m.recurrence)].filter(Boolean).join(' · ')}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-3 text-ink-faint">Nenhum remédio contínuo no momento.</p>
            )}
          </Block>

          <Block title="Vacinas">
            {of('vacina').length ? (
              <table className="w-full text-left">
                <thead className="text-[0.75em] text-ink-faint">
                  <tr>
                    <th className="py-2 font-semibold">Vacina</th>
                    <th className="py-2 font-semibold">Aplicada</th>
                    <th className="py-2 font-semibold">Próxima</th>
                  </tr>
                </thead>
                <tbody>
                  {of('vacina').map((v) => {
                    const next = nextVaccine(v.title)
                    return (
                      <tr key={v.id} className="border-t border-dashed border-line">
                        <td className="py-3 pr-3 font-bold">{v.title.replace(/ aplicada$/, '')}</td>
                        <td className="tabular py-3 pr-3 font-mono text-[0.9em]">{fmt(v.date, 'dd/MM/yyyy')}</td>
                        <td className="tabular py-3 font-mono text-[0.9em] text-ink-soft">{next ? fmt(next.dueAt, 'dd/MM/yyyy') : 'sem lembrete'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            ) : (
              <p className="py-3 text-ink-faint">Nenhuma vacina registrada.</p>
            )}
          </Block>

          <div className="grid gap-10 md:grid-cols-2">
            <Block title="Consultas recentes">
              <Rows events={of('consulta').slice(0, 5)} docsFor={docsFor} empty="Nenhuma consulta registrada." />
            </Block>
            <Block title="Exames">
              <Rows events={of('exame').slice(0, 5)} docsFor={docsFor} empty="Nenhum exame registrado." />
            </Block>
          </div>

          {weights.length > 0 && (
            <Block title="Peso">
              <div className="flex flex-wrap gap-x-6 gap-y-2 py-3">
                {weights.slice(0, 6).map((w) => (
                  <p key={w.id}>
                    <span className="tabular font-bold">{formatKg(w.weightKg!)}</span>{' '}
                    <span className="font-mono text-[0.8em] text-ink-faint">{fmt(w.date, 'MM/yy')}</span>
                  </p>
                ))}
              </div>
            </Block>
          )}

          <Block title="Responsáveis">
            <ul className="flex flex-wrap gap-x-6 gap-y-1 py-3">
              {members.map((m) => (
                <li key={m.id}>
                  <span className="font-bold">{users.get(m.userId)?.name}</span>{' '}
                  <span className="text-ink-faint">({ROLE_LABEL[m.role].toLowerCase()})</span>
                </li>
              ))}
            </ul>
          </Block>
        </div>

        <footer className="mt-14 flex items-center gap-2 border-t border-line pt-5 text-[0.75em] text-ink-faint">
          <LogoMark className="size-5" />
          Resumo gerado pelo Nuvem Vida a partir dos registros do tutor.
        </footer>
      </main>
    </div>
  )
}
