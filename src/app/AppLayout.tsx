import {
  CalendarDots,
  CaretUpDown,
  ClockCounterClockwise,
  IdentificationCard,
  NotePencil,
  BellSimpleRinging,
  Plus,
  SignOut,
  SquaresFour,
  UsersThree,
} from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { Link, Navigate, NavLink, useLocation, useNavigate, useOutlet } from 'react-router-dom'
import { Logo, LogoMark } from '@/components/brand/Logo'
import { PetAvatar, UserBadge } from '@/components/PetAvatar'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Sheet } from '@/components/ui/Sheet'
import { petAge } from '@/lib/dates'
import { cn } from '@/lib/utils'
import { ActionsProvider, useActions } from './actions'
import { useSession } from './session'
import { useReminderNotifications } from '@/features/agenda/notifications'

const NAV: { to: string; label: string; icon: Icon; end?: boolean }[] = [
  { to: '/app', label: 'Painel', icon: SquaresFour, end: true },
  { to: '/app/historico', label: 'Histórico', icon: ClockCounterClockwise },
  { to: '/app/agenda', label: 'Agenda', icon: CalendarDots },
  { to: '/app/familia', label: 'Família', icon: UsersThree },
]

const PetList = ({ onPick }: { onPick?: () => void }) => {
  const { pets, pet, selectPet } = useSession()
  return (
    <ul className="grid gap-1">
      {pets.map((p) => (
        <li key={p.id}>
          <button
            type="button"
            onClick={() => {
              selectPet(p.id)
              onPick?.()
            }}
            aria-current={p.id === pet?.id}
            className={cn(
              'flex w-full items-center gap-3 rounded-2xl p-2 text-left transition-colors',
              p.id === pet?.id ? 'bg-brand-soft' : 'hover:bg-surface-2',
            )}
          >
            <PetAvatar pet={p} className="size-10" />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-bold">{p.name}</span>
              <span className="block truncate text-xs text-ink-faint">
                {[p.breed, petAge(p.birthDate)].filter(Boolean).join(' · ')}
              </span>
            </span>
          </button>
        </li>
      ))}
      <li>
        <Link
          to="/app/pets/novo"
          onClick={onPick}
          className="flex items-center gap-3 rounded-2xl p-2 text-sm font-semibold text-ink-soft hover:bg-surface-2 hover:text-ink"
        >
          <span className="grid size-10 place-items-center rounded-[38%] border-2 border-dashed border-line">
            <Plus weight="bold" className="size-4" />
          </span>
          Adicionar pet
        </Link>
      </li>
    </ul>
  )
}

const UserMenu = ({ compact = false }: { compact?: boolean }) => {
  const { user, signOut } = useSession()
  const navigate = useNavigate()
  if (!user) return null
  return (
    <div className="flex items-center gap-2">
      <UserBadge name={user.name} hue={user.hue} className="size-9" />
      {!compact && <span className="min-w-0 flex-1 truncate text-sm font-semibold">{user.name}</span>}
      <button
        type="button"
        onClick={() => {
          signOut()
          navigate('/entrar')
        }}
        className="grid size-9 place-items-center rounded-full text-ink-faint hover:bg-surface-2 hover:text-ink"
        aria-label="Trocar de perfil"
        title="Trocar de perfil"
      >
        <SignOut weight="bold" className="size-4.5" />
      </button>
    </div>
  )
}

const Sidebar = () => {
  const { pet } = useSession()
  const { logEvent, scheduleReminder } = useActions()
  return (
    <aside className="sticky top-0 hidden h-dvh w-72 shrink-0 flex-col gap-6 border-r border-line bg-surface/60 px-4 py-6 lg:flex">
      <Link to="/" className="px-2" aria-label="Página inicial do Nuvem Vida">
        <Logo />
      </Link>
      <div>
        <p className="mb-2 px-2 text-xs font-bold tracking-wide text-ink-faint uppercase">Seus pets</p>
        <PetList />
      </div>
      <nav className="grid gap-1" aria-label="Seções do app">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-2xl px-3 py-2.5 font-semibold transition-colors',
                isActive ? 'bg-ink text-ground' : 'text-ink-soft hover:bg-surface-2 hover:text-ink',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon weight={isActive ? 'fill' : 'regular'} className="size-5" />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => logEvent()} className="flex flex-col items-start gap-2 rounded-2xl bg-brand p-3 text-left text-sm font-semibold text-white dark:text-brand-deep">
          <NotePencil weight="bold" className="size-5" />
          Registrar
        </button>
        <button type="button" onClick={() => scheduleReminder()} className="flex flex-col items-start gap-2 rounded-2xl bg-teal-soft p-3 text-left text-sm font-semibold text-ink">
          <BellSimpleRinging weight="bold" className="size-5 text-teal" />
          Lembrete
        </button>
      </div>
      <div className="mt-auto grid gap-3">
        {pet && (
          <Link
            to={`/consulta/${pet.id}`}
            className="flex items-center gap-3 rounded-2xl border border-line px-3 py-2.5 text-sm font-semibold hover:bg-surface-2"
          >
            <IdentificationCard weight="duotone" className="size-5 text-teal" />
            Modo consulta
          </Link>
        )}
        <div className="flex items-center gap-1">
          <div className="min-w-0 flex-1">
            <UserMenu />
          </div>
          <ThemeToggle className="text-ink-faint hover:bg-surface-2 hover:text-ink" />
        </div>
      </div>
    </aside>
  )
}

