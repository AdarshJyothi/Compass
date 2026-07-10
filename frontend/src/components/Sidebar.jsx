import { Compass, LayoutDashboard, ReceiptText, TrendingUp, Settings, Sun, Moon, LogOut } from 'lucide-react'
import { useTheme } from '../theme'

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'expenses', label: 'Expenses', icon: ReceiptText },
  { id: 'forecast', label: 'Forecast', icon: TrendingUp },
  { id: 'settings', label: 'Settings', icon: Settings }
]

export default function Sidebar({ page, setPage, user, onLogout }) {
  const { theme, toggle } = useTheme()
  return (
    <aside className="flex w-52 shrink-0 flex-col border-r border-gray-200 bg-white p-3 dark:border-ink-600 dark:bg-ink-950">
      <div className="mb-4 flex items-center gap-2 px-2 py-2 text-emerald-500 dark:text-emerald-400">
        <Compass size={22} />
        <span className="text-lg font-semibold tracking-tight">FinPilot</span>
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map(({ id, label, icon: Ico }) => (
          <button
            key={id}
            onClick={() => setPage(id)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
              page === id
                ? 'bg-emerald-50 font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                : 'text-gray-600 hover:bg-gray-100 dark:text-ink-400 dark:hover:bg-ink-800'
            }`}
          >
            <Ico size={17} />
            {label}
          </button>
        ))}
      </nav>
      <div className="space-y-1 border-t border-gray-200 pt-3 dark:border-ink-600">
        <button
          onClick={toggle}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-ink-400 dark:hover:bg-ink-800"
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-ink-400 dark:hover:bg-ink-800"
        >
          <LogOut size={17} />
          <span className="truncate">Log out{user?.name ? ` (${user.name})` : ''}</span>
        </button>
      </div>
    </aside>
  )
}
