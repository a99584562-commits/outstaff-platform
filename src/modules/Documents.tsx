import { useMemo, useState } from 'react'
import { DOCS, objShort } from '../data/mock'
import type { DocPerson } from '../data/mock'
import { Badge, Card, ModuleHead, Segmented, Stat, cx } from '../ui/components'

type DocKey = 'patentUntil' | 'medUntil' | 'regUntil'
const DOC_COLS: { key: DocKey; label: string }[] = [
  { key: 'patentUntil', label: 'Патент' },
  { key: 'medUntil', label: 'Мед. книжка' },
  { key: 'regUntil', label: 'Регистрация' },
]

function level(days: number): 'expired' | 'soon' | 'ok' | 'perm' {
  if (days >= 900) return 'perm'
  if (days < 0) return 'expired'
  if (days <= 14) return 'soon'
  return 'ok'
}
const LEVEL_META = {
  expired: { tone: 'rose', label: (d: number) => `просрочен ${Math.abs(d)} дн` },
  soon: { tone: 'amber', label: (d: number) => `${d} дн` },
  ok: { tone: 'green', label: (d: number) => `${d} дн` },
  perm: { tone: 'slate', label: () => 'не требуется' },
} as const

export default function Documents() {
  const [onlyRisk, setOnlyRisk] = useState<'all' | 'risk'>('all')
  const [docs, setDocs] = useState<DocPerson[]>(() => DOCS.map((d) => ({ ...d })))

  const worstOf = (p: DocPerson) => Math.min(...DOC_COLS.map((c) => (p[c.key] >= 900 ? 9999 : p[c.key])))

  const rows = useMemo(() => {
    const list = onlyRisk === 'risk' ? docs.filter((p) => worstOf(p) <= 14) : docs
    return [...list].sort((a, b) => worstOf(a) - worstOf(b))
  }, [docs, onlyRisk])

  const stats = useMemo(() => {
    let expired = 0
    let soon = 0
    for (const p of docs)
      for (const c of DOC_COLS) {
        const l = level(p[c.key])
        if (l === 'expired') expired++
        else if (l === 'soon') soon++
      }
    return { expired, soon, people: docs.length }
  }, [docs])

  function renew(id: string, key: DocKey) {
    setDocs((prev) => prev.map((p) => (p.id === id ? { ...p, [key]: 365 } : p)))
  }

  return (
    <div className="animate-fade-up">
      <ModuleHead
        eyebrow="Миграционный контроль"
        title="Контроль документов сотрудников"
        desc="Патенты, медкнижки и регистрации со светофором по сроку. Просроченный документ иностранца — штраф до 1 млн ₽ за человека. Кликните «Продлить», чтобы сбросить срок."
        right={
          <Segmented
            size="sm"
            value={onlyRisk}
            onChange={setOnlyRisk}
            options={[
              { value: 'all', label: 'Все' },
              { value: 'risk', label: '⚠ Скоро истекают' },
            ]}
          />
        }
      />

      <div className="mb-5 grid grid-cols-3 gap-3">
        <Stat label="Сотрудников на контроле" value={stats.people} />
        <Stat label="Истекают ≤14 дней" value={stats.soon} tone={stats.soon ? 'amber' : 'ink'} />
        <Stat label="Просрочено" value={stats.expired} tone={stats.expired ? 'rose' : 'ink'} sub="требует действий сегодня" />
      </div>

      {/* Desktop: table */}
      <Card pad={false} className="hidden md:block">
        <div className="overflow-x-auto p-2 sm:p-3">
          <table className="w-full border-separate" style={{ borderSpacing: '0 6px' }}>
            <thead>
              <tr className="text-ink-mute">
                <th className="px-3 pb-1 text-left text-xs font-semibold">Сотрудник</th>
                <th className="px-3 pb-1 text-left text-xs font-semibold">Объект</th>
                {DOC_COLS.map((c) => (
                  <th key={c.key} className="px-3 pb-1 text-left text-xs font-semibold">
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="bg-paper/60">
                  <td className="rounded-l-2xl px-3 py-2.5">
                    <div className="text-sm font-semibold text-ink">{p.name}</div>
                    <div className="text-[11px] text-ink-mute">{p.citizenship}</div>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-ink-soft">{objShort(p.object)}</td>
                  {DOC_COLS.map((c, i) => {
                    const days = p[c.key]
                    const l = level(days)
                    const meta = LEVEL_META[l]
                    return (
                      <td key={c.key} className={cx('px-3 py-2.5', i === DOC_COLS.length - 1 && 'rounded-r-2xl')}>
                        <div className="flex items-center gap-2">
                          <Badge tone={meta.tone} dot>
                            {meta.label(days)}
                          </Badge>
                          {(l === 'soon' || l === 'expired') && (
                            <button
                              onClick={() => renew(p.id, c.key)}
                              className="rounded-full bg-ink px-2.5 py-1 text-[11px] font-semibold text-white transition-all duration-300 ease-spring hover:bg-ink/85 active:scale-95"
                            >
                              Продлить
                            </button>
                          )}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mobile: cards */}
      <div className="space-y-3 md:hidden">
        {rows.map((p) => (
          <Card key={p.id} pad={false}>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-bold text-ink">{p.name}</div>
                  <div className="text-[11px] text-ink-mute">{p.citizenship}</div>
                </div>
                <Badge tone="slate">{objShort(p.object)}</Badge>
              </div>
              <div className="mt-3 space-y-2">
                {DOC_COLS.map((c) => {
                  const days = p[c.key]
                  const l = level(days)
                  const meta = LEVEL_META[l]
                  return (
                    <div key={c.key} className="flex items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2 hairline">
                      <span className="text-xs font-medium text-ink-soft">{c.label}</span>
                      <div className="flex items-center gap-2">
                        <Badge tone={meta.tone} dot>
                          {meta.label(days)}
                        </Badge>
                        {(l === 'soon' || l === 'expired') && (
                          <button
                            onClick={() => renew(p.id, c.key)}
                            className="rounded-full bg-ink px-2.5 py-1 text-[11px] font-semibold text-white transition-all duration-300 ease-spring active:scale-95"
                          >
                            Продлить
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <p className="mt-4 px-1 text-xs leading-relaxed text-ink-mute">
        В Битрикс24 каждый документ — поле с датой в карточке сотрудника. Робот за 14 дней до
        истечения ставит задачу ответственному и шлёт уведомление в Telegram. Светофор и фильтр
        «скоро истекают» защищают компанию от штрафов и снятия людей с объекта.
      </p>
    </div>
  )
}