const MobileTopBar = () => {
  const { pet } = useSession()
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-line/70 bg-ground/85 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 backdrop-blur-xl lg:hidden">
      <Link to="/" aria-label="Página inicial">
        <LogoMark className="size-8" />
      </Link>
      <button type="button" onClick={() => setOpen(true)} className="flex min-w-0 flex-1 items-center gap-2 rounded-full py-1 pr-3 pl-1 text-left hover:bg-surface-2">
        {pet && <PetAvatar pet={pet} className="size-8" />}
        <span className="truncate font-display text-lg font-bold">{pet?.name ?? 'Seus pets'}</span>
        <CaretUpDown weight="bold" className="size-4 shrink-0 text-ink-faint" />
      </button>
      {pet && (
        <Link to={`/consulta/${pet.id}`} className="grid size-9 place-items-center rounded-full text-teal hover:bg-surface-2" aria-label="Modo consulta">
          <IdentificationCard weight="duotone" className="size-5.5" />
        </Link>
      )}
      <ThemeToggle className="size-9 text-ink-faint hover:bg-surface-2" />
      <Sheet open={open} onOpenChange={setOpen} title="Seus pets">
        <PetList onPick={() => setOpen(false)} />
        <div className="mt-4 grid gap-3 border-t border-line pt-4">
          <Link to="/app/pet" onClick={() => setOpen(false)} className="text-sm font-semibold text-brand">
            Ver perfil de {pet?.name}
          </Link>
          <UserMenu />
        </div>
      </Sheet>
    </header>
  )
}

const BottomNav = () => {
  const { openAddMenu } = useActions()
  const items = [NAV[0], NAV[1], null, NAV[2], NAV[3]]
  return (
    <nav
      aria-label="Seções do app"
      className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-30 grid grid-cols-5 items-center rounded-[1.75rem] bg-surface/90 p-1.5 shadow-lift ring-1 ring-line backdrop-blur-xl lg:hidden"
    >
      {items.map((item) =>
        item ? (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn('flex flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[0.68rem] font-semibold', isActive ? 'text-brand' : 'text-ink-faint')
            }
          >
            {({ isActive }) => (
              <>
                <item.icon weight={isActive ? 'fill' : 'regular'} className="size-6" />
                {item.label}
              </>
            )}
          </NavLink>
        ) : (
          <button
            key="add"
            type="button"
            onClick={openAddMenu}
            aria-label="Adicionar"
            className="mx-auto grid size-13 place-items-center rounded-[1.2rem] bg-brand text-white shadow-[0_8px_20px_-6px_rgb(148_3_166/0.8)] active:scale-95 dark:text-brand-deep"
          >
            <Plus weight="bold" className="size-6" />
          </button>
        ),
      )}
    </nav>
  )
}

const AnimatedOutlet = () => {
  const location = useLocation()
  const outlet = useOutlet()
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      >
        {outlet}
      </motion.div>
    </AnimatePresence>
  )
}

const Notifier = () => {
  useReminderNotifications()
  return null
}

export const AppLayout = () => {
  const { ready, user, pets } = useSession()
  const location = useLocation()

  if (!ready) return <div className="min-h-dvh bg-ground" />
  if (!user) return <Navigate to="/entrar" replace />
  const justCreated = (location.state as { createdPet?: string } | null)?.createdPet
  if (pets.length === 0 && !justCreated && location.pathname !== '/app/pets/novo') {
    return <Navigate to="/app/pets/novo?primeiro=1" replace />
  }

  return (
    <ActionsProvider>
      <Notifier />
      <div className="flex min-h-dvh">
        {pets.length > 0 && <Sidebar />}
        <div className="min-w-0 flex-1">
          {pets.length > 0 && <MobileTopBar />}
          <main className="mx-auto w-full max-w-5xl px-4 pt-6 pb-32 sm:px-8 lg:pt-10 lg:pb-16">
            <AnimatedOutlet />
          </main>
        </div>
      </div>
      {pets.length > 0 && <BottomNav />}
    </ActionsProvider>
  )
}
