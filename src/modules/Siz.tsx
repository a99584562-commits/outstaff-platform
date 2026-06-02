import { useMemo, useState } from 'react'
import {
  EMPLOYEES,
  SIZ,
  SIZ_NORMS,
  fmt,
  fmtMoney,
  kitCost,
  objShort,
  sizById,
} from '../data/mock'
import type { SizItem, SizIssue } from '../data/mock'
import { Badge, Bar, Card, ModuleHead, Stat, cx } from '../ui/components'

const initials = (name: string) => name.replace('.', '').trim()[0]

const seedIssues = (): SizIssue[] => [
  { id: 'i1', worker: 'Усманов Ж.', specialty: 'Комплектовщик', object: 'wb-elektrostal', items: SIZ_NORMS['Комплектовщик'], date: '02.06', cost: kitCost('Комплектовщик'), returned: false },
  { id: 'i2', worker: 'Назаров Б.', specialty: 'Грузчик', object: 'ozon-tver', items: SIZ_NORMS['Грузчик'], date: '03.06', cost: kitCost('Грузчик'), returned: false },
  { id: 'i3', worker: 'Сидоров А.', specialty: 'Кладовщик', object: 'wb-elektrostal', items: SIZ_NORMS['Кладовщик'], date: '28.05', cost: kitCost('Кладовщик'), returned: true },
]

function stockLevel(s: SizItem): 'low' | 'mid' | 'ok' {
  if (s.stock <= s.min) return 'low'
  if (s.stock <= s.min * 1.3) return 'mid'
  return 'ok'
}

