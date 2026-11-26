import { X } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import { Drawer } from 'vaul'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/utils'

type SheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  className?: string
}

export const Sheet = ({ open, onOpenChange, title, description, children, className }: SheetProps) => {
  const wide = useMediaQuery('(min-width: 768px)')
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} direction={wide ? 'right' : 'bottom'}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-brand-deep/40 backdrop-blur-[2px]" />
        <Drawer.Content
          className={cn(
            'fixed z-50 flex flex-col bg-ground outline-none',
            wide
              ? 'inset-y-3 right-3 w-[min(30rem,calc(100vw-1.5rem))] rounded-[2rem] shadow-lift'
              : 'inset-x-0 bottom-0 max-h-[92dvh] rounded-t-[2rem]',
            className,
          )}
        >
          {!wide && <div className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-line" />}
          <header className="flex items-start justify-between gap-4 px-6 pt-5 pb-2">
            <div>
              <Drawer.Title className="font-display text-2xl font-bold">{title}</Drawer.Title>
              {description ? (
                <Drawer.Description className="mt-1 text-sm text-ink-soft">{description}</Drawer.Description>
              ) : (
                <Drawer.Description className="sr-only">{title}</Drawer.Description>
              )}
            </div>
            <Drawer.Close className="-mr-2 grid size-10 place-items-center rounded-full text-ink-soft hover:bg-surface-2" aria-label="Fechar">
              <X className="size-5" weight="bold" />
            </Drawer.Close>
          </header>
          <div className="overflow-y-auto px-6 pt-2 pb-[max(1.5rem,env(safe-area-inset-bottom))]">{children}</div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
