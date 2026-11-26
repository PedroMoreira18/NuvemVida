import { zodResolver } from '@hookform/resolvers/zod'
import { BellRinging } from '@phosphor-icons/react'
import { addDays, setHours, setMinutes, startOfDay } from 'date-fns'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { useSession } from '@/app/session'
import { Button } from '@/components/ui/Button'
import { Choice, Field, Input, Textarea } from '@/components/ui/Field'
import { addReminder } from '@/data/repo'
import type { CareType, RecurrenceKind } from '@/data/types'
import { recurrenceLabel, toLocalInput } from '@/lib/dates'
import { SUGGESTIONS, TypeChoice } from '@/features/history/EventForm'
import { askNotificationPermission, notificationsSupported } from './notifications'

const schema = z.object({
  type: z.enum(['vacina', 'remedio', 'consulta', 'exame', 'peso', 'outro']),
  title: z.string().trim().min(2, 'Dê um nome para o lembrete.'),
  dueAt: z.string().min(1, 'Escolha quando.'),
  kind: z.enum(['nenhuma', 'horas', 'diaria', 'semanal', 'mensal', 'anual']),
  every: z.coerce.number<string>().int().min(1, 'Use 1 ou mais.').max(365),
  dose: z.string().optional(),
  notes: z.string().optional(),
})

type Values = z.input<typeof schema>
type Parsed = z.output<typeof schema>

const KIND_OPTIONS: { value: RecurrenceKind; label: string }[] = [
  { value: 'nenhuma', label: 'Uma vez' },
  { value: 'horas', label: 'De horas em horas' },
  { value: 'diaria', label: 'Dias' },
  { value: 'semanal', label: 'Semanas' },
  { value: 'mensal', label: 'Meses' },
  { value: 'anual', label: 'Anos' },
]

const UNIT: Record<RecurrenceKind, string> = {
  nenhuma: '', horas: 'horas', diaria: 'dias', semanal: 'semanas', mensal: 'meses', anual: 'anos',
}

const DEFAULT_KIND: Record<CareType, RecurrenceKind> = {
  vacina: 'anual', remedio: 'horas', consulta: 'nenhuma', exame: 'nenhuma', peso: 'mensal', outro: 'mensal',
}

const tomorrowAt9 = () => setMinutes(setHours(startOfDay(addDays(new Date(), 1)), 9), 0).toISOString()

export const ReminderForm = ({ initialType = 'remedio', onDone }: { initialType?: CareType; onDone: () => void }) => {
  const { user, pet } = useSession()
  const [permission, setPermission] = useState(() => (notificationsSupported() ? Notification.permission : 'denied'))
  const { register, handleSubmit, control, watch, setValue, formState } = useForm<Values, unknown, Parsed>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: initialType,
      title: '',
      dueAt: toLocalInput(tomorrowAt9()),
      kind: DEFAULT_KIND[initialType],
      every: initialType === 'remedio' ? '12' : initialType === 'outro' ? '3' : '1',
    },
  })
  const type = watch('type')
  const kind = watch('kind')
  const every = Number(watch('every')) || 1

  if (!pet || !user) return null

  const onSubmit = async (values: Parsed) => {
    await addReminder({
      petId: pet.id,
      type: values.type,
      title: values.title,
      dueAt: new Date(values.dueAt).toISOString(),
      recurrence: { kind: values.kind, every: values.every },
      dose: values.dose || undefined,
      notes: values.notes || undefined,
      createdBy: user.id,
    })
    toast.success('Lembrete criado.', { description: `${values.title} · ${recurrenceLabel({ kind: values.kind, every: values.every })}` })
    onDone()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5" noValidate>
      <Controller
        control={control}
        name="type"
        render={({ field }) => (
          <TypeChoice
            value={field.value}
            onChange={(t) => {
              field.onChange(t)
              setValue('kind', DEFAULT_KIND[t])
            }}
          />
        )}
      />

      <Field label="Do que é o lembrete?" htmlFor="rm-title" error={formState.errors.title?.message}>
        <Input id="rm-title" list="rm-suggestions" placeholder={SUGGESTIONS[type][0]} aria-invalid={!!formState.errors.title} {...register('title')} />
        <datalist id="rm-suggestions">
          {SUGGESTIONS[type].map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </Field>

      {type === 'remedio' && (
        <Field label="Dose" htmlFor="rm-dose" hint="Ex.: 1 comprimido de 2,5 mg">
          <Input id="rm-dose" {...register('dose')} />
        </Field>
      )}

      <Field label={kind === 'nenhuma' ? 'Quando' : 'Primeira vez'} htmlFor="rm-due" error={formState.errors.dueAt?.message}>
        <Input id="rm-due" type="datetime-local" {...register('dueAt')} />
      </Field>

      <div className="grid gap-2">
        <span className="text-sm font-semibold">Repetir</span>
        <Controller control={control} name="kind" render={({ field }) => <Choice name="Repetir" value={field.value} onChange={field.onChange} options={KIND_OPTIONS} />} />
        {kind !== 'nenhuma' && (
          <div className="mt-1 flex items-center gap-3 rounded-2xl bg-surface-2 p-3">
            <span className="text-sm font-semibold">A cada</span>
            <Input type="number" min={1} max={365} className="h-10 w-20 text-center" aria-label="Intervalo" {...register('every')} />
            <span className="text-sm text-ink-soft">{UNIT[kind]}</span>
            <span className="ml-auto text-sm font-bold text-brand">{recurrenceLabel({ kind, every })}</span>
          </div>
        )}
        {formState.errors.every && <p className="text-sm font-medium text-late">{formState.errors.every.message}</p>}
      </div>

      <Field label="Anotações" htmlFor="rm-notes">
        <Textarea id="rm-notes" placeholder="Ex.: dar junto com a comida" {...register('notes')} />
      </Field>

      {permission === 'default' && (
        <button
          type="button"
          onClick={async () => setPermission(await askNotificationPermission() as NotificationPermission)}
          className="flex items-center gap-3 rounded-2xl bg-teal-soft p-4 text-left text-sm"
        >
          <BellRinging weight="duotone" className="size-6 shrink-0 text-teal" />
          <span>
            <b className="block">Ativar avisos neste aparelho</b>
            <span className="text-ink-soft">O navegador vai pedir sua permissão.</span>
          </span>
        </button>
      )}

      <Button type="submit" size="lg" disabled={formState.isSubmitting}>
        Criar lembrete
      </Button>
    </form>
  )
}
