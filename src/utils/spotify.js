// Spotify PKCE OAuth 2.0 flow
const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || ''
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI || window.location.origin + '/callback'
const SCOPES = [
  'user-read-private', 'user-read-email', 'user-read-playback-state',
  'user-modify-playback-state', 'user-read-currently-playing', 'user-read-recently-played',
  'user-top-read', 'user-library-read', 'user-library-modify',
  'playlist-read-private', 'playlist-read-collaborative', 'playlist-modify-public',
  'playlist-modify-private', 'streaming', 'app-remote-control',
  'user-follow-read', 'user-follow-modify'
].join(' ')

function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const arr = new Uint8Array(length)
  crypto.getRandomValues(arr)
  return Array.from(arr, b => chars[b % chars.length]).join('')
}

async function sha256(plain) {
  const encoder = new TextEncoder()
  const data = encoder.encode(plain)
  return crypto.subtle.digest('SHA-256', data)
}

function base64URLEncode(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

export async function initiateLogin() {
  const codeVerifier = generateRandomString(128)
  const codeChallenge = base64URLEncode(await sha256(codeVerifier))
  const state = generateRandomString(16)

  sessionStorage.setItem('code_verifier', codeVerifier)
  sessionStorage.setItem('auth_state', state)

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    scope: SCOPES,
    redirect_uri: REDIRECT_URI,
    state,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    show_dialog: 'true'
  })

  window.location.href = `https://accounts.spotify.com/authorize?${params}`
}

export async function exchangeCode(code) {
  const codeVerifier = sessionStorage.getItem('code_verifier')
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      code_verifier: codeVerifier
    })
  })
  const data = await res.json()
  if (data.access_token) {
    localStorage.setItem('spotify_token', data.access_token)
    localStorage.setItem('spotify_refresh', data.refresh_token || '')
    localStorage.setItem('spotify_token_exp', Date.now() + data.expires_in * 1000)
  }
  return data
}

export async function refreshToken() {
  const refresh = localStorage.getItem('spotify_refresh')
  if (!refresh) return null
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refresh,
      client_id: CLIENT_ID
    })
  })
  const data = await res.json()
  if (data.access_token) {
    localStorage.setItem('spotify_token', data.access_token)
    localStorage.setItem('spotify_token_exp', Date.now() + data.expires_in * 1000)
    if (data.refresh_token) localStorage.setItem('spotify_refresh', data.refresh_token)
  }
  return data.access_token
}

export function getToken() {
  return localStorage.getItem('spotify_token')
}

export function isLoggedIn() {
  return !!getToken()
}

export function logout() {
  localStorage.removeItem('spotify_token')
  localStorage.removeItem('spotify_refresh')
  localStorage.removeItem('spotify_token_exp')
  sessionStorage.removeItem('code_verifier')
  sessionStorage.removeItem('auth_state')
}

export async function spotifyFetch(endpoint, options = {}) {
  let token = getToken()
  const exp = localStorage.getItem('spotify_token_exp')
  if (exp && Date.now() > Number(exp) - 60000) {
    token = await refreshToken()
  }
  if (!token) throw new Error('Not authenticated')

  const url = endpoint.startsWith('http') ? endpoint : `https://api.spotify.com/v1${endpoint}`
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  })

  const text = await res.text()
  let data
  try { data = JSON.parse(text) } catch { data = { raw: text } }

  return {
    status: res.status,
    ok: res.ok,
    headers: Object.fromEntries(res.headers.entries()),
    data,
    endpoint,
    method: options.method || 'GET',
    timestamp: new Date().toISOString()
  }
}
