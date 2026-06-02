import React from 'react'

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(' ')
}

/** Microscopic pill-shaped eyebrow tag. */
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-[10px] font-semibold uppercase tracking-eyebrow text-accent-deep',
        className,
      )}
    >
      {children}
    </span>
  )
}

/** Double-bezel card: outer shell tray + inner core. */
export function Card({
  children,
  className,
  inner,
  pad = true,
}: {
  children: React.ReactNode
  className?: string
  inner?: string
  pad?: boolean
}) {
  return (
    <div className={cx('rounded-4xl bg-white/25 p-1.5 backdrop-blur-md glass-tray', className)}>
      <div
        className={cx(
          'h-full rounded-[calc(2rem-0.375rem)]',
          !inner && 'bg-white/65 backdrop-blur-2xl glass-edge',
          pad && 'p-5 sm:p-6',
          inner,
        )}
      >
        {children}
      </div>
    </div>
  )
}

export function Stat({
  label,
  value,
  sub,
  tone = 'ink',
}: {
  label: string
  value: React.ReactNode
  sub?: React.ReactNode
  tone?: 'ink' | 'accent' | 'amber' | 'rose'
}) {
  const toneCls = {
    ink: 'text-ink',
    accent: 'text-accent-deep',
    amber: 'text-amber-600',
    rose: 'text-rose-600',
  }[tone]
  return (
    <div className="rounded-2xl bg-white/45 p-4 backdrop-blur-sm glass-edge">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-mute">{label}</div>
      <div className={cx('mt-1.5 text-2xl font-extrabold tracking-tight tabular-nums', toneCls)}>
        {value}
      </div>
      {sub && <div className="mt-0.5 text-xs text-ink-mute">{sub}</div>}
    </div>
  )
}

const badgeTones: Record<string, string> = {
  green: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-700',
  rose: 'bg-rose-50 text-rose-700',
  slate: 'bg-slate-100 text-slate-600',
  accent: 'bg-accent-soft text-accent-deep',
  indigo: 'bg-indigo-50 text-indigo-700',
  sky: 'bg-sky-50 text-sky-700',
}

export function Badge({
  children,
  tone = 'slate',
  dot,
}: {
  children: React.ReactNode
  tone?: keyof typeof badgeTones | string
  dot?: boolean
}) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
        badgeTones[tone] ?? badgeTones.slate,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />}
      {children}
    </span>
  )
}

/** Pill toggle group / filter tabs. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
}: {
  options: { value: T; label: React.ReactNode }[]
  value: T
  onChange: (v: T) => void
  size?: 'sm' | 'md'
}) {
  return (
    <div className="inline-flex flex-wrap items-center gap-1 rounded-full bg-black/[0.04] p-1 hairline">
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={cx(
              'rounded-full font-semibold transition-all duration-300 ease-spring',
              size === 'sm' ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-sm',
              active ? 'bg-white text-ink shadow-sm hairline' : 'text-ink-mute hover:text-ink',
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

/** Island CTA with nested icon circle. */
export function CTA({
  children,
  onClick,
  icon,
  variant = 'solid',
  className,
}: {
  children: React.ReactNode
  onClick?: () => void
  icon?: React.ReactNode
  variant?: 'solid' | 'ghost'
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      className={cx(
        'group inline-flex items-center gap-3 rounded-full pl-6 pr-2 py-2 text-sm font-semibold transition-all duration-500 ease-spring active:scale-[0.98]',
        variant === 'solid'
          ? 'bg-ink text-white hover:bg-ink/90'
          : 'bg-white text-ink hairline hover:bg-paper',
        className,
      )}
    >
      <span>{children}</span>
      <span
        className={cx(
          'flex h-8 w-8 items-center justify-center rounded-full transition-all duration-500 ease-spring group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105',
          variant === 'solid' ? 'bg-white/15' : 'bg-black/5',
        )}
      >
        {icon}
      </span>
    </button>
  )
}

/** Simple horizontal progress / fill bar. */
export function Bar({ value, tone = 'accent', track = true }: { value: number; tone?: string; track?: boolean }) {
  const tones: Record<string, string> = {
    accent: 'bg-accent',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    emerald: 'bg-emerald-500',
    slate: 'bg-slate-400',
    indigo: 'bg-indigo-500',
  }
  return (
    <div className={cx('h-2 w-full overflow-hidden rounded-full', track && 'bg-black/[0.06]')}>
      <div
        className={cx('h-full rounded-full transition-all duration-700 ease-spring', tones[tone] ?? tones.accent)}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  )
}

/** Section heading block. */
export function ModuleHead({
  eyebrow,
  title,
  desc,
  right,
}: {
  eyebrow: string
  title: string
  desc?: string
  right?: React.ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-ink sm:text-[28px]">{title}</h2>
        {desc && <p className="mt-2 text-sm leading-relaxed text-ink-soft">{desc}</p>}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  )
}
