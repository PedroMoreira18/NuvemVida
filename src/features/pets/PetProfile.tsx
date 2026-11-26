import { Heartbeat, IdentificationCard, PencilSimple, Trash, UploadSimple, Warning } from '@phosphor-icons/react'
import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useSession } from '@/app/session'
import { PetAvatar } from '@/components/PetAvatar'
import { Button } from '@/components/ui/Button'
import { Sheet } from '@/components/ui/Sheet'
import { useDocuments, useEvents, useMembers } from '@/data/hooks'
import { addDocument, deleteDocument, deletePet, updatePet } from '@/data/repo'
import { fmt, longDate, petAge } from '@/lib/dates'
import { formatKg } from '@/lib/utils'
import { DocumentThumb } from '@/features/documents/DocumentThumb'
import { PetForm } from './PetForm'

const SPECIES = { cachorro: 'Cachorro', gato: 'Gato', outro: 'Outro' }

export const PetProfile = () => {
  const { pet, user, selectPet, pets } = useSession()
  const docs = useDocuments(pet?.id) ?? []
  const events = useEvents(pet?.id) ?? []
  const members = useMembers(pet?.id)
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [removing, setRemoving] = useState(false)
  const upload = useRef<HTMLInputElement>(null)

  if (!pet || !user) return null
  const isTutor = members.find((m) => m.userId === user.id)?.role === 'tutor'
  const eventTitle = (id?: string) => events.find((e) => e.id === id)?.title

  const facts = [
    ['Espécie', SPECIES[pet.species]],
    ['Raça', pet.breed],
    ['Sexo', pet.sex === 'macho' ? 'Macho' : pet.sex === 'femea' ? 'Fêmea' : undefined],
    ['Idade', petAge(pet.birthDate)],
    ['Nascimento', pet.birthDate ? longDate(pet.birthDate) : undefined],
    ['Peso', pet.weightKg ? formatKg(pet.weightKg) : undefined],
  ].filter((f): f is [string, string] => !!f[1])

  return (
    <div>
      <header className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        <PetAvatar pet={pet} className="size-28" />
        <div className="flex-1">
          <h1 className="text-5xl leading-none font-extrabold">{pet.name}</h1>
          <p className="mt-2 text-ink-soft">Na família desde {fmt(pet.createdAt, "MMMM 'de' yyyy")}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setEditing(true)}>
            <PencilSimple weight="bold" />
            Editar
          </Button>
          <Button asChild variant="soft">
            <Link to={`/consulta/${pet.id}`}>
              <IdentificationCard weight="bold" />
              Modo consulta
            </Link>
          </Button>
        </div>
      </header>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <section className="self-start rounded-[2rem] bg-surface p-6 shadow-card ring-1 ring-line">
          <h2 className="text-lg font-bold">Dados</h2>
          <dl className="mt-4 divide-y divide-dashed divide-line">
            {facts.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 py-3">
                <dt className="text-ink-soft">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
          {pet.allergies && (
            <p className="mt-4 flex gap-2 rounded-2xl bg-late-soft p-4 font-semibold text-late">
              <Warning weight="fill" className="mt-0.5 size-5 shrink-0" />
              Alergia: {pet.allergies}
            </p>
          )}
          {pet.conditions && (
            <p className="mt-3 flex gap-2 rounded-2xl bg-teal-soft p-4 font-semibold">
              <Heartbeat weight="duotone" className="mt-0.5 size-5 shrink-0 text-teal" />
              {pet.conditions}
            </p>
          )}
        </section>

        <section className="rounded-[2rem] bg-surface p-6 shadow-card ring-1 ring-line">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold">Documentos</h2>
              <p className="text-sm text-ink-soft">Receitas, exames, fotos da carteirinha de papel.</p>
            </div>
            <Button variant="soft" size="sm" onClick={() => upload.current?.click()}>
              <UploadSimple weight="bold" />
              Enviar
            </Button>
            <input
              ref={upload}
              type="file"
              accept="image/*,application/pdf"
              multiple
              hidden
              onChange={async (e) => {
                const files = Array.from(e.target.files ?? [])
                await Promise.all(files.map((f) => addDocument(f, pet.id, user.id)))
                e.target.value = ''
                if (files.length) toast.success(files.length > 1 ? `${files.length} arquivos guardados.` : 'Arquivo guardado.')
              }}
            />
          </div>
          {docs.length ? (
            <ul className="mt-5 grid gap-2">
              {docs.map((d) => (
                <li key={d.id} className="flex items-center gap-2">
                  <DocumentThumb doc={d} showName className="min-w-0 flex-1" />
                  <div className="hidden w-32 text-right text-xs text-ink-faint sm:block">
                    <p className="truncate">{eventTitle(d.eventId) ?? 'Avulso'}</p>
                    <p>{fmt(d.createdAt, 'dd/MM/yyyy')}</p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      await deleteDocument(d.id)
                      toast('Arquivo apagado.')
                    }}
                    className="grid size-9 shrink-0 place-items-center rounded-full text-ink-faint hover:bg-late-soft hover:text-late"
                    aria-label={`Apagar ${d.name}`}
                  >
                    <Trash className="size-4.5" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <button
              type="button"
              onClick={() => upload.current?.click()}
              className="mt-5 w-full rounded-3xl border-2 border-dashed border-line p-8 text-center text-ink-soft transition-colors hover:border-brand hover:text-brand"
            >
              <UploadSimple weight="duotone" className="mx-auto size-10" />
              <span className="mt-2 block font-semibold">Tire uma foto da carteirinha de vacinação</span>
              <span className="text-sm">ou envie um PDF de exame</span>
            </button>
          )}
        </section>
      </div>

      {isTutor && (
        <section className="mt-12 border-t border-line pt-6">
          <Button variant="ghost" className="text-late hover:bg-late-soft hover:text-late" onClick={() => setRemoving(true)}>
            <Trash weight="bold" />
            Remover {pet.name} do app
          </Button>
        </section>
      )}

      <Sheet open={editing} onOpenChange={setEditing} title={`Editar ${pet.name}`}>
        <PetForm
          initial={pet}
          submitLabel="Salvar alterações"
          onSubmit={async (data) => {
            await updatePet(pet.id, data)
            setEditing(false)
            toast.success('Dados atualizados.')
          }}
        />
      </Sheet>

      <Sheet open={removing} onOpenChange={setRemoving} title={`Remover ${pet.name}?`}>
        <p className="leading-relaxed text-ink-soft">
          Isso apaga o histórico, os lembretes e os documentos de {pet.name} neste aparelho. Não tem como desfazer.
        </p>
        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          <Button variant="secondary" size="lg" onClick={() => setRemoving(false)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            size="lg"
            onClick={async () => {
              const other = pets.find((p) => p.id !== pet.id)
              await deletePet(pet.id)
              setRemoving(false)
              if (other) selectPet(other.id)
              toast(`${pet.name} foi removido.`)
              navigate('/app', { replace: true })
            }}
          >
            Apagar tudo
          </Button>
        </div>
      </Sheet>
    </div>
  )
}
