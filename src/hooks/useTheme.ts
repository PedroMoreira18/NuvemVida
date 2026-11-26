import { useCallback, useEffect, useSyncExternalStore } from 'react'

type Theme = 'light' | 'dark'
const KEY = 'nv.theme'
const listeners = new Set<() => void>()

const stored = (): Theme | undefined => {
  try {
    const value = localStorage.getItem(KEY)
    return value === 'light' || value === 'dark' ? value : undefined
  } catch {
    return undefined
  }
}

const current = (): Theme =>
  stored() ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')

export const applyTheme = () => document.documentElement.classList.toggle('dark', current() === 'dark')

export const useTheme = () => {
  const theme = useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    current,
    () => 'light' as Theme,
  )

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      applyTheme()
      listeners.forEach((l) => l())
    }
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  const toggle = useCallback(() => {
    try {
      localStorage.setItem(KEY, current() === 'dark' ? 'light' : 'dark')
    } catch {
      document.documentElement.classList.toggle('dark')
      return
    }
    applyTheme()
    listeners.forEach((l) => l())
  }, [])

  return { theme, toggle }
}
