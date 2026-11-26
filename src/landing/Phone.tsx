import { Check, Pill, Stethoscope, Syringe, Warning } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export const Phone = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div
    className={cn(
      'relative aspect-[9/19] w-[17rem] rounded-[2.9rem] bg-[#1d0a24] p-[0.55rem] shadow-[0_40px_80px_-30px_rgb(40_4_48/0.65),inset_0_0_0_1.5px_rgb(255_255_255/0.12)]',
      className,
    )}
  >
    <div className="relative size-full overflow-hidden rounded-[2.4rem] bg-[#f2f5f4] text-[#2a1233]">
      <div className="absolute top-2 left-1/2 z-10 h-[1.35rem] w-[5.5rem] -translate-x-1/2 rounded-full bg-[#1d0a24]" />
      {children}
    </div>
  </div>
)

const Row = ({ icon, title, meta, tone, done }: { icon: ReactNode; title: string; meta: string; tone: 'late' | 'soon' | 'ok'; done?: boolean }) => {
  const tones = {
    late: 'bg-[#ffe3df] text-[#d2473a]',
    soon: 'bg-[#ffe7c9] text-[#ad5a00]',
    ok: 'bg-[#d2f2ed] text-[#117f74]',
  }
  return (
    <div className="flex items-center gap-2.5 rounded-2xl bg-white p-2.5 shadow-[0_1px_2px_rgb(42_18_51/0.06),0_6px_16px_-8px_rgb(42_18_51/0.18)]">
      <span className={cn('grid size-8 place-items-center rounded-xl [&_svg]:size-4.5', tones[tone])}>{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[0.72rem] font-bold">{title}</p>
        <p className="truncate text-[0.6rem] text-[#5c4a66]">{meta}</p>
      </div>
      <span className={cn('grid size-6 place-items-center rounded-full border-2 [&_svg]:size-3', done ? 'border-[#117f74] bg-[#117f74] text-white' : 'border-[#e0dbe3]')}>
        {done && <Check weight="bold" />}
      </span>
    </div>
  )
}

export const DashboardScreen = () => (
  <div className="flex h-full flex-col gap-2.5 px-3.5 pt-11">
    <p className="text-[0.62rem] font-semibold text-[#75667e]">Boa noite, Ana</p>
    <div className="flex items-center gap-2">
      <img src="/img/pacoca.webp" alt="" className="size-10 rounded-[38%] object-cover" />
      <div>
        <p className="font-display text-[1.05rem] leading-none font-bold">Paçoca</p>
        <p className="text-[0.6rem] text-[#5c4a66]">Vira-lata · 9 anos · 14,2 kg</p>
      </div>
      <img src="/img/mingau.webp" alt="" className="ml-auto size-7 rounded-[38%] object-cover opacity-70" />
    </div>
    <div className="rounded-2xl bg-[#9403a6] p-3 text-white">
      <p className="text-[0.6rem] font-semibold opacity-80">Próxima dose</p>
      <p className="font-display text-[1.05rem] font-bold">Pimobendan às 20:00</p>
      <p className="mt-1 text-[0.58rem] opacity-80">Última dada pela Marina às 08:07</p>
    </div>
    <p className="mt-1 text-[0.62rem] font-bold tracking-wide text-[#75667e] uppercase">Próximos dias</p>
    <Row icon={<Warning weight="fill" />} title="Antipulgas" meta="Atrasado há 2 dias" tone="late" />
    <Row icon={<Stethoscope weight="duotone" />} title="Retorno cardiologista" meta="Terça às 15:30" tone="soon" />
    <Row icon={<Syringe weight="duotone" />} title="V10, reforço anual" meta="Em 30 dias" tone="ok" />
    <Row icon={<Pill weight="duotone" />} title="Pimobendan 2,5 mg" meta="Hoje às 08:00" tone="ok" done />
  </div>
)

const TimelineItem = ({ date, title, note, color }: { date: string; title: string; note: string; color: string }) => (
  <div className="relative pl-5">
    <span className="absolute top-1 left-0 size-2.5 rounded-full ring-4 ring-[#f2f5f4]" style={{ background: color }} />
    <p className="font-mono text-[0.55rem] text-[#75667e]">{date}</p>
    <p className="text-[0.72rem] font-bold">{title}</p>
    <p className="text-[0.6rem] leading-snug text-[#5c4a66]">{note}</p>
  </div>
)

export const HistoryScreen = () => (
  <div className="flex h-full flex-col gap-3 px-3.5 pt-11">
    <p className="font-display text-[1.05rem] font-bold">Histórico do Paçoca</p>
    <div className="flex gap-1.5 text-[0.58rem] font-bold">
      <span className="rounded-full bg-[#9403a6] px-2.5 py-1 text-white">Tudo</span>
      <span className="rounded-full bg-white px-2.5 py-1">Vacinas</span>
      <span className="rounded-full bg-white px-2.5 py-1">Consultas</span>
    </div>
    <div className="relative grid gap-3.5 before:absolute before:top-1 before:bottom-0 before:left-[0.3rem] before:w-px before:bg-[#e0dbe3]">
      <TimelineItem date="OUT 2026" title="Retorno cardiologista" note="Respondendo bem ao remédio. Manter dose." color="#117f74" />
      <TimelineItem date="SET 2026" title="Hemograma e função renal" note="Tudo dentro do normal. PDF anexado." color="#ad5a00" />
      <TimelineItem date="JUL 2026" title="Início do pimobendan" note="1 comprimido a cada 12 horas, com comida." color="#4cbfb8" />
      <TimelineItem date="JUL 2026" title="Ecocardiograma" note="Leve aumento do átrio esquerdo." color="#ad5a00" />
      <TimelineItem date="DEZ 2025" title="V10 aplicada" note="Lote 2231B · Dr. Rui Albuquerque" color="#9403a6" />
    </div>
  </div>
)

export const AgendaScreen = () => {
  const marks: Record<number, string> = { 3: '#d2473a', 9: '#ad5a00', 12: '#117f74', 18: '#9403a6', 26: '#9403a6' }
  return (
    <div className="flex h-full flex-col gap-3 px-3.5 pt-11">
      <p className="font-display text-[1.05rem] font-bold">Dezembro</p>
      <div className="grid grid-cols-7 gap-y-1.5 text-center text-[0.58rem]">
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
          <span key={i} className="font-bold text-[#75667e]">{d}</span>
        ))}
        {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
          <span key={day} className={cn('relative mx-auto grid size-6 place-items-center rounded-full font-semibold', day === 5 && 'bg-[#9403a6] text-white')}>
            {day}
            {marks[day] && <span className="absolute -bottom-0.5 size-1 rounded-full" style={{ background: marks[day] }} />}
          </span>
        ))}
      </div>
      <Row icon={<Pill weight="duotone" />} title="Pimobendan" meta="A cada 12h · 08:00 e 20:00" tone="ok" />
      <Row icon={<Stethoscope weight="duotone" />} title="Retorno cardiologista" meta="9 dez · 15:30" tone="soon" />
    </div>
  )
}

