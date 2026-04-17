// Google Identity Services — implicit token flow (no redirect URI needed)
let tokenClient  = null
let _accessToken = localStorage.getItem('gmail_access_token') || null
let _userEmail   = localStorage.getItem('gmail_user_email')   || null

export function isGmailConnected() { return !!_accessToken }
export function getGmailEmail()    { return _userEmail }

export function disconnectGmail() {
  const tokenToRevoke = _accessToken
  _accessToken = null
  _userEmail   = null
  localStorage.removeItem('gmail_access_token')
  localStorage.removeItem('gmail_user_email')
  if (tokenToRevoke && window.google?.accounts?.oauth2) {
    window.google.accounts.oauth2.revoke(tokenToRevoke, () => {})
  }
}

function loadGIS(callback) {
  if (window.google?.accounts?.oauth2) { callback(); return }
  const s = document.createElement('script')
  s.src = 'https://accounts.google.com/gsi/client'
  s.async = true
  s.defer = true
  s.onload  = callback
  s.onerror = () => console.error('Failed to load Google Identity Services')
  document.head.appendChild(s)
}

export function connectGmail(onSuccess, onError) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  if (!clientId) { onError?.('VITE_GOOGLE_CLIENT_ID not set'); return }

  loadGIS(() => {
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: [
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/userinfo.email',
      ].join(' '),
      callback: async (res) => {
        if (res.error) { onError?.(res.error); return }
        _accessToken = res.access_token
        localStorage.setItem('gmail_access_token', _accessToken)
        try {
          const r    = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${_accessToken}` },
          })
          if (r.ok) {
            const info = await r.json()
            if (info.email) {
              _userEmail = info.email
              localStorage.setItem('gmail_user_email', _userEmail)
            }
          }
        } catch (err) {
          console.warn('Failed to fetch Gmail user info:', err)
        }
        onSuccess?.(_userEmail)
      },
    })
    tokenClient.requestAccessToken({ prompt: '' })
  })
}

export async function sendReminderEmail(subject, bodyHtml) {
  if (!_accessToken) throw new Error('Gmail not connected')
  const to = _userEmail || 'me'
  const raw = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    '',
    bodyHtml,
  ].join('\r\n')

  const encoded = btoa(unescape(encodeURIComponent(raw)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method:  'POST',
    headers: { Authorization: `Bearer ${_accessToken}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify({ raw: encoded }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    if (res.status === 401) { _accessToken = null; localStorage.removeItem('gmail_access_token') }
    throw new Error(err.error?.message || 'Send failed')
  }
  return res.json()
}
