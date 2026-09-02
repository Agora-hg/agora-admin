import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, ApiError } from '../api/client'
import type { Rfq } from '../types'

const statusLabel: Record<string, string> = {
  new: 'Новая',
  confirmed: 'Подтверждена',
  cancelled: 'Отменена',
}

const recLabel: Record<string, string> = {
  pending: 'ждёт отправки',
  sent: 'отправлено в TG',
  failed: 'ошибка TG',
  skipped_unlinked: 'нет привязки TG',
}

export function RfqDetailPage() {
  const { id } = useParams()
  const [rfq, setRfq] = useState<Rfq | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function load() {
    if (!id) return
    const res = await api<{ data: Rfq }>(`/admin/rfqs/${id}`)
    setRfq(res.data)
  }

  useEffect(() => {
    load().catch((e) => setError(e instanceof ApiError ? e.message : 'Ошибка'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function confirmRfq() {
    if (!id || !window.confirm('Подтвердить и отправить поставщикам в Telegram?')) return
    setBusy(true)
    try {
      const res = await api<{ data: Rfq }>(`/admin/rfqs/${id}/confirm`, { method: 'POST' })
      setRfq(res.data)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Не удалось подтвердить')
    } finally {
      setBusy(false)
    }
  }

  async function cancelRfq() {
    if (!id || !window.confirm('Отменить заявку?')) return
    setBusy(true)
    try {
      const res = await api<{ data: Rfq }>(`/admin/rfqs/${id}/cancel`, { method: 'POST' })
      setRfq(res.data)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Не удалось отменить')
    } finally {
      setBusy(false)
    }
  }

  if (!rfq) return <div className="text-sm text-slate-500">{error || 'Загрузка…'}</div>

  return (
    <div className="max-w-3xl">
      <Link to="/rfqs" className="text-sm text-slate-500 hover:underline">
        ← К заявкам
      </Link>
      <div className="mt-2 mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Заявка #{rfq.id}</h1>
          <p className="text-sm text-slate-500">{statusLabel[rfq.status] || rfq.status}</p>
        </div>
        <div className="flex gap-2">
          {rfq.status === 'new' && (
            <>
              <button type="button" disabled={busy} onClick={() => void confirmRfq()} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
                Подтвердить и отправить
              </button>
              <button type="button" disabled={busy} onClick={() => void cancelRfq()} className="rounded-lg border px-4 py-2 text-sm">
                Отменить
              </button>
            </>
          )}
          {rfq.status === 'confirmed' && (
            <button type="button" disabled={busy} onClick={() => void confirmRfq()} className="rounded-lg border px-4 py-2 text-sm">
              Дослать тем, кто без TG / с ошибкой
            </button>
          )}
        </div>
      </div>

      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      <div className="space-y-4 rounded-xl border bg-white p-6 text-sm">
        <div>
          <div className="text-xs text-slate-500">Покупатель</div>
          <div className="font-medium">{rfq.buyer_name}</div>
          <div className="text-slate-600">
            {[rfq.buyer_company, rfq.buyer_phone, rfq.buyer_email, rfq.buyer_city].filter(Boolean).join(' · ') || '—'}
          </div>
        </div>
        {rfq.comment && (
          <div>
            <div className="text-xs text-slate-500">Комментарий</div>
            <div>{rfq.comment}</div>
          </div>
        )}
        {rfq.items && rfq.items.length > 0 && (
          <div>
            <div className="text-xs text-slate-500">Состав</div>
            <ul className="list-inside list-disc">
              {rfq.items.map((it, i) => (
                <li key={i}>
                  {it.title || it.offer_title || 'позиция'}
                  {it.qty ? ` × ${it.qty}` : ''}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div>
          <div className="mb-2 text-xs text-slate-500">Поставщики</div>
          {(rfq.recipients || []).map((r) => (
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 border-t py-2">
              <span>{r.supplier?.commercial_name || r.supplier_id}</span>
              <span className="text-xs text-slate-500">{recLabel[r.status] || r.status}{r.error ? ` · ${r.error}` : ''}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
