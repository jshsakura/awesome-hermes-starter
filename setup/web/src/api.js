import { demoApi } from './demo.js'

// The GitHub Pages build has no server behind it, so requests go to canned
// answers instead. Same components, same copy — only the transport differs.
const DEMO = import.meta.env.VITE_DEMO === '1'

// One request helper for the whole app. The session cookie rides along on its
// own; this only has to carry JSON, surface the server's error text instead of
// a bare status code, and flag a 401 so the app can fall back to the login form.
export async function api(path, options = {}) {
  if (DEMO) return demoApi(path, options)

  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const body = await res.json().catch(() => ({}))
  if (res.status === 401) {
    const err = new Error(body.error || 'not signed in')
    err.unauthorized = true
    throw err
  }
  if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`)
  return body
}
