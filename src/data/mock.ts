// Mock domain data for an outstaffing company operating on Bitrix24.

export const OBJECTS = [
  { id: 'wb-elektrostal', name: 'СЦ Wildberries · Электросталь', city: 'Электросталь' },
  { id: 'ozon-tver', name: 'ФЦ Ozon · Тверь', city: 'Тверь' },
  { id: 'magnit-msk', name: 'РЦ Магнит · Дмитров', city: 'Дмитров' },
  { id: 'xpark-spb', name: 'Склад X-Park · СПб', city: 'Санкт-Петербург' },
] as const

export type ObjectId = (typeof OBJECTS)[number]['id']

export const SPECIALTIES = [
  'Комплектовщик',
  'Грузчик',
  'Кладовщик',
  'Оператор ВПТ',
  'Упаковщик',
  'Разнорабочий',
] as const
export type Specialty = (typeof SPECIALTIES)[number]

// ── Табель ────────────────────────────────────────────────────────────────
export type ShiftCode = '' | 'D' | 'N' | 'V'
export const SHIFT_META: Record<Exclude<ShiftCode, ''>, { label: string; hours: number; tone: string }> = {
  D: { label: 'Я', hours: 12, tone: 'bg-accent-soft text-accent-deep' },
  N: { label: 'Н', hours: 12, tone: 'bg-indigo-50 text-indigo-700' },
  V: { label: 'В', hours: 0, tone: 'bg-slate-100 text-slate-400' },
}

export interface Employee {
  id: string
  name: string
  specialty: Specialty
  object: ObjectId
  rate: number // ставка оплаты сотруднику, ₽/час
  // 14 ячеек = первые две недели месяца
  shifts: ShiftCode[]
}

const pattern = (s: string): ShiftCode[] => s.split('').map((c) => (c === '.' ? '' : (c as ShiftCode)))

export const EMPLOYEES: Employee[] = [
  { id: 'e1', name: 'Усманов Ж.', specialty: 'Комплектовщик', object: 'wb-elektrostal', rate: 180, shifts: pattern('DD..DDDD..DD..') },
  { id: 'e2', name: 'Каримов Р.', specialty: 'Комплектовщик', object: 'wb-elektrostal', rate: 180, shifts: pattern('.DDDD..DDDD..D') },
  { id: 'e3', name: 'Сидоров А.', specialty: 'Кладовщик', object: 'wb-elektrostal', rate: 230, shifts: pattern('DDDDD..DDDDD..') },
  { id: 'e4', name: 'Назаров Б.', specialty: 'Грузчик', object: 'ozon-tver', rate: 175, shifts: pattern('NN..NNNN..NN..') },
  { id: 'e5', name: 'Петров И.', specialty: 'Оператор ВПТ', object: 'ozon-tver', rate: 260, shifts: pattern('DD.DD.DD.DD.DD') },
  { id: 'e6', name: 'Холматов С.', specialty: 'Упаковщик', object: 'magnit-msk', rate: 170, shifts: pattern('DDDD..DDDD..DD') },
  { id: 'e7', name: 'Рахимов Д.', specialty: 'Разнорабочий', object: 'magnit-msk', rate: 165, shifts: pattern('.DD..DDDD..DDD') },
  { id: 'e8', name: 'Ковалёв М.', specialty: 'Кладовщик', object: 'xpark-spb', rate: 235, shifts: pattern('NNNN..NNNN..NN') },
  { id: 'e9', name: 'Эргашев Т.', specialty: 'Грузчик', object: 'xpark-spb', rate: 175, shifts: pattern('DD..DD..DD..DD') },
]

// ── Кандидаты / заезды ──────────────────────────────────────────────────────
export type ArrivalStatus = 'planned' | 'transit' | 'arrived' | 'onsite' | 'failed'
export const ARRIVAL_META: Record<ArrivalStatus, { label: string; tone: string }> = {
  planned: { label: 'Запланирован', tone: 'slate' },
  transit: { label: 'В пути', tone: 'sky' },
  arrived: { label: 'Заехал', tone: 'indigo' },
  onsite: { label: 'На объекте', tone: 'green' },
  failed: { label: 'Сорвался', tone: 'rose' },
}
export const ARRIVAL_ORDER: ArrivalStatus[] = ['planned', 'transit', 'arrived', 'onsite', 'failed']

export interface Candidate {
  id: string
  name: string
  specialty: Specialty
  object: ObjectId
  day: number // день в горизонте 1..14
  status: ArrivalStatus
  source: string
}

