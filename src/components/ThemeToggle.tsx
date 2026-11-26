import { Moon, Sun } from '@phosphor-icons/react'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'

export const ThemeToggle = ({ className }: { className?: string }) => {
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Usar tema claro' : 'Usar tema escuro'}
      className={cn('grid size-10 place-items-center rounded-full transition-colors [&_svg]:size-5', className)}
    >
      {dark ? <Sun weight="bold" /> : <Moon weight="bold" />}
    </button>
  )
}
