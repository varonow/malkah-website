/* ============================================================
   MALKAH — supabase.js
   Handles all database interactions.
   Replace SUPABASE_URL and SUPABASE_ANON_KEY with your values
   from supabase.com → Project Settings → API
   ============================================================ */

const SUPABASE_URL      = 'https://rdkjxzjplguvyrjevqyn.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_9_uBtxS71qO2zqTk7x30Sw_7Tem1Cw7'

// ── Submit contact form ───────────────────────────────────────
async function submitContact(data) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/contact_submissions`, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'apikey':        SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer':        'return=minimal',
      },
      body: JSON.stringify(data),
    })
    return res.ok
  } catch (err) {
    console.error('Contact submit error:', err)
    return false
  }
}

// ── Save notify me email ──────────────────────────────────────
async function saveNotifyEmail(email) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/notify_emails`, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'apikey':        SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer':        'return=minimal',
      },
      body: JSON.stringify({ email }),
    })
    return res.ok
  } catch (err) {
    console.error('Notify email error:', err)
    return false
  }
}