export const CANDIDATES: Candidate[] = [
  { id: 'c1', name: 'Тошматов А.', specialty: 'Комплектовщик', object: 'wb-elektrostal', day: 2, status: 'onsite', source: 'Avito' },
  { id: 'c2', name: 'Юлдашев К.', specialty: 'Грузчик', object: 'ozon-tver', day: 2, status: 'arrived', source: 'Рекомендация' },
  { id: 'c3', name: 'Махмудов Ф.', specialty: 'Упаковщик', object: 'magnit-msk', day: 4, status: 'transit', source: 'Telegram' },
  { id: 'c4', name: 'Сергеев П.', specialty: 'Оператор ВПТ', object: 'ozon-tver', day: 5, status: 'planned', source: 'HeadHunter' },
  { id: 'c5', name: 'Бобоев Ш.', specialty: 'Разнорабочий', object: 'magnit-msk', day: 5, status: 'failed', source: 'Avito' },
  { id: 'c6', name: 'Алиев Н.', specialty: 'Кладовщик', object: 'xpark-spb', day: 7, status: 'planned', source: 'Зарплата.ру' },
  { id: 'c7', name: 'Дустов Р.', specialty: 'Комплектовщик', object: 'wb-elektrostal', day: 8, status: 'transit', source: 'Telegram' },
  { id: 'c8', name: 'Орлов В.', specialty: 'Грузчик', object: 'xpark-spb', day: 9, status: 'planned', source: 'Avito' },
  { id: 'c9', name: 'Камолов И.', specialty: 'Упаковщик', object: 'magnit-msk', day: 9, status: 'planned', source: 'Рекомендация' },
  { id: 'c10', name: 'Фёдоров Е.', specialty: 'Кладовщик', object: 'wb-elektrostal', day: 11, status: 'planned', source: 'HeadHunter' },
  { id: 'c11', name: 'Гафуров М.', specialty: 'Комплектовщик', object: 'ozon-tver', day: 12, status: 'planned', source: 'Telegram' },
  { id: 'c12', name: 'Носов Д.', specialty: 'Разнорабочий', object: 'xpark-spb', day: 14, status: 'planned', source: 'Avito' },
]

// ── Подбор: потребность по объектам и специальностям ────────────────────────
export interface Demand {
  object: ObjectId
  specialty: Specialty
  need: number // нужно человек
  filled: number // закрыто
  inWork: number // в работе (кандидаты в воронке)
}
export const DEMAND: Demand[] = [
  { object: 'wb-elektrostal', specialty: 'Комплектовщик', need: 40, filled: 31, inWork: 6 },
  { object: 'wb-elektrostal', specialty: 'Кладовщик', need: 6, filled: 5, inWork: 1 },
  { object: 'ozon-tver', specialty: 'Грузчик', need: 25, filled: 18, inWork: 5 },
  { object: 'ozon-tver', specialty: 'Оператор ВПТ', need: 8, filled: 4, inWork: 3 },
  { object: 'magnit-msk', specialty: 'Упаковщик', need: 30, filled: 24, inWork: 4 },
  { object: 'magnit-msk', specialty: 'Разнорабочий', need: 15, filled: 9, inWork: 4 },
  { object: 'xpark-spb', specialty: 'Кладовщик', need: 12, filled: 11, inWork: 2 },
  { object: 'xpark-spb', specialty: 'Грузчик', need: 20, filled: 13, inWork: 6 },
]

// Воронка подбора (агрегат за месяц)
export const FUNNEL = [
  { stage: 'Отклики', value: 1240 },
  { stage: 'Скрининг', value: 720 },
  { stage: 'Собеседование', value: 410 },
  { stage: 'Оффер', value: 250 },
  { stage: 'Вышел на смену', value: 168 },
]

// ── Договоры с заказчиками ──────────────────────────────────────────────────
export interface Contract {
  id: string
  client: string
  object: ObjectId
  billRate: number // ставка заказчику, ₽/час
  headPlan: number
  headFact: number
  hoursMonth: number // отработано часов за месяц (факт)
  planRevenue: number
  status: 'active' | 'ending' | 'signing'
  until: string
}
export const CONTRACTS: Contract[] = [
  { id: 'k1', client: 'Wildberries', object: 'wb-elektrostal', billRate: 295, headPlan: 46, headFact: 36, hoursMonth: 11800, planRevenue: 4_100_000, status: 'active', until: '31.12.2026' },
  { id: 'k2', client: 'Ozon', object: 'ozon-tver', billRate: 305, headPlan: 33, headFact: 22, hoursMonth: 7100, planRevenue: 3_050_000, status: 'active', until: '30.09.2026' },
  { id: 'k3', client: 'Магнит', object: 'magnit-msk', billRate: 270, headPlan: 45, headFact: 33, hoursMonth: 9600, planRevenue: 2_900_000, status: 'ending', until: '30.06.2026' },
  { id: 'k4', client: 'X-Park Logistics', object: 'xpark-spb', billRate: 315, headPlan: 32, headFact: 24, hoursMonth: 7600, planRevenue: 2_700_000, status: 'signing', until: '—' },
]

