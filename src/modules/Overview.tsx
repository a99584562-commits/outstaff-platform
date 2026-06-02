import { Badge, Card, CTA, Eyebrow, Stat, cx } from '../ui/components'
import { IconArrow, IconSpark } from '../ui/icons'
import type { ModuleId } from '../App'

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
      <Card inner="bg-ink/90 text-white backdrop-blur-2xl glass-dark relative overflow-hidden" pad={false}>
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
            <Card key={x.p}>
              <div className="text-sm font-bold text-ink">{x.p}</div>
              <p className="mt-2 text-xs leading-relaxed text-ink-mute">{x.s}</p>
            </Card>
          ))}
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
              className="group rounded-4xl bg-white/25 p-1.5 text-left backdrop-blur-md glass-tray transition-all duration-500 ease-spring hover:-translate-y-0.5"
            >
              <div className="flex h-full items-center justify-between rounded-[calc(2rem-0.375rem)] bg-white/65 p-5 backdrop-blur-2xl glass-edge">
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
