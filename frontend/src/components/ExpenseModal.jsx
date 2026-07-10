import { useState } from 'react'
import Modal from './Modal'
import { api } from '../api'
import { todayISO } from '../format'

export default function ExpenseModal({ categories, initial, onClose, onSaved }) {
  const editing = Boolean(initial?.id)
  const [amount, setAmount] = useState(initial?.amount ?? '')
  const [categoryId, setCategoryId] = useState(initial?.category_id ?? categories[0]?.id ?? '')
  const [date, setDate] = useState(initial?.date ?? todayISO())
  const [note, setNote] = useState(initial?.note ?? '')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  async function save(e) {
    e.preventDefault()
    setErr('')
    setBusy(true)
    try {
      const body = { amount: Number(amount), category_id: Number(categoryId), date, note }
      if (editing) await api(`/expenses/${initial.id}`, { method: 'PUT', body })
      else await api('/expenses', { method: 'POST', body })
      onSaved()
      onClose()
    } catch (ex) {
      setErr(ex.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal title={editing ? 'Edit expense' : 'Add expense'} onClose={onClose}>
      <form onSubmit={save} className="space-y-3">
        <div>
          <label className="label">Amount (INR)</label>
          <input
            className="input text-lg"
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="450"
            autoFocus
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Category</label>
            <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Date</label>
            <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
        </div>
        <div>
          <label className="label">Note (optional)</label>
          <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Dinner at Swiggy" />
        </div>
        {err && <p className="text-sm text-red-500">{err}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={busy}>
            {editing ? 'Save changes' : 'Add expense'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
