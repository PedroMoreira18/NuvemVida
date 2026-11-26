import { zodResolver } from '@hookform/resolvers/zod'
import { FilePdf, ImageSquare, Paperclip, X } from '@phosphor-icons/react'
import { addYears } from 'date-fns'
import { useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { useSession } from '@/app/session'
import { Button } from '@/components/ui/Button'
import { Choice, Field, Input, Textarea } from '@/components/ui/Field'
import { addDocument, addEvent, addReminder } from '@/data/repo'
import type { CareType } from '@/data/types'
import { CARE, CARE_ORDER } from '@/lib/care'
import { toLocalInput } from '@/lib/dates'
import { formatBytes } from '@/lib/utils'

export const SUGGESTIONS: Record<CareType, string[]> = {
  vacina: ['V10', 'V8', 'Antirrábica', 'V4 felina', 'V5 felina', 'Gripe canina', 'Giárdia'],
  remedio: ['Antibiótico', 'Anti-inflamatório', 'Vitamina'],
  consulta: ['Consulta de rotina', 'Retorno', 'Cardiologista', 'Dermatologista'],
  exame: ['Hemograma', 'Raio-X', 'Ultrassom', 'Ecocardiograma'],
  peso: ['Pesagem'],
  outro: ['Vermífugo', 'Antipulgas', 'Banho e tosa', 'Castração'],
}

const schema = z.object({
  type: z.enum(['vacina', 'remedio', 'consulta', 'exame', 'peso', 'outro']),
  title: z.string().trim().min(2, 'Dê um nome para o registro.'),
  date: z.string().min(1, 'Escolha a data.'),
  weightKg: z.string().optional(),
  vet: z.string().optional(),
  clinic: z.string().optional(),
  notes: z.string().optional(),
  remindNext: z.boolean(),
})

type Values = z.infer<typeof schema>

export const TypeChoice = ({ value, onChange }: { value: CareType; onChange: (t: CareType) => void }) => (
  <Choice
    name="Tipo"
    value={value}
    onChange={onChange}
    options={CARE_ORDER.map((t) => {
      const Icon = CARE[t].icon
      return { value: t, label: CARE[t].label, icon: <Icon weight="duotone" /> }
    })}
  />
)

export const FilePicker = ({ files, onChange }: { files: File[]; onChange: (files: File[]) => void }) => {
  const input = useRef<HTMLInputElement>(null)
  return (
    <div className="grid gap-2">
      {files.map((file, i) => (
        <div key={`${file.name}-${i}`} className="flex items-center gap-3 rounded-2xl bg-surface p-3 ring-1 ring-line">
          {file.type === 'application/pdf' ? (
            <FilePdf weight="duotone" className="size-6 text-late" />
          ) : (
            <ImageSquare weight="duotone" className="size-6 text-brand" />
          )}
          <span className="min-w-0 flex-1 truncate text-sm font-semibold">{file.name}</span>
          <span className="font-mono text-xs text-ink-faint">{formatBytes(file.size)}</span>
          <button type="button" onClick={() => onChange(files.filter((_, j) => j !== i))} aria-label={`Remover ${file.name}`} className="grid size-8 place-items-center rounded-full hover:bg-surface-2">
            <X className="size-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => input.current?.click()}
        className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line p-4 text-sm font-semibold text-ink-soft transition-colors hover:border-brand hover:text-brand"
      >
        <Paperclip weight="bold" className="size-4.5" />
        Anexar foto ou PDF
      </button>
      <input
        ref={input}
        type="file"
        accept="image/*,application/pdf"
        multiple
        hidden
        onChange={(e) => {
          onChange([...files, ...Array.from(e.target.files ?? [])])
          e.target.value = ''
        }}
      />
    </div>
  )
}

export const EventForm = ({ initialType = 'vacina', onDone }: { initialType?: CareType; onDone: () => void }) => {
  const { user, pet } = useSession()
  const [files, setFiles] = useState<File[]>([])
  const { register, handleSubmit, control, watch, setValue, formState } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { type: initialType, title: '', date: toLocalInput(new Date().toISOString()), remindNext: initialType === 'vacina' },
  })
  const type = watch('type')
  const remindNext = watch('remindNext')

  if (!pet || !user) return null

  const onSubmit = async (values: Values) => {
    const weight = values.weightKg ? Number(values.weightKg.replace(',', '.')) : undefined
    const date = new Date(values.date).toISOString()
    const event = await addEvent({
      petId: pet.id,
      type: values.type,
      title: values.title,
      date,
      notes: values.notes || undefined,
      vet: values.vet || undefined,
      clinic: values.clinic || undefined,
      weightKg: weight && !Number.isNaN(weight) ? weight : undefined,
      createdBy: user.id,
    })
    await Promise.all(files.map((f) => addDocument(f, pet.id, user.id, event.id)))
    if (values.type === 'vacina' && values.remindNext) {
      await addReminder({
        petId: pet.id,
        type: 'vacina',
        title: `${values.title} (reforço)`,
        dueAt: addYears(new Date(values.date), 1).toISOString(),
        recurrence: { kind: 'anual', every: 1 },
        createdBy: user.id,
      })
    }
    toast.success(`Registrado no histórico de ${pet.name}.`)
    onDone()
  }

  const needsVet = type === 'vacina' || type === 'consulta' || type === 'exame'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5" noValidate>
      <Controller control={control} name="type" render={({ field }) => <TypeChoice value={field.value} onChange={field.onChange} />} />

      <Field label="O que foi?" htmlFor="ev-title" error={formState.errors.title?.message}>
        <Input id="ev-title" list="ev-suggestions" placeholder={SUGGESTIONS[type][0]} aria-invalid={!!formState.errors.title} {...register('title')} />
        <datalist id="ev-suggestions">
          {SUGGESTIONS[type].map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {SUGGESTIONS[type].slice(0, 4).map((s) => (
            <button key={s} type="button" onClick={() => setValue('title', s, { shouldValidate: true })} className="rounded-full bg-surface-2 px-3 py-1 text-xs font-semibold text-ink-soft hover:text-ink">
              {s}
            </button>
          ))}
        </div>
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Quando" htmlFor="ev-date" error={formState.errors.date?.message}>
          <Input id="ev-date" type="datetime-local" {...register('date')} />
        </Field>
        {type === 'peso' && (
          <Field label="Peso (kg)" htmlFor="ev-weight">
            <Input id="ev-weight" inputMode="decimal" placeholder="14,2" {...register('weightKg')} />
          </Field>
        )}
      </div>

      {needsVet && (
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Veterinário" htmlFor="ev-vet">
            <Input id="ev-vet" placeholder="Opcional" {...register('vet')} />
          </Field>
          <Field label="Clínica" htmlFor="ev-clinic">
            <Input id="ev-clinic" placeholder="Opcional" {...register('clinic')} />
          </Field>
        </div>
      )}

      <Field label="Anotações" htmlFor="ev-notes" hint="Dose, lote, o que o veterinário recomendou.">
        <Textarea id="ev-notes" {...register('notes')} />
      </Field>

      <div className="grid gap-1.5">
        <span className="text-sm font-semibold">Receita, exame ou carteirinha</span>
        <FilePicker files={files} onChange={setFiles} />
      </div>

      {type === 'vacina' && (
        <label className="flex cursor-pointer items-center gap-3 rounded-2xl bg-brand-soft p-4 text-sm font-semibold">
          <input type="checkbox" className="size-5 accent-[var(--brand)]" checked={remindNext} onChange={(e) => setValue('remindNext', e.target.checked)} />
          Me lembrar do reforço daqui a um ano
        </label>
      )}

      <Button type="submit" size="lg" disabled={formState.isSubmitting}>
        Salvar no histórico
      </Button>
    </form>
  )
}
