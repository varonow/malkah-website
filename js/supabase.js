/* ============================================================
   MALKAH — supabase.js
   Database interactions + admin auth with auto-refresh
   ============================================================ */

const SUPABASE_URL      = 'https://rdkjxzjplguvyrjevqyn.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_9_uBtxS71qO2zqTk7x30Sw_7Tem1Cw7'

// ── Helper to build request headers ───────────────────────────
function authHeaders() {
  const token = localStorage.getItem('sb-access-token')
  return {
    'Content-Type':  'application/json',
    'apikey':        SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${token || SUPABASE_ANON_KEY}`,
  }
}

// ── Token refresh ─────────────────────────────────────────────
async function refreshSession() {
  const refreshToken = localStorage.getItem('sb-refresh-token')
  if (!refreshToken) return false
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
    if (!res.ok) return false
    const data = await res.json()
    localStorage.setItem('sb-access-token', data.access_token)
    localStorage.setItem('sb-refresh-token', data.refresh_token)
    if (data.user) localStorage.setItem('sb-user', JSON.stringify(data.user))
    return true
  } catch { return false }
}

// ── Authenticated fetch with auto-refresh on 401 ─────────────
async function authFetch(url, options = {}) {
  options.headers = { ...(options.headers || {}), ...authHeaders() }
  let res = await fetch(url, options)
  if (res.status === 401 && localStorage.getItem('sb-refresh-token')) {
    const refreshed = await refreshSession()
    if (refreshed) {
      options.headers = { ...(options.headers || {}), ...authHeaders() }
      res = await fetch(url, options)
    } else {
      // Refresh failed — log out and redirect
      logout()
      if (window.location.pathname.startsWith('/admin/')) {
        window.location.href = '/admin/login.html'
      }
    }
  }
  return res
}

// ── Contact form submission ───────────────────────────────────
async function submitContact(data) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/contact_submissions`, {
      method: 'POST',
      headers: { ...authHeaders(), 'Prefer': 'return=minimal' },
      body: JSON.stringify(data),
    })
    return res.ok
  } catch (err) { console.error('Contact submit:', err); return false }
}

// ── Notify me email ───────────────────────────────────────────
async function saveNotifyEmail(email) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/notify_emails`, {
      method: 'POST',
      headers: { ...authHeaders(), 'Prefer': 'return=minimal' },
      body: JSON.stringify({ email }),
    })
    return res.ok
  } catch (err) { console.error('Notify email:', err); return false }
}

// ── Auth ──────────────────────────────────────────────────────
async function login(email, password) {
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) return { ok: false, error: data.error_description || data.msg || 'Login failed' }
    localStorage.setItem('sb-access-token', data.access_token)
    localStorage.setItem('sb-refresh-token', data.refresh_token)
    localStorage.setItem('sb-user', JSON.stringify(data.user))
    return { ok: true, user: data.user }
  } catch (err) { return { ok: false, error: String(err) } }
}

function logout() {
  localStorage.removeItem('sb-access-token')
  localStorage.removeItem('sb-refresh-token')
  localStorage.removeItem('sb-user')
}

function currentUser() {
  const u = localStorage.getItem('sb-user')
  return u ? JSON.parse(u) : null
}

function isLoggedIn() { return !!localStorage.getItem('sb-access-token') }

function requireAuth(redirectTo = 'login.html') {
  if (!isLoggedIn()) { window.location.href = redirectTo; return false }
  return true
}

// ── Generic DB helpers (use authFetch for auto-refresh) ───────
async function dbSelect(table, query = '') {
  const url = `${SUPABASE_URL}/rest/v1/${table}${query ? '?' + query : ''}`
  const res = await authFetch(url)
  if (!res.ok) throw new Error(`Select ${table} failed`)
  return res.json()
}

async function dbInsert(table, data) {
  const res = await authFetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: { 'Prefer': 'return=representation' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Insert ${table} failed: ${await res.text()}`)
  return res.json()
}

async function dbUpdate(table, id, data) {
  const res = await authFetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: 'PATCH',
    headers: { 'Prefer': 'return=representation' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Update ${table} failed: ${await res.text()}`)
  return res.json()
}

async function dbDelete(table, id) {
  const res = await authFetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error(`Delete ${table} failed`)
  return true
}

// ── Tutorial-specific lookups ─────────────────────────────────
async function getAllSchools() {
  return dbSelect('schools', 'select=*&order=position.asc,name.asc')
}

async function getSchoolBySlug(slug) {
  const data = await dbSelect('schools', `select=*&slug=eq.${slug}&limit=1`)
  return data[0] || null
}

async function getKitsBySchool(schoolId) {
  return dbSelect('kits', `select=*&school_id=eq.${schoolId}&order=position.asc,name.asc`)
}

async function getKitBySlug(schoolId, slug) {
  const data = await dbSelect('kits', `select=*&school_id=eq.${schoolId}&slug=eq.${slug}&limit=1`)
  return data[0] || null
}

async function getWeeksByKit(kitId) {
  return dbSelect('weeks', `select=*&kit_id=eq.${kitId}&order=number.asc`)
}

async function getWeekByNumber(kitId, number) {
  const data = await dbSelect('weeks', `select=*&kit_id=eq.${kitId}&number=eq.${number}&limit=1`)
  return data[0] || null
}

async function getVideosByWeek(weekId) {
  return dbSelect('videos', `select=*&week_id=eq.${weekId}&order=position.asc`)
}

async function getVideoByPosition(weekId, position) {
  const data = await dbSelect('videos', `select=*&week_id=eq.${weekId}&position=eq.${position}&limit=1`)
  return data[0] || null
}

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name)
}