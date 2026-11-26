import { Alarm } from '@phosphor-icons/react'
import { motion } from 'motion/react'
import type { ReactNode } from 'react'

const FACTS = [
  {
    value: '149 mi',
    text: 'de animais de estimação vivem no Brasil, a terceira maior população pet do mundo.',
    source: 'Senado Notícias',
  },
  {
    value: '95%',
    text: 'dos tutores de cães acham a saúde do pet tão importante quanto a de alguém da família. Entre tutores de gatos, são 96%.',
    source: 'SINDAN',
  },
  {
    value: '35,2%',
    text: 'não fazem nada para prevenir problemas de saúde no futuro. Só pensam nisso quando o bicho adoece.',
    source: 'Royal Canin / Censuswide',
  },
  {
    value: '50%',
    text: 'já deixaram de fazer algum procedimento no pet por falta de dinheiro.',
    source: 'Quaest, 2024',
  },
  {
    value: '92%',
    text: 'dos pets brasileiros não têm plano de saúde.',
    source: 'Quaest, 2024',
  },
]

const Scrap = ({ className, children }: { className: string; children: ReactNode }) => (
  <div className={`absolute rounded-xl px-3 py-2 text-[0.8rem] font-semibold shadow-card ${className}`}>{children}</div>
)

export const Problem = () => (
  <section id="problema" className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
    <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
      <div className="lg:sticky lg:top-28 lg:self-start">
        <h2 className="text-4xl leading-[1.02] font-extrabold sm:text-5xl">Hoje, a saúde do pet fica espalhada por aí.</h2>
        <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-soft">
          A carteirinha de papel some na gaveta. A receita vai parar no WhatsApp e o resultado do exame fica no e-mail de
          alguém. Aí o veterinário pergunta a data da última vacina e ninguém lembra direito.
        </p>
        <div className="relative mt-12 hidden h-44 sm:block" aria-hidden="true">
          <Scrap className="top-2 left-0 -rotate-6 bg-[#fff6b8] text-[#5c4a00]">Vermífugo do Mingau??</Scrap>
          <Scrap className="top-16 left-40 rotate-3 bg-[#dcf8c6] text-[#1f4d1a]">
            Mãe, você deu o remédio do Paçoca?
            <span className="ml-2 font-mono text-[0.65rem] opacity-60">20:14</span>
          </Scrap>
          <Scrap className="top-28 left-6 rotate-2 bg-surface text-ink-soft">
            <span className="font-mono">receita_vet_FINAL(2).jpg</span>
          </Scrap>
          <Scrap className="top-0 left-72 flex rotate-[8deg] items-center gap-1.5 bg-late-soft text-late">
            <Alarm weight="bold" className="size-4" />
            Alarme 08:00 · adiado 3x
          </Scrap>
        </div>
      </div>

      <div className="rounded-[2rem] bg-surface p-2 shadow-card ring-1 ring-line">
        <div className="flex items-baseline justify-between border-b-2 border-ink px-5 pt-5 pb-3">
          <p className="font-display text-lg font-bold">Ficha do problema</p>
          <p className="font-mono text-xs text-ink-faint">BRASIL</p>
        </div>
        <ol>
          {FACTS.map((fact, i) => (
            <motion.li
              key={fact.value}
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-12% 0px' }}
              transition={{ duration: 0.7, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-[6.5rem_1fr] gap-4 border-b border-dashed border-line px-5 py-6 last:border-0 sm:grid-cols-[9rem_1fr]"
            >
              <span className="font-display text-[2.1rem] leading-none font-extrabold tracking-[-0.04em] text-brand sm:text-5xl">
                {fact.value}
              </span>
              <div>
                <p className="leading-relaxed text-ink">{fact.text}</p>
                <p className="mt-1.5 font-mono text-[0.7rem] tracking-wide text-ink-faint uppercase">{fact.source}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </div>
  </section>
)
