import { Badge, Card, CTA, Eyebrow, Stat, cx } from '../ui/components'
import {
  IconArrow,
  IconCalendar,
  IconContract,
  IconFunnel,
  IconGrid,
  IconShield,
  IconSpark,
  IconTimesheet,
} from '../ui/icons'
import type { ModuleId } from '../App'

const FLOW: { n: string; id: ModuleId; icon: (p: { className?: string }) => JSX.Element; t: string; d: string }[] = [
  { n: '01', id: 'recruitment', icon: IconFunnel, t: 'Подбор и проверка', d: 'Быстрый подбор сотрудников, проверка документов, верификация.' },
  { n: '02', id: 'contracts', icon: IconContract, t: 'Договоры и документы', d: 'Автоматическое формирование договоров, актов, закрывающих.' },
  { n: '03', id: 'timesheet', icon: IconTimesheet, t: 'Табель и учёт рабочего времени', d: 'Точные табели, учёт часов, переработок и отклонений в реальном времени.' },
  { n: '04', id: 'arrivals', icon: IconCalendar, t: 'Заезды и объекты', d: 'Управление заездами, объектами, локациями и клиентами в одном окне.' },
  { n: '05', id: 'documents', icon: IconShield, t: 'Патенты и допуски', d: 'Контроль сроков патентов, медкнижек, допусков и уведомления.' },
  { n: '06', id: 'dashboard', icon: IconGrid, t: 'Аналитика и отчёты', d: 'Сводная аналитика по сотрудникам, объектам, клиентам и финансам.' },
]

const PAINS = [
  { p: 'Табели в Excel и WhatsApp', s: 'Часы теряются, спорные смены, ручная сверка с заказчиком и ЗП' },
  { p: 'Заезды кандидатов «на коленке»', s: 'Никто не видит, кто реально доедет до объекта и когда' },
  { p: 'Подбор без цифр', s: 'Неясно, где дефицит людей и на каком шаге воронки они теряются' },
  { p: 'Документы мигрантов', s: 'Просроченный патент = штраф до 1 млн ₽ и снятие людей с объекта' },
]

const MODULES: { id: ModuleId; name: string; desc: string }[] = [
  { id: 'dashboard', name: 'Дашборд руководителя', desc: 'Вся операционка на одном экране' },
  { id: 'timesheet', name: 'Табель учёта смен', desc: 'Часы и фонд оплаты в реальном времени' },
  { id: 'arrivals', name: 'Календарь заезда', desc: 'Воронка заезда кандидатов на объекты' },
  { id: 'recruitment', name: 'Подбор', desc: 'Закрытие потребности по объектам и спец.' },
  { id: 'documents', name: 'Документы', desc: 'Светофор патентов, медкнижек, регистраций' },
  { id: 'siz', name: 'Выдача СИЗ', desc: 'Склад спецодежды и выдача комплектов' },
  { id: 'housing', name: 'Проживание', desc: 'Загрузка общежитий и бюджет на койко-места' },
  { id: 'contracts', name: 'Договоры', desc: 'План-факт и маржа по заказчикам' },
  { id: 'billing', name: 'Биллинг', desc: 'Акты из часов в один клик' },
  { id: 'margin', name: 'Маржинальность', desc: 'Живая юнит-экономика договоров' },
  { id: 'worker', name: 'Кабинет вахтовика', desc: 'Мобильный ЛК: смены, расчёт, удержания' },
  { id: 'client', name: 'Портал заказчика', desc: 'Заявки на персонал и акты для клиента' },
]

