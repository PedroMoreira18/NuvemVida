import { useGSAP } from '@gsap/react'
import { CalendarDots, ClockCounterClockwise, IdentificationCard, SquaresFour } from '@phosphor-icons/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { AnimatePresence, motion } from 'motion/react'
import { useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { AgendaScreen, DashboardScreen, HistoryScreen, Phone, VetScreen } from './Phone'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const STEPS = [
  {
    icon: SquaresFour,
    title: 'Abra e veja o que vence nesta semana',
    text: 'O painel junta o que importa nos próximos dias: a dose da noite, a vacina do mês que vem, o antipulgas que passou da data. Verde está em dia, amarelo está chegando e vermelho atrasou.',
    screen: DashboardScreen,
  },
  {
    icon: ClockCounterClockwise,
    title: 'A vida do pet numa linha do tempo',
    text: 'Vacinas, consultas, exames e remédios entram em ordem, com a foto da receita ou o PDF do exame junto. Dá para filtrar por tipo e registrar algo novo em poucos toques.',
    screen: HistoryScreen,
  },
  {
    icon: CalendarDots,
    title: 'Lembretes que se repetem sozinhos',
    text: 'Remédio de 12 em 12 horas, vermífugo a cada três meses, vacina uma vez por ano. Você programa uma vez e o aviso chega antes. Se quiser, manda tudo para a agenda do celular.',
    screen: AgendaScreen,
  },
  {
    icon: IdentificationCard,
    title: 'Na consulta, é só virar a tela',
    text: 'O modo consulta mostra alergias, remédios em uso e as últimas vacinas em letra grande, do jeito que o veterinário precisa ler. Também sai impresso ou em PDF.',
    screen: VetScreen,
  },
]

export const HowItWorks = () => {
  const root = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)

  useGSAP(
    () => {
      const steps = gsap.utils.toArray<HTMLElement>('[data-step]')
      steps.forEach((step, i) => {
        ScrollTrigger.create({
          trigger: step,
          start: 'top 55%',
          end: 'bottom 55%',
          onToggle: (self) => self.isActive && setActive(i),
        })
      })
      gsap.fromTo(
        '[data-progress]',
        { scaleY: 0 },
        { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '[data-steps]', start: 'top 55%', end: 'bottom 55%', scrub: 0.4 } },
      )
    },
    { scope: root },
  )

  const Screen = STEPS[active].screen

  return (
    <section id="como-funciona" ref={root} className="relative bg-surface-2/60 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <h2 className="max-w-2xl text-4xl leading-[1.02] font-extrabold sm:text-5xl">
          Tudo o que o seu pet precisa, na ordem em que acontece.
        </h2>

        <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_auto] lg:gap-24">
          <div data-steps className="relative grid gap-8 pl-8 lg:gap-[30vh] lg:py-[12vh]">
            <div className="absolute top-0 bottom-0 left-[0.6875rem] w-0.5 rounded-full bg-line" />
            <div data-progress className="absolute top-0 bottom-0 left-[0.6875rem] w-0.5 origin-top rounded-full bg-brand" />
            {STEPS.map((step, i) => {
              const Icon = step.icon
              const MobileScreen = step.screen
              return (
                <article key={step.title} data-step className="relative">
                  <span
                    className={cn(
                      'absolute top-0.5 -left-8 grid size-6 place-items-center rounded-full ring-4 ring-ground transition-colors duration-500',
                      i <= active ? 'bg-brand text-white' : 'bg-line text-ink-faint',
                    )}
                  >
                    <span className="size-1.5 rounded-full bg-current" />
                  </span>
                  <div
                    className={cn(
                      'transition-opacity duration-500 lg:opacity-35',
                      i === active && 'lg:opacity-100',
                    )}
                  >
                    <Icon weight="duotone" className="size-9 text-brand" />
                    <h3 className="mt-3 text-2xl font-bold sm:text-3xl">{step.title}</h3>
                    <p className="mt-3 max-w-[34rem] text-lg leading-relaxed text-ink-soft">{step.text}</p>
                  </div>
                  <div className="mt-8 flex justify-center lg:hidden">
                    <Phone className="w-[15.5rem]">
                      <MobileScreen />
                    </Phone>
                  </div>
                </article>
              )
            })}
          </div>

          <div className="hidden lg:block">
            <div className="sticky top-[calc(50vh-18rem)]">
              <Phone className="w-[18rem]">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div
                    key={active}
                    initial={{ opacity: 0, y: 30, filter: 'blur(6px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -30, filter: 'blur(6px)' }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0"
                  >
                    <Screen />
                  </motion.div>
                </AnimatePresence>
              </Phone>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
