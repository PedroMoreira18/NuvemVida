import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useSession } from '@/app/session'
import { Logo } from '@/components/brand/Logo'
import { createPet } from '@/data/repo'
import { firstName } from '@/lib/utils'
import { PetForm } from './PetForm'

export const NewPet = () => {
  const { user, pets, selectPet } = useSession()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const first = params.has('primeiro') || pets.length === 0
  if (!user) return null

  return (
    <div className="mx-auto max-w-xl">
      {first && <Logo className="mb-10" />}
      <h1 className="text-4xl leading-[1.05] font-extrabold sm:text-5xl">
        {first ? `Prazer, ${firstName(user.name)}. Quem é o seu pet?` : 'Mais um pet na família'}
      </h1>
      <p className="mt-3 text-lg text-ink-soft">
        {first
          ? 'Só o básico agora. Raça, peso e alergias você completa depois, no perfil do pet.'
          : 'Cada pet tem histórico, lembretes e família separados.'}
      </p>
      <div className="mt-10">
        <PetForm
          compact={first}
          submitLabel={first ? 'Cadastrar e ir para o painel' : 'Cadastrar pet'}
          onSubmit={async (data) => {
            const pet = await createPet({ ...data, createdBy: user.id })
            selectPet(pet.id)
            toast.success(`${pet.name} chegou!`, {
              description: 'Comece registrando a última vacina ou um remédio de uso contínuo.',
              action: { label: 'Outro pet', onClick: () => navigate('/app/pets/novo') },
            })
            navigate('/app', { replace: true, state: { createdPet: pet.id } })
          }}
        />
      </div>
    </div>
  )
}
