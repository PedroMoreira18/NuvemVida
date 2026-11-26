import { Bird, Cat, Dog } from '@phosphor-icons/react'
import type { Pet } from '@/data/types'
import { useObjectUrl } from '@/hooks/useObjectUrl'
import { cn, initials } from '@/lib/utils'

const SPECIES_ICON = { cachorro: Dog, gato: Cat, outro: Bird }

type Props = { pet: Pick<Pet, 'name' | 'species' | 'photo' | 'photoUrl' | 'hue'>; className?: string; ring?: boolean }

export const PetAvatar = ({ pet, className, ring = false }: Props) => {
  const blobUrl = useObjectUrl(pet.photo)
  const src = blobUrl ?? pet.photoUrl
  const Icon = SPECIES_ICON[pet.species]
  return (
    <span
      className={cn(
        'relative inline-grid size-12 shrink-0 place-items-center overflow-hidden rounded-[38%] text-white',
        ring && 'ring-4 ring-surface',
        className,
      )}
      style={{ background: `oklch(0.72 0.11 ${pet.hue})` }}
    >
      {src ? (
        <img src={src} alt={`Foto de ${pet.name}`} className="size-full object-cover" draggable={false} />
      ) : (
        <Icon weight="duotone" className="size-[55%]" aria-label={pet.name} />
      )}
    </span>
  )
}

export const UserBadge = ({ name, hue, className }: { name: string; hue: number; className?: string }) => (
  <span
    title={name}
    className={cn('inline-grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold text-white', className)}
    style={{ background: `oklch(0.6 0.13 ${hue})` }}
  >
    {initials(name)}
  </span>
)
