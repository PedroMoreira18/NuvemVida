import Dexie, { type EntityTable } from 'dexie'
import type { Completion, HealthEvent, Invite, Member, Pet, PetDocument, Reminder, User } from './types'

export const db = new Dexie('nuvem-vida') as Dexie & {
  users: EntityTable<User, 'id'>
  pets: EntityTable<Pet, 'id'>
  members: EntityTable<Member, 'id'>
  invites: EntityTable<Invite, 'code'>
  events: EntityTable<HealthEvent, 'id'>
  reminders: EntityTable<Reminder, 'id'>
  completions: EntityTable<Completion, 'id'>
  documents: EntityTable<PetDocument, 'id'>
}

db.version(1).stores({
  users: 'id, name',
  pets: 'id, createdBy',
  members: 'id, petId, userId, [petId+userId]',
  invites: 'code, petId',
  events: 'id, petId, type, date, [petId+date]',
  reminders: 'id, petId, dueAt, active',
  completions: 'id, reminderId, petId, doneAt',
  documents: 'id, petId, eventId, createdAt',
})

export const newId = () => crypto.randomUUID()
export const nowIso = () => new Date().toISOString()
