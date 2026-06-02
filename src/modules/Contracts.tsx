import { useMemo, useState } from 'react'
import { CONTRACTS, EMPLOYEES, fmtMoney, fmtMoneyShort, objShort } from '../data/mock'
import type { Contract } from '../data/mock'
import { Badge, Bar, Card, ModuleHead, Stat, cx } from '../ui/components'

const STATUS_META: Record<Contract['status'], { label: string; tone: string }> = {
  active: { label: 'Действует', tone: 'green' },
  ending: { label: 'Истекает', tone: 'amber' },
  signing: { label: 'На подписании', tone: 'sky' },
}

// факт выручки = отработанные часы * ставка заказчику
const factRevenue = (c: Contract) => c.hoursMonth * c.billRate
// оценка ЗП-затрат по сотрудникам объекта
const payrollOf = (c: Contract) => {
  const emps = EMPLOYEES.filter((e) => e.object === c.object)
  const avgRate = emps.length ? emps.reduce((a, e) => a + e.rate, 0) / emps.length : 190
  return Math.round(c.hoursMonth * avgRate)
}

export default function Contracts() {
  const [sel, setSel] = useState<string>(CONTRACTS[0].id)
  const active = CONTRACTS.find((c) => c.id === sel)!

  const totals = useMemo(() => {
    const plan = CONTRACTS.reduce((a, c) => a + c.planRevenue, 0)
    const fact = CONTRACTS.reduce((a, c) => a + factRevenue(c), 0)
    const headPlan = CONTRACTS.reduce((a, c) => a + c.headPlan, 0)
    const headFact = CONTRACTS.reduce((a, c) => a + c.headFact, 0)
    return { plan, fact, headPlan, headFact }
  }, [])

  const aFact = factRevenue(active)
  const aPayroll = payrollOf(active)
  const aMargin = aFact - aPayroll
  const aMarginPct = Math.round((aMargin / aFact) * 100)
  const maxRev = Math.max(...CONTRACTS.map((c) => Math.max(c.planRevenue, factRevenue(c))))

  return (
    <div className="animate-fade-up">
      <ModuleHead
        eyebrow="Заказчики · план-факт"
        title="Отчёты по договорам с заказчиками"
        desc="Выручка план-факт, укомплектованность и маржа по каждому договору. Выберите договор, чтобы раскрыть экономику. Данные собираются из табелей и ставок автоматически."
      />

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="План выручки / мес" value={fmtMoneyShort(totals.plan)} />
        <Stat label="Факт выручки / мес" value={fmtMoneyShort(totals.fact)} tone="accent" sub={`${Math.round((totals.fact / totals.plan) * 100)}% плана`} />
        <Stat label="Укомплектованность" value={`${totals.headFact}/${totals.headPlan}`} sub="человек по всем договорам" />
        <Stat label="Договоров" value={CONTRACTS.length} sub="1 истекает в этом месяце" tone="amber" />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3" pad={false}>
          <div className="p-5 pb-3 text-sm font-bold text-ink">Договоры · выручка план / факт</div>
          <div className="space-y-1 p-3 pt-0">
            {CONTRACTS.map((c) => {
              const fact = factRevenue(c)
              const st = STATUS_META[c.status]
              return (
                <button
                  key={c.id}
                  onClick={() => setSel(c.id)}
                  className={cx(
                    'w-full rounded-2xl p-3 text-left transition-all duration-300 ease-spring',
                    sel === c.id ? 'bg-paper hairline-strong' : 'hover:bg-paper',
                  )}
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-bold text-ink">{c.client}</div>
                      <div className="text-[11px] text-ink-mute">
                        {objShort(c.object)} · до {c.until}
                      </div>
                    </div>
                    <Badge tone={st.tone} dot>
                      {st.label}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-9 text-[10px] font-semibold uppercase text-ink-mute">План</span>
                      <div className="flex-1">
                        <Bar value={(c.planRevenue / maxRev) * 100} tone="slate" />
                      </div>
                      <span className="w-20 text-right text-[11px] tabular-nums text-ink-mute">{fmtMoneyShort(c.planRevenue)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-9 text-[10px] font-semibold uppercase text-ink-mute">Факт</span>
                      <div className="flex-1">
                        <Bar value={(fact / maxRev) * 100} tone={fact >= c.planRevenue ? 'accent' : 'amber'} />
                      </div>
                      <span className="w-20 text-right text-[11px] font-bold tabular-nums text-ink">{fmtMoneyShort(fact)}</span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </Card>

        <Card className="lg:col-span-2" inner="bg-ink/90 text-white backdrop-blur-2xl glass-dark">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-extrabold tracking-tight">{active.client}</div>
              <div className="text-xs text-white/60">{objShort(active.object)}</div>
            </div>
            <Badge tone={STATUS_META[active.status].tone}>{STATUS_META[active.status].label}</Badge>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <MiniStat label="Ставка заказчику" value={`₽ ${active.billRate}/ч`} />
            <MiniStat label="Отработано часов" value={active.hoursMonth.toLocaleString('ru-RU')} />
            <MiniStat label="Факт выручки" value={fmtMoneyShort(aFact)} />
            <MiniStat label="ФОТ + налоги" value={fmtMoneyShort(aPayroll)} />
          </div>

          <div className="mt-5 rounded-2xl bg-white/[0.06] p-4">
            <div className="flex items-end justify-between">
              <span className="text-xs text-white/60">Маржа по договору</span>
              <span className="text-2xl font-extrabold tracking-tight text-accent">{aMarginPct}%</span>
            </div>
            <div className="mt-2.5">
              <Bar value={aMarginPct} tone="emerald" track={false} />
            </div>
            <div className="mt-2 text-xs text-white/70">{fmtMoney(aMargin)} в месяц</div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-white/60">
            <span>Укомплектованность</span>
            <span className="font-bold text-white">
              {active.headFact}/{active.headPlan} чел · {Math.round((active.headFact / active.headPlan) * 100)}%
            </span>
          </div>
        </Card>
      </div>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/[0.06] p-3">
      <div className="text-[11px] text-white/55">{label}</div>
      <div className="mt-0.5 text-base font-bold tabular-nums">{value}</div>
    </div>
  )
}
