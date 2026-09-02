import { useEffect, useState, type FormEvent } from 'react'
import { api, ApiError } from '../api/client'
import type { Paginated, Supplier } from '../types'

type InboxRow = {
  id: number
  direction: string
  text: string
  supplier: { id: number; commercial_name: string } | null
  created_at: string | null
}

export function BroadcastPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [selected, setSelected] = useState<number[]>([])
  const [allLinked, setAllLinked] = useState(true)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [inbox, setInbox] = useState<InboxRow[]>([])
  const [replyFor, setReplyFor] = useState<number | null>(null)
  const [replyText, setReplyText] = useState('')

  useEffect(() => {
    api<Paginated<Supplier>>('/admin/suppliers?per_page=100').then((r) => setSuppliers(r.data))
    api<{ data: InboxRow[] }>('/admin/telegram/inbox?per_page=30').then((r) => setInbox(r.data))
  }, [])

  function toggle(id: number) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  }

  async function onSend(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setResult(null)
    try {
      const res = await api<{ sent_count: number; failed_count: number; skipped_count: number }>('/admin/broadcasts', {
        method: 'POST',
        json: allLinked
          ? { text, all_linked: true }
          : { text, supplier_ids: selected },
      })
      setResult(`Доставлено ${res.sent_count}, ошибок ${res.failed_count}, без TG ${res.skipped_count}`)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не отправилось')
    } finally {
      setBusy(false)
    }
  }

  async function sendReply(id: number) {
    if (!replyText.trim()) return
    await api(`/admin/telegram/inbox/${id}/reply`, { method: 'POST', json: { text: replyText } })
    setReplyFor(null)
    setReplyText('')
    const r = await api<{ data: InboxRow[] }>('/admin/telegram/inbox?per_page=30')
    setInbox(r.data)
  }

  const linked = suppliers.filter((s) => s.telegram_status === 'linked')

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold">Рассылка</h1>
      <p className="mb-6 text-sm text-slate-500">
        Уйдёт только тем, кто нажал Start у @agora_managerbot. Без привязки — в отчёте «не привязаны».
      </p>

      <form onSubmit={onSend} className="mb-8 space-y-4 rounded-xl border bg-white p-6">
        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        {result && <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{result}</div>}

        <label className="block text-sm">
          <span className="mb-1 block font-medium">Текст</span>
          <textarea value={text} onChange={(e) => setText(e.target.value)} required rows={5} className="w-full rounded-lg border px-3 py-2" />
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={allLinked} onChange={(e) => setAllLinked(e.target.checked)} />
          Всем привязанным ({linked.length})
        </label>

        {!allLinked && (
          <div className="rounded-lg border">
            {suppliers.map((s) => (
              <label key={s.id} className="flex items-center gap-2 border-t px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  disabled={s.telegram_status !== 'linked'}
                  checked={selected.includes(s.id)}
                  onChange={() => toggle(s.id)}
                />
                <span className="flex-1">{s.commercial_name}</span>
                <span className="text-xs text-slate-500">
                  {s.telegram_status === 'linked' ? 'TG ок' : s.telegram ? 'ждём Start' : 'нет юза'}
                </span>
              </label>
            ))}
          </div>
        )}

        <button type="submit" disabled={busy || !text.trim()} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
          {busy ? 'Отправляю…' : 'Отправить'}
        </button>
      </form>

      <h2 className="mb-2 text-lg font-semibold">Входящие из бота</h2>
      <p className="mb-3 text-sm text-slate-500">Можно ответить здесь или реплаем в Telegram.</p>
      <div className="overflow-hidden rounded-xl border bg-white">
        {inbox.length === 0 && <div className="px-4 py-8 text-center text-sm text-slate-400">Пока пусто</div>}
        {inbox.map((m) => (
          <div key={m.id} className="border-t px-4 py-3 text-sm">
            <div className="mb-1 flex justify-between gap-2 text-xs text-slate-500">
              <span>
                {m.direction === 'in' ? '←' : '→'} {m.supplier?.commercial_name || 'неизвестный'}
              </span>
              <span>{m.created_at ? new Date(m.created_at).toLocaleString('ru-RU') : ''}</span>
            </div>
            <div>{m.text}</div>
            {m.direction === 'in' && (
              <div className="mt-2">
                {replyFor === m.id ? (
                  <div className="flex gap-2">
                    <input value={replyText} onChange={(e) => setReplyText(e.target.value)} className="flex-1 rounded-lg border px-3 py-1" />
                    <button type="button" onClick={() => void sendReply(m.id)} className="rounded-lg bg-slate-900 px-3 py-1 text-white">
                      Отправить
                    </button>
                  </div>
                ) : (
                  <button type="button" className="text-xs underline" onClick={() => setReplyFor(m.id)}>
                    Ответить
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
