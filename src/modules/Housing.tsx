import { useMemo, useState } from 'react'
import { HOSTELS, fmtMoney, objShort } from '../data/mock'
import type { Hostel } from '../data/mock'
import { Badge, Bar, Card, ModuleHead, Stat, cx } from '../ui/components'

export default function Housing() {
  const [list, setList] = useState<Hostel[]>(() => HOSTELS.map((h) => ({ ...h })))

  const totals = useMemo(() => {
    const cap = list.reduce((a, h) => a + h.capacity, 0)
    const occ = list.reduce((a, h) => a + h.occupied, 0)
    const cost = list.reduce((a, h) => a + h.occupied * h.costPerBed, 0)
    return { cap, occ, free: cap - occ, cost, pct: cap ? Math.round((occ / cap) * 100) : 0 }
  }, [list])

  function move(id: string, delta: number) {
    setList((prev) =>
      prev.map((h) => (h.id === id ? { ...h, occupied: Math.max(0, Math.min(h.capacity, h.occupied + delta)) } : h)),
    )
  }

  return (
    <div className="animate-fade-up">
      <ModuleHead
        eyebrow="Размещение персонала"
        title="Проживание и общежития"
        desc="Койко-места по объектам: загрузка, свободные места и стоимость аренды. Заселяйте и выселяйте кнопками — свободные места и бюджет на проживание пересчитываются на лету. Эти же суммы идут в удержания вахтовиков."
      />

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Всего мест" value={totals.cap} />
        <Stat label="Заселено" value={totals.occ} tone="accent" sub={`${totals.pct}% загрузки`} />
        <Stat label="Свободно" value={totals.free} tone={totals.free < 10 ? 'amber' : 'ink'} />
        <Stat label="Бюджет / мес" value={fmtMoney(totals.cost)} sub="аренда койко-мест" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {list.map((h) => {
          const pct = Math.round((h.occupied / h.capacity) * 100)
          const free = h.capacity - h.occupied
          const tone = pct >= 95 ? 'rose' : pct >= 80 ? 'amber' : 'accent'
          return (
            <Card key={h.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-bold text-ink">{h.name}</div>
                  <div className="text-[11px] text-ink-mute">{h.address}</div>
                </div>
                <Badge tone="slate">{objShort(h.object)}</Badge>
              </div>

              {/* bed grid */}
              <div className="mt-4 grid grid-cols-10 gap-1">
                {Array.from({ length: h.capacity }, (_, i) => (
                  <div
                    key={i}
                    className={cx(
                      'aspect-square rounded-[5px] transition-colors duration-300',
                      i < h.occupied ? 'bg-accent' : 'bg-black/[0.07]',
                    )}
                  />
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-xs">
                  <span className="font-bold tabular-nums text-ink">{h.occupied}</span>
                  <span className="text-ink-mute">/{h.capacity} мест · </span>
                  <span className={cx('font-semibold', free === 0 ? 'text-rose-600' : 'text-accent-deep')}>
                    {free} свободно
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <RoundBtn onClick={() => move(h.id, -1)} disabled={h.occupied === 0}>−</RoundBtn>
                  <RoundBtn onClick={() => move(h.id, +1)} disabled={free === 0}>+</RoundBtn>
                </div>
              </div>

              <div className="mt-3">
                <Bar value={pct} tone={tone} />
              </div>
              <div className="mt-2 flex justify-between text-[11px] text-ink-mute">
                <span>{fmtMoney(h.costPerBed)}/место</span>
                <span className="font-semibold text-ink">{fmtMoney(h.occupied * h.costPerBed)}/мес</span>
              </div>
            </Card>
          )
        })}
      </div>

      <p className="mt-4 px-1 text-xs leading-relaxed text-ink-mute">
        В Битрикс24 общежитие — смарт-процесс с привязкой сотрудников к койко-местам. При заселении
        автоматически встаёт удержание за проживание в расчёт ЗП, при выселении — снимается. Координатор
        видит, где есть места под новый заезд, а руководитель — реальную стоимость размещения.
      </p>
    </div>
  )
}

function RoundBtn({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cx(
        'flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold transition-all duration-300 ease-spring active:scale-90',
        disabled ? 'cursor-not-allowed bg-black/[0.04] text-ink-mute/40' : 'bg-ink text-white hover:bg-ink/85',
      )}
    >
      {children}
    </button>
  )
}
