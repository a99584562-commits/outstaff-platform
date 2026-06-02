import { CANDIDATES, CONTRACTS, DEMAND, DOCS, EMPLOYEES, OBJECTS, fmtMoneyShort, objShort, shiftHours } from '../data/mock'
import type { ModuleId } from '../App'
import { Badge, Bar, Card, Eyebrow, ModuleHead, Stat, cx } from '../ui/components'
import { IconArrow } from '../ui/icons'

const factRevenue = (c: (typeof CONTRACTS)[number]) => c.hoursMonth * c.billRate

export default function Dashboard({ go }: { go: (id: ModuleId) => void }) {
  const revenue = CONTRACTS.reduce((a, c) => a + factRevenue(c), 0)
  const headFact = CONTRACTS.reduce((a, c) => a + c.headFact, 0)
  const headPlan = CONTRACTS.reduce((a, c) => a + c.headPlan, 0)
  const fillPct = Math.round((headFact / headPlan) * 100)

  const need = DEMAND.reduce((a, d) => a + d.need, 0)
  const filled = DEMAND.reduce((a, d) => a + d.filled, 0)
  const open = need - filled

  // документы под риском
  const docRisk = DOCS.reduce((a, p) => {
    const worst = Math.min(p.patentUntil, p.medUntil, p.regUntil)
    return worst <= 14 ? a + 1 : a
  }, 0)

  // заезды на неделю
  const arrivalsWeek = CANDIDATES.filter((c) => c.day <= 7 && c.status !== 'failed').length
  const failed = CANDIDATES.filter((c) => c.status === 'failed').length

  // оценка маржи (упрощённо: 22%)
  const margin = Math.round(revenue * 0.22)

  return (
    <div className="animate-fade-up space-y-6">
      <ModuleHead
        eyebrow="Сводка · сегодня"
        title="Дашборд руководителя"
        desc="Вся операционка на одном экране: деньги, люди, риски и заезды. Карточки кликабельны — проваливайтесь в нужный модуль."
        right={<Badge tone="accent" dot>Данные за июнь 2026</Badge>}
      />

      {/* KPI ribbon */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard onClick={() => go('contracts')} label="Выручка / мес" value={fmtMoneyShort(revenue)} hint="по всем договорам" tone="accent" />
        <KpiCard onClick={() => go('margin')} label="Маржа / мес" value={fmtMoneyShort(margin)} hint="≈22% рентабельность" />
        <KpiCard onClick={() => go('recruitment')} label="Закрыто вакансий" value={`${fillPct}%`} hint={`${headFact}/${headPlan} человек`} tone={fillPct >= 80 ? 'accent' : 'amber'} />
        <KpiCard onClick={() => go('documents')} label="Документы под риском" value={docRisk} hint="истекают ≤14 дней" tone={docRisk ? 'rose' : 'ink'} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Укомплектованность по объектам */}
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm font-bold text-ink">Укомплектованность по объектам</div>
            <button onClick={() => go('recruitment')} className="text-xs font-semibold text-accent-deep hover:underline">
              Подбор →
            </button>
          </div>
          <div className="space-y-3.5">
            {OBJECTS.map((o) => {
              const rows = DEMAND.filter((d) => d.object === o.id)
              const n = rows.reduce((a, r) => a + r.need, 0)
              const f = rows.reduce((a, r) => a + r.filled, 0)
              const pct = n ? Math.round((f / n) * 100) : 0
              const tone = pct >= 90 ? 'accent' : pct >= 75 ? 'amber' : 'rose'
              return (
                <div key={o.id}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="font-medium text-ink-soft">{objShort(o.id)}</span>
                    <span className="tabular-nums text-ink-mute">
                      {f}/{n} · <span className="font-semibold text-ink">{pct}%</span>
                    </span>
                  </div>
                  <Bar value={pct} tone={tone} />
                </div>
              )
            })}
          </div>
        </Card>

        {/* Заезды / риски */}
        <Card inner="bg-ink text-white">
          <div className="text-sm font-bold">На этой неделе</div>
          <div className="mt-4 space-y-3">
            <RiskRow label="Ожидается заездов" value={arrivalsWeek} onClick={() => go('arrivals')} />
            <RiskRow label="Открытых позиций" value={open} tone="amber" onClick={() => go('recruitment')} />
            <RiskRow label="Срывов заезда" value={failed} tone={failed ? 'rose' : undefined} onClick={() => go('arrivals')} />
            <RiskRow label="Красных документов" value={docRisk} tone={docRisk ? 'rose' : undefined} onClick={() => go('documents')} />
          </div>
          <div className="mt-5 rounded-2xl bg-white/[0.06] p-4">
            <div className="text-xs text-white/60">Отработано часов за период</div>
            <div className="mt-1 text-2xl font-extrabold tabular-nums">
              {EMPLOYEES.reduce((a, e) => a + shiftHours(e.shifts), 0).toLocaleString('ru-RU')}
            </div>
            <button onClick={() => go('timesheet')} className="mt-2 text-xs font-semibold text-accent hover:underline">
              Открыть табель →
            </button>
          </div>
        </Card>
      </div>

      {/* Договоры compact */}
      <div>
        <Eyebrow>Договоры с заказчиками</Eyebrow>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CONTRACTS.map((c) => {
            const fact = factRevenue(c)
            const pct = Math.round((fact / c.planRevenue) * 100)
            return (
              <button
                key={c.id}
                onClick={() => go('contracts')}
                className="rounded-4xl bg-black/[0.035] p-1.5 text-left hairline transition-all duration-500 ease-spring hover:-translate-y-0.5"
              >
                <div className="rounded-[calc(2rem-0.375rem)] bg-white p-4 hairline">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-ink">{c.client}</span>
                    <span className={cx('text-xs font-bold tabular-nums', pct >= 90 ? 'text-accent-deep' : 'text-amber-600')}>{pct}%</span>
                  </div>
                  <div className="mt-1 text-[11px] text-ink-mute">{fmtMoneyShort(fact)} факт</div>
                  <div className="mt-2">
                    <Bar value={pct} tone={pct >= 90 ? 'accent' : 'amber'} />
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function KpiCard({
  label,
  value,
  hint,
  tone = 'ink',
  onClick,
}: {
  label: string
  value: React.ReactNode
  hint: string
  tone?: 'ink' | 'accent' | 'amber' | 'rose'
  onClick: () => void
}) {
  const toneCls = { ink: 'text-ink', accent: 'text-accent-deep', amber: 'text-amber-600', rose: 'text-rose-600' }[tone]
  return (
    <button
      onClick={onClick}
      className="group rounded-4xl bg-black/[0.035] p-1.5 text-left hairline transition-all duration-500 ease-spring hover:-translate-y-0.5"
    >
      <div className="relative h-full rounded-[calc(2rem-0.375rem)] bg-white p-4 hairline sm:p-5">
        <span className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-black/5 text-ink-mute transition-all duration-500 ease-spring group-hover:translate-x-0.5 group-hover:bg-accent group-hover:text-white sm:right-5 sm:top-5">
          <IconArrow className="h-3.5 w-3.5" />
        </span>
        <span className="block pr-9 text-[11px] font-semibold uppercase leading-tight tracking-wider text-ink-mute">{label}</span>
        <div className={cx('mt-2 text-2xl font-extrabold tracking-tight tabular-nums sm:text-3xl', toneCls)}>{value}</div>
        <div className="mt-0.5 text-xs text-ink-mute">{hint}</div>
      </div>
    </button>
  )
}

function RiskRow({ label, value, tone, onClick }: { label: string; value: number; tone?: 'amber' | 'rose'; onClick: () => void }) {
  const dot = tone === 'rose' ? 'bg-rose-400' : tone === 'amber' ? 'bg-amber-400' : 'bg-accent'
  return (
    <button onClick={onClick} className="flex w-full items-center justify-between rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-white/[0.06]">
      <span className="flex items-center gap-2.5 text-sm text-white/75">
        <span className={cx('h-1.5 w-1.5 rounded-full', dot)} />
        {label}
      </span>
      <span className="text-lg font-extrabold tabular-nums">{value}</span>
    </button>
  )
}
