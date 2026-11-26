import { CheckCircle, Copy, Info, ShareNetwork, UserMinus, UserPlus } from '@phosphor-icons/react'
import { motion } from 'motion/react'
import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { useSession } from '@/app/session'
import { UserBadge } from '@/components/PetAvatar'
import { Button } from '@/components/ui/Button'
import { Choice, Input } from '@/components/ui/Field'
import { Sheet } from '@/components/ui/Sheet'
import { useCompletions, useMembers, useUsersMap } from '@/data/hooks'
import { acceptInvite, createInvite, removeMember } from '@/data/repo'
import type { Invite, MemberRole } from '@/data/types'
import { CARE, ROLE_LABEL } from '@/lib/care'
import { ago, fmt } from '@/lib/dates'
import { cn, firstName } from '@/lib/utils'

const ROLE_HINT: Record<MemberRole, string> = {
  tutor: 'Pode tudo, inclusive convidar e remover pessoas.',
  familia: 'Vê e atualiza a rotina, registra consultas e doses.',
  cuidador: 'Passeador, babá de pet, vizinho que ajuda: marca o que fez.',
}

const InviteSheet = ({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) => {
  const { pet, user } = useSession()
  const [role, setRole] = useState<MemberRole>('familia')
  const [invite, setInvite] = useState<Invite>()
  if (!pet || !user) return null
  const link = invite ? `${window.location.origin}/convite/${invite.code}` : ''

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Copiado.')
    } catch {
      toast.error('Não deu para copiar. Selecione e copie manualmente.')
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o)
        if (!o) setInvite(undefined)
      }}
      title={`Convidar para cuidar de ${pet.name}`}
    >
      {!invite ? (
        <div className="grid gap-5">
          <div className="grid gap-2">
            <span className="text-sm font-semibold">Essa pessoa é…</span>
            <Choice
              name="Papel"
              value={role}
              onChange={setRole}
              options={(['familia', 'cuidador', 'tutor'] as MemberRole[]).map((r) => ({ value: r, label: ROLE_LABEL[r] }))}
            />
            <p className="text-sm text-ink-soft">{ROLE_HINT[role]}</p>
          </div>
          <Button size="lg" onClick={async () => setInvite(await createInvite(pet.id, role, user.id))}>
            Gerar convite
          </Button>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid gap-5">
          <div className="rounded-3xl bg-field p-6 text-center text-white">
            <p className="text-sm font-semibold text-white/80">Código do convite</p>
            <p className="mt-2 font-mono text-4xl font-bold tracking-[0.25em]">{invite.code}</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Button variant="secondary" size="lg" onClick={() => copy(link)}>
              <Copy weight="bold" />
              Copiar link
            </Button>
            {'share' in navigator ? (
              <Button
                size="lg"
                onClick={() =>
                  navigator.share({ title: 'Nuvem Vida', text: `Vamos cuidar de ${pet.name} juntos? Use o código ${invite.code}.`, url: link }).catch(() => {})
                }
              >
                <ShareNetwork weight="bold" />
                Compartilhar
              </Button>
            ) : (
              <Button size="lg" onClick={() => copy(invite.code)}>
                <Copy weight="bold" />
                Copiar código
              </Button>
            )}
          </div>
          <p className="flex gap-2 rounded-2xl bg-surface-2 p-4 text-sm leading-relaxed text-ink-soft">
            <Info weight="duotone" className="mt-0.5 size-5 shrink-0 text-brand" />
            Nesta versão de teste os dados ficam neste aparelho. A pessoa convidada cria o perfil dela aqui mesmo e entra
            com o código.
          </p>
        </motion.div>
      )}
    </Sheet>
  )
}

const JoinWithCode = () => {
  const { user } = useSession()
  const [code, setCode] = useState('')
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!user || code.trim().length < 4) return
    const result = await acceptInvite(code, user.id)
    if (result === 'ok') {
      toast.success('Pronto, você agora faz parte do cuidado.')
      setCode('')
    }
    if (result === 'already-member') toast.info('Você já faz parte do cuidado desse pet.')
    if (result === 'not-found') toast.error('Não achamos esse código. Confira as letras.')
  }
  return (
    <form onSubmit={submit} className="flex gap-2">
      <Input
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="Código de convite"
        aria-label="Código de convite"
        maxLength={6}
        className="font-mono tracking-[0.2em] uppercase"
      />
      <Button type="submit" variant="secondary" className="h-12 shrink-0">
        Entrar
      </Button>
    </form>
  )
}

