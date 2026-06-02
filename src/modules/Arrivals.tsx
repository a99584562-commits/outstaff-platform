import { useMemo, useState } from 'react'
import { ARRIVAL_META, ARRIVAL_ORDER, CANDIDATES, OBJECTS, objShort } from '../data/mock'
import type { ArrivalStatus, Candidate, ObjectId } from '../data/mock'
import { Badge, Card, ModuleHead, Segmented, Stat, cx } from '../ui/components'

const NEXT_STATUS: Record<ArrivalStatus, ArrivalStatus> = {
  planned: 'transit',
  transit: 'arrived',
  arrived: 'onsite',
  onsite: 'planned',
  failed: 'planned',
}
const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const DAYS = Array.from({ length: 14 }, (_, i) => i + 1)

export default function Arrivals() {
  const [filter, setFilter] = useState<ObjectId | 'all'>('all')
  const [list, setList] = useState<Candidate[]>(() => CANDIDATES.map((c) => ({ ...c })))

  const visible = filter === 'all' ? list : list.filter((c) => c.object === filter)

  const stats = useMemo(() => {
    const by = (s: ArrivalStatus) => visible.filter((c) => c.status === s).length
    return {
      expected: visible.length,
      onsite: by('onsite') + by('arrived'),
      transit: by('transit'),
      failed: by('failed'),
    }
  }, [visible])

  function advance(id: string) {
    setList((prev) => prev.map((c) => (c.id === id ? { ...c, status: NEXT_STATUS[c.status] } : c)))
  }
  function markFailed(id: string) {
    setList((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'failed' } : c)))
  }

  return (
    <div className="animate-fade-up">
      <ModuleHead
        eyebrow="Логистика заезда"
        title="Календарь приезда кандидатов"
        desc="Кто, когда и на какой объект заезжает. Кликом по карточке двигайте статус заезда по воронке, правым — фиксируйте срыв. Координатор видит всю картину на две недели вперёд."
        right={
          <Segmented
            size="sm"
            value={filter}
            onChange={setFilter}
            options={[{ value: 'all', label: 'Все' }, ...OBJECTS.map((o) => ({ value: o.id, label: objShort(o.id) }))]}
          />
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Ожидается заездов" value={stats.expected} />
        <Stat label="Заехало / на объекте" value={stats.onsite} tone="accent" />
        <Stat label="В пути" value={stats.transit} />
        <Stat label="Сорвалось" value={stats.failed} tone={stats.failed ? 'rose' : 'ink'} />
      </div>

      <Card pad={false}>
        <div className="flex flex-wrap items-center gap-2 p-4 sm:p-5">
          {ARRIVAL_ORDER.map((s) => (
            <Badge key={s} tone={ARRIVAL_META[s].tone} dot>
              {ARRIVAL_META[s].label}
            </Badge>
          ))}
          <span className="ml-auto text-xs text-ink-mute">Клик — следующий статус · долгое нажатие на ✕ — срыв</span>
        </div>

        <div className="overflow-x-auto p-4 pt-0 sm:p-5 sm:pt-0">
          <div className="grid min-w-[860px] grid-cols-7 gap-2">
            {DAYS.map((d) => {
              const dayCands = visible.filter((c) => c.day === d)
              const isWeekend = (d - 1) % 7 >= 5
              return (
                <div
                  key={d}
                  className={cx('min-h-[150px] rounded-2xl p-2.5 hairline', isWeekend ? 'bg-paper' : 'bg-white')}
                >
                  <div className="mb-2 flex items-center justify-between px-1">
                    <span className="text-[11px] font-semibold text-ink-mute">{WEEKDAYS[(d - 1) % 7]}</span>
                    <span className="text-sm font-bold tabular-nums text-ink">{d}</span>
                  </div>
                  <div className="space-y-1.5">
                    {dayCands.map((c) => {
                      const meta = ARRIVAL_META[c.status]
                      return (
                        <div
                          key={c.id}
                          onClick={() => advance(c.id)}
                          className="group cursor-pointer rounded-xl bg-black/[0.025] p-2 transition-all duration-300 ease-spring hover:bg-black/[0.05] active:scale-[0.97]"
                          title="Клик — продвинуть статус"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <span className="text-xs font-bold leading-tight text-ink">{c.name}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                markFailed(c.id)
                              }}
                              className="rounded-md px-1 text-ink-mute opacity-0 transition-opacity hover:text-rose-500 group-hover:opacity-100"
                              title="Отметить срыв"
                            >
                              ✕
                            </button>
                          </div>
                          <div className="mt-0.5 text-[10px] leading-tight text-ink-mute">
                            {c.specialty} · {objShort(c.object)}
                          </div>
                          <div className="mt-1.5">
                            <Badge tone={meta.tone} dot>
                              {meta.label}
                            </Badge>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Card>

      <p className="mt-4 px-1 text-xs leading-relaxed text-ink-mute">
        В Битрикс24 каждый заезд — элемент смарт-процесса «Кандидаты», связанный с воронкой подбора и
        объектом. Статусы заезда = стадии, при переходе на «На объекте» автоматически создаётся
        сотрудник в табеле. Source-метка показывает эффективность каналов привлечения.
      </p>
    </div>
  )
}
