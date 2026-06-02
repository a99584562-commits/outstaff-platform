import { useMemo, useState } from 'react'
import {
  EMPLOYEES,
  SIZ,
  SIZ_NORMS,
  fmt,
  fmtMoney,
  objShort,
  sizById,
} from '../data/mock'
import type { SizItem, SizIssue } from '../data/mock'
import { Badge, Bar, Card, ModuleHead, Stat, cx } from '../ui/components'

const initials = (name: string) => name.replace('.', '').trim()[0]

const seedLog = (): SizIssue[] => [
  { id: 'i1', worker: 'Усманов Ж.', specialty: 'Комплектовщик', object: 'wb-elektrostal', items: [{ item: 's3', qty: 1 }, { item: 's2', qty: 2 }], date: '02.06', cost: 320 + 90 * 2 },
  { id: 'i2', worker: 'Назаров Б.', specialty: 'Грузчик', object: 'ozon-tver', items: [{ item: 's1', qty: 1 }, { item: 's3', qty: 1 }, { item: 's2', qty: 2 }, { item: 's4', qty: 1 }], date: '03.06', cost: 450 + 320 + 90 * 2 + 2200 },
]

function stockLevel(s: SizItem): 'low' | 'mid' | 'ok' {
  if (s.stock <= s.min) return 'low'
  if (s.stock <= s.min * 1.3) return 'mid'
  return 'ok'
}

