import { useMemo, useState } from 'react'
import { LODGINGS, LODGING_META, OBJECTS, RESIDENTS, fmtMoney, lodgingCost, objShort, residentById } from '../data/mock'
import type { Lodging, ObjectId } from '../data/mock'
import { Badge, Bar, Card, ModuleHead, Segmented, Stat, cx } from '../ui/components'

const initials = (name: string) => name.replace('.', '').trim()[0]

export default function Housing() {
  const [list, setList] = useState<Lodging[]>(() => LODGINGS.map((l) => ({ ...l, residentIds: [...l.residentIds] })))
  const [obj, setObj] = useState<ObjectId | 'all'>('all')
  const [selected, setSelected] = useState<string | null>(null)

  const housedIds = useMemo(() => new Set(list.flatMap((l) => l.residentIds)), [list])
  const pool = RESIDENTS.filter((r) => !housedIds.has(r.id))
  const visible = obj === 'all' ? list : list.filter((l) => l.object === obj)
  const selPerson = selected ? residentById(selected) : null

  const totals = useMemo(() => {
    const cap = list.reduce((a, l) => a + l.capacity, 0)
    const occ = list.reduce((a, l) => a + l.residentIds.length, 0)
    const cost = list.reduce((a, l) => a + lodgingCost(l), 0)
    return { cap, occ, free: cap - occ, cost }
  }, [list])

  function seat(lodgingId: string) {
    if (!selected) return
    setList((prev) =>
      prev.map((l) =>
        l.id === lodgingId && l.residentIds.length < l.capacity && !l.residentIds.includes(selected)
          ? { ...l, residentIds: [...l.residentIds, selected] }
          : l,
      ),
    )
    setSelected(null)
  }
  function vacate(lodgingId: string, personId: string) {
    setList((prev) => prev.map((l) => (l.id === lodgingId ? { ...l, residentIds: l.residentIds.filter((id) => id !== personId) } : l)))
  }

  return (
    <div className="animate-fade-up">
      <ModuleHead
        eyebrow="Размещение персонала"
        title="Проживание: закрепление за человеком"
        desc="Хостелы, общежития и квартиры. Выберите человека из «ждут расселения» и кликните по свободному месту — он закрепится за конкретной койкой. Клик по занятому месту — выселить. Бюджет и удержания за проживание пересчитываются на лету."
        right={
          <Segmented
            size="sm"
            value={obj}
            onChange={(v) => { setObj(v); }}
            options={[{ value: 'all', label: 'Все объекты' }, ...OBJECTS.map((o) => ({ value: o.id, label: objShort(o.id) }))]}
          />
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Всего мест" value={totals.cap} />
        <Stat label="Заселено" value={totals.occ} tone="accent" sub={`${Math.round((totals.occ / totals.cap) * 100)}% загрузки`} />
        <Stat label="Свободно" value={totals.free} />
        <Stat label="Бюджет / мес" value={fmtMoney(totals.cost)} sub="койки + аренда квартир" />
      </div>

      {/* Пул ждущих расселения */}
      <Card pad={false} className={cx('mb-5 transition-all duration-500', selected && 'ring-2 ring-accent/40 rounded-4xl')}>
        <div className="flex flex-wrap items-center gap-3 p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <span className={cx('flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold', pool.length ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700')}>
              {pool.length}
            </span>
            <span className="text-sm font-bold text-ink">Ждут расселения</span>
          </div>
          {pool.length === 0 ? (
            <span className="text-xs text-ink-mute">Все расселены 🎉</span>
          ) : (
            <div className="flex flex-wrap gap-2">
              {pool.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelected(selected === p.id ? null : p.id)}
                  className={cx(
                    'flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3.5 text-sm font-semibold transition-all duration-300 ease-spring active:scale-95',
                    selected === p.id ? 'bg-accent text-white' : 'bg-white text-ink-soft hairline hover:bg-paper',
                  )}
                >
                  <span className={cx('flex h-6 w-6 items-center justify-center rounded-full text-xs', selected === p.id ? 'bg-white/20' : 'bg-accent/10 text-accent-deep')}>
                    {initials(p.name)}
                  </span>
                  {p.name}
                  <span className={cx('text-[11px] font-normal', selected === p.id ? 'text-white/70' : 'text-ink-mute')}>· {objShort(p.object)}</span>
                </button>
              ))}
            </div>
          )}
          {selPerson && (
            <span className="ml-auto text-xs font-medium text-accent-deep">
              ↳ выберите свободное место для «{selPerson.name}»
            </span>
          )}
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {visible.map((l) => {
          const free = l.capacity - l.residentIds.length
          const pct = Math.round((l.residentIds.length / l.capacity) * 100)
          const meta = LODGING_META[l.type]
          const canSeatHere = !!selected && free > 0
          return (
            <Card key={l.id} className={cx('transition-all duration-300', canSeatHere && 'ring-2 ring-accent/40 rounded-4xl')}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-ink">{l.name}</span>
                    <Badge tone={meta.tone}>{l.type === 'apartment' ? 'Квартира' : 'Хостел'}</Badge>
                  </div>
                  <div className="text-[11px] text-ink-mute">{l.address}</div>
                </div>
                <Badge tone="slate">{objShort(l.object)}</Badge>
              </div>

              {/* места */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {l.residentIds.map((rid) => {
                  const r = residentById(rid)
                  const offObject = r && r.object !== l.object
                  return (
                    <button
                      key={rid}
                      onClick={() => vacate(l.id, rid)}
                      title={`${r?.name} · ${r?.role}${offObject ? ' · не со своего объекта' : ''} — выселить`}
                      className="group relative flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-sm font-bold text-white transition-all duration-300 ease-spring hover:bg-rose-500 active:scale-90"
                    >
                      {initials(r?.name ?? '?')}
                      {offObject && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-amber-400 ring-2 ring-white" />}
                      <span className="absolute inset-0 hidden items-center justify-center rounded-xl bg-rose-500 text-[10px] group-hover:flex">✕</span>
                    </button>
                  )
                })}
                {Array.from({ length: free }, (_, i) => (
                  <button
                    key={'e' + i}
                    onClick={() => seat(l.id)}
                    disabled={!selected}
                    title={selected ? 'Заселить выбранного' : 'Свободное место'}
                    className={cx(
                      'flex h-10 w-10 items-center justify-center rounded-xl border border-dashed text-lg transition-all duration-300 ease-spring',
                      canSeatHere
                        ? 'animate-pulse border-accent/60 bg-accent/5 text-accent-deep hover:bg-accent/15'
                        : 'cursor-default border-black/15 text-ink-mute/40',
                    )}
                  >
                    +
                  </button>
                ))}
              </div>

              <div className="mt-4">
                <Bar value={pct} tone={pct >= 100 ? 'rose' : pct >= 80 ? 'amber' : 'accent'} />
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px]">
                <span className="text-ink-mute">
                  <span className="font-bold text-ink">{l.residentIds.length}</span>/{l.capacity} мест ·{' '}
                  <span className={free === 0 ? 'text-rose-600' : 'text-accent-deep'}>{free} своб.</span>
                </span>
                <span className="text-ink-mute">
                  {l.type === 'apartment' ? (
                    <>аренда <span className="font-semibold text-ink">{fmtMoney(l.cost)}/мес</span></>
                  ) : (
                    <>
                      {fmtMoney(l.cost)}/место · <span className="font-semibold text-ink">{fmtMoney(lodgingCost(l))}/мес</span>
                    </>
                  )}
                </span>
              </div>
            </Card>
          )
        })}
      </div>

      <p className="mt-4 px-1 text-xs leading-relaxed text-ink-mute">
        Квартиры стоят фиксированную аренду независимо от загрузки, хостелы — по числу занятых коек: модуль
        считает реальный бюджет на проживание и подсказывает, где недозагруз. Закрепление человека за местом в
        Битрикс24 автоматически ставит удержание за проживание в его расчёт ЗП, а жёлтая метка показывает, что
        сотрудник живёт не на своём объекте.
      </p>
    </div>
  )
}
