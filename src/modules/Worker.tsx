import { useMemo, useState } from 'react'
import { EMPLOYEES, PAYROLL, SHIFT_META, fmt, fmtMoney, objShort, shiftCount, shiftHours } from '../data/mock'
import { Card, ModuleHead, cx } from '../ui/components'

const DAYS = Array.from({ length: 14 }, (_, i) => i + 1)

export default function Worker() {
  const [empId, setEmpId] = useState(EMPLOYEES[0].id)
  const emp = EMPLOYEES.find((e) => e.id === empId)!
  const pay = PAYROLL[empId]

  const calc = useMemo(() => {
    const hours = shiftHours(emp.shifts)
    const shifts = shiftCount(emp.shifts)
    const earned = hours * emp.rate
    const deductions = pay.housing + pay.gear + pay.fine
    const toPay = earned - pay.avans - deductions
    return { hours, shifts, earned, deductions, toPay }
  }, [emp, pay])

  return (
    <div className="animate-fade-up">
      <ModuleHead
        eyebrow="Мобильный · самообслуживание"
        title="Личный кабинет вахтовика"
        desc="То, что сотрудник открывает в телефоне: свой график смен, что заработал, авансы и удержания (проживание, спецодежда). Снимает поток звонков бригадиру «сколько мне начислили?»."
      />

      {/* employee picker */}
      <div className="mb-6 flex flex-wrap gap-2">
        {EMPLOYEES.slice(0, 6).map((e) => (
          <button
            key={e.id}
            onClick={() => setEmpId(e.id)}
            className={cx(
              'rounded-full px-3.5 py-1.5 text-sm font-semibold transition-all duration-300 ease-spring',
              e.id === empId ? 'bg-ink text-white' : 'bg-white text-ink-soft hairline hover:bg-paper',
            )}
          >
            {e.name}
          </button>
        ))}
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[auto_1fr]">
        {/* Phone frame */}
        <div className="mx-auto w-[340px] max-w-full">
          <div className="rounded-[2.6rem] bg-ink p-2.5 shadow-[0_30px_60px_-30px_rgba(20,22,27,0.5)]">
            <div className="relative overflow-hidden rounded-[2.1rem] bg-paper">
              {/* notch */}
              <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-ink" />
              <div className="max-h-[600px] overflow-y-auto px-4 pb-5 pt-9">
                {/* header */}
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-base font-extrabold text-white">
                    {emp.name[0]}
                  </div>
                  <div className="leading-tight">
                    <div className="text-sm font-extrabold text-ink">{emp.name}</div>
                    <div className="text-[11px] text-ink-mute">{emp.specialty} · {objShort(emp.object)}</div>
                  </div>
                </div>

                {/* к выплате */}
                <div className="mt-4 rounded-3xl bg-ink p-5 text-white">
                  <div className="text-[11px] uppercase tracking-wider text-white/55">К выплате за период</div>
                  <div className="mt-1 text-3xl font-extrabold tracking-tight tabular-nums">{fmtMoney(calc.toPay)}</div>
                  <div className="mt-1 text-xs text-white/55">аванс уже выплачен: {fmtMoney(pay.avans)}</div>
                </div>

                {/* mini stats */}
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <MiniBox label="Смен" value={calc.shifts} />
                  <MiniBox label="Часов" value={calc.hours} />
                  <MiniBox label="Ставка" value={`${emp.rate}₽`} />
                </div>

                {/* начисления/удержания */}
                <div className="mt-3 rounded-3xl bg-white p-4 hairline">
                  <div className="text-xs font-bold text-ink">Расчёт</div>
                  <Line label="Начислено" value={calc.earned} />
                  <Line label="Аванс" value={-pay.avans} />
                  <Line label="Проживание" value={-pay.housing} />
                  {pay.gear > 0 && <Line label="Спецодежда" value={-pay.gear} />}
                  {pay.fine > 0 && <Line label="Штраф" value={-pay.fine} tone="rose" />}
                  <div className="mt-2 flex items-center justify-between border-t border-black/[0.06] pt-2">
                    <span className="text-sm font-bold text-ink">К выплате</span>
                    <span className="text-sm font-extrabold tabular-nums text-accent-deep">{fmtMoney(calc.toPay)}</span>
                  </div>
                </div>

                {/* график */}
                <div className="mt-3 rounded-3xl bg-white p-4 hairline">
                  <div className="mb-2 text-xs font-bold text-ink">Мой график · 1–14</div>
                  <div className="grid grid-cols-7 gap-1.5">
                    {DAYS.map((d) => {
                      const code = emp.shifts[d] || ''
                      const meta = code ? SHIFT_META[code] : null
                      return (
                        <div
                          key={d}
                          className={cx(
                            'flex h-9 flex-col items-center justify-center rounded-lg text-[10px] font-bold',
                            meta ? meta.tone : 'bg-black/[0.03] text-ink-mute',
                          )}
                        >
                          <span className="text-[9px] font-medium opacity-60">{d}</span>
                          {meta ? meta.label : ''}
                        </div>
                      )
                    })}
                  </div>
                </div>

                <button className="mt-3 w-full rounded-full bg-accent py-3 text-sm font-semibold text-white transition-all duration-300 active:scale-[0.98]">
                  Запросить справку 2-НДФЛ
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* explainer */}
        <div className="space-y-4">
          <Card>
            <div className="text-sm font-bold text-ink">Зачем это вам</div>
            <ul className="mt-3 space-y-2.5 text-sm text-ink-soft">
              {[
                'Сотрудник сам видит смены и расчёт — меньше звонков и споров',
                'Прозрачные удержания за проживание и спецодежду снижают конфликты',
                'Заявки на справки и отгулы падают задачами в Битрикс24',
                'Открывается по ссылке/QR, без установки приложения',
              ].map((t) => (
                <li key={t} className="flex gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  {t}
                </li>
              ))}
            </ul>
          </Card>
          <Card inner="bg-ink/90 text-white backdrop-blur-2xl glass-dark">
            <div className="text-sm font-bold">Данные — из тех же источников</div>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              Часы берутся из табеля, удержания за проживание — из модуля общежитий, ставка — из карточки
              сотрудника в Битрикс24. Кабинет ничего не считает «отдельно», поэтому цифры всегда сходятся
              с ведомостью и актом заказчику.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <MiniBoxDark label="Заработано" value={fmt(calc.earned)} />
              <MiniBoxDark label="Удержано" value={fmt(calc.deductions + pay.avans)} />
              <MiniBoxDark label="К выплате" value={fmt(calc.toPay)} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function MiniBox({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white p-2.5 text-center hairline">
      <div className="text-base font-extrabold tabular-nums text-ink">{value}</div>
      <div className="text-[10px] text-ink-mute">{label}</div>
    </div>
  )
}
function MiniBoxDark({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white/[0.06] p-2.5">
      <div className="text-sm font-extrabold tabular-nums">{value}</div>
      <div className="text-[10px] text-white/55">{label}</div>
    </div>
  )
}
function Line({ label, value, tone }: { label: string; value: number; tone?: 'rose' }) {
  const neg = value < 0
  return (
    <div className="mt-2 flex items-center justify-between text-sm">
      <span className="text-ink-soft">{label}</span>
      <span className={cx('font-semibold tabular-nums', tone === 'rose' ? 'text-rose-600' : neg ? 'text-ink-mute' : 'text-ink')}>
        {neg ? '−' : '+'} {fmtMoney(Math.abs(value)).replace('₽ ', '')}
      </span>
    </div>
  )
}
