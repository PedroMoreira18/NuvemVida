import { useEffect } from 'react'
import { toast } from 'sonner'
import { useSession } from '@/app/session'
import { db } from '@/data/db'
import type { Reminder } from '@/data/types'
import { relativeDue } from '@/lib/dates'

const NOTIFIED_KEY = 'nv.notified'
const CHECK_EVERY_MS = 30_000

const loadNotified = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(NOTIFIED_KEY) ?? '[]')
  } catch {
    return []
  }
}

const saveNotified = (keys: string[]) => {
  try {
    localStorage.setItem(NOTIFIED_KEY, JSON.stringify(keys.slice(-200)))
  } catch {
  }
}

const leadMs = (r: Reminder) => (r.type === 'remedio' ? 0 : 24 * 3_600_000)

export const notificationsSupported = () => typeof window !== 'undefined' && 'Notification' in window

export const askNotificationPermission = async () => {
  if (!notificationsSupported()) return 'unsupported' as const
  return Notification.requestPermission()
}

const show = async (title: string, body: string) => {
  if (notificationsSupported() && Notification.permission === 'granted') {
    const registration = await navigator.serviceWorker?.getRegistration()
    if (registration) registration.showNotification(title, { body, icon: '/pwa-192.png', badge: '/pwa-192.png' })
    else new Notification(title, { body, icon: '/pwa-192.png' })
  }
  toast(title, { description: body })
}

export const useReminderNotifications = () => {
  const { pets } = useSession()

  useEffect(() => {
    if (!pets.length) return
    const names = new Map(pets.map((p) => [p.id, p.name]))

    const check = async () => {
      const reminders = await db.reminders.where('petId').anyOf([...names.keys()]).filter((r) => r.active === 1).toArray()
      const notified = loadNotified()
      const now = Date.now()
      for (const r of reminders) {
        const key = `${r.id}@${r.dueAt}`
        const due = new Date(r.dueAt).getTime()
        if (notified.includes(key) || due - leadMs(r) > now || now - due > 6 * 3_600_000) continue
        notified.push(key)
        await show(`${r.title} · ${names.get(r.petId)}`, r.dose ? `${r.dose}. ${relativeDue(r.dueAt)}` : relativeDue(r.dueAt))
      }
      saveNotified(notified)
    }

    check()
    const timer = setInterval(check, CHECK_EVERY_MS)
    return () => clearInterval(timer)
  }, [pets])
}
