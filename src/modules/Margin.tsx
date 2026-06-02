import { useMemo, useState } from 'react'
import { CONTRACTS, fmtMoney, fmtMoneyShort, objShort } from '../data/mock'
import { Bar, Card, ModuleHead, Segmented, Stat } from '../ui/components'

// налоги/взносы на ФОТ, % сверху
const TAX = 0.302

export default function Margin() {
  const [id, setId] = useState(CONTRACTS[0].id)
  const c = CONTRACTS.find((x) => x.id === id)!

  const [bill, setBill] = useState(c.billRate)
  const [pay, setPay] = useState(180)

  // при смене договора подхватываем его ставку
  const onSelect = (v: string) => {
    const next = CONTRACTS.find((x) => x.id === v)!
    setId(v)
    setBill(next.billRate)
  }

  const calc = useMemo(() => {
    const hours = c.hoursMonth
    const revenue = bill * hours
    const wage = pay * hours
    const taxes = wage * TAX
    const cost = wage + taxes
    const margin = revenue - cost
    const marginPct = revenue ? Math.round((margin / revenue) * 100) : 0
    const perHour = bill - pay * (1 + TAX)
    return { revenue, wage, taxes, cost, margin, marginPct, perHour, hours }
  }, [bill, pay, c])

  const tone = calc.marginPct >= 20 ? 'emerald' : calc.marginPct >= 10 ? 'amber' : 'rose'

  return (
    <div className="animate-fade-up">
      <ModuleHead
        eyebrow="Юнит-экономика"
        title="Маржинальность по договорам"
        desc="Живой калькулятор: подвигайте ставку заказчику и ставку персоналу — маржа, ФОТ с налогами и доход с часа пересчитываются сразу. Так менеджер видит, можно ли поднять ЗП и не уйти в минус."
        right={
          <Segmented
            size="sm"
            value={id}
            onChange={onSelect}
            options={CONTRACTS.map((x) => ({ value: x.id, label: x.client }))}
          />
        }
      />

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <div className="text-sm font-bold text-ink">{c.client}</div>
          <div className="text-[11px] text-ink-mute">
            {objShort(c.object)} · {calc.hours.toLocaleString('ru-RU')} ч/мес
          </div>

          <div className="mt-6 space-y-6">
            <Slider
              label="Ставка заказчику"
              value={bill}
              min={250}
              max={360}
              onChange={setBill}
              suffix="₽/ч"
              tone="accent"
            />
            <Slider
              label="Ставка персоналу"
              value={pay}
              min={140}
              max={260}
              onChange={setPay}
              suffix="₽/ч"
              tone="ink"
            />
          </div>

          <div className="mt-6 rounded-2xl bg-paper p-4 hairline">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-soft">Доход с одного часа</span>
              <span className="text-lg font-extrabold tabular-nums text-accent-deep">{fmtMoney(Math.round(calc.perHour))}</span>
            </div>
            <p className="mt-1.5 text-[11px] leading-relaxed text-ink-mute">
              Ставка минус ЗП и {Math.round(TAX * 100)}% взносов. Умножьте на объём часов — получите
              маржу договора.
            </p>
          </div>
        </Card>

        <Card className="lg:col-span-3" inner="bg-ink/95 text-white glass-dark">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-white/55">Маржа договора / мес</div>
              <div className="mt-1 text-4xl font-extrabold tracking-tight">{fmtMoneyShort(calc.margin)}</div>
            </div>
            <div className="text-right">
              <div className="text-5xl font-extrabold tracking-tighter text-accent">{calc.marginPct}%</div>
              <div className="text-xs text-white/55">рентабельность</div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <Waterfall label="Выручка от заказчика" value={calc.revenue} max={calc.revenue} tone="emerald" />
            <Waterfall label="Зарплата персоналу" value={calc.wage} max={calc.revenue} tone="slate" />
            <Waterfall label="Налоги и взносы (30,2%)" value={calc.taxes} max={calc.revenue} tone="amber" />
            <div className="border-t border-white/10 pt-4">
              <Waterfall label="Маржа" value={calc.margin} max={calc.revenue} tone="emerald" bold />
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Stat label="Выручка / мес" value={fmtMoneyShort(calc.revenue)} tone="accent" />
        <Stat label="Себестоимость" value={fmtMoneyShort(calc.cost)} sub="ФОТ + взносы" />
        <Stat label="Маржа / мес" value={fmtMoneyShort(calc.margin)} tone={tone === 'rose' ? 'rose' : 'accent'} />
      </div>
    </div>
  )
}

function Slider({
  label,
  value,
  min,
  max,
  onChange,
  suffix,
  tone,
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (v: number) => void
  suffix: string
  tone: 'accent' | 'ink'
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-ink-soft">{label}</span>
        <span className="text-lg font-extrabold tabular-nums text-ink">
          {value} <span className="text-xs font-medium text-ink-mute">{suffix}</span>
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={tone === 'accent' ? 'w-full accent-accent' : 'w-full accent-ink'}
      />
    </div>
  )
}

function Waterfall({
  label,
  value,
  max,
  tone,
  bold,
}: {
  label: string
  value: number
  max: number
  tone: string
  bold?: boolean
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className={bold ? 'font-bold text-white' : 'text-white/70'}>{label}</span>
        <span className="font-bold tabular-nums text-white">{fmtMoney(Math.round(value))}</span>
      </div>
      <Bar value={(value / max) * 100} tone={tone} track={false} />
    </div>
  )
}
