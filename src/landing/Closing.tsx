import { ArrowRight, Check, GraduationCap } from '@phosphor-icons/react'
import { Link } from 'react-router-dom'
import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { Cloud, CloudEdge } from './Clouds'

const PLANS = [
  {
    name: 'Grátis',
    price: 'R$ 0',
    note: 'para sempre',
    items: ['Carteirinha e histórico de saúde', 'Lembretes de vacina, remédio e consulta', 'Anexos de receitas e exames', 'Modo consulta para o veterinário'],
    footnote: 'Mantido por anúncios de marcas do mundo pet.',
  },
  {
    name: 'Nuvem Família',
    price: 'Assinatura',
    note: 'mensal ou anual',
    items: ['Tudo do plano grátis', 'Quantos pets você tiver', 'Gestão compartilhada com família e cuidadores', 'Registro de quem deu cada dose'],
    footnote: 'Valores em validação com tutores.',
    featured: true,
  },
]

const TEAM = [
  ['Arthur Sindeaux de Araújo Nogueira', 'CC'],
  ['Camila de Araujo Stolz', 'Design'],
  ['Eros Amancio Nascimento', 'CC'],
  ['Karina Leal Almeida Peixoto', 'Design'],
  ['Lucas Coutinho de Almeida Bayma', 'CC'],
  ['Luiz Felipe de Siqueira Gonçalves', 'CC'],
  ['Maria Bertholine Rêgo Barros Simões Duarte', 'Design'],
  ['Mateus Lins Farias', 'CC'],
  ['Pedro de Sá e Benevides de Lima Moreira', 'CC'],
  ['Remi Cunha Falcão', 'Design'],
  ['Ricardo Henrique Souza Arruda Chagas', 'Design'],
  ['Telmo Melo Ferreira Calheiros', 'CC'],
]

export const Plans = () => (
  <section id="planos" className="mx-auto max-w-7xl px-5 pt-36 pb-24 sm:px-8 sm:pt-32 sm:pb-32">
    <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
      <div>
        <h2 className="text-4xl leading-[1.02] font-extrabold sm:text-5xl">Comece de graça. Chame a família quando quiser.</h2>
        <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">
          O essencial para cuidar de um pet não custa nada. A assinatura libera mais pets e a rotina dividida com outras
          pessoas. Neste protótipo, tudo já vem liberado para você testar.
        </p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        {PLANS.map((plan) => (
          <article
            key={plan.name}
            className={cn(
              'flex flex-col rounded-[2rem] p-7',
              plan.featured ? 'bg-field text-white shadow-lift' : 'bg-surface shadow-card ring-1 ring-line',
            )}
          >
            <h3 className="text-xl font-bold">{plan.name}</h3>
            <p className="mt-5 font-display text-4xl font-extrabold tracking-[-0.03em]">{plan.price}</p>
            <p className={cn('text-sm', plan.featured ? 'text-white/75' : 'text-ink-faint')}>{plan.note}</p>
            <ul className="mt-7 grid gap-3">
              {plan.items.map((item) => (
                <li key={item} className="flex gap-2.5 text-[0.95rem]">
                  <Check weight="bold" className={cn('mt-0.5 size-4.5 shrink-0', plan.featured ? 'text-orange' : 'text-ok')} />
                  {item}
                </li>
              ))}
            </ul>
            <p className={cn('mt-auto pt-8 text-xs', plan.featured ? 'text-white/70' : 'text-ink-faint')}>{plan.footnote}</p>
          </article>
        ))}
      </div>
    </div>
  </section>
)

export const Team = () => (
  <section id="equipe" className="border-t border-line">
    <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
      <div>
        <GraduationCap weight="duotone" className="size-10 text-teal" />
        <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">Quem está fazendo</h2>
        <p className="mt-4 max-w-md leading-relaxed text-ink-soft">
          O Nuvem Vida é o projeto do Grupo 11 na disciplina de Projetos 2026.2 da CESAR School, feito por estudantes de
          Ciência da Computação e de Design em Recife.
        </p>
      </div>
      <ul className="grid gap-x-8 sm:grid-cols-2">
        {TEAM.map(([name, course]) => (
          <li key={name} className="flex items-baseline justify-between gap-4 border-b border-dashed border-line py-3">
            <span className="font-medium">{name}</span>
            <span className={cn('font-mono text-xs font-semibold', course === 'Design' ? 'text-teal' : 'text-brand')}>{course}</span>
          </li>
        ))}
      </ul>
    </div>
  </section>
)

export const FinalCta = () => (
  <section className="relative isolate overflow-hidden bg-field text-white">
    <CloudEdge className="rotate-180 text-ground" />
    <Cloud className="absolute top-16 -right-24 w-96 animate-drift text-orange" />
    <Cloud className="absolute -bottom-24 left-[30%] hidden w-80 rotate-180 animate-drift-slow text-teal-bright/70 lg:block" />
    <div className="mx-auto flex max-w-7xl flex-col items-start gap-8 px-5 py-20 sm:px-8 lg:flex-row lg:items-end lg:justify-between">
      <h2 className="max-w-3xl text-4xl leading-[1] font-extrabold sm:text-6xl">
        Cadastre seu pet e veja o que vence nesta semana.
      </h2>
      <Button asChild variant="white" size="lg">
        <Link to="/entrar">
          Criar minha conta
          <ArrowRight weight="bold" />
        </Link>
      </Button>
    </div>
    <footer className="mx-auto flex max-w-7xl flex-col gap-4 border-t border-white/15 px-5 py-8 text-sm text-white/70 sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <Logo inverted />
      <p>
        Grupo 11 · CESAR School · 2026. Fotos do{' '}
        <a className="underline hover:text-white" href="https://unsplash.com" target="_blank" rel="noreferrer">
          Unsplash
        </a>
        .
      </p>
    </footer>
  </section>
)
