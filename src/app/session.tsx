import { useLiveQuery } from 'dexie-react-hooks'
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { db } from '@/data/db'
import type { Pet, User } from '@/data/types'

const USER_KEY = 'nv.currentUser'
const PET_KEY = 'nv.currentPet'

const readStorage = (key: string) => {
  try {
    return localStorage.getItem(key) ?? undefined
  } catch {
    return undefined
  }
}

const writeStorage = (key: string, value?: string) => {
  try {
    if (value) localStorage.setItem(key, value)
    else localStorage.removeItem(key)
  } catch {
  }
}

type Session = {
  ready: boolean
  user?: User
  users: User[]
  pets: Pet[]
  pet?: Pet
  signIn: (userId: string) => void
  signOut: () => void
  selectPet: (petId: string) => void
}

const SessionContext = createContext<Session | null>(null)

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [userId, setUserId] = useState(() => readStorage(USER_KEY))
  const [petId, setPetId] = useState(() => readStorage(PET_KEY))

  const users = useLiveQuery(() => db.users.orderBy('name').toArray(), [])
  const petsResult = useLiveQuery(async () => {
    if (!userId) return { userId, list: [] as Pet[] }
    const memberships = await db.members.where({ userId }).toArray()
    const list = await db.pets.bulkGet(memberships.map((m) => m.petId))
    return { userId, list: list.filter((p): p is Pet => !!p).sort((a, b) => a.createdAt.localeCompare(b.createdAt)) }
  }, [userId])
  const pets = petsResult?.userId === userId ? petsResult?.list : undefined

  const user = users?.find((u) => u.id === userId)
  const pet = pets?.find((p) => p.id === petId) ?? pets?.[0]

  useEffect(() => {
    if (users && userId && !user) {
      setUserId(undefined)
      writeStorage(USER_KEY)
    }
  }, [users, userId, user])

  const signIn = useCallback((id: string) => {
    setUserId(id)
    writeStorage(USER_KEY, id)
  }, [])

  const signOut = useCallback(() => {
    setUserId(undefined)
    writeStorage(USER_KEY)
  }, [])

  const selectPet = useCallback((id: string) => {
    setPetId(id)
    writeStorage(PET_KEY, id)
  }, [])

  const value = useMemo<Session>(
    () => ({ ready: users !== undefined && pets !== undefined, user, users: users ?? [], pets: pets ?? [], pet, signIn, signOut, selectPet }),
    [users, pets, user, pet, signIn, signOut, selectPet],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export const useSession = () => {
  const session = useContext(SessionContext)
  if (!session) throw new Error('useSession precisa estar dentro de <SessionProvider>')
  return session
}
