import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import type { Paginated, Rfq } from '../types'

const statusLabel: Record<string, string> = {
  new: 'Новая',
  confirmed: 'Подтверждена',
  cancelled: 'Отменена',
}

export function RfqsPage() {
  const [data, setData] = useState<Paginated<Rfq> | null>(null)
  const [status, setStatus] = useState('')
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)

  async function load(page = 1) {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (status) params.set('status', status)
      if (q) params.set('q', q)
      params.set('page', String(page))
      setData(await api<Paginated<Rfq>>(`/admin/rfqs?${params}`))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function onSearch(e: FormEvent) {
    e.preventDefault()
    load(1)
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Заявки</h1>
          <p className="text-sm text-slate-500">
            Склад истории для кабинета поставщика. Подтверждение шлёт заявку в Telegram.
          </p>
        </div>
        <Link
          to="/rfqs/new"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          + Заявка
        </Link>
      </div>

      <form onSubmit={onSearch} className="mb-4 flex flex-wrap gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Покупатель, компания, телефон…"
          className="rounded-lg border px-3 py-2 text-sm"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          <option value="">Все статусы</option>
          <option value="new">Новые</option>
          <option value="confirmed">Подтверждённые</option>
          <option value="cancelled">Отменённые</option>
        </select>
        <button type="submit" className="rounded-lg border bg-white px-4 py-2 text-sm hover:bg-slate-50">
          Найти
        </button>
      </form>

      {loading && <div className="text-sm text-slate-500">Загрузка…</div>}

      {!loading && data && (
        <div className="overflow-hidden rounded-xl border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">Покупатель</th>
                <th className="px-4 py-3 font-medium">Поставщики</th>
                <th className="px-4 py-3 font-medium">Статус</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {data.data.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-4 py-3">{r.id}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{r.buyer_name}</div>
                    <div className="text-xs text-slate-500">{r.buyer_phone || r.buyer_company || '—'}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {(r.recipients || []).map((x) => x.supplier?.commercial_name).filter(Boolean).join(', ') || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        r.status === 'new'
                          ? 'bg-amber-50 text-amber-800'
                          : r.status === 'confirmed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {statusLabel[r.status] || r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/rfqs/${r.id}`} className="text-slate-700 underline">
                      Открыть
                    </Link>
                  </td>
                </tr>
              ))}
              {data.data.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    Заявок пока нет
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {data && data.meta.last_page > 1 && (
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            disabled={data.meta.current_page <= 1}
            onClick={() => load(data.meta.current_page - 1)}
            className="rounded border bg-white px-3 py-1 text-sm disabled:opacity-40"
          >
            Назад
          </button>
          <span className="px-2 py-1 text-sm text-slate-500">
            {data.meta.current_page} / {data.meta.last_page}
          </span>
          <button
            type="button"
            disabled={data.meta.current_page >= data.meta.last_page}
            onClick={() => load(data.meta.current_page + 1)}
            className="rounded border bg-white px-3 py-1 text-sm disabled:opacity-40"
          >
            Вперёд
          </button>
        </div>
      )}
    </div>
  )
}
