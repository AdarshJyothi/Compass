import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { api } from '../api'
import { inr, shortDate, thisMonth } from '../format'
import CategoryIcon from '../components/CategoryIcon'
import ExpenseModal from '../components/ExpenseModal'

export default function Expenses({ categories }) {
  const [month, setMonth] = useState(thisMonth())
  const [catFilter, setCatFilter] = useState('')
  const [rows, setRows] = useState([])
  const [modal, setModal] = useState(null)
  const [err, setErr] = useState('')

  const catById = Object.fromEntries(categories.map((c) => [c.id, c]))

  const load = () => {
    const q = new URLSearchParams({ month })
    if (catFilter) q.set('category_id', catFilter)
    api(`/expenses?${q}`).then(setRows).catch((e) => setErr(e.message))
  }
  useEffect(() => { load() }, [month, catFilter])

  async function del(id) {
    if (!confirm('Delete this expense?')) return
    await api(`/expenses/${id}`, { method: 'DELETE' })
    load()
  }

  const total = rows.reduce((s, r) => s + r.amount, 0)

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Expenses</h1>
          <p className="text-xs text-gray-500 dark:text-ink-400">{rows.length} entries · {inr(total)}</p>
        </div>
        <div className="flex items-center gap-2">
          <input type="month" className="input w-auto" value={month} onChange={(e) => setMonth(e.target.value)} />
          <select className="input w-auto" value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button className="btn-primary" onClick={() => setModal({})}>
            <Plus size={16} /> Add
          </button>
        </div>
      </div>

      {err && <p className="text-sm text-red-500">{err}</p>}

      <div className="card divide-y divide-gray-100 dark:divide-ink-600">
        {rows.length === 0 && (
          <p className="p-6 text-sm text-gray-500 dark:text-ink-400">No expenses for this filter.</p>
        )}
        {rows.map((e) => {
          const c = catById[e.category_id]
          return (
            <div key={e.id} className="group flex items-center gap-3 px-4 py-2.5">
              <CategoryIcon icon={c?.icon} color={c?.color} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{e.note || c?.name || 'Expense'}</p>
                <p className="text-xs text-gray-500 dark:text-ink-400">{shortDate(e.date)} · {c?.name}</p>
              </div>
              <span className="text-sm font-medium">{inr(e.amount)}</span>
              <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                <button className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-ink-700 dark:hover:text-gray-200" onClick={() => setModal(e)} aria-label="Edit">
                  <Pencil size={15} />
                </button>
                <button className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10" onClick={() => del(e.id)} aria-label="Delete">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {modal && (
        <ExpenseModal
          categories={categories}
          initial={modal.id ? modal : null}
          onClose={() => setModal(null)}
          onSaved={load}
        />
      )}
    </div>
  )
}
