import { useMemo, useState } from 'react'
import {
  CLIENT_REQUESTS,
  CONTRACTS,
  REQUEST_META,
  SPECIALTIES,
  fmtMoneyShort,
  objName,
  objShort,
} from '../data/mock'
import type { ClientRequest } from '../data/mock'
import { Badge, Bar, Card, CTA, ModuleHead, Segmented, Stat, cx } from '../ui/components'
import { IconArrow } from '../ui/icons'

const CLIENTS = ['Wildberries', 'Ozon', 'Магнит']
const factRevenue = (c: (typeof CONTRACTS)[number]) => c.hoursMonth * c.billRate

export default function ClientPortal() {
  const [client, setClient] = useState('Wildberries')
  const [reqs, setReqs] = useState<ClientRequest[]>(() => CLIENT_REQUESTS.map((r) => ({ ...r })))
  const [adding, setAdding] = useState(false)
  const [newSpec, setNewSpec] = useState<string>(SPECIALTIES[0])
  const [newNeed, setNewNeed] = useState(10)

  const mine = reqs.filter((r) => r.client === client)
  const contract = CONTRACTS.find((c) => c.client === client)
  const objId = contract?.object

  const agg = useMemo(() => {
    const need = mine.reduce((a, r) => a + r.need, 0)
    const filled = mine.reduce((a, r) => a + r.filled, 0)
    return { need, filled, open: need - filled, pct: need ? Math.round((filled / need) * 100) : 0, count: mine.length }
  }, [mine])

  function addRequest() {
    if (!objId) return
    const id = 'r' + (reqs.length + 1) + '_' + newSpec
    setReqs((prev) => [
      { id, client, object: objId, specialty: newSpec as any, need: newNeed, filled: 0, status: 'new', date: 'сегодня' },
      ...prev,
    ])
    setAdding(false)
    setNewNeed(10)
  }

  return (
    <div className="animate-fade-up">
      <ModuleHead
        eyebrow="Кабинет заказчика"
        title="Портал заказчика"
        desc="Что видит ваш клиент: подаёт заявку на персонал в пару кликов, следит за процентом закрытия в реальном времени и видит свои акты. Привязывает заказчика к вам и убирает заявки из почты и мессенджеров."
        right={
          <Segmented
            size="sm"
            value={client}
            onChange={setClient}
            options={CLIENTS.map((c) => ({ value: c, label: c }))}
          />
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Активных заявок" value={agg.count} />
        <Stat label="Заявлено человек" value={agg.need} />
        <Stat label="Закрыто" value={`${agg.pct}%`} tone="accent" sub={`${agg.filled} из ${agg.need}`} />
        <Stat label="Нужно ещё" value={agg.open} tone={agg.open > 0 ? 'amber' : 'ink'} />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3" pad={false}>
          <div className="flex items-center justify-between p-5 pb-3">
            <div className="text-sm font-bold text-ink">Заявки на персонал · {client}</div>
            <CTA icon={<IconArrow className="h-4 w-4" />} onClick={() => setAdding((v) => !v)} variant="ghost">
              Подать заявку
            </CTA>
          </div>

          {adding && (
            <div className="mx-3 mb-3 rounded-2xl bg-paper p-4 hairline">
              <div className="text-xs font-bold text-ink">Новая заявка</div>
              <div className="mt-3 flex flex-wrap items-end gap-3">
                <div className="min-w-[180px] flex-1">
                  <label className="text-[11px] text-ink-mute">Специальность</label>
                  <select
                    value={newSpec}
                    onChange={(e) => setNewSpec(e.target.value)}
                    className="mt-1 w-full rounded-xl bg-white px-3 py-2 text-sm font-medium text-ink hairline outline-none"
                  >
                    {SPECIALTIES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-28">
                  <label className="text-[11px] text-ink-mute">Человек</label>
                  <input
                    type="number"
                    min={1}
                    value={newNeed}
                    onChange={(e) => setNewNeed(Math.max(1, Number(e.target.value)))}
                    className="mt-1 w-full rounded-xl bg-white px-3 py-2 text-sm font-medium text-ink hairline outline-none"
                  />
                </div>
                <button
                  onClick={addRequest}
                  className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white transition-all duration-300 active:scale-95"
                >
                  Отправить
                </button>
              </div>
            </div>
          )}

          <div className="space-y-1 p-3 pt-0">
            {mine.map((r) => {
              const pct = Math.round((r.filled / r.need) * 100)
              const meta = REQUEST_META[r.status]
              return (
                <div key={r.id} className="rounded-2xl p-3 transition-colors hover:bg-paper">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-ink">{r.specialty}</div>
                      <div className="text-[11px] text-ink-mute">
                        {objShort(r.object)} · заявка от {r.date}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold tabular-nums text-ink">
                        {r.filled}
                        <span className="text-ink-mute">/{r.need}</span>
                      </span>
                      <Badge tone={meta.tone} dot>
                        {meta.label}
                      </Badge>
                    </div>
                  </div>
                  <Bar value={pct} tone={pct >= 100 ? 'accent' : pct >= 60 ? 'amber' : 'rose'} />
                </div>
              )
            })}
          </div>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <Card inner="bg-ink/90 text-white backdrop-blur-2xl glass-dark">
            <div className="text-sm font-bold">Объект</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight">{objId ? objName(objId) : '—'}</div>
            {contract && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-2xl bg-white/[0.06] p-3">
                  <div className="text-[11px] text-white/55">На объекте сейчас</div>
                  <div className="mt-0.5 text-xl font-extrabold tabular-nums">{contract.headFact} чел</div>
                </div>
                <div className="rounded-2xl bg-white/[0.06] p-3">
                  <div className="text-[11px] text-white/55">Ставка по договору</div>
                  <div className="mt-0.5 text-xl font-extrabold tabular-nums">₽{contract.billRate}/ч</div>
                </div>
              </div>
            )}
          </Card>

          <Card>
            <div className="text-sm font-bold text-ink">Мои акты</div>
            {contract ? (
              <div className="mt-3 space-y-2">
                {[
                  { m: 'Май 2026', s: 'paid' },
                  { m: 'Июнь 2026', s: 'issued' },
                ].map((a) => (
                  <div key={a.m} className="flex items-center justify-between rounded-2xl bg-paper px-4 py-3 hairline">
                    <div>
                      <div className="text-sm font-semibold text-ink">Акт · {a.m}</div>
                      <div className="text-[11px] text-ink-mute">{fmtMoneyShort(factRevenue(contract))}</div>
                    </div>
                    <Badge tone={a.s === 'paid' ? 'green' : 'sky'} dot>
                      {a.s === 'paid' ? 'Оплачен' : 'Выставлен'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-xs text-ink-mute">Договор на подписании — актов пока нет.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