export const VetScreen = () => (
  <div className="flex h-full flex-col gap-2.5 bg-white px-3.5 pt-11">
    <div className="flex items-center gap-2">
      <img src="/img/pacoca.webp" alt="" className="size-11 rounded-[38%] object-cover" />
      <div>
        <p className="font-display text-[1.2rem] leading-none font-bold">Paçoca</p>
        <p className="text-[0.6rem] text-[#5c4a66]">Cão · macho · 9 anos · 14,2 kg</p>
      </div>
    </div>
    <div className="rounded-xl bg-[#ffe3df] p-2.5 text-[#a8342a]">
      <p className="text-[0.58rem] font-bold uppercase">Alergia</p>
      <p className="text-[0.8rem] font-bold">Dipirona</p>
    </div>
    <div className="rounded-xl bg-[#d4f3f0] p-2.5">
      <p className="text-[0.58rem] font-bold text-[#117f74] uppercase">Em uso</p>
      <p className="text-[0.8rem] font-bold">Pimobendan 2,5 mg · 12/12h</p>
    </div>
    <div className="grid gap-1 text-[0.66rem]">
      {[
        ['V10', 'dez 2025'],
        ['Antirrábica', 'dez 2025'],
        ['Ecocardiograma', 'jul 2026'],
        ['Hemograma', 'set 2026'],
      ].map(([name, date]) => (
        <div key={name} className="flex justify-between border-b border-[#e0dbe3] py-1.5">
          <span className="font-semibold">{name}</span>
          <span className="font-mono text-[#5c4a66]">{date}</span>
        </div>
      ))}
    </div>
  </div>
)
