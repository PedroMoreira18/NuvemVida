import { addDays, setHours, setMinutes, startOfDay, subDays, subMonths, subYears } from 'date-fns'
import { db, newId, nowIso } from './db'
import { createUser } from './repo'
import type { Completion, HealthEvent, Member, Pet, Reminder, User } from './types'

const at = (date: Date, hour: number, minute = 0) => setMinutes(setHours(startOfDay(date), hour), minute)
const iso = (date: Date) => date.toISOString()

const nextDoseOf = (hours: number[]) => {
  const now = new Date()
  for (const h of hours) {
    const candidate = at(now, h)
    if (candidate > now) return candidate
  }
  return at(addDays(now, 1), hours[0])
}

export const seedDemo = async (name: string): Promise<User> => {
  const me = await createUser(name || 'Você')
  const marina: User = { id: newId(), name: 'Marina', hue: 330, createdAt: nowIso() }
  const jorge: User = { id: newId(), name: 'Jorge', hue: 150, createdAt: nowIso() }
  const now = new Date()

  const pacoca: Pet = {
    id: newId(),
    name: 'Paçoca',
    species: 'cachorro',
    breed: 'Vira-lata caramelo',
    sex: 'macho',
    birthDate: iso(subYears(subMonths(now, 4), 9)),
    weightKg: 14.2,
    photoUrl: '/img/pacoca.webp',
    allergies: 'Dipirona',
    conditions: 'Sopro cardíaco grau II, em acompanhamento',
    hue: 32,
    createdBy: me.id,
    createdAt: iso(subMonths(now, 14)),
  }
  const mingau: Pet = {
    id: newId(),
    name: 'Mingau',
    species: 'gato',
    breed: 'Sem raça definida, laranja',
    sex: 'macho',
    birthDate: iso(subYears(subMonths(now, 2), 3)),
    weightKg: 4.8,
    photoUrl: '/img/mingau.webp',
    conditions: 'Castrado',
    hue: 210,
    createdBy: me.id,
    createdAt: iso(subMonths(now, 13)),
  }

  const member = (petId: string, userId: string, role: Member['role']): Member => ({
    id: newId(), petId, userId, role, addedAt: nowIso(),
  })

  const event = (pet: Pet, e: Omit<HealthEvent, 'id' | 'petId' | 'createdAt' | 'createdBy'> & { by?: string }): HealthEvent => ({
    id: newId(), petId: pet.id, createdBy: e.by ?? me.id, createdAt: e.date, ...e,
  })

  const helena = { vet: 'Dra. Helena Prado', clinic: 'Clínica Patas & Cia' }
  const rui = { vet: 'Dr. Rui Albuquerque', clinic: 'Hospital Veterinário Boa Vista' }

  const events: HealthEvent[] = [
    event(pacoca, { type: 'vacina', title: 'V10 (polivalente)', date: iso(subMonths(now, 11)), notes: 'Lote 2231B. Reforço anual.', ...rui }),
    event(pacoca, { type: 'vacina', title: 'Antirrábica', date: iso(subDays(subMonths(now, 11), 1)), ...rui }),
    event(pacoca, { type: 'consulta', title: 'Cardiologista: primeira avaliação', date: iso(subMonths(now, 4)), notes: 'Sopro grau II. Começar pimobendan 2,5 mg de 12 em 12 horas. Evitar exercício pesado.', ...helena }),
    event(pacoca, { type: 'exame', title: 'Ecocardiograma', date: iso(subDays(subMonths(now, 4), 2)), notes: 'Leve aumento do átrio esquerdo.', ...helena }),
    event(pacoca, { type: 'remedio', title: 'Início do pimobendan 2,5 mg', date: iso(subMonths(now, 4)), notes: '1 comprimido a cada 12 horas, junto com comida.', ...helena }),
    event(pacoca, { type: 'outro', title: 'Antipulgas (Bravecto)', date: iso(subMonths(subDays(now, 2), 3)) }),
    event(pacoca, { type: 'exame', title: 'Hemograma e função renal', date: iso(subMonths(now, 2)), notes: 'Tudo dentro do normal.', ...rui, by: marina.id }),
    event(pacoca, { type: 'consulta', title: 'Retorno cardiologista', date: iso(subMonths(now, 1)), notes: 'Respondendo bem ao remédio. Manter dose.', ...helena, by: marina.id }),
    event(pacoca, { type: 'peso', title: 'Pesagem', date: iso(subMonths(now, 10)), weightKg: 15.1 }),
    event(pacoca, { type: 'peso', title: 'Pesagem', date: iso(subMonths(now, 6)), weightKg: 14.9 }),
    event(pacoca, { type: 'peso', title: 'Pesagem', date: iso(subMonths(now, 4)), weightKg: 14.7 }),
    event(pacoca, { type: 'peso', title: 'Pesagem', date: iso(subMonths(now, 2)), weightKg: 14.4 }),
    event(pacoca, { type: 'peso', title: 'Pesagem', date: iso(subMonths(now, 1)), weightKg: 14.2 }),

    event(mingau, { type: 'vacina', title: 'V4 felina', date: iso(subMonths(now, 10)), ...rui }),
    event(mingau, { type: 'vacina', title: 'Antirrábica', date: iso(subMonths(now, 10)), ...rui }),
    event(mingau, { type: 'consulta', title: 'Check-up anual', date: iso(subMonths(now, 10)), notes: 'Dentes ótimos. Manter ração para castrados.', ...rui }),
    event(mingau, { type: 'outro', title: 'Vermífugo', date: iso(subMonths(addDays(now, 1), 3)) }),
    event(mingau, { type: 'peso', title: 'Pesagem', date: iso(subMonths(now, 10)), weightKg: 4.5 }),
    event(mingau, { type: 'peso', title: 'Pesagem', date: iso(subMonths(now, 5)), weightKg: 4.7 }),
    event(mingau, { type: 'peso', title: 'Pesagem', date: iso(subMonths(now, 1)), weightKg: 4.8 }),
  ]

  const reminder = (pet: Pet, r: Omit<Reminder, 'id' | 'petId' | 'createdAt' | 'createdBy' | 'active'>): Reminder => ({
    id: newId(), petId: pet.id, createdBy: me.id, createdAt: nowIso(), active: 1, ...r,
  })

  const pimobendan = reminder(pacoca, {
    type: 'remedio',
    title: 'Pimobendan',
    dose: '2,5 mg · 1 comprimido',
    notes: 'Dar junto com a comida.',
    dueAt: iso(nextDoseOf([8, 20])),
    recurrence: { kind: 'horas', every: 12 },
  })

  const reminders: Reminder[] = [
    pimobendan,
    reminder(pacoca, { type: 'outro', title: 'Antipulgas (Bravecto)', dueAt: iso(at(subDays(now, 2), 9)), recurrence: { kind: 'mensal', every: 3 } }),
    reminder(pacoca, { type: 'consulta', title: 'Retorno com a cardiologista', notes: 'Levar o último ecocardiograma.', dueAt: iso(at(addDays(now, 6), 15, 30)), recurrence: { kind: 'nenhuma', every: 1 } }),
    reminder(pacoca, { type: 'vacina', title: 'V10 (reforço anual)', dueAt: iso(at(addDays(now, 30), 10)), recurrence: { kind: 'anual', every: 1 } }),
    reminder(pacoca, { type: 'vacina', title: 'Antirrábica', dueAt: iso(at(addDays(now, 29), 10)), recurrence: { kind: 'anual', every: 1 } }),
    reminder(mingau, { type: 'outro', title: 'Vermífugo', dose: '1 comprimido', dueAt: iso(at(addDays(now, 1), 9)), recurrence: { kind: 'mensal', every: 3 } }),
    reminder(mingau, { type: 'consulta', title: 'Check-up anual', dueAt: iso(at(addDays(now, 21), 11)), recurrence: { kind: 'anual', every: 1 } }),
    reminder(mingau, { type: 'vacina', title: 'V4 felina (reforço)', dueAt: iso(at(addDays(now, 60), 10)), recurrence: { kind: 'anual', every: 1 } }),
  ]

  const lastDose = new Date(new Date(pimobendan.dueAt).getTime() - 12 * 3_600_000 + 7 * 60_000)
  const completions: Completion[] = lastDose < now
    ? [{ id: newId(), reminderId: pimobendan.id, petId: pacoca.id, title: pimobendan.title, type: 'remedio', dueAt: iso(lastDose), doneAt: iso(lastDose), doneBy: marina.id }]
    : []

  await db.transaction('rw', [db.users, db.pets, db.members, db.events, db.reminders, db.completions], async () => {
    await db.users.bulkAdd([marina, jorge])
    await db.pets.bulkAdd([pacoca, mingau])
    await db.members.bulkAdd([
      member(pacoca.id, me.id, 'tutor'),
      member(mingau.id, me.id, 'tutor'),
      member(pacoca.id, marina.id, 'familia'),
      member(mingau.id, marina.id, 'familia'),
      member(pacoca.id, jorge.id, 'cuidador'),
    ])
    await db.events.bulkAdd(events)
    await db.reminders.bulkAdd(reminders)
    await db.completions.bulkAdd(completions)
  })

  return me
}

export const resetAll = () => Promise.all(db.tables.map((t) => t.clear()))
