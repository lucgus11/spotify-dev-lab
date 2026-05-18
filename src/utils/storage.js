const HISTORY_KEY = 'spotify_request_history'
const MAX_HISTORY = 100

export function saveRequest(req) {
  const history = getHistory()
  const entry = {
    id: Date.now() + Math.random().toString(36).slice(2),
    ...req,
    savedAt: new Date().toISOString()
  }
  history.unshift(entry)
  if (history.length > MAX_HISTORY) history.splice(MAX_HISTORY)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
  return entry
}

export function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
  } catch { return [] }
}

export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY)
}

export function deleteHistoryEntry(id) {
  const history = getHistory().filter(h => h.id !== id)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
}

export function exportHistory() {
  const data = JSON.stringify(getHistory(), null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `spotify-lab-history-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// Favorites (saved endpoints)
const FAV_KEY = 'spotify_favorites'

export function saveFavorite(endpoint) {
  const favs = getFavorites()
  if (!favs.find(f => f.endpoint === endpoint.endpoint && f.method === endpoint.method)) {
    favs.push({ ...endpoint, savedAt: new Date().toISOString() })
    localStorage.setItem(FAV_KEY, JSON.stringify(favs))
  }
}

export function getFavorites() {
  try { return JSON.parse(localStorage.getItem(FAV_KEY) || '[]') } catch { return [] }
}

export function removeFavorite(endpoint) {
  const favs = getFavorites().filter(f => !(f.endpoint === endpoint.endpoint && f.method === endpoint.method))
  localStorage.setItem(FAV_KEY, JSON.stringify(favs))
}

// Collections (grouped requests)
const COLL_KEY = 'spotify_collections'

export function getCollections() {
  try { return JSON.parse(localStorage.getItem(COLL_KEY) || '[]') } catch { return [] }
}

export function saveCollection(name, requests) {
  const colls = getCollections()
  const idx = colls.findIndex(c => c.name === name)
  const coll = { name, requests, updatedAt: new Date().toISOString() }
  if (idx >= 0) colls[idx] = coll; else colls.push(coll)
  localStorage.setItem(COLL_KEY, JSON.stringify(colls))
}
