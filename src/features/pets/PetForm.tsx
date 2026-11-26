import { zodResolver } from '@hookform/resolvers/zod'
import { Bird, Camera, Cat, Dog } from '@phosphor-icons/react'
import { useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { PetAvatar } from '@/components/PetAvatar'
import { Button } from '@/components/ui/Button'
import { Choice, Field, Input, Textarea } from '@/components/ui/Field'
import type { Pet } from '@/data/types'
import { toDateInput } from '@/lib/dates'
import { shrinkImage } from '@/lib/image'

const schema = z.object({
  name: z.string().trim().min(1, 'Qual é o nome do seu pet?').max(40),
  species: z.enum(['cachorro', 'gato', 'outro']),
  sex: z.enum(['macho', 'femea', '']),
  birthDate: z.string().optional(),
  breed: z.string().optional(),
  weightKg: z
    .string()
    .optional()
    .refine((v) => !v || !Number.isNaN(Number(v.replace(',', '.'))), 'Use só números, ex.: 12,5'),
  allergies: z.string().optional(),
  conditions: z.string().optional(),
})

type Values = z.infer<typeof schema>

export type PetFormData = Pick<Pet, 'name' | 'species' | 'sex' | 'birthDate' | 'breed' | 'weightKg' | 'allergies' | 'conditions' | 'photo'>

type Props = {
  initial?: Pet
  submitLabel: string
  onSubmit: (data: PetFormData) => Promise<void> | void
  compact?: boolean
}

export const PetForm = ({ initial, submitLabel, onSubmit, compact = false }: Props) => {
  const [photo, setPhoto] = useState<Blob | undefined>(initial?.photo)
  const fileInput = useRef<HTMLInputElement>(null)
  const { register, handleSubmit, control, watch, formState } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initial?.name ?? '',
      species: initial?.species ?? 'cachorro',
      sex: initial?.sex ?? '',
      birthDate: initial?.birthDate ? toDateInput(initial.birthDate) : '',
      breed: initial?.breed ?? '',
      weightKg: initial?.weightKg ? String(initial.weightKg).replace('.', ',') : '',
      allergies: initial?.allergies ?? '',
      conditions: initial?.conditions ?? '',
    },
  })
  const name = watch('name')
  const species = watch('species')

  const submit = (v: Values) =>
    onSubmit({
      name: v.name.trim(),
      species: v.species,
      sex: v.sex || undefined,
      birthDate: v.birthDate ? new Date(`${v.birthDate}T12:00:00`).toISOString() : undefined,
      breed: v.breed?.trim() || undefined,
      weightKg: v.weightKg ? Number(v.weightKg.replace(',', '.')) : undefined,
      allergies: v.allergies?.trim() || undefined,
      conditions: v.conditions?.trim() || undefined,
      photo,
    })

  return (
    <form onSubmit={handleSubmit(submit)} className="grid gap-6" noValidate>
      <div className="flex items-center gap-5">
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          className="group relative rounded-[38%] focus-visible:outline-offset-4"
          aria-label="Escolher foto do pet"
        >
          <PetAvatar
            pet={{ name: name || 'Pet', species, photo, photoUrl: photo ? undefined : initial?.photoUrl, hue: initial?.hue ?? 215 }}
            className="size-24"
          />
          <span className="absolute -right-1 -bottom-1 grid size-9 place-items-center rounded-full bg-ink text-ground ring-4 ring-ground transition-transform group-hover:scale-110">
            <Camera weight="bold" className="size-4.5" />
          </span>
        </button>
        <div className="text-sm text-ink-soft">
          <p className="font-semibold text-ink">Foto</p>
          <p>Ajuda a reconhecer cada pet rapidinho.</p>
        </div>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          hidden
          onChange={async (e) => {
            const file = e.target.files?.[0]
            if (file) setPhoto(await shrinkImage(file))
          }}
        />
      </div>

      <Field label="Nome" htmlFor="pet-name" error={formState.errors.name?.message}>
        <Input id="pet-name" placeholder="Ex.: Paçoca" autoComplete="off" aria-invalid={!!formState.errors.name} {...register('name')} />
      </Field>

      <div className="grid gap-2">
        <span className="text-sm font-semibold">É um…</span>
        <Controller
          control={control}
          name="species"
          render={({ field }) => (
            <Choice
              name="Espécie"
              value={field.value}
              onChange={field.onChange}
              options={[
                { value: 'cachorro', label: 'Cachorro', icon: <Dog weight="duotone" /> },
                { value: 'gato', label: 'Gato', icon: <Cat weight="duotone" /> },
                { value: 'outro', label: 'Outro', icon: <Bird weight="duotone" /> },
              ]}
            />
          )}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Nascimento" htmlFor="pet-birth" hint="Se não souber, coloque uma data aproximada.">
          <Input id="pet-birth" type="date" {...register('birthDate')} />
        </Field>
        <div className="grid content-start gap-1.5">
          <span className="text-sm font-semibold">Sexo</span>
          <Controller
            control={control}
            name="sex"
            render={({ field }) => (
              <Choice
                name="Sexo"
                value={field.value ?? ''}
                onChange={field.onChange}
                options={[
                  { value: 'macho', label: 'Macho' },
                  { value: 'femea', label: 'Fêmea' },
                ]}
              />
            )}
          />
        </div>
      </div>

      {!compact && (
        <>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Raça" htmlFor="pet-breed">
              <Input id="pet-breed" placeholder="Ex.: vira-lata" {...register('breed')} />
            </Field>
            <Field label="Peso (kg)" htmlFor="pet-weight" error={formState.errors.weightKg?.message}>
              <Input id="pet-weight" inputMode="decimal" placeholder="Ex.: 12,5" {...register('weightKg')} />
            </Field>
          </div>
          <Field label="Alergias" htmlFor="pet-allergies" hint="Aparece em destaque no modo consulta.">
            <Input id="pet-allergies" placeholder="Ex.: dipirona, frango" {...register('allergies')} />
          </Field>
          <Field label="Condições de saúde" htmlFor="pet-conditions">
            <Textarea id="pet-conditions" placeholder="Ex.: sopro no coração, castrado, diabetes" {...register('conditions')} />
          </Field>
        </>
      )}

      <Button type="submit" size="lg" disabled={formState.isSubmitting}>
        {submitLabel}
      </Button>
    </form>
  )
}
