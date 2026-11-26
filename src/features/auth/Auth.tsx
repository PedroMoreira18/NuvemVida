import { ArrowLeft, ArrowRight, Envelope, Sparkle } from '@phosphor-icons/react'
import { motion } from 'motion/react'
import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useSession } from '@/app/session'
import { Logo } from '@/components/brand/Logo'
import { UserBadge } from '@/components/PetAvatar'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Field'
import { acceptInvite, createUser } from '@/data/repo'
import { seedDemo } from '@/data/seed'
import { Cloud } from '@/landing/Clouds'

export const Auth = () => {
  const { user, users, signIn, ready } = useSession()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const invite = params.get('convite') ?? undefined
  const wantsDemo = params.has('demo')
  const [name, setName] = useState('')
  const [error, setError] = useState<string>()
  const [busy, setBusy] = useState(false)

  if (ready && user && !invite) return <Navigate to="/app" replace />

  const finish = async (userId: string, fresh: boolean) => {
    signIn(userId)
    if (invite) {
      const result = await acceptInvite(invite, userId)
      if (result === 'ok') toast.success('Convite aceito. Agora vocês cuidam juntos.')
      if (result === 'not-found') toast.error('Esse convite não existe mais. Peça um código novo.')
      navigate('/app/familia', { replace: true })
      return
    }
    navigate(fresh ? '/app/pets/novo?primeiro=1' : '/app', { replace: true })
  }

  const onCreate = async (e: FormEvent) => {
    e.preventDefault()
    if (name.trim().length < 2) {
      setError('Digite pelo menos duas letras.')
      return
    }
    setBusy(true)
    const created = await createUser(name)
    await finish(created.id, true)
  }

  const onDemo = async () => {
    setBusy(true)
    const demoUser = await seedDemo(name.trim() || 'Ana')
    toast.success('Pronto! O Paçoca e o Mingau já estão te esperando.')
    signIn(demoUser.id)
    navigate('/app', { replace: true })
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_1.1fr]">
      <aside className="relative isolate hidden overflow-hidden bg-field text-white lg:block">
        <img src="/img/sofa.webp" alt="" className="absolute inset-0 -z-10 size-full object-cover opacity-90" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-brand-deep/90 via-brand-deep/20 to-transparent" />
        <Cloud className="absolute -top-16 -right-16 w-80 rotate-180 animate-drift text-orange" />
        <div className="flex h-full flex-col justify-between p-12">
          <Link to="/" aria-label="Voltar para o início">
            <Logo inverted />
          </Link>
          <blockquote className="max-w-md">
            <p className="font-display text-4xl leading-[1.05] font-bold tracking-[-0.03em]">
              Vacina em dia, remédio na hora e a carteirinha sempre no bolso.
            </p>
          </blockquote>
        </div>
      </aside>

      <main className="relative flex flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm font-semibold text-ink-soft hover:text-ink">
            <ArrowLeft weight="bold" className="size-4" />
            Início
          </Link>
          <ThemeToggle className="hover:bg-surface-2" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10"
        >
          <Logo className="mb-10 lg:hidden" />

          {invite && (
            <div className="mb-8 flex gap-3 rounded-2xl bg-teal-soft p-4 text-ink">
              <Envelope weight="duotone" className="size-6 shrink-0 text-teal" />
              <p className="text-sm leading-relaxed">
                Você recebeu um convite para cuidar de um pet junto. Entre com seu perfil ou crie um para aceitar.
              </p>
            </div>
          )}

          {users.length > 0 && (
            <section className="mb-10">
              <h1 className="text-3xl font-extrabold">Quem está usando?</h1>
              <p className="mt-2 text-ink-soft">Perfis salvos neste aparelho.</p>
              <ul className="mt-5 grid gap-2">
                {users.map((u) => (
                  <li key={u.id}>
                    <button
                      type="button"
                      onClick={() => finish(u.id, false)}
                      className="group flex w-full items-center gap-3 rounded-2xl bg-surface p-3 text-left shadow-card ring-1 ring-line transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-lift"
                    >
                      <UserBadge name={u.name} hue={u.hue} className="size-11 text-sm" />
                      <span className="flex-1 font-semibold">{u.name}</span>
                      <ArrowRight weight="bold" className="size-4 text-ink-faint transition-transform group-hover:translate-x-1" />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h2 className={users.length ? 'text-xl font-bold' : 'text-3xl font-extrabold'}>
              {users.length ? 'Criar outro perfil' : 'Vamos começar pelo seu nome'}
            </h2>
            {!users.length && (
              <p className="mt-2 text-ink-soft">Depois a gente cadastra o seu pet. Leva menos de um minuto.</p>
            )}
            <form onSubmit={onCreate} className="mt-6 grid gap-4" noValidate>
              <Field label="Como você quer ser chamado?" htmlFor="name" error={error}>
                <Input
                  id="name"
                  autoComplete="given-name"
                  placeholder="Ex.: Ana"
                  value={name}
                  aria-invalid={!!error}
                  onChange={(e) => {
                    setName(e.target.value)
                    setError(undefined)
                  }}
                />
              </Field>
              <Button type="submit" size="lg" disabled={busy}>
                Criar conta
                <ArrowRight weight="bold" />
              </Button>
            </form>
          </section>

          {!invite && (
            <div className={`mt-8 rounded-3xl p-5 ${wantsDemo ? 'bg-brand-soft ring-2 ring-brand' : 'bg-surface-2'}`}>
              <div className="flex items-start gap-3">
                <img src="/img/pacoca.webp" alt="" className="size-12 rounded-[38%] object-cover" />
                <div className="flex-1">
                  <p className="font-bold">Só quer dar uma olhada?</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                    Entre numa conta de exemplo com dois pets, histórico, lembretes e família já cadastrados.
                  </p>
                </div>
              </div>
              <Button variant={wantsDemo ? 'primary' : 'secondary'} className="mt-4 w-full" onClick={onDemo} disabled={busy}>
                <Sparkle weight="fill" />
                Explorar com dados de exemplo
              </Button>
            </div>
          )}

          <p className="mt-8 text-center text-xs leading-relaxed text-ink-faint">
            Seus dados ficam guardados só neste aparelho, no navegador.
          </p>
        </motion.div>
      </main>
    </div>
  )
}
