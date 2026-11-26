import { FilePdf, FileText } from '@phosphor-icons/react'
import type { PetDocument } from '@/data/types'
import { useObjectUrl } from '@/hooks/useObjectUrl'
import { cn, formatBytes } from '@/lib/utils'

export const openDocument = (doc: PetDocument) => {
  const url = URL.createObjectURL(doc.blob)
  window.open(url, '_blank', 'noopener')
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

export const DocumentThumb = ({ doc, className, showName = false }: { doc: PetDocument; className?: string; showName?: boolean }) => {
  const isImage = doc.mime.startsWith('image/')
  const url = useObjectUrl(isImage ? doc.blob : undefined)
  return (
    <button
      type="button"
      onClick={() => openDocument(doc)}
      title={`Abrir ${doc.name}`}
      className={cn('group flex items-center gap-2.5 overflow-hidden rounded-2xl bg-surface-2 text-left ring-1 ring-line transition-shadow hover:shadow-card', className)}
    >
      <span className="grid size-14 shrink-0 place-items-center overflow-hidden bg-surface">
        {isImage && url ? (
          <img src={url} alt="" className="size-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : doc.mime === 'application/pdf' ? (
          <FilePdf weight="duotone" className="size-7 text-late" />
        ) : (
          <FileText weight="duotone" className="size-7 text-ink-faint" />
        )}
      </span>
      {showName && (
        <span className="min-w-0 pr-3">
          <span className="block truncate text-sm font-semibold">{doc.name}</span>
          <span className="block font-mono text-xs text-ink-faint">{formatBytes(doc.size)}</span>
        </span>
      )}
    </button>
  )
}
