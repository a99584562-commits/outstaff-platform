import { useMemo, useState } from 'react'
import { DEMAND, FUNNEL, OBJECTS, SPECIALTIES, fmt, objShort } from '../data/mock'
import type { ObjectId, Specialty } from '../data/mock'
import { Badge, Bar, Card, ModuleHead, Segmented, Stat, cx } from '../ui/components'

export default function Recruitment() {
  const [obj, setObj] = useState<ObjectId | 'all'>('all')
  const [spec, setSpec] = useState<Specialty | 'all'>('all')

  const rows = useMemo(
    () =>
      DEMAND.filter((d) => (obj === 'all' || d.object === obj) && (spec === 'all' || d.specialty === spec)).sort(
        (a, b) => a.filled / a.need - b.filled / b.need,
      ),
    [obj, spec],
  )

  const agg = useMemo(() => {
    const need = rows.reduce((a, r) => a + r.need, 0)
    const filled = rows.reduce((a, r) => a + r.filled, 0)
    const inWork = rows.reduce((a, r) => a + r.inWork, 0)
    return { need, filled, inWork, open: need - filled, pct: need ? Math.round((filled / need) * 100) : 0 }
  }, [rows])

  const maxFunnel = FUNNEL[0].value

  return (
    <div className="animate-fade-up">
      <ModuleHead
        eyebrow="Закрытие потребности"
        title="Подбор по объектам и специальностям"
        desc="Сколько людей нужно, сколько закрыто и сколько в работе — в разрезе объектов и специальностей. Фильтруйте и сразу видите узкие места и воронку привлечения."
      />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Segmented
          size="sm"
          value={obj}
          onChange={setObj}
          options={[{ value: 'all', label: 'Все объекты' }, ...OBJECTS.map((o) => ({ value: o.id, label: objShort(o.id) }))]}
        />
        <Segmented
          size="sm"
          value={spec}
          onChange={setSpec}
          options={[{ value: 'all', label: 'Все специальности' }, ...SPECIALTIES.map((s) => ({ value: s, label: s }))]}
        />
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Потребность" value={fmt(agg.need)} sub="человек" />
        <Stat label="Закрыто" value={fmt(agg.filled)} tone="accent" sub={`${agg.pct}% от плана`} />
        <Stat label="В работе" value={fmt(agg.inWork)} sub="кандидатов в воронке" />
        <Stat label="Открыто" value={fmt(agg.open)} tone={agg.open > 0 ? 'amber' : 'ink'} sub="дефицит" />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3" pad={false}>
          <div className="p-5 pb-2 text-sm font-bold text-ink">Закрытие по объектам и специальностям</div>
          <div className="space-y-1 p-3 pt-1">
            {rows.map((r) => {
              const pct = Math.round((r.filled / r.need) * 100)
              const tone = pct >= 90 ? 'accent' : pct >= 70 ? 'amber' : 'rose'
              return (
                <div
                  key={r.object + r.specialty}
                  className="rounded-2xl p-3 transition-colors duration-300 hover:bg-paper"
                >
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-ink">{r.specialty}</div>
                      <div className="text-[11px] text-ink-mute">{objShort(r.object)}</div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold tabular-nums text-ink">
                        {r.filled}
                        <span className="text-ink-mute">/{r.need}</span>
                      </span>
                      <Badge tone={tone}>{pct}%</Badge>
                    </div>
                  </div>
                  <Bar value={pct} tone={tone} />
                </div>
              )
            })}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <div className="text-sm font-bold text-ink">Воронка подбора за месяц</div>
          <div className="mt-4 space-y-2.5">
            {FUNNEL.map((f, i) => {
              const w = (f.value / maxFunnel) * 100
              const conv = i === 0 ? 100 : Math.round((f.value / FUNNEL[i - 1].value) * 100)
              return (
                <div key={f.stage}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-ink-soft">{f.stage}</span>
                    <span className="tabular-nums text-ink-mute">
                      {fmt(f.value)}
                      {i > 0 && <span className="ml-1.5 text-accent-deep">→ {conv}%</span>}
                    </span>
                  </div>
                  <div
                    className={cx(
                      'h-8 rounded-xl bg-accent/90 transition-all duration-700 ease-spring',
                      i === FUNNEL.length - 1 && 'bg-accent-deep',
                    )}
                    style={{ width: `${Math.max(w, 8)}%` }}
                  />
                </div>
              )
            })}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-ink-mute">
            Из {fmt(FUNNEL[0].value)} откликов до смены доходит {fmt(FUNNEL[FUNNEL.length - 1].value)} —
            конверсия {Math.round((FUNNEL[FUNNEL.length - 1].value / FUNNEL[0].value) * 100)}%. Видно, на
            каком шаге теряются люди.
          </p>
        </Card>
      </div>
    </div>
  )
}
