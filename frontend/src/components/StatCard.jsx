export default function StatCard({ label, value, sub, tone = 'default' }) {
  const tones = {
    default: 'text-gray-900 dark:text-gray-100',
    good: 'text-emerald-600 dark:text-emerald-400',
    warn: 'text-amber-600 dark:text-amber-400',
    bad: 'text-red-600 dark:text-red-400',
    violet: 'text-violet-600 dark:text-violet-400'
  }
  return (
    <div className="card p-4">
      <div className="text-xs text-gray-500 dark:text-ink-400">{label}</div>
      <div className={`mt-1 text-xl font-semibold ${tones[tone]}`}>{value}</div>
      {sub && <div className="mt-0.5 text-xs text-gray-500 dark:text-ink-400">{sub}</div>}
    </div>
  )
}
