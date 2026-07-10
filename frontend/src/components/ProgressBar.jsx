export default function ProgressBar({ value, max, color = '#34d399' }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  const over = max > 0 && value > max
  return (
    <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-ink-600">
      <div
        className="h-1.5 rounded-full transition-all"
        style={{ width: `${pct}%`, backgroundColor: over ? '#e24b4a' : color }}
      />
    </div>
  )
}
