import { useEffect, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { api } from '../api'
import { inr } from '../format'
import StatCard from '../components/StatCard'

export default function Forecast() {
  const [months, setMonths] = useState(12)
  const [growth, setGrowth] = useState(0)
  const [expChange, setExpChange] = useState(0)
  const [d, setD] = useState(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    const t = setTimeout(() => {
      api(`/forecast?months=${months}&salary_growth_pct=${growth}&expense_change_pct=${expChange}`)
        .then(setD)
        .catch((e) => setErr(e.message))
    }, 200)
    return () => clearTimeout(t)
  }, [months, growth, expChange])

  return (
    <div className="space-y-4 p-6">
      <div>
        <h1 className="text-xl font-semibold">Forecast</h1>
        <p className="text-xs text-gray-500 dark:text-ink-400">
          Projected from your salary, fixed costs, and average variable spending.
        </p>
      </div>

      <div className="card grid gap-5 p-4 sm:grid-cols-3">
        <div>
          <div className="mb-1 flex justify-between text-xs text-gray-500 dark:text-ink-400">
            <span>Horizon</span><span className="font-medium text-gray-800 dark:text-gray-200">{months} months</span>
          </div>
          <input type="range" min="6" max="60" step="1" value={months} onChange={(e) => setMonths(Number(e.target.value))} className="w-full accent-emerald-500" />
        </div>
        <div>
          <div className="mb-1 flex justify-between text-xs text-gray-500 dark:text-ink-400">
            <span>Salary growth / year</span><span className="font-medium text-gray-800 dark:text-gray-200">{growth}%</span>
          </div>
          <input type="range" min="0" max="30" step="1" value={growth} onChange={(e) => setGrowth(Number(e.target.value))} className="w-full accent-emerald-500" />
        </div>
        <div>
          <div className="mb-1 flex justify-between text-xs text-gray-500 dark:text-ink-400">
            <span>Spending change</span><span className="font-medium text-gray-800 dark:text-gray-200">{expChange > 0 ? '+' : ''}{expChange}%</span>
          </div>
          <input type="range" min="-30" max="30" step="1" value={expChange} onChange={(e) => setExpChange(Number(e.target.value))} className="w-full accent-emerald-500" />
        </div>
      </div>

      {err && <p className="text-sm text-red-500">{err}</p>}

      {d && (
        <>
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <StatCard label="Savings / month (now)" value={inr(d.monthly_net)} tone={d.monthly_net >= 0 ? 'good' : 'bad'} />
            <StatCard label={`Total saved in ${months} months`} value={inr(d.series[d.series.length - 1]?.cumulative)} tone="violet" />
            <StatCard label="Fixed costs / month" value={inr(d.assumptions.fixed_total)} />
            <StatCard label="Avg variable spend / month" value={inr(d.assumptions.avg_variable)} />
          </div>

          <div className="card p-4">
            <h2 className="mb-2 text-sm font-semibold">Cumulative savings</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={d.series} margin={{ top: 5, right: 5, bottom: 0, left: 5 }}>
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#8b93a3" interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#8b93a3" width={70} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                  <Tooltip formatter={(v, n) => [inr(v), n === 'cumulative' ? 'Total saved' : n]} />
                  <ReferenceLine y={0} stroke="#e24b4a" strokeDasharray="4 4" />
                  <Area type="monotone" dataKey="cumulative" stroke="#7f77dd" fill="#7f77dd33" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {d.assumptions.avg_variable === 0 && (
              <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                No spending history yet — the forecast will get smarter as you log expenses.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