export const Family = () => {
  const { pet, user } = useSession()
  const members = useMembers(pet?.id)
  const users = useUsersMap()
  const log = useCompletions(pet?.id, 30)
  const [inviting, setInviting] = useState(false)

  if (!pet || !user) return null
  const me = members.find((m) => m.userId === user.id)
  const canManage = me?.role === 'tutor'
  const doneCount = (userId: string) => log.filter((c) => c.doneBy === userId).length

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold sm:text-5xl">Família</h1>
          <p className="mt-2 max-w-xl text-ink-soft">
            Quem cuida de {pet.name} com você. Todos veem os mesmos lembretes e cada um marca o que fez.
          </p>
        </div>
        <Button onClick={() => setInviting(true)}>
          <UserPlus weight="bold" />
          Convidar
        </Button>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1fr]">
        <section>
          <ul className="grid gap-2.5">
            {members.map((m, i) => {
              const u = users.get(m.userId)
              if (!u) return null
              return (
                <motion.li
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 rounded-3xl bg-surface p-4 shadow-card ring-1 ring-line"
                >
                  <UserBadge name={u.name} hue={u.hue} className="size-12 text-base" />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">
                      {u.name}
                      {u.id === user.id && <span className="ml-1.5 text-sm font-medium text-ink-faint">(você)</span>}
                    </p>
                    <p className="text-sm text-ink-soft">
                      {doneCount(u.id) > 0
                        ? `${doneCount(u.id)} cuidado${doneCount(u.id) > 1 ? 's' : ''} registrado${doneCount(u.id) > 1 ? 's' : ''}`
                        : 'Nenhum cuidado registrado ainda'}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-1 text-xs font-bold',
                      m.role === 'tutor' ? 'bg-brand-soft text-brand' : m.role === 'familia' ? 'bg-teal-soft text-teal' : 'bg-ok-soft text-ok',
                    )}
                  >
                    {ROLE_LABEL[m.role]}
                  </span>
                  {canManage && u.id !== user.id && (
                    <button
                      type="button"
                      onClick={async () => {
                        await removeMember(m.id)
                        toast(`${firstName(u.name)} não acompanha mais ${pet.name}.`)
                      }}
                      className="grid size-9 place-items-center rounded-full text-ink-faint hover:bg-late-soft hover:text-late"
                      aria-label={`Remover ${u.name}`}
                    >
                      <UserMinus weight="bold" className="size-4.5" />
                    </button>
                  )}
                </motion.li>
              )
            })}
          </ul>

          <div className="mt-8 rounded-3xl bg-surface-2 p-5">
            <p className="font-bold">Recebeu um código?</p>
            <p className="mt-1 mb-4 text-sm text-ink-soft">Digite aqui para começar a acompanhar outro pet.</p>
            <JoinWithCode />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold">Registro de cuidados</h2>
          {log.length ? (
            <ol className="relative grid gap-1 rounded-[2rem] bg-surface p-3 shadow-card ring-1 ring-line">
              {log.map((c) => {
                const u = users.get(c.doneBy)
                const Icon = CARE[c.type].icon
                return (
                  <li key={c.id} className="flex items-center gap-3 rounded-2xl p-2.5 hover:bg-surface-2">
                    {u && <UserBadge name={u.name} hue={u.hue} />}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">
                        <b>{u ? (u.id === user.id ? 'Você' : firstName(u.name)) : 'Alguém'}</b> · {c.title}
                      </p>
                      <p className="font-mono text-xs text-ink-faint">{fmt(c.doneAt, "dd/MM 'às' HH:mm")}</p>
                    </div>
                    <Icon weight="duotone" className={cn('size-5', CARE[c.type].ink)} />
                    <span className="hidden text-xs text-ink-faint sm:block">{ago(c.doneAt)}</span>
                  </li>
                )
              })}
            </ol>
          ) : (
            <div className="rounded-[2rem] border-2 border-dashed border-line p-8 text-center">
              <CheckCircle weight="duotone" className="mx-auto size-10 text-ok" />
              <p className="mt-3 text-ink-soft">
                Quando alguém marcar um remédio ou cuidado como feito, aparece aqui com nome e horário.
              </p>
            </div>
          )}
        </section>
      </div>

      <InviteSheet open={inviting} onOpenChange={setInviting} />
    </div>
  )
}
