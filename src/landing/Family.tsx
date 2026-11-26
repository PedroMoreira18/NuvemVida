import { CheckCircle, Paperclip, Warning } from '@phosphor-icons/react'
import { motion } from 'motion/react'
import { UserBadge } from '@/components/PetAvatar'

const feed = [
  { who: 'Marina', hue: 330, text: 'deu o Pimobendan do Paçoca', time: '08:07' },
  { who: 'Jorge', hue: 150, text: 'marcou o antipulgas como feito', time: 'ontem' },
  { who: 'Ana', hue: 250, text: 'anexou o hemograma (PDF)', time: 'seg', icon: true },
]

export const Family = () => (
  <section id="familia" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
    <div className="grid items-center gap-16 lg:grid-cols-2">
      <div className="relative order-2 lg:order-1">
        <div className="overflow-hidden rounded-[2.5rem] shadow-lift">
          <img
            src="/img/familia.webp"
            alt="Mulher sorrindo com um cachorro vira-lata no colo"
            loading="lazy"
            className="aspect-[4/5] w-full object-cover sm:aspect-[5/5]"
          />
        </div>

        <div className="absolute inset-x-3 -bottom-10 grid gap-2.5 sm:inset-x-auto sm:-right-8 sm:bottom-10 sm:w-[21rem]">
          {feed.map((item, i) => (
            <motion.div
              key={item.who}
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-20% 0px' }}
              transition={{ delay: 0.15 + i * 0.18, type: 'spring', stiffness: 260, damping: 24 }}
              className="flex items-center gap-3 rounded-2xl bg-surface/95 p-3 shadow-card ring-1 ring-line backdrop-blur"
            >
              <UserBadge name={item.who} hue={item.hue} />
              <p className="min-w-0 flex-1 text-sm leading-snug">
                <b className="font-bold">{item.who}</b> {item.text}
              </p>
              {item.icon ? <Paperclip className="size-4 text-ink-faint" /> : <CheckCircle weight="fill" className="size-5 text-ok" />}
              <span className="font-mono text-[0.7rem] text-ink-faint">{item.time}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="order-1 lg:order-2">
        <h2 className="text-4xl leading-[1.02] font-extrabold sm:text-5xl">
          Cuidar do pet cansa menos quando a casa inteira ajuda.
        </h2>
        <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-soft">
          Convide quem divide a rotina com você: a família, quem mora junto, o passeador. Todo mundo vê os mesmos
          lembretes e marca o que já fez, com nome e horário.
        </p>

        <motion.div
          initial={{ opacity: 0, rotate: -2, y: 16 }}
          whileInView={{ opacity: 1, rotate: -1.5, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 max-w-md rounded-3xl bg-soon-soft p-5 text-ink ring-1 ring-soon/25"
        >
          <div className="flex gap-3">
            <Warning weight="fill" className="mt-0.5 size-6 shrink-0 text-soon" />
            <div>
              <p className="font-bold">Essa dose já foi dada</p>
              <p className="mt-1 text-[0.95rem] leading-relaxed text-ink-soft">
                A Marina deu o Pimobendan às 08:07. Quer registrar outra dose mesmo assim?
              </p>
            </div>
          </div>
        </motion.div>
        <p className="mt-4 max-w-md text-sm text-ink-faint">
          O aviso aparece quando alguém tenta marcar uma dose que outra pessoa acabou de dar.
        </p>
      </div>
    </div>
  </section>
)
