import { useEffect, useState } from 'react'
import { Compass, Sun, Moon } from 'lucide-react'
import { api, setToken } from '../api'
import { useTheme } from '../theme'

export default function Login({ onAuthed }) {
  const { theme, toggle } = useTheme()
  const [setupComplete, setSetupComplete] = useState(null)
  const [username, setUsername] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api('/auth/status').then((d) => setSetupComplete(d.setup_complete)).catch(() => setSetupComplete(true))
  }, [])

  async function submit(e) {
    e.preventDefault()
    setErr('')
    setBusy(true)
    try {
      const path = setupComplete ? '/auth/login' : '/auth/register'
      const body = setupComplete ? { username, password } : { username, password, name }
      const d = await api(path, { method: 'POST', body })
      setToken(d.token)
      onAuthed({ name: d.name, username: d.username })
    } catch (ex) {
      setErr(ex.message)
    } finally {
      setBusy(false)
    }
  }

  if (setupComplete === null) return null

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <button
        onClick={toggle}
        className="btn-ghost fixed right-4 top-4"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </button>
      <div className="card w-full max-w-sm p-6">
        <div className="mb-5 flex items-center gap-2 text-emerald-500 dark:text-emerald-400">
          <Compass size={26} />
          <span className="text-xl font-semibold">FinPilot</span>
        </div>
        <h1 className="mb-1 text-lg font-semibold">
          {setupComplete ? 'Welcome back' : 'Create your account'}
        </h1>
        <p className="mb-4 text-sm text-gray-500 dark:text-ink-400">
          {setupComplete ? 'Log in to your money cockpit.' : 'One-time setup. Your data stays on this computer.'}
        </p>
        <form onSubmit={submit} className="space-y-3">
          {!setupComplete && (
            <div>
              <label className="label">Your name</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </div>
          )}
          <div>
            <label className="label">Username</label>
            <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} required minLength={3} />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>
          {err && <p className="text-sm text-red-500">{err}</p>}
          <button className="btn-primary w-full justify-center" disabled={busy}>
            {setupComplete ? 'Log in' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  )
}