// ── Документы иностранных сотрудников ───────────────────────────────────────
export interface DocPerson {
  id: string
  name: string
  citizenship: string
  object: ObjectId
  patentUntil: number // дней до истечения
  medUntil: number
  regUntil: number
}
export const DOCS: DocPerson[] = [
  { id: 'd1', name: 'Усманов Ж.', citizenship: 'Узбекистан', object: 'wb-elektrostal', patentUntil: 4, medUntil: 58, regUntil: 22 },
  { id: 'd2', name: 'Каримов Р.', citizenship: 'Узбекистан', object: 'wb-elektrostal', patentUntil: 41, medUntil: 12, regUntil: 3 },
  { id: 'd3', name: 'Назаров Б.', citizenship: 'Таджикистан', object: 'ozon-tver', patentUntil: -2, medUntil: 90, regUntil: 45 },
  { id: 'd4', name: 'Холматов С.', citizenship: 'Узбекистан', object: 'magnit-msk', patentUntil: 27, medUntil: 27, regUntil: 60 },
  { id: 'd5', name: 'Рахимов Д.', citizenship: 'Таджикистан', object: 'magnit-msk', patentUntil: 70, medUntil: 5, regUntil: 18 },
  { id: 'd6', name: 'Эргашев Т.', citizenship: 'Узбекистан', object: 'xpark-spb', patentUntil: 120, medUntil: 64, regUntil: 9 },
  { id: 'd7', name: 'Тошматов А.', citizenship: 'Кыргызстан', object: 'wb-elektrostal', patentUntil: 999, medUntil: 33, regUntil: 51 },
]

// ── Расчёт ЗП (кабинет вахтовика) ───────────────────────────────────────────
export const shiftHours = (s: ShiftCode[]) =>
  s.reduce((a, c) => a + (c && c !== 'V' ? SHIFT_META[c].hours : 0), 0)
export const shiftCount = (s: ShiftCode[]) => s.filter((c) => c === 'D' || c === 'N').length

export interface Payroll {
  avans: number // выплаченный аванс
  housing: number // удержание за проживание
  gear: number // удержание за спецодежду
  fine: number // штрафы
}
export const PAYROLL: Record<string, Payroll> = {
  e1: { avans: 8000, housing: 6000, gear: 1500, fine: 0 },
  e2: { avans: 8000, housing: 6000, gear: 0, fine: 1000 },
  e3: { avans: 10000, housing: 6000, gear: 0, fine: 0 },
  e4: { avans: 8000, housing: 6500, gear: 1500, fine: 0 },
  e5: { avans: 12000, housing: 6500, gear: 0, fine: 0 },
  e6: { avans: 7000, housing: 5500, gear: 1500, fine: 500 },
  e7: { avans: 7000, housing: 5500, gear: 0, fine: 0 },
  e8: { avans: 10000, housing: 7000, gear: 0, fine: 0 },
  e9: { avans: 8000, housing: 7000, gear: 1500, fine: 0 },
}

