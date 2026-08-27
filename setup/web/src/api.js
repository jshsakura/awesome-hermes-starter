// One request helper for the whole app. The session cookie rides along on its
// own; this only has to carry JSON, surface the server's error text instead of
// a bare status code, and flag a 401 so the app can fall back to the login form.
export async function api(path, options = {}) {
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
