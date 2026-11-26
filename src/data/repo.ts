import { nextOccurrenceAfter } from '@/lib/dates'
import { db, newId, nowIso } from './db'
import type { Completion, HealthEvent, MemberRole, Pet, PetDocument, Reminder, User } from './types'

const randomHue = () => Math.floor(Math.random() * 360)

export const createUser = async (name: string): Promise<User> => {
  const user: User = { id: newId(), name: name.trim(), hue: randomHue(), createdAt: nowIso() }
  await db.users.add(user)
  return user
}

export const createPet = async (data: Omit<Pet, 'id' | 'createdAt' | 'hue'> & { hue?: number }) => {
  const pet: Pet = { ...data, hue: data.hue ?? randomHue(), id: newId(), createdAt: nowIso() }
  await db.transaction('rw', db.pets, db.members, async () => {
    await db.pets.add(pet)
    await db.members.add({ id: newId(), petId: pet.id, userId: data.createdBy, role: 'tutor', addedAt: nowIso() })
  })
  return pet
}

export const updatePet = (id: string, changes: Partial<Pet>) => db.pets.update(id, changes)

export const deletePet = (petId: string) =>
  db.transaction('rw', [db.pets, db.members, db.invites, db.events, db.reminders, db.completions, db.documents], async () => {
    await Promise.all([
      db.members.where({ petId }).delete(),
      db.invites.where({ petId }).delete(),
      db.events.where({ petId }).delete(),
      db.reminders.where({ petId }).delete(),
      db.completions.where({ petId }).delete(),
      db.documents.where({ petId }).delete(),
    ])
    await db.pets.delete(petId)
  })

export const addEvent = async (data: Omit<HealthEvent, 'id' | 'createdAt'>) => {
  const event: HealthEvent = { ...data, id: newId(), createdAt: nowIso() }
  await db.events.add(event)
  if (event.type === 'peso' && event.weightKg) await db.pets.update(event.petId, { weightKg: event.weightKg })
  return event
}

export const deleteEvent = (id: string) =>
  db.transaction('rw', db.events, db.documents, async () => {
    await db.documents.where({ eventId: id }).modify({ eventId: undefined })
    await db.events.delete(id)
  })

export const addReminder = async (data: Omit<Reminder, 'id' | 'createdAt' | 'active'>) => {
  const reminder: Reminder = { ...data, active: 1, id: newId(), createdAt: nowIso() }
  await db.reminders.add(reminder)
  return reminder
}

export const deleteReminder = (id: string) => db.reminders.delete(id)

export const lastCompletion = async (reminderId: string) =>
  (await db.completions.where({ reminderId }).sortBy('doneAt')).at(-1)

export const findRecentDuplicate = async (reminder: Reminder) => {
  const last = await lastCompletion(reminder.id)
  if (!last) return undefined
  const windowHours = reminder.recurrence.kind === 'horas' ? Math.max(1, reminder.recurrence.every / 2) : 12
  const elapsed = Date.now() - new Date(last.doneAt).getTime()
  return elapsed < windowHours * 3_600_000 ? last : undefined
}

const eventTitleFor = (reminder: Reminder) => {
  switch (reminder.type) {
    case 'vacina': return `${reminder.title} aplicada`
    case 'consulta': return reminder.title
    case 'exame': return reminder.title
    default: return reminder.title
  }
}

export const completeReminder = async (reminder: Reminder, userId: string) => {
  const completion: Completion = {
    id: newId(),
    reminderId: reminder.id,
    petId: reminder.petId,
    title: reminder.title,
    type: reminder.type,
    dueAt: reminder.dueAt,
    doneAt: nowIso(),
    doneBy: userId,
  }
  await db.transaction('rw', db.completions, db.reminders, db.events, async () => {
    await db.completions.add(completion)
    if (reminder.recurrence.kind === 'nenhuma') {
      await db.reminders.update(reminder.id, { active: 0 })
    } else {
      await db.reminders.update(reminder.id, { dueAt: nextOccurrenceAfter(reminder.dueAt, reminder.recurrence).toISOString() })
    }
    if (reminder.type !== 'remedio') {
      await db.events.add({
        id: newId(),
        petId: reminder.petId,
        type: reminder.type,
        title: eventTitleFor(reminder),
        date: completion.doneAt,
        notes: reminder.notes,
        createdBy: userId,
        createdAt: nowIso(),
      })
    }
  })
  return completion
}

export const undoCompletion = async (completion: Completion, previous: Reminder) =>
  db.transaction('rw', db.completions, db.reminders, db.events, async () => {
    await db.completions.delete(completion.id)
    await db.reminders.put(previous)
    if (previous.type !== 'remedio') {
      await db.events.where({ petId: completion.petId }).filter((e) => e.date === completion.doneAt).delete()
    }
  })

const inviteCode = () => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from(crypto.getRandomValues(new Uint8Array(6)), (b) => alphabet[b % alphabet.length]).join('')
}

export const createInvite = async (petId: string, role: MemberRole, createdBy: string) => {
  const invite = { code: inviteCode(), petId, role, createdBy, createdAt: nowIso() }
  await db.invites.add(invite)
  return invite
}

export type InviteResult = 'ok' | 'not-found' | 'already-member'

export const acceptInvite = async (code: string, userId: string): Promise<InviteResult> => {
  const invite = await db.invites.get(code.trim().toUpperCase())
  if (!invite) return 'not-found'
  const existing = await db.members.where({ petId: invite.petId, userId }).first()
  if (existing) return 'already-member'
  await db.transaction('rw', db.members, db.invites, async () => {
    await db.members.add({ id: newId(), petId: invite.petId, userId, role: invite.role, addedAt: nowIso() })
    await db.invites.update(invite.code, { acceptedBy: userId })
  })
  return 'ok'
}

export const removeMember = (memberId: string) => db.members.delete(memberId)

export const addDocument = async (file: File, petId: string, createdBy: string, eventId?: string) => {
  const doc: PetDocument = {
    id: newId(),
    petId,
    eventId,
    name: file.name,
    mime: file.type || 'application/octet-stream',
    size: file.size,
    blob: file,
    createdBy,
    createdAt: nowIso(),
  }
  await db.documents.add(doc)
  return doc
}

export const deleteDocument = (id: string) => db.documents.delete(id)
