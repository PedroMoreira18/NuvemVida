import Lenis from 'lenis'
import { motion, useMotionValueEvent, useScroll } from 'motion/react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSession } from '@/app/session'
import { Logo } from '@/components/brand/Logo'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { FinalCta, Plans, Team } from './Closing'
import { Family } from './Family'
import { Hero } from './Hero'
import { HowItWorks } from './HowItWorks'
import { Problem } from './Problem'

const NAV = [
  ['#como-funciona', 'Como funciona'],
  ['#familia', 'Família'],
  ['#planos', 'Planos'],
  ['#equipe', 'Equipe'],
]

const useSmoothScroll = () => {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis({ anchors: { offset: -80 } })
    let frame = requestAnimationFrame(function raf(time) {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    })
    return () => {
      cancelAnimationFrame(frame)
      lenis.destroy()
    }
  }, [])
}

const Header = () => {
  const { user } = useSession()
  const { scrollY } = useScroll()
  const [solid, setSolid] = useState(false)
  useMotionValueEvent(scrollY, 'change', (y) => setSolid(y > 40))

  return (
    <motion.header
      className={cn(
        'fixed inset-x-0 top-0 z-40 transition-[background-color,box-shadow,color] duration-300',
        solid ? 'bg-ground/85 text-ink shadow-[0_1px_0_var(--line)] backdrop-blur-xl' : 'text-white',
      )}
    >
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
        <Link to="/" aria-label="Nuvem Vida, início">
          <Logo inverted={!solid} />
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Seções">
          {NAV.map(([href, label]) => (
            <a
              key={href}
              href={href}
              className={cn('rounded-full px-4 py-2 text-sm font-semibold transition-colors', solid ? 'hover:bg-surface-2' : 'hover:bg-white/10')}
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle className={solid ? 'hover:bg-surface-2' : 'hover:bg-white/10'} />
          <Button asChild size="sm" variant={solid ? 'primary' : 'white'}>
            <Link to={user ? '/app' : '/entrar'}>{user ? 'Abrir o app' : 'Entrar'}</Link>
          </Button>
        </div>
      </div>
    </motion.header>
  )
}

export const Landing = () => {
  useSmoothScroll()
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Problem />
        <HowItWorks />
        <Family />
        <Plans />
        <Team />
        <FinalCta />
      </main>
    </>
  )
}
