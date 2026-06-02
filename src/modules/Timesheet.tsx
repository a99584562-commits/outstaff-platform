import { useMemo, useState } from 'react'
import { EMPLOYEES, OBJECTS, SHIFT_META, fmt, fmtMoney, objShort } from '../data/mock'
import type { Employee, ObjectId, ShiftCode } from '../data/mock'
import { Badge, Bar, Card, CTA, ModuleHead, Segmented, Stat, cx } from '../ui/components'
import { IconBitrix } from '../ui/icons'

const DAYS = Array.from({ length: 14 }, (_, i) => i + 1)
const NEXT: Record<ShiftCode, ShiftCode> = { '': 'D', D: 'N', N: 'V', V: '' }

function rowHours(s: ShiftCode[]) {
  return s.reduce((a, c) => a + (c && c !== 'V' ? SHIFT_META[c].hours : 0), 0)
}
function rowShifts(s: ShiftCode[]) {
  return s.filter((c) => c === 'D' || c === 'N').length
}

export default function Timesheet() {
  const [filter, setFilter] = useState<ObjectId | 'all'>('all')
  const [rows, setRows] = useState<Employee[]>(() => EMPLOYEES.map((e) => ({ ...e, shifts: [...e.shifts] })))
  const [saved, setSaved] = useState(false)

  const visible = filter === 'all' ? rows : rows.filter((r) => r.object === filter)

  const totals = useMemo(() => {
    let hours = 0
    let shifts = 0
    let payroll = 0
    for (const r of visible) {
      const h = rowHours(r.shifts)
      hours += h
      shifts += rowShifts(r.shifts)
      payroll += h * r.rate
    }
    return { hours, shifts, payroll, people: visible.length }
  }, [visible])

  function cycle(empId: string, day: number) {
    setSaved(false)
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== empId) return r
        const next = [...r.shifts]
        next[day] = NEXT[next[day] || '']
        return { ...r, shifts: next }
      }),
    )
  }

  return (
    <div className="animate-fade-up">
      <ModuleHead
        eyebrow="Учёт рабочего времени"
        title="Табель учёта смен"
        desc="Кликом по ячейке проставляйте смены: дневная → ночная → выходной. Часы, смены и фонд оплаты пересчитываются на лету и выгружаются в смарт-процесс Битрикс24."
        right={
          <CTA
            icon={<IconBitrix className="h-4 w-4" />}
            onClick={() => setSaved(true)}
          >
            {saved ? 'Выгружено в Б24' : 'Выгрузить в Б24'}
          </CTA>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Часов за период" value={fmt(totals.hours)} sub="первые 2 недели" />
        <Stat label="Смен" value={fmt(totals.shifts)} tone="accent" />
        <Stat label="Сотрудников" value={totals.people} />
        <Stat label="Фонд оплаты" value={fmtMoney(totals.payroll)} sub="по ставкам персонала" />
      </div>

      <Card pad={false}>
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
          <Segmented
            size="sm"
            value={filter}
            onChange={setFilter}
            options={[{ value: 'all', label: 'Все объекты' }, ...OBJECTS.map((o) => ({ value: o.id, label: objShort(o.id) }))]}
          />
          <div className="flex items-center gap-3 text-xs text-ink-mute">
            <LegendDot tone={SHIFT_META.D.tone} label="Я · день 12ч" />
            <LegendDot tone={SHIFT_META.N.tone} label="Н · ночь 12ч" />
            <LegendDot tone={SHIFT_META.V.tone} label="В · выходной" />
          </div>
        </div>

        <div className="overflow-x-auto px-4 pb-4 sm:px-5">
          <table className="w-full border-separate" style={{ borderSpacing: '0 6px' }}>
            <thead>
              <tr className="text-ink-mute">
                <th className="sticky left-0 z-10 bg-white pb-2 pr-3 text-left text-xs font-semibold">Сотрудник</th>
                {DAYS.map((d) => (
                  <th key={d} className="px-0.5 pb-2 text-center text-[11px] font-semibold tabular-nums">
                    {d}
                  </th>
                ))}
                <th className="pb-2 pl-3 text-right text-xs font-semibold">Часы</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((e) => {
                const h = rowHours(e.shifts)
                return (
                  <tr key={e.id} className="group">
                    <td className="sticky left-0 z-10 bg-white pr-3">
                      <div className="text-sm font-semibold text-ink">{e.name}</div>
                      <div className="text-[11px] text-ink-mute">
                        {e.specialty} · {objShort(e.object)}
                      </div>
                    </td>
                    {DAYS.map((d) => {
                      const code = e.shifts[d] || ''
                      const meta = code ? SHIFT_META[code] : null
                      return (
                        <td key={d} className="px-0.5 text-center">
                          <button
                            onClick={() => cycle(e.id, d)}
                            className={cx(
                              'h-9 w-8 rounded-lg text-xs font-bold transition-all duration-300 ease-spring hover:scale-105 active:scale-95',
                              meta ? meta.tone : 'bg-black/[0.03] text-transparent hover:bg-black/[0.06]',
                            )}
                            title="Кликните, чтобы изменить смену"
                          >
                            {meta ? meta.label : '·'}
                          </button>
                        </td>
                      )
                    })}
                    <td className="pl-3 text-right">
                      <span className="text-sm font-bold tabular-nums text-ink">{h}</span>
                      <span className="text-[11px] text-ink-mute"> ч</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Card>
          <div className="text-sm font-bold text-ink">Загрузка по объектам</div>
          <div className="mt-4 space-y-3.5">
            {OBJECTS.map((o) => {
              const list = rows.filter((r) => r.object === o.id)
              const h = list.reduce((a, r) => a + rowHours(r.shifts), 0)
              const max = 600
              return (
                <div key={o.id}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="font-medium text-ink-soft">{objShort(o.id)}</span>
                    <span className="font-semibold tabular-nums text-ink">{fmt(h)} ч</span>
                  </div>
                  <Bar value={(h / max) * 100} tone="accent" />
                </div>
              )
            })}
          </div>
        </Card>
        <Card inner="bg-ink text-white" >
          <Badge tone="accent">Как это работает в Б24</Badge>
          <p className="mt-3 text-sm leading-relaxed text-white/80">
            Табель — это смарт-процесс с привязкой к объекту и сотруднику. Бригадир заполняет
            смены с телефона, данные падают в Битрикс24, а закрытый период автоматически уходит в
            расчёт зарплаты и в акт заказчику. Никаких Excel-файлов в почте.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            {['Заполнение с мобильного на объекте', 'Двойной контроль: бригадир + координатор', 'Автоперенос часов в биллинг и ЗП'].map((t) => (
              <li key={t} className="flex items-center gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                {t}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}

function LegendDot({ tone, label }: { tone: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cx('h-4 w-4 rounded-md', tone)} />
      {label}
    </span>
  )
}