// ── Проживание: люди + объекты размещения ───────────────────────────────────
export interface Resident {
  id: string
  name: string
  object: ObjectId
  role: Specialty
}
// пул людей, которых нужно расселять (заехавшие/работающие)
export const RESIDENTS: Resident[] = [
  { id: 'p1', name: 'Усманов Ж.', object: 'wb-elektrostal', role: 'Комплектовщик' },
  { id: 'p2', name: 'Каримов Р.', object: 'wb-elektrostal', role: 'Комплектовщик' },
  { id: 'p3', name: 'Сидоров А.', object: 'wb-elektrostal', role: 'Кладовщик' },
  { id: 'p4', name: 'Тошматов А.', object: 'wb-elektrostal', role: 'Комплектовщик' },
  { id: 'p5', name: 'Дустов Р.', object: 'wb-elektrostal', role: 'Комплектовщик' },
  { id: 'p6', name: 'Назаров Б.', object: 'ozon-tver', role: 'Грузчик' },
  { id: 'p7', name: 'Петров И.', object: 'ozon-tver', role: 'Оператор ВПТ' },
  { id: 'p8', name: 'Юлдашев К.', object: 'ozon-tver', role: 'Грузчик' },
  { id: 'p9', name: 'Гафуров М.', object: 'ozon-tver', role: 'Комплектовщик' },
  { id: 'p10', name: 'Холматов С.', object: 'magnit-msk', role: 'Упаковщик' },
  { id: 'p11', name: 'Рахимов Д.', object: 'magnit-msk', role: 'Разнорабочий' },
  { id: 'p12', name: 'Махмудов Ф.', object: 'magnit-msk', role: 'Упаковщик' },
  { id: 'p13', name: 'Камолов И.', object: 'magnit-msk', role: 'Упаковщик' },
  { id: 'p14', name: 'Ковалёв М.', object: 'xpark-spb', role: 'Кладовщик' },
  { id: 'p15', name: 'Эргашев Т.', object: 'xpark-spb', role: 'Грузчик' },
  { id: 'p16', name: 'Орлов В.', object: 'xpark-spb', role: 'Грузчик' },
  { id: 'p17', name: 'Носов Д.', object: 'xpark-spb', role: 'Разнорабочий' },
  { id: 'p18', name: 'Алиев Н.', object: 'xpark-spb', role: 'Кладовщик' },
]
export const residentById = (id: string) => RESIDENTS.find((r) => r.id === id)

export type LodgingType = 'hostel' | 'apartment'
export const LODGING_META: Record<LodgingType, { label: string; tone: string }> = {
  hostel: { label: 'Хостел / общежитие', tone: 'slate' },
  apartment: { label: 'Квартира', tone: 'indigo' },
}

export interface Lodging {
  id: string
  name: string
  type: LodgingType
  object: ObjectId
  address: string
  capacity: number
  // hostel: ₽/мес за койко-место; apartment: ₽/мес аренда всей квартиры
  cost: number
  residentIds: string[]
}
export const LODGINGS: Lodging[] = [
  { id: 'l1', name: 'Хостел «Восток»', type: 'hostel', object: 'wb-elektrostal', address: 'Электросталь, ул. Мира, 12', capacity: 10, cost: 6000, residentIds: ['p1', 'p2', 'p3'] },
  { id: 'l2', name: '2-комн. квартира', type: 'apartment', object: 'wb-elektrostal', address: 'Электросталь, ул. Корешкова, 8', capacity: 4, cost: 55000, residentIds: ['p4', 'p5'] },
  { id: 'l3', name: 'Общежитие №3', type: 'hostel', object: 'ozon-tver', address: 'Тверь, пр-т Ленина, 48', capacity: 8, cost: 6500, residentIds: ['p6', 'p7'] },
  { id: 'l4', name: 'Студия', type: 'apartment', object: 'ozon-tver', address: 'Тверь, ул. Советская, 21', capacity: 2, cost: 38000, residentIds: ['p8'] },
  { id: 'l5', name: 'Дом для рабочих', type: 'hostel', object: 'magnit-msk', address: 'Дмитров, ул. Заводская, 5', capacity: 10, cost: 5500, residentIds: ['p10', 'p11', 'p12'] },
  { id: 'l6', name: '3-комн. квартира', type: 'apartment', object: 'magnit-msk', address: 'Дмитров, ул. Профессиональная, 14', capacity: 6, cost: 60000, residentIds: ['p13'] },
  { id: 'l7', name: 'Хостел «Север»', type: 'hostel', object: 'xpark-spb', address: 'СПб, Кубинская ул., 78', capacity: 8, cost: 7000, residentIds: ['p14', 'p15', 'p16'] },
  { id: 'l8', name: '1-комн. квартира', type: 'apartment', object: 'xpark-spb', address: 'СПб, ул. Маршала Казакова, 3', capacity: 3, cost: 42000, residentIds: ['p17'] },
]
// итоговая стоимость объекта размещения за месяц
export const lodgingCost = (l: Lodging) =>
  l.type === 'apartment' ? l.cost : l.residentIds.length * l.cost

