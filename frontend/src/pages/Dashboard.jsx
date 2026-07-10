import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { api } from '../api'
import { inr, shortDate } from '../format'
import StatCard from '../components/StatCard'
import ProgressBar from '../components/ProgressBar'
import CategoryIcon from '../components/CategoryIcon'
import ExpenseModal from '../components/ExpenseModal'

export default function Dashboard({ categories, setPage }) {
  const [d, setD] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [err, setErr] = useState('')

  const load = () => api('/dashboard').then(setD).catch((e) => setErr(e.message))
  useEffect(() => { load() }, [])

  if (err) return <p className="p-6 text-sm text-red-500">{err}</p>
  if (!d) return null

  const catById = Object.fromEntries(categories.map((c) => [c.id, c]))
  const maxCat = d.category_breakdown[0]?.amount || 1
  const b = d.budget

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{d.month_label}</h1>
          <p className="text-xs text-gray-500 dark:text-ink-400">{d.days_left} days left this month</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Add expense
        </button>
      </div>

      {d.setup_needed && (
        <div className="card flex items-center justify-between border-amber-300 bg-amber-50 p-4 dark:border-amber-500/40 dark:bg-amber-500/10">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            Set your monthly salary and fixed costs to unlock budgets and forecasts.
          </p>
          <button className="btn-ghost shrink-0" onClick={() => setPage('settings')}>Open settings</button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          label="Spent this month"
          value={inr(d.total_spent)}
          sub={d.salary > 0 ? `${Math.round((d.total_spent / d.salary) * 100)}% of salary` : 'incl. fixed costs'}
        />
        <StatCard label="Safe to spend / day" value={inr(d.safe_to_spend_per_day)} sub="keeps savings on target" tone="good" />
        <StatCard label="Left this month" value={inr(d.left_this_month)} sub={`of ${inr(d.salary)} salary`} />
        <StatCard
          label="Projected savings"
          value={inr(d.projected_savings)}
          sub={`target ${inr(d.savings_target)}`}
          tone={d.projected_savings >= d.savings_target ? 'good' : 'warn'}
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="card p-4">
          <h2 className="mb-3 text-sm font-semibold">Spending by category</h2>
          {d.category_breakdown.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-ink-400">No expenses yet this month. Add your first one.</p>
          )}
          <div className="space-y-3">
            {d.category_breakdown.slice(0, 6).map((c) => (
              <div key={c.category_id}>
                <div className="mb-1 flex justify-between text-xs text-gray-500 dark:text-ink-400">
                  <span>{c.name}</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">{inr(c.amount)}</span>
                </div>
                <ProgressBar value={c.amount} max={maxCat} color={c.color} />
              </div>
            ))}
          </div>
        </div>

        <div className="card p-4">
          <h2 className="mb-3 text-sm font-semibold">Budget health · {100 - Math.round((d.savings_target / (d.salary || 1)) * 100)}/{Math.round((d.savings_target / (d.salary || 1)) * 100)} split</h2>
          <div className="space-y-3">
            <div>
              <div className="mb-1 flex justify-between text-xs text-gray-500 dark:text-ink-400">
                <span>Needs</span>
                <span>{inr(b.needs.spent)} / {inr(b.needs.budget)}</span>
              </div>
              <ProgressBar value={b.needs.spent} max={b.needs.budget} color="#34d399" />
            </div>
            <div>
              <div className="mb-1 flex justify-between text-xs text-gray-500 dark:text-ink-400">
                <span>Wants</span>
                <span>{inr(b.wants.spent)} / {inr(b.wants.budget)}</span>
              </div>
              <ProgressBar value={b.wants.spent} max={b.wants.budget} color="#efa227" />
            </div>
            <div>
              <div className="mb-1 flex justify-between text-xs text-gray-500 dark:text-ink-400">
                <span>Savings (projected vs target)</span>
                <span>{inr(b.savings.projected)} / {inr(b.savings.target)}</span>
              </div>
              <ProgressBar value={Math.max(0, b.savings.projected)} max={b.savings.target || 1} color="#7f77dd" />
            </div>
          </div>
          <h2 className="mb-2 mt-5 text-sm font-semibold">Upcoming bills</h2>
          {d.upcoming_bills.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-ink-400">Nothing due later this month.</p>
          ) : (
            <div className="space-y-1.5">
              {d.upcoming_bills.slice(0, 4).map((u) => (
                <div key={u.id} className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-ink-400">{u.name} · day {u.day_of_month}</span>
                  <span className="font-medium">{inr(u.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="card p-4">
          <h2 className="mb-2 text-sm font-semibold">Cumulative spend this month</h2>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={d.daily_cumulative} margin={{ top: 5, right: 5, bottom: 0, left: 5 }}>
                <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#8b93a3" />
                <YAxis tick={{ fontSize: 11 }} stroke="#8b93a3" width={55} tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)} />
                <Tooltip formatter={(v) => inr(v)} labelFormatter={(l) => `Day ${l}`} />
                <Area type="monotone" dataKey="spent" stroke="#34d399" fill="#34d39933" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-4">
          <h2 className="mb-3 text-sm font-semibold">Recent expenses</h2>
          {d.recent.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-ink-400">Nothing logged yet.</p>
          ) : (
            <div className="space-y-2">
              {d.recent.map((e) => {
                const c = catById[e.category_id]
                return (
                  <div key={e.id} className="flex items-center gap-3">
                    <CategoryIcon icon={c?.icon} color={c?.color} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">{e.note || c?.name || 'Expense'}</p>
                      <p className="text-xs text-gray-500 dark:text-ink-400">{shortDate(e.date)} · {c?.name}</p>
                    </div>
                    <span className="text-sm font-medium">{inr(e.amount)}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {showAdd && (
        <ExpenseModal categories={categories} onClose={() => setShowAdd(false)} onSaved={load} />
      )}
    </div>
  )
}
