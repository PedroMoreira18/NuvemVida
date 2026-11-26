import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'

const control =
  'w-full rounded-2xl border border-line bg-surface px-4 text-[0.95rem] text-ink placeholder:text-ink-faint transition-[border-color,box-shadow] duration-150 focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15 aria-invalid:border-late aria-invalid:ring-late/15'

export const Input = ({ className, ...props }: ComponentProps<'input'>) => (
  <input className={cn(control, 'h-12', className)} {...props} />
)

export const Textarea = ({ className, ...props }: ComponentProps<'textarea'>) => (
  <textarea className={cn(control, 'min-h-24 resize-y py-3', className)} {...props} />
)

export const Select = ({ className, ...props }: ComponentProps<'select'>) => (
  <select
    className={cn(
      control,
      'h-12 appearance-none bg-[url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20viewBox%3D%270%200%2016%2016%27%3E%3Cpath%20d%3D%27M4%206l4%204%204-4%27%20fill%3D%27none%27%20stroke%3D%27%236b7598%27%20stroke-width%3D%271.8%27%20stroke-linecap%3D%27round%27/%3E%3C/svg%3E")] bg-[length:1rem] bg-[right_1rem_center] bg-no-repeat pr-10',
      className,
    )}
    {...props}
  />
)

type FieldProps = { label: string; htmlFor: string; hint?: string; error?: string; children: ReactNode; className?: string }

export const Field = ({ label, htmlFor, hint, error, children, className }: FieldProps) => (
  <div className={cn('grid gap-1.5', className)}>
    <label htmlFor={htmlFor} className="text-sm font-semibold text-ink">
      {label}
    </label>
    {children}
    {error ? (
      <p role="alert" className="text-sm font-medium text-late">{error}</p>
    ) : hint ? (
      <p className="text-sm text-ink-faint">{hint}</p>
    ) : null}
  </div>
)

type ChoiceProps<T extends string> = {
  name: string
  value: T
  onChange: (value: T) => void
  options: { value: T; label: string; icon?: ReactNode }[]
  className?: string
}

export const Choice = <T extends string>({ name, value, onChange, options, className }: ChoiceProps<T>) => (
  <div role="radiogroup" aria-label={name} className={cn('flex flex-wrap gap-2', className)}>
    {options.map((option) => {
      const checked = option.value === value
      return (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={checked}
          onClick={() => onChange(option.value)}
          className={cn(
            'inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors duration-150 [&_svg]:size-5',
            checked ? 'border-brand bg-brand text-white dark:text-brand-deep' : 'border-line bg-surface text-ink-soft hover:border-brand/50 hover:text-ink',
          )}
        >
          {option.icon}
          {option.label}
        </button>
      )
    })}
  </div>
)
