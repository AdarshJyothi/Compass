const BASE = '/api'

let token = localStorage.getItem('fp_token')

export function setToken(t) {
  token = t
  if (t) localStorage.setItem('fp_token', t)
  else localStorage.removeItem('fp_token')
}

export function getToken() {
  return token
}

export async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  })
  if (res.status === 401 && !path.startsWith('/auth/')) {
    setToken(null)
    window.dispatchEvent(new Event('fp-logout'))
  }
  if (!res.ok) {
    let msg = 'Request failed'
    try {
      const d = await res.json()
      msg = typeof d.detail === 'string' ? d.detail : msg
    } catch (e) { /* ignore */ }
    throw new Error(msg)
  }
  return res.json()
}
