import {
  ARRIVALS_WEEK,
  CANDIDATES,
  CONTRACTS,
  DASH_MONTHS,
  DEMAND,
  DOCRISK_SERIES,
  DOCS,
  EMPLOYEES,
  FILL_SERIES,
  MARGIN_SERIES,
  OBJECTS,
  REVENUE_FACT,
  REVENUE_PLAN,
  fmtMoneyShort,
  objShort,
  shiftHours,
} from '../data/mock'
import type { ModuleId } from '../App'
import { Badge, Bar, Card, Eyebrow, ModuleHead, cx } from '../ui/components'
import { IconArrow } from '../ui/icons'

const factRevenue = (c: (typeof CONTRACTS)[number]) => c.hoursMonth * c.billRate
const CLIENT_COLORS = ['#0f7a5f', '#16a57d', '#4cae8f', '#8fcdba']

export default function Dashboard({ go }: { go: (id: ModuleId) => void }) {
  const revenue = CONTRACTS.reduce((a, c) => a + factRevenue(c), 0)
  const headFact = CONTRACTS.reduce((a, c) => a + c.headFact, 0)
  const headPlan = CONTRACTS.reduce((a, c) => a + c.headPlan, 0)
  const fillPct = Math.round((headFact / headPlan) * 100)

  const need = DEMAND.reduce((a, d) => a + d.need, 0)
  const filled = DEMAND.reduce((a, d) => a + d.filled, 0)
  const open = need - filled

  const docRisk = DOCS.reduce((a, p) => {
    const worst = Math.min(p.patentUntil, p.medUntil, p.regUntil)
    return worst <= 14 ? a + 1 : a
  }, 0)

  const arrivalsWeek = CANDIDATES.filter((c) => c.day <= 7 && c.status !== 'failed').length
  const failed = CANDIDATES.filter((c) => c.status === 'failed').length
  const margin = Math.round(revenue * 0.22)

  const clientRev = CONTRACTS.map((c, i) => ({ label: c.client, value: factRevenue(c), color: CLIENT_COLORS[i % CLIENT_COLORS.length] }))

  return (
    <div className="animate-fade-up space-y-6">
      <ModuleHead
        eyebrow="Сводка · сегодня"
        title="Дашборд руководителя"
        desc="Деньги, люди, риски и заезды на одном экране — с трендами и графиками. Карточки кликабельны: проваливайтесь в нужный модуль."
        right={<Badge tone="accent" dot>Данные за июнь 2026</Badge>}
      />

      {/* KPI ribbon со спарклайнами */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard onClick={() => go('contracts')} label="Выручка / мес" value={fmtMoneyShort(revenue)} hint="по всем договорам" tone="accent" spark={REVENUE_FACT} />
        <KpiCard onClick={() => go('margin')} label="Маржа / мес" value={fmtMoneyShort(margin)} hint="≈22% рентабельность" spark={MARGIN_SERIES} />
        <KpiCard onClick={() => go('recruitment')} label="Закрыто вакансий" value={`${fillPct}%`} hint={`${headFact}/${headPlan} человек`} tone={fillPct >= 80 ? 'accent' : 'amber'} spark={FILL_SERIES} sparkTone="amber" />
        <KpiCard onClick={() => go('documents')} label="Документы под риском" value={docRisk} hint="истекают ≤14 дней" tone={docRisk ? 'rose' : 'ink'} spark={DOCRISK_SERIES} sparkTone="rose" />
      </div>

      {/* Выручка тренд + донат */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-1 flex items-center justify-between">
            <div className="text-sm font-bold text-ink">Выручка: план / факт, ₽ млн</div>
            <div className="flex items-center gap-3 text-[11px] font-medium text-ink-mute">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-accent" /> Факт</span>
              <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 rounded bg-slate-400" /> План</span>
            </div>
          </div>
          <RevenueChart months={DASH_MONTHS} plan={REVENUE_PLAN} fact={REVENUE_FACT} />
        </Card>

        <Card>
          <div className="text-sm font-bold text-ink">Структура выручки</div>
          <div className="mt-1 text-[11px] text-ink-mute">по заказчикам, факт / мес</div>
          <Donut segments={clientRev} centerLabel={fmtMoneyShort(revenue)} />
          <div className="mt-4 space-y-2">
            {clientRev.map((s) => (
              <div key={s.label} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-ink-soft">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                  {s.label}
                </span>
                <span className="font-semibold tabular-nums text-ink">{Math.round((s.value / revenue) * 100)}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Укомплектованность + неделя */}
      <div className="grid gap-4 lg:grid-cols-3">
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

        <Card inner="bg-ink/95 text-white glass-dark">
          <div className="text-sm font-bold">На этой неделе</div>
          <div className="mt-4 space-y-2.5">
            <RiskRow label="Ожидается заездов" value={arrivalsWeek} onClick={() => go('arrivals')} />
            <RiskRow label="Открытых позиций" value={open} tone="amber" onClick={() => go('recruitment')} />
            <RiskRow label="Срывов заезда" value={failed} tone={failed ? 'rose' : undefined} onClick={() => go('arrivals')} />
            <RiskRow label="Красных документов" value={docRisk} tone={docRisk ? 'rose' : undefined} onClick={() => go('documents')} />
          </div>
          <div className="mt-4 rounded-2xl bg-white/[0.06] p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs text-white/60">Заезды по дням</span>
              <span className="text-xs font-semibold text-white">{ARRIVALS_WEEK.reduce((a, b) => a + b, 0)} за неделю</span>
            </div>
            <WeekBars values={ARRIVALS_WEEK} />
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
                className="rounded-4xl bg-white/35 p-1.5 text-left glass-tray transition-all duration-500 ease-spring hover:-translate-y-0.5"
              >
                <div className="rounded-[calc(2rem-0.375rem)] p-4 glass-pane">
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

/* ─── charts ─────────────────────────────────────────────────────────── */

function Sparkline({ data, tone = 'accent' }: { data: number[]; tone?: 'accent' | 'amber' | 'rose' }) {
  const w = 100
  const h = 30
  const pad = 3
  const min = Math.min(...data)
  const max = Math.max(...data)
  const rng = max - min || 1
  const px = (i: number) => pad + (i * (w - 2 * pad)) / (data.length - 1)
  const py = (v: number) => h - pad - ((v - min) / rng) * (h - 2 * pad)
  const line = data.map((v, i) => `${i ? 'L' : 'M'}${px(i).toFixed(1)} ${py(v).toFixed(1)}`).join(' ')
  const area = `${line} L${px(data.length - 1).toFixed(1)} ${h} L${px(0).toFixed(1)} ${h} Z`
  const stroke = tone === 'rose' ? '#e11d48' : tone === 'amber' ? '#d97706' : '#0f7a5f'
  const fill = tone === 'rose' ? 'rgba(225,29,72,0.10)' : tone === 'amber' ? 'rgba(217,119,6,0.10)' : 'rgba(15,122,95,0.12)'
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="mt-3 h-8 w-full">
      <path d={area} fill={fill} />
      <path d={line} fill="none" stroke={stroke} strokeWidth={1.6} vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

function RevenueChart({ months, plan, fact }: { months: string[]; plan: number[]; fact: number[] }) {
  const W = 680
  const H = 250
  const padL = 38
  const padR = 14
  const padT = 14
  const padB = 28
  const max = Math.ceil(Math.max(...plan, ...fact) / 2) * 2
  const x = (i: number) => padL + (i * (W - padL - padR)) / (months.length - 1)
  const y = (v: number) => padT + (1 - v / max) * (H - padT - padB)
  const ticks = [0, max / 2, max]

  const factLine = fact.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')
  const factArea = `${factLine} L${x(fact.length - 1).toFixed(1)} ${y(0)} L${x(0).toFixed(1)} ${y(0)} Z`
  const planLine = plan.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 w-full">
      <defs>
        <linearGradient id="revfill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f7a5f" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#0f7a5f" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {/* gridlines + y labels */}
      {ticks.map((t) => (
        <g key={t}>
          <line x1={padL} y1={y(t)} x2={W - padR} y2={y(t)} stroke="rgba(20,22,27,0.08)" strokeWidth={1} />
          <text x={padL - 8} y={y(t) + 3} textAnchor="end" className="fill-ink-mute" fontSize="11">{t}</text>
        </g>
      ))}
      {/* plan dashed */}
      <path d={planLine} fill="none" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" strokeLinejoin="round" strokeLinecap="round" />
      {/* fact area + line */}
      <path d={factArea} fill="url(#revfill)" />
      <path d={factLine} fill="none" stroke="#0f7a5f" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      {/* dots */}
      {fact.map((v, i) => (
        <circle key={i} cx={x(i)} cy={y(v)} r={i === fact.length - 1 ? 5 : 3} fill="#fff" stroke="#0a5946" strokeWidth={i === fact.length - 1 ? 3 : 2} />
      ))}
      {/* x labels */}
      {months.map((m, i) => (
        <text key={m} x={x(i)} y={H - 8} textAnchor="middle" className="fill-ink-mute" fontSize="11">{m}</text>
      ))}
    </svg>
  )
}

function Donut({ segments, centerLabel }: { segments: { label: string; value: number; color: string }[]; centerLabel: string }) {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1
  const r = 46
  const c = 2 * Math.PI * r
  let acc = 0
  return (
    <div className="relative mx-auto mt-4 h-40 w-40">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(20,22,27,0.06)" strokeWidth="14" />
        {segments.map((s) => {
          const len = (s.value / total) * c
          const el = (
            <circle
              key={s.label}
              cx="60"
              cy="60"
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth="14"
              strokeDasharray={`${len.toFixed(2)} ${(c - len).toFixed(2)}`}
              strokeDashoffset={(-acc).toFixed(2)}
              strokeLinecap="butt"
            />
          )
          acc += len
          return el
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-base font-extrabold tracking-tight text-ink">{centerLabel}</span>
        <span className="text-[10px] text-ink-mute">в месяц</span>
      </div>
    </div>
  )
}

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
function WeekBars({ values }: { values: number[] }) {
  const max = Math.max(...values, 1)
  return (
    <div className="flex h-20 items-end gap-1.5">
      {values.map((v, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1">
          <div className="flex w-full flex-1 items-end">
            <div
              className="w-full rounded-md bg-accent transition-all duration-700 ease-spring"
              style={{ height: `${(v / max) * 100}%`, minHeight: v ? '6px' : '2px', opacity: v ? 1 : 0.25 }}
            />
          </div>
          <span className="text-[9px] text-white/45">{WEEKDAYS[i]}</span>
        </div>
      ))}
    </div>
  )
}

/* ─── ui bits ────────────────────────────────────────────────────────── */

function KpiCard({
  label,
  value,
  hint,
  tone = 'ink',
  onClick,
  spark,
  sparkTone = 'accent',
}: {
  label: string
  value: React.ReactNode
  hint: string
  tone?: 'ink' | 'accent' | 'amber' | 'rose'
  onClick: () => void
  spark?: number[]
  sparkTone?: 'accent' | 'amber' | 'rose'
}) {
  const toneCls = { ink: 'text-ink', accent: 'text-accent-deep', amber: 'text-amber-600', rose: 'text-rose-600' }[tone]
  return (
    <button
      onClick={onClick}
      className="group rounded-4xl bg-white/35 p-1.5 text-left glass-tray transition-all duration-500 ease-spring hover:-translate-y-0.5"
    >
      <div className="relative h-full rounded-[calc(2rem-0.375rem)] bg-white/80 p-4 glass-edge sm:p-5">
        <span className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-black/5 text-ink-mute transition-all duration-500 ease-spring group-hover:translate-x-0.5 group-hover:bg-accent group-hover:text-white sm:right-5 sm:top-5">
          <IconArrow className="h-3.5 w-3.5" />
        </span>
        <span className="block pr-9 text-[11px] font-semibold uppercase leading-tight tracking-wider text-ink-mute">{label}</span>
        <div className={cx('mt-2 text-2xl font-extrabold tracking-tight tabular-nums sm:text-3xl', toneCls)}>{value}</div>
        <div className="mt-0.5 text-xs text-ink-mute">{hint}</div>
        {spark && <Sparkline data={spark} tone={sparkTone} />}
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
