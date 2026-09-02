import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, ApiError } from '../api/client'
import type { Paginated, Supplier } from '../types'

export function RfqNewPage() {
  const navigate = useNavigate()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [selected, setSelected] = useState<number[]>([])
  const [buyerName, setBuyerName] = useState('')
  const [buyerPhone, setBuyerPhone] = useState('')
  const [buyerEmail, setBuyerEmail] = useState('')
  const [buyerCompany, setBuyerCompany] = useState('')
  const [buyerCity, setBuyerCity] = useState('Москва')
  const [comment, setComment] = useState('')
  const [itemTitle, setItemTitle] = useState('')
  const [itemQty, setItemQty] = useState('1000')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api<Paginated<Supplier>>('/admin/suppliers?per_page=100').then((r) => setSuppliers(r.data))
  }, [])

  function toggle(id: number) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const items = itemTitle.trim()
        ? [{ title: itemTitle.trim(), qty: Number(itemQty) || undefined }]
        : []
      const res = await api<{ data: { id: number } }>('/admin/rfqs', {
        method: 'POST',
        json: {
          buyer_name: buyerName,
          buyer_phone: buyerPhone || null,
          buyer_email: buyerEmail || null,
          buyer_company: buyerCompany || null,
          buyer_city: buyerCity || null,
          comment: comment || null,
          supplier_ids: selected,
          items,
        },
      })
      navigate(`/rfqs/${res.data.id}`)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не удалось создать заявку')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <Link to="/rfqs" className="text-sm text-slate-500 hover:underline">
        ← К заявкам
      </Link>
      <h1 className="mt-2 text-2xl font-semibold">Новая заявка</h1>
      <p className="mb-6 text-sm text-slate-500">
        Создаётся в базе сразу. Админу уйдёт пуш в бота. Поставщику — только после подтверждения.
      </p>

      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border bg-white p-6">
        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Покупатель *</span>
            <input value={buyerName} onChange={(e) => setBuyerName(e.target.value)} required className="w-full rounded-lg border px-3 py-2" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Телефон</span>
            <input value={buyerPhone} onChange={(e) => setBuyerPhone(e.target.value)} className="w-full rounded-lg border px-3 py-2" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Email</span>
            <input type="email" value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)} className="w-full rounded-lg border px-3 py-2" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Компания</span>
            <input value={buyerCompany} onChange={(e) => setBuyerCompany(e.target.value)} className="w-full rounded-lg border px-3 py-2" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Город</span>
            <input value={buyerCity} onChange={(e) => setBuyerCity(e.target.value)} className="w-full rounded-lg border px-3 py-2" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Позиция</span>
            <input value={itemTitle} onChange={(e) => setItemTitle(e.target.value)} placeholder="Гофрокороб 400×300×200" className="w-full rounded-lg border px-3 py-2" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Кол-во</span>
            <input value={itemQty} onChange={(e) => setItemQty(e.target.value)} className="w-full rounded-lg border px-3 py-2" />
          </label>
        </div>

        <label className="block text-sm">
          <span className="mb-1 block font-medium">Комментарий</span>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="w-full rounded-lg border px-3 py-2" rows={3} />
        </label>

        <div>
          <div className="mb-2 text-sm font-medium">Поставщики *</div>
          <div className="rounded-lg border">
            {suppliers.map((s) => (
              <label key={s.id} className="flex items-center gap-2 border-t px-3 py-2 text-sm">
                <input type="checkbox" checked={selected.includes(s.id)} onChange={() => toggle(s.id)} />
                <span className="flex-1">{s.commercial_name}</span>
                <span className="text-xs text-slate-500">
                  {s.telegram_status === 'linked' ? 'TG ок' : s.telegram ? 'ждём Start' : 'нет TG'}
                </span>
              </label>
            ))}
          </div>
        </div>

        <button type="submit" disabled={saving || !buyerName || selected.length === 0} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
          {saving ? 'Создаю…' : 'Создать заявку'}
        </button>
      </form>
    </div>
  )
}
