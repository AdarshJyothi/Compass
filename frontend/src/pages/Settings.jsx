import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Check } from 'lucide-react'
import { api } from '../api'
import { inr } from '../format'
import CategoryIcon from '../components/CategoryIcon'

const COLORS = ['#34d399', '#5dcaa5', '#1d9e75', '#378add', '#85b7eb', '#7f77dd', '#efa227', '#f0997b', '#e24b4a', '#d4537e', '#ed93b1', '#888780']
const ICONS = ['utensils', 'shopping-basket', 'home', 'car', 'plug', 'heart-pulse', 'graduation-cap', 'tv', 'clapperboard', 'shopping-bag', 'plane', 'package']

function Section({ title, sub, children }) {
  return (
    <div className="card p-4">
      <h2 className="text-sm font-semibold">{title}</h2>
      {sub && <p className="mb-3 mt-0.5 text-xs text-gray-500 dark:text-ink-400">{sub}</p>}
      {children}
    </div>
  )
}

export default function Settings({ categories, onCategoriesChanged }) {
  const [s, setS] = useState(null)
  const [saved, setSaved] = useState(false)
  const [err, setErr] = useState('')

  const [recurring, setRecurring] = useState([])
  const emptyRec = { name: '', amount: '', day_of_month: 1, category_id: '', active: true }
  const [recForm, setRecForm] = useState(emptyRec)
  const [recEditId, setRecEditId] = useState(null)

  const [newCat, setNewCat] = useState({ name: '', kind: 'want', color: COLORS[0], icon: 'package' })

  const loadRec = () => api('/recurring').then(setRecurring).catch((e) => setErr(e.message))

  useEffect(() => {
    api('/settings').then(setS).catch((e) => setErr(e.message))
    loadRec()
  }, [])

  if (!s) return err ? <p className="p-6 text-sm text-red-500">{err}</p> : null

  const pctSum = Number(s.needs_pct) + Number(s.wants_pct) + Number(s.savings_pct)

  async function saveSettings(e) {
    e.preventDefault()
    setErr('')
    try {
      const d = await api('/settings', {
        method: 'PUT',
        body: {
          monthly_salary: Number(s.monthly_salary),
          savings_pct: Number(s.savings_pct),
          needs_pct: Number(s.needs_pct),
          wants_pct: Number(s.wants_pct)
        }
      })
      setS(d)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (ex) {
      setErr(ex.message)
    }
  }

  async function saveRec(e) {
    e.preventDefault()
    setErr('')
    try {
      const body = {
        name: recForm.name,
        amount: Number(recForm.amount),
        day_of_month: Number(recForm.day_of_month),
        category_id: Number(recForm.category_id || categories[0]?.id),
        active: recForm.active
      }
      if (recEditId) await api(`/recurring/${recEditId}`, { method: 'PUT', body })
      else await api('/recurring', { method: 'POST', body })
      setRecForm(emptyRec)
      setRecEditId(null)
      loadRec()
    } catch (ex) {
      setErr(ex.message)
    }
  }

  async function toggleRec(r) {
    await api(`/recurring/${r.id}`, { method: 'PUT', body: { ...r, active: !r.active } })
    loadRec()
  }

  async function delRec(id) {
    if (!confirm('Delete this fixed cost?')) return
    await api(`/recurring/${id}`, { method: 'DELETE' })
    loadRec()
  }

  async function toggleKind(c) {
    await api(`/categories/${c.id}`, { method: 'PUT', body: { ...c, kind: c.kind === 'need' ? 'want' : 'need' } })
    onCategoriesChanged()
  }

  async function addCat(e) {
    e.preventDefault()
    if (!newCat.name.trim()) return
    setErr('')
    try {
      await api('/categories', { method: 'POST', body: newCat })
      setNewCat({ name: '', kind: 'want', color: COLORS[0], icon: 'package' })
      onCategoriesChanged()
    } catch (ex) {
      setErr(ex.message)
    }
  }

  async function delCat(id) {
    setErr('')
    try {
      await api(`/categories/${id}`, { method: 'DELETE' })
      onCategoriesChanged()
    } catch (ex) {
      setErr(ex.message)
    }
  }

  const fixedTotal = recurring.filter((r) => r.active).reduce((t, r) => t + r.amount, 0)

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-xl font-semibold">Settings</h1>
      {err && <p className="text-sm text-red-500">{err}</p>}

      <Section title="Income & budget split" sub="Your salary and how it should be divided across needs, wants, and savings.">
        <form onSubmit={saveSettings} className="grid gap-3 sm:grid-cols-4">
          <div>
            <label className="label">Monthly salary (INR)</label>
            <input className="input" type="number" min="0" value={s.monthly_salary} onChange={(e) => setS({ ...s, monthly_salary: e.target.value })} />
          </div>
          <div>
            <label className="label">Needs %</label>
            <input className="input" type="number" min="0" max="100" value={s.needs_pct} onChange={(e) => setS({ ...s, needs_pct: e.target.value })} />
          </div>
          <div>
            <label className="label">Wants %</label>
            <input className="input" type="number" min="0" max="100" value={s.wants_pct} onChange={(e) => setS({ ...s, wants_pct: e.target.value })} />
          </div>
          <div>
            <label className="label">Savings %</label>
            <input className="input" type="number" min="0" max="100" value={s.savings_pct} onChange={(e) => setS({ ...s, savings_pct: e.target.value })} />
          </div>
          <div className="sm:col-span-4 flex items-center gap-3">
            <button className="btn-primary" type="submit">{saved ? <><Check size={16} /> Saved</> : 'Save'}</button>
            {pctSum !== 100 && (
              <span className="text-xs text-amber-600 dark:text-amber-400">Split adds up to {pctSum}% — usually this should be 100%.</span>
            )}
          </div>
        </form>
      </Section>

      <Section title={`Fixed monthly costs · ${inr(fixedTotal)}/month`} sub="Rent, EMIs, subscriptions — anything that leaves your account every month.">
        <form onSubmit={saveRec} className="mb-3 grid gap-2 sm:grid-cols-[1fr_120px_90px_1fr_auto]">
          <input className="input" placeholder="Name (e.g. Rent)" value={recForm.name} onChange={(e) => setRecForm({ ...recForm, name: e.target.value })} required />
          <input className="input" type="number" min="1" placeholder="Amount" value={recForm.amount} onChange={(e) => setRecForm({ ...recForm, amount: e.target.value })} required />
          <input className="input" type="number" min="1" max="28" title="Day of month" value={recForm.day_of_month} onChange={(e) => setRecForm({ ...recForm, day_of_month: e.target.value })} />
          <select className="input" value={recForm.category_id} onChange={(e) => setRecForm({ ...recForm, category_id: e.target.value })}>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div className="flex gap-2">
            <button className="btn-primary" type="submit">{recEditId ? 'Save' : <><Plus size={16} /> Add</>}</button>
            {recEditId && <button type="button" className="btn-ghost" onClick={() => { setRecEditId(null); setRecForm(emptyRec) }}>Cancel</button>}
          </div>
        </form>
        <div className="divide-y divide-gray-100 dark:divide-ink-600">
          {recurring.map((r) => (
            <div key={r.id} className={`flex items-center gap-3 py-2 ${r.active ? '' : 'opacity-50'}`}>
              <button
                onClick={() => toggleRec(r)}
                className={`h-5 w-9 shrink-0 rounded-full p-0.5 transition ${r.active ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-ink-500'}`}
                aria-label="Toggle active"
              >
                <span className={`block h-4 w-4 rounded-full bg-white transition ${r.active ? 'translate-x-4' : ''}`} />
              </button>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{r.name}</p>
                <p className="text-xs text-gray-500 dark:text-ink-400">day {r.day_of_month} · {categories.find((c) => c.id === r.category_id)?.name}</p>
              </div>
              <span className="text-sm font-medium">{inr(r.amount)}</span>
              <button className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-ink-700 dark:hover:text-gray-200" onClick={() => { setRecEditId(r.id); setRecForm(r) }} aria-label="Edit">
                <Pencil size={15} />
              </button>
              <button className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10" onClick={() => delRec(r.id)} aria-label="Delete">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
          {recurring.length === 0 && <p className="py-3 text-sm text-gray-500 dark:text-ink-400">No fixed costs yet. Add rent, EMIs, subscriptions above.</p>}
        </div>
      </Section>

      <Section title="Categories" sub="Click the need/want badge to reclassify — it changes how spending counts against your budget split.">
        <form onSubmit={addCat} className="mb-3 grid gap-2 sm:grid-cols-[1fr_110px_130px_110px_auto]">
          <input className="input" placeholder="New category name" value={newCat.name} onChange={(e) => setNewCat({ ...newCat, name: e.target.value })} />
          <select className="input" value={newCat.kind} onChange={(e) => setNewCat({ ...newCat, kind: e.target.value })}>
            <option value="need">need</option>
            <option value="want">want</option>
          </select>
          <select className="input" value={newCat.icon} onChange={(e) => setNewCat({ ...newCat, icon: e.target.value })}>
            {ICONS.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
          <select className="input" value={newCat.color} onChange={(e) => setNewCat({ ...newCat, color: e.target.value })} style={{ color: newCat.color }}>
            {COLORS.map((c) => <option key={c} value={c} style={{ color: c }}>{c}</option>)}
          </select>
          <button className="btn-primary" type="submit"><Plus size={16} /> Add</button>
        </form>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <div key={c.id} className="group flex items-center gap-2 rounded-lg border border-gray-200 p-2 dark:border-ink-600">
              <CategoryIcon icon={c.icon} color={c.color} />
              <span className="min-w-0 flex-1 truncate text-sm">{c.name}</span>
              <button
                onClick={() => toggleKind(c)}
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  c.kind === 'need'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400'
                }`}
              >
                {c.kind}
              </button>
              <button className="rounded p-1 text-gray-300 opacity-0 transition hover:text-red-500 group-hover:opacity-100 dark:text-ink-500" onClick={() => delCat(c.id)} aria-label="Delete category">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}