export default function Siz() {
  const [items, setItems] = useState<SizItem[]>(() => SIZ.map((s) => ({ ...s })))
  const [issues, setIssues] = useState<SizIssue[]>(seedIssues)
  const [empId, setEmpId] = useState(EMPLOYEES[0].id)
  const emp = EMPLOYEES.find((e) => e.id === empId)!
  const norm = SIZ_NORMS[emp.specialty]

  const stockOf = (id: string) => items.find((i) => i.id === id)?.stock ?? 0
  const canIssue = norm.every((n) => stockOf(n.item) >= n.qty)
  const cost = kitCost(emp.specialty)

  const stats = useMemo(() => {
    const units = items.reduce((a, i) => a + i.stock, 0)
    const reorder = items.filter((i) => i.stock <= i.min).length
    const active = issues.filter((i) => !i.returned)
    const issuedValue = active.reduce((a, i) => a + i.cost, 0)
    return { units, reorder, issuedCount: active.length, issuedValue }
  }, [items, issues])

  function issueKit() {
    if (!canIssue) return
    setItems((prev) => prev.map((i) => {
      const n = norm.find((x) => x.item === i.id)
      return n ? { ...i, stock: i.stock - n.qty } : i
    }))
    setIssues((prev) => [
      { id: 'i' + (prev.length + 1) + '_' + empId, worker: emp.name, specialty: emp.specialty, object: emp.object, items: norm, date: 'сегодня', cost, returned: false },
      ...prev,
    ])
  }

  function returnIssue(id: string) {
    const iss = issues.find((x) => x.id === id)
    if (!iss || iss.returned) return
    setItems((its) =>
      its.map((i) => {
        const n = iss.items.find((x) => x.item === i.id)
        return n ? { ...i, stock: i.stock + n.qty } : i
      }),
    )
    setIssues((prev) => prev.map((x) => (x.id === id ? { ...x, returned: true } : x)))
  }

  return (
    <div className="animate-fade-up">
      <ModuleHead
        eyebrow="Охрана труда · склад"
        title="Выдача СИЗ и спецодежды"
        desc="Складской учёт средств защиты и спецодежды + выдача комплекта по норме специальности. Выберите сотрудника и выдайте комплект одним кликом — остатки на складе спишутся, а стоимость уйдёт в удержание сотрудника. Возврат восстанавливает остаток."
      />

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Позиций в каталоге" value={items.length} />
        <Stat label="Единиц на складе" value={fmt(stats.units)} tone="accent" />
        <Stat label="Комплектов выдано" value={stats.issuedCount} sub={`удержаний на ${fmtMoney(stats.issuedValue)}`} />
        <Stat label="К дозаказу" value={stats.reorder} tone={stats.reorder ? 'rose' : 'ink'} sub="ниже мин. остатка" />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Склад */}
        <Card className="lg:col-span-3" pad={false}>
          <div className="flex items-center justify-between p-5 pb-3">
            <div className="text-sm font-bold text-ink">Склад СИЗ</div>
            <span className="text-xs text-ink-mute">остаток · мин · цена</span>
          </div>
          <div className="space-y-1 p-3 pt-0">
            {items.map((s) => {
              const lvl = stockLevel(s)
              const tone = lvl === 'low' ? 'rose' : lvl === 'mid' ? 'amber' : 'accent'
              const pct = Math.min(100, (s.stock / Math.max(s.min * 2, s.stock)) * 100)
              return (
                <div key={s.id} className="rounded-2xl p-3 transition-colors hover:bg-paper">
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-ink">{s.name}</span>
                      {s.bySize && <Badge tone="slate">по размеру</Badge>}
                      {lvl === 'low' && <Badge tone="rose" dot>дозаказ</Badge>}
                    </div>
                    <div className="flex items-center gap-3 text-xs tabular-nums">
                      <span className={cx('font-bold', lvl === 'low' ? 'text-rose-600' : 'text-ink')}>
                        {s.stock} {s.unit}
                      </span>
                      <span className="text-ink-mute">мин {s.min}</span>
                      <span className="w-16 text-right text-ink-soft">{fmtMoney(s.price)}</span>
                    </div>
                  </div>
                  <Bar value={pct} tone={tone} />
                </div>
              )
            })}
          </div>
        </Card>

        {/* Выдача */}
        <Card className="lg:col-span-2" inner="bg-ink text-white">
          <div className="text-sm font-bold">Выдать комплект</div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {EMPLOYEES.map((e) => (
              <button
                key={e.id}
                onClick={() => setEmpId(e.id)}
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
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold">{emp.name}</span>
              <Badge tone="accent">{emp.specialty}</Badge>
            </div>
            <div className="mt-1 text-[11px] text-white/55">Норма комплекта · {objShort(emp.object)}</div>

            <div className="mt-3 space-y-2">
              {norm.map((n) => {
                const it = sizById(n.item)!
                const ok = stockOf(n.item) >= n.qty
                return (
                  <div key={n.item} className="flex items-center justify-between text-sm">
                    <span className="text-white/80">
                      {it.name} <span className="text-white/45">× {n.qty}</span>
                    </span>
                    <span className={cx('text-xs font-semibold', ok ? 'text-accent' : 'text-rose-400')}>
                      {ok ? `на складе ${stockOf(n.item)}` : 'нет на складе'}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
              <span className="text-xs text-white/55">Стоимость комплекта</span>
              <span className="text-lg font-extrabold tabular-nums">{fmtMoney(cost)}</span>
            </div>
          </div>

          <button
            onClick={issueKit}
            disabled={!canIssue}
            className={cx(
              'mt-4 w-full rounded-full py-3 text-sm font-semibold transition-all duration-300 ease-spring active:scale-[0.98]',
              canIssue ? 'bg-accent text-white hover:bg-accent-deep' : 'cursor-not-allowed bg-white/10 text-white/40',
            )}
          >
            {canIssue ? 'Выдать комплект и списать со склада' : 'Не хватает позиций на складе'}
          </button>
          <p className="mt-2 text-center text-[11px] text-white/45">
            Стоимость уйдёт в удержание сотрудника
          </p>
        </Card>
      </div>

      {/* История выдач */}
      <div className="mt-5">
        <div className="mb-3 text-sm font-bold text-ink">История выдач</div>
        <div className="space-y-2">
          {issues.map((iss) => (
            <Card key={iss.id} pad={false}>
              <div className="grid items-center gap-3 p-4 sm:grid-cols-[1.2fr_1.8fr_auto_auto]">
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
                <div className="flex justify-end">
                  {iss.returned ? (
                    <Badge tone="slate" dot>Возвращён</Badge>
                  ) : (
                    <button
                      onClick={() => returnIssue(iss.id)}
                      className="rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-ink-soft transition-all duration-300 ease-spring hover:text-ink hairline active:scale-95"
                    >
                      Вернуть
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <p className="mt-4 px-1 text-xs leading-relaxed text-ink-mute">
        В Битрикс24 склад СИЗ — это товарный каталог, выдача — смарт-процесс с привязкой к сотруднику.
        Выдача списывает остаток и формирует личную карточку СИЗ (что, когда, под подпись), стоимость идёт
        в удержание, а позиции ниже минимального остатка автоматически попадают в заявку на дозакупку.
      </p>
    </div>
  )
}