export default function Overview({ go }: { go: (id: ModuleId) => void }) {
  return (
    <div className="animate-fade-up space-y-6">
      {/* Hero */}
      <Card inner="bg-ink/95 text-white glass-dark relative overflow-hidden" pad={false}>
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(circle, #0f7a5f, transparent 70%)' }}
        />
        <div className="relative p-7 sm:p-10">
          <Badge tone="accent">Решения на Битрикс24 · VibeCode</Badge>
          <h1 className="mt-5 max-w-3xl text-3xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
            Цифровой контур аутстаффинговой компании
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
            Табель, заезды, подбор, договоры и документы — в едином окне поверх вашего Битрикс24.
            Не вместо CRM, а достраивает её там, где «коробка» аутстаффинг не закрывает.
            Все экраны ниже — живые: кликайте, двигайте, считайте.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <CTA icon={<IconArrow className="h-4 w-4" />} onClick={() => go('timesheet')}>
              Открыть демо
            </CTA>
            <div className="flex items-center gap-2 text-sm text-white/55">
              <IconSpark className="h-4 w-4 text-accent" />
              12 интерактивных модулей
            </div>
          </div>

          <div className="mt-9 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              ['−90%', 'ручной сверки часов'],
              ['×2', 'скорость закрытия заявок'],
              ['0', 'просроченных патентов'],
              ['1 окно', 'вся операционка'],
            ].map(([v, l]) => (
              <div key={l}>
                <div className="text-3xl font-extrabold tracking-tight text-accent">{v}</div>
                <div className="mt-1 text-xs text-white/55">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Pains */}
      <div>
        <Eyebrow>Боль аутстаффинга на «частичном» Битрикс24</Eyebrow>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PAINS.map((x) => (
            <Card key={x.p} glass>
              <div className="text-sm font-bold text-ink">{x.p}</div>
              <p className="mt-2 text-xs leading-relaxed text-ink-mute">{x.s}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* How it works — маршрут */}
      <div>
        <Eyebrow>Как это работает — от подбора до отчёта</Eyebrow>
        <div className="relative mt-6 pl-0">
          {/* светящаяся линия-коннектор */}
          <div className="pointer-events-none absolute left-7 top-8 bottom-10 w-px overflow-visible">
            <div className="absolute inset-0 bg-gradient-to-b from-accent/0 via-accent/50 to-accent/0" />
            <span className="flow-pulse absolute left-1/2 h-12 w-[3px] -translate-x-1/2 rounded-full" />
          </div>

          <div className="space-y-3">
            {FLOW.map((s) => {
              const Icon = s.icon
              return (
                <button
                  key={s.n}
                  onClick={() => go(s.id)}
                  className="group relative grid w-full grid-cols-[56px_1fr] items-center gap-4 text-left sm:gap-5"
                >
                  {/* под с иконкой */}
                  <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-accent-deep ring-1 ring-accent/25 shadow-[0_8px_24px_-10px_rgba(15,122,95,0.5)] transition-all duration-500 ease-spring group-hover:-translate-y-0.5 group-hover:bg-accent group-hover:text-white group-hover:shadow-[0_12px_30px_-8px_rgba(15,122,95,0.65)]">
                    <Icon className="h-6 w-6" />
                  </span>
                  {/* карточка-стекло */}
                  <div className="flex items-center justify-between gap-4 rounded-3xl p-4 glass-pane transition-all duration-500 ease-spring group-hover:-translate-y-0.5 sm:p-5">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm font-extrabold tabular-nums text-accent-deep">{s.n}</span>
                        <span className="truncate text-sm font-bold text-ink sm:text-base">{s.t}</span>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-ink-soft sm:text-[13px]">{s.d}</p>
                    </div>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/5 text-ink-mute transition-all duration-500 ease-spring group-hover:translate-x-0.5 group-hover:bg-accent group-hover:text-white">
                      <IconArrow className="h-4 w-4" />
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Modules grid */}
      <div>
        <div className="flex items-end justify-between">
          <Eyebrow>Что входит в платформу</Eyebrow>
          <span className="text-xs text-ink-mute">Нажмите модуль, чтобы открыть демо</span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m, i) => (
            <button
              key={m.id}
              onClick={() => go(m.id)}
              className="group rounded-4xl bg-white/35 p-1.5 text-left glass-tray transition-all duration-500 ease-spring hover:-translate-y-0.5"
            >
              <div className="flex h-full items-center justify-between rounded-[calc(2rem-0.375rem)] p-5 glass-pane">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold tabular-nums text-accent-deep">0{i + 1}</span>
                    <div className="truncate text-sm font-bold text-ink">{m.name}</div>
                  </div>
                  <div className="mt-1 truncate text-xs text-ink-mute">{m.desc}</div>
                </div>
                <span className="ml-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/5 transition-all duration-500 ease-spring group-hover:translate-x-0.5 group-hover:bg-accent group-hover:text-white">
                  <IconArrow className="h-4 w-4" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Why VibeCode */}
      <Card>
        <div className="grid items-center gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <Eyebrow>Почему это быстро и недорого</Eyebrow>
            <h3 className="mt-3 text-xl font-extrabold tracking-tight text-ink">
              Собрано на VibeCode поверх вашего Битрикс24
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Приложения работают через REST вашего портала: данные остаются в Битрикс24, а интерфейсы
              заточены под аутстаффинг. Разворачивается за дни, а не месяцы, и дорабатывается под ваши
              объекты, ставки и воронки.
            </p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {['Внутри портала Битрикс24', 'Доступ с телефона на объекте', 'Роли: бригадир / координатор / руководитель', 'White-label под ваш бренд'].map((t) => (
                <li key={t} className="flex items-center gap-2 text-sm text-ink-soft">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Запуск пилота" value="дни" tone="accent" />
            <Stat label="Модулей готово" value="12" />
            <Stat label="Данные" value="в Б24" sub="ничего не выносим" />
            <Stat label="Кастомизация" value="100%" sub="под ваши процессы" />
          </div>
        </div>
      </Card>
    </div>
  )
}
