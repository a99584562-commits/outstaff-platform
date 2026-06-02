import { useState } from 'react'
import { CONTRACTS, fmtMoney, objShort } from '../data/mock'
import { Badge, Card, CTA, ModuleHead, Stat, cx } from '../ui/components'
import { IconBitrix } from '../ui/icons'

type ActStatus = 'draft' | 'issued' | 'paid'
const ACT_META: Record<ActStatus, { label: string; tone: string }> = {
  draft: { label: 'Черновик', tone: 'slate' },
  issued: { label: 'Выставлен', tone: 'sky' },
  paid: { label: 'Оплачен', tone: 'green' },
}
const NEXT: Record<ActStatus, ActStatus> = { draft: 'issued', issued: 'paid', paid: 'draft' }

interface Act {
  id: string
  client: string
  object: string
  hours: number
  rate: number
  status: ActStatus
}

export default function Billing() {
  const [acts, setActs] = useState<Act[]>(() =>
    CONTRACTS.map((c, i) => ({
      id: c.id,
      client: c.client,
      object: objShort(c.object),
      hours: c.hoursMonth,
      rate: c.billRate,
      status: (['paid', 'issued', 'draft', 'draft'] as ActStatus[])[i] ?? 'draft',
    })),
  )

  const total = acts.reduce((a, x) => a + x.hours * x.rate, 0)
  const paid = acts.filter((a) => a.status === 'paid').reduce((a, x) => a + x.hours * x.rate, 0)
  const issued = acts.filter((a) => a.status === 'issued').reduce((a, x) => a + x.hours * x.rate, 0)

  function setRate(id: string, rate: number) {
    setActs((p) => p.map((a) => (a.id === id ? { ...a, rate } : a)))
  }
  function toggle(id: string) {
    setActs((p) => p.map((a) => (a.id === id ? { ...a, status: NEXT[a.status] } : a)))
  }

  return (
    <div className="animate-fade-up">
      <ModuleHead
        eyebrow="Выставление актов"
        title="Биллинг по отработанным часам"
        desc="Акт заказчику считается сам: часы из табеля × ставка по договору. Подвигайте ставку — суммы пересчитаются мгновенно. Клик по статусу проводит акт: черновик → выставлен → оплачен."
        right={<CTA icon={<IconBitrix className="h-4 w-4" />}>Сформировать акты</CTA>}
      />

      <div className="mb-5 grid grid-cols-3 gap-3">
        <Stat label="К выставлению / мес" value={fmtMoney(total)} />
        <Stat label="Выставлено, ждёт оплаты" value={fmtMoney(issued)} tone="amber" />
        <Stat label="Оплачено" value={fmtMoney(paid)} tone="accent" />
      </div>

      <div className="space-y-3">
        {acts.map((a) => {
          const sum = a.hours * a.rate
          const meta = ACT_META[a.status]
          return (
            <Card key={a.id} pad={false}>
              <div className="grid items-center gap-4 p-4 sm:p-5 lg:grid-cols-[1.3fr_1.4fr_1fr_auto]">
                <div>
                  <div className="text-sm font-bold text-ink">Акт · {a.client}</div>
                  <div className="text-[11px] text-ink-mute">
                    {a.object} · {a.hours.toLocaleString('ru-RU')} ч отработано
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between text-[11px] text-ink-mute">
                    <span>Ставка заказчику</span>
                    <span className="font-bold text-ink">₽ {a.rate}/ч</span>
                  </div>
                  <input
                    type="range"
                    min={250}
                    max={360}
                    step={5}
                    value={a.rate}
                    onChange={(e) => setRate(a.id, Number(e.target.value))}
                    className="w-full accent-accent"
                  />
                </div>

                <div className="text-right">
                  <div className="text-[11px] text-ink-mute">Сумма акта</div>
                  <div className="text-lg font-extrabold tabular-nums text-ink">{fmtMoney(sum)}</div>
                </div>

                <button
                  onClick={() => toggle(a.id)}
                  className={cx(
                    'justify-self-start rounded-full px-1 transition-transform duration-300 active:scale-95 lg:justify-self-end',
                  )}
                  title="Сменить статус акта"
                >
                  <Badge tone={meta.tone} dot>
                    {meta.label}
                  </Badge>
                </button>
              </div>
            </Card>
          )
        })}
      </div>

      <p className="mt-4 px-1 text-xs leading-relaxed text-ink-mute">
        Закрытый табель за период автоматически превращается в акт по каждому договору. Бухгалтерия
        не сверяет часы вручную — система берёт их из того же источника, что и расчёт зарплаты.
        Статусы оплат подтягиваются и в отчёт по договорам.
      </p>
    </div>
  )
}
