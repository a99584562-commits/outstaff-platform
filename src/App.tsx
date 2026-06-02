import { useEffect, useState } from 'react'
import { cx } from './ui/components'
import {
  IconBilling,
  IconBitrix,
  IconCalendar,
  IconContract,
  IconDocs,
  IconFunnel,
  IconGrid,
  IconHome,
  IconLock,
  IconMargin,
  IconOverview,
  IconPhone,
  IconShield,
  IconStore,
  IconTimesheet,
} from './ui/icons'
import Overview from './modules/Overview'
import Dashboard from './modules/Dashboard'
import Timesheet from './modules/Timesheet'
import Arrivals from './modules/Arrivals'
import Recruitment from './modules/Recruitment'
import Documents from './modules/Documents'
import Siz from './modules/Siz'
import Housing from './modules/Housing'
import Contracts from './modules/Contracts'
import Billing from './modules/Billing'
import Margin from './modules/Margin'
import Worker from './modules/Worker'
import ClientPortal from './modules/ClientPortal'

export type ModuleId =
  | 'overview'
  | 'dashboard'
  | 'timesheet'
  | 'arrivals'
  | 'recruitment'
  | 'documents'
  | 'siz'
  | 'housing'
  | 'contracts'
  | 'billing'
  | 'margin'
  | 'worker'
  | 'client'

const PASSWORD = 'staff2026'
const STORAGE_KEY = 'smena_unlocked'

const NAV: { id: ModuleId; label: string; icon: (p: { className?: string }) => JSX.Element; group: string }[] = [
  { id: 'overview', label: 'Обзор', icon: IconOverview, group: 'Платформа' },
  { id: 'dashboard', label: 'Дашборд руководителя', icon: IconGrid, group: 'Платформа' },
  { id: 'timesheet', label: 'Табель смен', icon: IconTimesheet, group: 'Операции' },
  { id: 'arrivals', label: 'Заезд кандидатов', icon: IconCalendar, group: 'Операции' },
  { id: 'recruitment', label: 'Подбор', icon: IconFunnel, group: 'Операции' },
  { id: 'documents', label: 'Документы', icon: IconDocs, group: 'Операции' },
  { id: 'siz', label: 'Выдача СИЗ', icon: IconShield, group: 'Операции' },
  { id: 'housing', label: 'Проживание', icon: IconHome, group: 'Операции' },
  { id: 'contracts', label: 'Договоры', icon: IconContract, group: 'Финансы' },
  { id: 'billing', label: 'Биллинг / акты', icon: IconBilling, group: 'Финансы' },
  { id: 'margin', label: 'Маржинальность', icon: IconMargin, group: 'Финансы' },
  { id: 'worker', label: 'Кабинет вахтовика', icon: IconPhone, group: 'Кабинеты' },
  { id: 'client', label: 'Портал заказчика', icon: IconStore, group: 'Кабинеты' },
]