// ── Портал заказчика: заявки на персонал ────────────────────────────────────
export type RequestStatus = 'new' | 'inwork' | 'done'
export const REQUEST_META: Record<RequestStatus, { label: string; tone: string }> = {
  new: { label: 'Новая', tone: 'sky' },
  inwork: { label: 'В работе', tone: 'amber' },
  done: { label: 'Закрыта', tone: 'green' },
}
export interface ClientRequest {
  id: string
  client: string
  object: ObjectId
  specialty: Specialty
  need: number
  filled: number
  status: RequestStatus
  date: string
}
export const CLIENT_REQUESTS: ClientRequest[] = [
  { id: 'r1', client: 'Wildberries', object: 'wb-elektrostal', specialty: 'Комплектовщик', need: 40, filled: 31, status: 'inwork', date: '05.06' },
  { id: 'r2', client: 'Wildberries', object: 'wb-elektrostal', specialty: 'Кладовщик', need: 6, filled: 5, status: 'inwork', date: '08.06' },
  { id: 'r3', client: 'Ozon', object: 'ozon-tver', specialty: 'Грузчик', need: 25, filled: 18, status: 'inwork', date: '03.06' },
  { id: 'r4', client: 'Ozon', object: 'ozon-tver', specialty: 'Оператор ВПТ', need: 8, filled: 4, status: 'new', date: '10.06' },
  { id: 'r5', client: 'Магнит', object: 'magnit-msk', specialty: 'Упаковщик', need: 30, filled: 24, status: 'inwork', date: '01.06' },
  { id: 'r6', client: 'Магнит', object: 'magnit-msk', specialty: 'Разнорабочий', need: 15, filled: 15, status: 'done', date: '20.05' },
]

// ── СИЗ / спецодежда: склад + нормы выдачи ──────────────────────────────────
export interface SizItem {
  id: string
  name: string
  unit: 'шт' | 'пара'
  price: number
  stock: number
  min: number // минимальный остаток (порог дозаказа)
  bySize?: boolean // выдаётся по размеру
}
export const SIZ: SizItem[] = [
  { id: 's1', name: 'Каска защитная', unit: 'шт', price: 450, stock: 38, min: 20 },
  { id: 's2', name: 'Перчатки рабочие', unit: 'пара', price: 90, stock: 14, min: 50 },
  { id: 's3', name: 'Жилет сигнальный', unit: 'шт', price: 320, stock: 61, min: 30 },
  { id: 's4', name: 'Ботинки с подноском', unit: 'пара', price: 2200, stock: 27, min: 25, bySize: true },
  { id: 's5', name: 'Куртка утеплённая', unit: 'шт', price: 2800, stock: 16, min: 10, bySize: true },
  { id: 's6', name: 'Брюки рабочие', unit: 'шт', price: 1200, stock: 42, min: 20, bySize: true },
  { id: 's7', name: 'Респиратор FFP1', unit: 'шт', price: 180, stock: 9, min: 40 },
  { id: 's8', name: 'Очки защитные', unit: 'шт', price: 250, stock: 33, min: 15 },
]
export const sizById = (id: string) => SIZ.find((s) => s.id === id)

// норма комплекта СИЗ по специальности: [id позиции, кол-во]
export const SIZ_NORMS: Record<Specialty, { item: string; qty: number }[]> = {
  Комплектовщик: [{ item: 's3', qty: 1 }, { item: 's2', qty: 2 }],
  Грузчик: [{ item: 's1', qty: 1 }, { item: 's3', qty: 1 }, { item: 's2', qty: 2 }, { item: 's4', qty: 1 }],
  Кладовщик: [{ item: 's3', qty: 1 }, { item: 's2', qty: 1 }],
  'Оператор ВПТ': [{ item: 's1', qty: 1 }, { item: 's3', qty: 1 }, { item: 's2', qty: 1 }, { item: 's8', qty: 1 }],
  Упаковщик: [{ item: 's2', qty: 2 }, { item: 's7', qty: 1 }],
  Разнорабочий: [{ item: 's1', qty: 1 }, { item: 's3', qty: 1 }, { item: 's2', qty: 2 }, { item: 's4', qty: 1 }, { item: 's5', qty: 1 }],
}
export const kitCost = (spec: Specialty) =>
  SIZ_NORMS[spec].reduce((a, n) => a + (sizById(n.item)?.price ?? 0) * n.qty, 0)

export interface SizIssue {
  id: string
  worker: string
  specialty: Specialty
  object: ObjectId
  items: { item: string; qty: number }[]
  date: string
  cost: number
  returned: boolean
}

export const fmt = (n: number) => n.toLocaleString('ru-RU')
export const fmtMoney = (n: number) => '₽ ' + n.toLocaleString('ru-RU')
export const fmtMoneyShort = (n: number) =>
  n >= 1_000_000 ? '₽ ' + (n / 1_000_000).toFixed(1).replace('.', ',') + ' млн' : fmtMoney(n)

export const objName = (id: ObjectId) => OBJECTS.find((o) => o.id === id)?.name ?? id
export const objShort = (id: ObjectId) => {
  const n = objName(id)
  return n.split('·')[0].trim()
}