export default function Siz() {
  const [items, setItems] = useState<SizItem[]>(() => SIZ.map((s) => ({ ...s })))
  const [log, setLog] = useState<SizIssue[]>(seedLog)
  const [empId, setEmpId] = useState(EMPLOYEES[0].id)
  const [sel, setSel] = useState<Record<string, number>>({}) // что выдаём: id -> кол-во

  const emp = EMPLOYEES.find((e) => e.id === empId)!
  const stockOf = (id: string) => items.find((i) => i.id === id)?.stock ?? 0

  const picked = Object.entries(sel).filter(([, q]) => q > 0)
  const totalUnits = picked.reduce((a, [, q]) => a + q, 0)
  const totalCost = picked.reduce((a, [id, q]) => a + (sizById(id)?.price ?? 0) * q, 0)

  const stats = useMemo(() => {
    const units = items.reduce((a, i) => a + i.stock, 0)
    const reorder = items.filter((i) => i.stock <= i.min).length
    return { units, reorder, issued: log.length }
  }, [items, log])

  function setQty(id: string, qty: number) {
    const max = stockOf(id)
    setSel((p) => ({ ...p, [id]: Math.max(0, Math.min(max, qty)) }))
  }
  function pickEmployee(id: string) {
    setEmpId(id)
    setSel({})
  }
  function fillByNorm() {
    const next: Record<string, number> = {}
    for (const n of SIZ_NORMS[emp.specialty]) next[n.item] = Math.min(n.qty, stockOf(n.item))
    setSel(next)
  }
  function issue() {
    if (!picked.length) return
    const issuedItems = picked.map(([item, qty]) => ({ item, qty }))
    setItems((prev) => prev.map((i) => (sel[i.id] ? { ...i, stock: i.stock - sel[i.id] } : i)))
    setLog((prev) => [
      { id: 'i' + (prev.length + 1) + '_' + empId, worker: emp.name, specialty: emp.specialty, object: emp.object, items: issuedItems, date: 'сегодня', cost: totalCost },
      ...prev,
    ])
    setSel({})
  }

  return (
    <div className="animate-fade-up">
      <ModuleHead
        eyebrow="Охрана труда · склад"
        title="Выдача СИЗ и спецодежды"
        desc="Складской учёт спецодежды и средств защиты. Выберите сотрудника, наберите нужные позиции с количеством и нажмите «Выдать» — остатки спишутся, а стоимость уйдёт в удержание сотрудника."
      />

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Позиций в каталоге" value={items.length} />
        <Stat label="Единиц на складе" value={fmt(stats.units)} tone="accent" />
        <Stat label="Выдач в журнале" value={stats.issued} />
        <Stat label="К дозаказу" value={stats.reorder} tone={stats.reorder ? 'rose' : 'ink'} sub="ниже мин. остатка" />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Склад со степперами */}
        <Card className="lg:col-span-3" pad={false}>
          <div className="flex items-center justify-between p-5 pb-3">
            <div className="text-sm font-bold text-ink">Склад СИЗ</div>
            <span className="text-xs text-ink-mute">отметьте, сколько выдать →</span>
          </div>
          <div className="space-y-1 p-3 pt-0">
            {items.map((s) => {
              const lvl = stockLevel(s)
              const tone = lvl === 'low' ? 'rose' : lvl === 'mid' ? 'amber' : 'accent'
              const pct = Math.min(100, (s.stock / Math.max(s.min * 2, s.stock)) * 100)
              const q = sel[s.id] ?? 0
              return (
                <div key={s.id} className={cx('rounded-2xl p-3 transition-colors', q > 0 ? 'bg-accent-soft/60' : 'hover:bg-paper')}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-ink">{s.name}</span>
                        {s.bySize && <Badge tone="slate">по размеру</Badge>}
                        {lvl === 'low' && <Badge tone="rose" dot>дозаказ</Badge>}
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="w-28">
                          <Bar value={pct} tone={tone} />
                        </div>
                        <span className="text-[11px] tabular-nums text-ink-mute">
                          ост. <span className={cx('font-semibold', lvl === 'low' ? 'text-rose-600' : 'text-ink')}>{s.stock}</span> {s.unit} · {fmtMoney(s.price)}
                        </span>
                      </div>
                    </div>
                    <Stepper value={q} max={s.stock} onChange={(v) => setQty(s.id, v)} />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Выдача */}
        <Card className="lg:col-span-2" inner="bg-ink/95 text-white glass-dark">
          <div className="text-sm font-bold">Кому выдаём</div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {EMPLOYEES.map((e) => (
              <button
                key={e.id}
                onClick={() => pickEmployee(e.id)}
                className={cx(
                  'flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2.5 text-xs font-semibold transition-all duration-300 ease-spring',
                  e.id === empId ? 'bg-accent text-white' : 'bg-white/[0.08] text-white/70 hover:bg-white/[0.14]',
                )}
              >
                <span className={cx('flex h-5 w-5 items-center justify-center rounded-full text-[10px]', e.id === empId ? 'bg-white/25' : 'bg-white/10')}>
                  {initials(e.name)}
                </span>
                {e.name}
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-2xl bg-white/[0.06] p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-bold leading-tight">{emp.name}</div>
                <div className="text-[11px] text-white/55">{emp.specialty} · {objShort(emp.object)}</div>
              </div>
              <button
                onClick={fillByNorm}
                className="shrink-0 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-accent transition-colors hover:bg-white/15"
              >
                по норме
              </button>
            </div>

            <div className="mt-3 min-h-[80px] space-y-2">
              {picked.length === 0 ? (
                <p className="py-5 text-center text-xs text-white/45">Отметьте позиции на складе слева</p>
              ) : (
                picked.map(([id, q]) => {
                  const it = sizById(id)!
                  return (
                    <div key={id} className="flex items-center justify-between text-sm">
                      <span className="text-white/80">
                        {it.name} <span className="text-white/45">× {q}</span>
                      </span>
                      <span className="tabular-nums text-white/70">{fmtMoney(it.price * q)}</span>
                    </div>
                  )
                })
              )}
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
              <span className="text-xs text-white/55">Итого · {totalUnits} ед.</span>
              <span className="text-lg font-extrabold tabular-nums">{fmtMoney(totalCost)}</span>
            </div>
          </div>

          <button
            onClick={issue}
            disabled={!picked.length}
            className={cx(
              'mt-4 w-full rounded-full py-3 text-sm font-semibold transition-all duration-300 ease-spring active:scale-[0.98]',
              picked.length ? 'bg-accent text-white hover:bg-accent-deep' : 'cursor-not-allowed bg-white/10 text-white/40',
            )}
          >
            {picked.length ? `Выдать ${totalUnits} ед. и списать со склада` : 'Выберите позиции'}
          </button>
          <p className="mt-2 text-center text-[11px] text-white/45">Стоимость уйдёт в удержание сотрудника</p>
        </Card>
      </div>

      {/* Журнал выдач */}
      <div className="mt-5">
        <div className="mb-3 text-sm font-bold text-ink">Журнал выдач</div>
        <div className="space-y-2">
          {log.map((iss) => (
            <Card key={iss.id} pad={false}>
              <div className="grid items-center gap-3 p-4 sm:grid-cols-[1.2fr_2fr_auto]">
                <div>
                  <div className="text-sm font-bold text-ink">{iss.worker}</div>
                  <div className="text-[11px] text-ink-mute">
                    {iss.specialty} · {objShort(iss.object)} · {iss.date}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {iss.items.map((n) => (
                    <span key={n.item} className="rounded-full bg-paper px-2.5 py-1 text-[11px] font-medium text-ink-soft hairline">
                      {sizById(n.item)?.name} ×{n.qty}
                    </span>
                  ))}
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-ink-mute">удержание</div>
                  <div className="text-sm font-bold tabular-nums text-ink">{fmtMoney(iss.cost)}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <p className="mt-4 px-1 text-xs leading-relaxed text-ink-mute">
        В Битрикс24 склад СИЗ — товарный каталог, выдача — смарт-процесс с привязкой к сотруднику.
        Выдача списывает остаток и формирует личную карточку СИЗ (что и когда выдано, под подпись),
        стоимость идёт в удержание, а позиции ниже минимального остатка попадают в заявку на дозакупку.
      </p>
    </div>
  )
}

function Stepper({ value, max, onChange }: { value: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <button
        onClick={() => onChange(value - 1)}
        disabled={value === 0}
        className={cx(
          'flex h-7 w-7 items-center justify-center rounded-full text-base font-bold transition-all duration-200 active:scale-90',
          value === 0 ? 'cursor-not-allowed bg-black/[0.04] text-ink-mute/40' : 'bg-white text-ink hairline hover:bg-paper',
        )}
      >
        −
      </button>
      <span className={cx('w-6 text-center text-sm font-bold tabular-nums', value > 0 ? 'text-accent-deep' : 'text-ink-mute')}>{value}</span>
      <button
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        className={cx(
          'flex h-7 w-7 items-center justify-center rounded-full text-base font-bold transition-all duration-200 active:scale-90',
          value >= max ? 'cursor-not-allowed bg-black/[0.04] text-ink-mute/40' : 'bg-ink text-white hover:bg-ink/85',
        )}
      >
        +
      </button>
    </div>
  )
}