export default function App() {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(STORAGE_KEY) === '1')
  const [active, setActive] = useState<ModuleId>('overview')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setMenuOpen(false)
    document.querySelector('#scroll-top')?.scrollIntoView({ behavior: 'smooth' })
  }, [active])

  if (!unlocked) return <Gate onUnlock={() => setUnlocked(true)} />

  const groups = [...new Set(NAV.map((n) => n.group))]

  return (
    <div className="min-h-[100dvh] lg:flex">
      {/* Sidebar */}
      <aside
        className={cx(
          'fixed inset-y-0 left-0 z-40 w-72 transform bg-white p-4 transition-transform duration-500 ease-spring hairline lg:static lg:translate-x-0',
          menuOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <Brand />
        <nav className="mt-6 space-y-5">
          {groups.map((g) => (
            <div key={g}>
              <div className="px-3 text-[10px] font-bold uppercase tracking-eyebrow text-ink-mute">{g}</div>
              <div className="mt-2 space-y-0.5">
                {NAV.filter((n) => n.group === g).map((n) => {
                  const Icon = n.icon
                  const on = active === n.id
                  return (
                    <button
                      key={n.id}
                      onClick={() => setActive(n.id)}
                      className={cx(
                        'flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-all duration-300 ease-spring',
                        on ? 'bg-ink text-white' : 'text-ink-soft hover:bg-paper',
                      )}
                    >
                      <Icon className={cx('h-[18px] w-[18px]', on ? 'text-accent' : 'text-ink-mute')} />
                      {n.label}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-6 rounded-2xl bg-paper p-4 hairline">
          <div className="flex items-center gap-2 text-xs font-semibold text-ink">
            <IconBitrix className="h-4 w-4 text-accent" />
            Работает поверх Битрикс24
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-ink-mute">
            Демо-данные. На проде — REST вашего портала. White-label под ваш бренд.
          </p>
        </div>
      </aside>

      {menuOpen && (
        <div
          className="fixed inset-0 z-30 bg-ink/30 backdrop-blur-sm lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-black/[0.06] bg-paper/80 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-10">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white hairline lg:hidden"
            aria-label="Меню"
          >
            <div className="space-y-1">
              <span className="block h-0.5 w-4 bg-ink" />
              <span className="block h-0.5 w-4 bg-ink" />
            </div>
          </button>
          <div className="hidden text-sm font-semibold text-ink-mute lg:block">
            {NAV.find((n) => n.id === active)?.group} · {NAV.find((n) => n.id === active)?.label}
          </div>
          <div className="lg:hidden">
            <Brand compact />
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-ink-soft hairline sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Демо-режим
            </span>
            <button
              onClick={() => {
                sessionStorage.removeItem(STORAGE_KEY)
                location.reload()
              }}
              className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:text-ink hairline"
            >
              Выйти
            </button>
          </div>
        </header>

        <main id="scroll-top" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
          {active === 'overview' && <Overview go={setActive} />}
          {active === 'dashboard' && <Dashboard go={setActive} />}
          {active === 'timesheet' && <Timesheet />}
          {active === 'arrivals' && <Arrivals />}
          {active === 'recruitment' && <Recruitment />}
          {active === 'documents' && <Documents />}
          {active === 'siz' && <Siz />}
          {active === 'housing' && <Housing />}
          {active === 'contracts' && <Contracts />}
          {active === 'billing' && <Billing />}
          {active === 'margin' && <Margin />}
          {active === 'worker' && <Worker />}
          {active === 'client' && <ClientPortal />}

          <footer className="mt-12 flex flex-col items-center gap-1 border-t border-black/[0.06] pt-6 text-center text-xs text-ink-mute">
            <span>СМЕНА · платформа управления аутстаффингом на Битрикс24</span>
            <span>Интерактивное демо · данные вымышлены</span>
          </footer>
        </main>
      </div>
    </div>
  )
}

function Brand({ compact }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink text-base font-extrabold text-accent">
        С
      </div>
      {!compact && (
        <div className="leading-tight">
          <div className="text-base font-extrabold tracking-tight text-ink">СМЕНА</div>
          <div className="text-[10px] font-medium uppercase tracking-eyebrow text-ink-mute">аутстаффинг · Б24</div>
        </div>
      )}
    </div>
  )
}

function Gate({ onUnlock }: { onUnlock: () => void }) {
  const [val, setVal] = useState('')
  const [err, setErr] = useState(false)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (val.trim().toLowerCase() === PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, '1')
      onUnlock()
    } else {
      setErr(true)
    }
  }

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden px-4">
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, #0f7a5f, transparent 70%)' }}
      />
      <div className="relative w-full max-w-md animate-fade-up">
        <div className="rounded-4xl bg-black/[0.04] p-1.5 hairline">
          <div className="rounded-[calc(2rem-0.375rem)] bg-white p-8 hairline">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-lg font-extrabold text-accent">
                С
              </div>
              <div className="leading-tight">
                <div className="text-lg font-extrabold tracking-tight text-ink">СМЕНА</div>
                <div className="text-[10px] font-medium uppercase tracking-eyebrow text-ink-mute">
                  аутстаффинг · Битрикс24
                </div>
              </div>
            </div>

            <h1 className="mt-7 text-2xl font-extrabold tracking-tight text-ink">
              Демо платформы для аутстаффинга
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Закрытый показ интерактивных решений на Битрикс24. Введите пароль доступа.
            </p>

            <form onSubmit={submit} className="mt-6">
              <div className="flex items-center gap-2 rounded-2xl bg-paper px-4 hairline focus-within:ring-2 focus-within:ring-accent/30">
                <IconLock className="h-5 w-5 text-ink-mute" />
                <input
                  autoFocus
                  type="password"
                  value={val}
                  onChange={(e) => {
                    setVal(e.target.value)
                    setErr(false)
                  }}
                  placeholder="Пароль доступа"
                  className="w-full bg-transparent py-3.5 text-sm font-medium text-ink outline-none placeholder:text-ink-mute"
                />
              </div>
              {err && <p className="mt-2 text-xs font-semibold text-rose-600">Неверный пароль. Попробуйте ещё раз.</p>}
              <button
                type="submit"
                className="group mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3.5 text-sm font-semibold text-white transition-all duration-500 ease-spring hover:bg-ink/90 active:scale-[0.98]"
              >
                Войти в демо
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 transition-transform duration-500 ease-spring group-hover:translate-x-0.5">
                  →
                </span>
              </button>
            </form>
          </div>
        </div>
        <p className="mt-5 text-center text-xs text-ink-mute">
          Решения на VibeCode поверх Битрикс24 · white-label
        </p>
      </div>
    </div>
  )
}
