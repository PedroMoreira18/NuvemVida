import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './db'
import type { Completion, User } from './types'

export const useUsersMap = () =>
  useLiveQuery(async () => new Map((await db.users.toArray()).map((u) => [u.id, u] as [string, User])), []) ??
  new Map<string, User>()

export const useActiveReminders = (petIds: string[]) =>
  useLiveQuery(
    async () => {
      if (!petIds.length) return []
      const list = await db.reminders.where('petId').anyOf(petIds).filter((r) => r.active === 1).toArray()
      return list.sort((a, b) => a.dueAt.localeCompare(b.dueAt))
    },
    [petIds.join(',')],
  )

export const useCompletions = (petId?: string, limit = 50) =>
  useLiveQuery(
    async () => (petId ? (await db.completions.where({ petId }).reverse().sortBy('doneAt')).slice(0, limit) : []),
    [petId, limit],
  ) ?? []

export const useLastCompletionByReminder = (petId?: string) => {
  const completions = useCompletions(petId, 200)
  const map = new Map<string, Completion>()
  for (const c of completions) if (!map.has(c.reminderId)) map.set(c.reminderId, c)
  return map
}

export const useEvents = (petId?: string) =>
  useLiveQuery(async () => (petId ? (await db.events.where({ petId }).toArray()).sort((a, b) => b.date.localeCompare(a.date)) : []), [petId])

export const useDocuments = (petId?: string) =>
  useLiveQuery(async () => (petId ? (await db.documents.where({ petId }).reverse().sortBy('createdAt')) : []), [petId])

export const useMembers = (petId?: string) =>
  useLiveQuery(async () => (petId ? db.members.where({ petId }).toArray() : []), [petId]) ?? []
