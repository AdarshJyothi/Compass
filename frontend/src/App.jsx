import { useEffect, useState } from 'react'
import { api, getToken, setToken } from './api'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Expenses from './pages/Expenses'
import Forecast from './pages/Forecast'
import Settings from './pages/Settings'

export default function App() {
  const [user, setUser] = useState(undefined)
  const [page, setPage] = useState('dashboard')
  const [categories, setCategories] = useState([])

  const loadCats = () => api('/categories').then(setCategories).catch(() => {})

  useEffect(() => {
    const onLogout = () => setUser(null)
    window.addEventListener('fp-logout', onLogout)
    return () => window.removeEventListener('fp-logout', onLogout)
  }, [])

  useEffect(() => {
    if (!getToken()) {
      setUser(null)
      return
    }
    api('/auth/me').then(setUser).catch(() => setUser(null))
  }, [])

  useEffect(() => {
    if (user) loadCats()
  }, [user])

  if (user === undefined) return null
  if (!user) return <Login onAuthed={(u) => { setUser(u); setPage('dashboard') }} />

  const pages = {
    dashboard: <Dashboard categories={categories} setPage={setPage} />,
    expenses: <Expenses categories={categories} />,
    forecast: <Forecast />,
    settings: <Settings categories={categories} onCategoriesChanged={loadCats} />
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar
        page={page}
        setPage={setPage}
        user={user}
        onLogout={() => { setToken(null); setUser(null) }}
      />
      <main className="min-w-0 flex-1">{pages[page]}</main>
    </div>
  )
}
