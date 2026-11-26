import { ArrowRight, Sparkle } from '@phosphor-icons/react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { ClinicSeal, VaccineSticker } from '@/components/Stamp'
import { Button } from '@/components/ui/Button'
import { Cloud, CloudEdge } from './Clouds'
import { DashboardScreen, Phone } from './Phone'

const EASE = [0.16, 1, 0.3, 1] as const

const stick = (delay: number, rotate: number) => ({
  initial: { opacity: 0, scale: 1.35, rotate: rotate - 12, y: -40 },
  animate: { opacity: 1, scale: 1, rotate, y: 0 },
  transition: { delay, type: 'spring' as const, stiffness: 420, damping: 22, mass: 0.9 },
})

export const Hero = () => {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const photoY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 90])
  const phoneY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -60])

  return (
    <section ref={ref} className="relative isolate overflow-hidden bg-field pt-28 text-white sm:pt-32">
      <Cloud className="absolute -top-36 -right-44 w-[22rem] rotate-180 animate-drift-slow text-cloud sm:-top-28 sm:right-[4%] sm:w-[34rem]" />
      <Cloud className="absolute -bottom-20 -left-48 w-[22rem] animate-drift text-orange sm:-bottom-24 sm:-left-60 sm:w-[30rem]" />

      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 pb-10 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:pb-4">
        <div className="relative z-10 max-w-xl">
          <motion.h1
            initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.9, ease: EASE }}
            className="text-[2.8rem] leading-[0.98] font-extrabold tracking-[-0.04em] text-mint sm:text-6xl lg:text-[4.6rem]"
          >
            A carteirinha do seu pet agora mora na nuvem.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
            className="mt-6 max-w-[34rem] text-lg leading-relaxed text-white/85 sm:text-xl"
          >
            Vacina, remédio, consulta e exame ficam guardados no celular. O Nuvem Vida avisa antes de cada data e mostra
            para a família inteira quem já deu o remédio.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.28, ease: EASE }}
            className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Button asChild variant="white" size="lg">
              <Link to="/entrar">
                Começar agora
                <ArrowRight weight="bold" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="text-white hover:bg-white/10 hover:text-white">
              <Link to="/entrar?demo=1">
                <Sparkle weight="fill" />
                Ver com o Paçoca e o Mingau
              </Link>
            </Button>
          </motion.div>
          <p className="mt-6 text-sm text-white/70">Grátis, sem baixar nada. Funciona até sem internet.</p>
        </div>

        <div className="relative mx-auto h-[33rem] w-full max-w-[34rem] sm:h-[38rem]">
          <motion.div
            style={{ y: photoY }}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, ease: EASE }}
            className="absolute top-0 right-0 h-[82%] w-[82%] overflow-hidden rounded-[3rem] shadow-[0_40px_80px_-40px_rgb(40_4_48/0.7)]"
          >
            <img
              src="/img/hero-cao-ceu.webp"
              alt="Cachorro caramelo de coleira vermelha olhando para o lado, com o céu azul ao fundo"
              className="size-full object-cover object-[60%_center]"
              fetchPriority="high"
            />
          </motion.div>

          <motion.div
            style={{ y: phoneY }}
            initial={{ opacity: 0, y: 80, rotate: -4 }}
            animate={{ opacity: 1, y: 0, rotate: -4 }}
            transition={{ duration: 1, delay: 0.25, ease: EASE }}
            className="absolute bottom-0 left-0 origin-bottom-left scale-[0.82] sm:scale-100"
          >
            <Phone>
              <DashboardScreen />
            </Phone>
          </motion.div>

          <motion.div {...stick(1.05, 6)} className="absolute -top-5 left-[44%] sm:left-[52%]">
            <VaccineSticker vaccine="V10" maker="Polivalente canina" lot="2231B" date="12/12/2025" tone="orange" />
          </motion.div>
          <motion.div {...stick(1.3, -5)} className="absolute right-[-0.5rem] bottom-[17%] sm:right-[-1.75rem]">
            <VaccineSticker vaccine="Antirrábica" maker="Dose anual" lot="R-0918" date="11/12/2025" tone="teal" />
          </motion.div>
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 2.4 }}
            animate={{ opacity: 0.85, scale: 1, rotate: -16 }}
            transition={{ delay: 1.75, duration: 0.26, ease: [0.5, 0, 0.75, 0] }}
            className="absolute right-[-0.75rem] bottom-[7%] sm:right-[-2.5rem]"
          >
            <ClinicSeal clinic="Clínica Patas & Cia" vet="Dra. Helena Prado" color="#5a0266" className="size-24 sm:size-28" />
          </motion.div>
        </div>
      </div>
      <CloudEdge className="relative -mb-px text-ground" />
    </section>
  )
}
