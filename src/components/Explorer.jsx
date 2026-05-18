import React, { useState, useRef } from 'react'
import { spotifyFetch } from '../utils/spotify'
import { ENDPOINTS, METHOD_COLORS } from '../utils/endpoints'
import { saveRequest, saveFavorite, getFavorites, removeFavorite } from '../utils/storage'
import './Explorer.css'

function JsonNode({ data, depth = 0 }) {
  const [collapsed, setCollapsed] = useState(depth > 2)
  if (data === null) return <span className="json-null">null</span>
  if (typeof data === 'boolean') return <span className="json-bool">{String(data)}</span>
  if (typeof data === 'number') return <span className="json-num">{data}</span>
  if (typeof data === 'string') {
    if (data.startsWith('http')) return <span className="json-str">"<a href={data} target="_blank" rel="noreferrer">{data}</a>"</span>
    return <span className="json-str">"{data}"</span>
  }
  if (Array.isArray(data)) {
    if (data.length === 0) return <span className="json-bracket">[]</span>
    return (
      <span>
        <button className="json-toggle" onClick={() => setCollapsed(c=>!c)}>{collapsed ? '▶' : '▼'}</button>
        <span className="json-bracket">[</span>
        {collapsed ? (
          <span className="json-ellipsis" onClick={() => setCollapsed(false)}> {data.length} items </span>
        ) : (
          <div className="json-body">
            {data.map((v, i) => (
              <div key={i} className="json-row">
                <JsonNode data={v} depth={depth+1} />
                {i < data.length - 1 && <span className="json-comma">,</span>}
              </div>
            ))}
          </div>
        )}
        <span className="json-bracket">]</span>
      </span>
    )
  }
  if (typeof data === 'object') {
    const keys = Object.keys(data)
    if (keys.length === 0) return <span className="json-bracket">{'{}'}</span>
    return (
      <span>
        <button className="json-toggle" onClick={() => setCollapsed(c=>!c)}>{collapsed ? '▶' : '▼'}</button>
        <span className="json-bracket">{'{'}</span>
        {collapsed ? (
          <span className="json-ellipsis" onClick={() => setCollapsed(false)}> {keys.length} keys </span>
        ) : (
          <div className="json-body">
            {keys.map((k, i) => (
              <div key={k} className="json-row">
                <span className="json-key">"{k}"</span>
                <span className="json-colon">: </span>
                <JsonNode data={data[k]} depth={depth+1} />
                {i < keys.length - 1 && <span className="json-comma">,</span>}
              </div>
            ))}
          </div>
        )}
        <span className="json-bracket">{'}'}</span>
      </span>
    )
  }
  return <span>{String(data)}</span>
}

export default function Explorer() {
  const [activeCategory, setActiveCategory] = useState('User Profile')
  const [customEndpoint, setCustomEndpoint] = useState('/me')
  const [customMethod, setCustomMethod] = useState('GET')
  const [customBody, setCustomBody] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState('tree')
  const [search, setSearch] = useState('')
  const [favorites, setFavorites] = useState(getFavorites())
  const [activeTab, setActiveTab] = useState('endpoints')
  const resultRef = useRef()

  async function runRequest(endpoint, method = 'GET', body = null) {
    setLoading(true)
    setResult(null)
    try {
      const opts = { method }
      if (body) {
        try { opts.body = JSON.stringify(JSON.parse(body)) } catch { opts.body = body }
      }
      const res = await spotifyFetch(endpoint, opts)
      setResult(res)
      saveRequest({ endpoint, method, body, ...res })
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    } catch (e) {
      setResult({ status: 0, ok: false, data: { error: e.message }, endpoint, method })
    }
    setLoading(false)
  }

  function toggleFav(ep) {
    const existing = favorites.find(f => f.endpoint === ep.endpoint && f.method === ep.method)
    if (existing) { removeFavorite(ep); setFavorites(getFavorites()) }
    else { saveFavorite(ep); setFavorites(getFavorites()) }
  }

  function isFav(ep) {
    return favorites.some(f => f.endpoint === ep.endpoint && f.method === ep.method)
  }

  const allEndpoints = Object.values(ENDPOINTS).flat()
  const filtered = search
    ? allEndpoints.filter(e => e.label.toLowerCase().includes(search.toLowerCase()) || e.endpoint.toLowerCase().includes(search.toLowerCase()))
    : null

  const displayEndpoints = filtered || ENDPOINTS[activeCategory] || []

  function copyResult() {
    navigator.clipboard.writeText(JSON.stringify(result?.data, null, 2))
  }

  return (
    <div className="explorer">
      {/* Sidebar */}
      <div className="explorer-sidebar">
        <div className="explorer-tabs">
          <button className={`etab ${activeTab === 'endpoints' ? 'active' : ''}`} onClick={() => setActiveTab('endpoints')}>Endpoints</button>
          <button className={`etab ${activeTab === 'favorites' ? 'active' : ''}`} onClick={() => setActiveTab('favorites')}>
            Favorites {favorites.length > 0 && <span className="badge">{favorites.length}</span>}
          </button>
        </div>

        {activeTab === 'endpoints' && (
          <>
            <div className="ep-search-wrap">
              <input
                type="text"
                placeholder="Search endpoints..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="ep-search"
              />
            </div>
            {!search && (
              <div className="category-list">
                {Object.keys(ENDPOINTS).map(cat => (
                  <button
                    key={cat}
                    className={`cat-btn ${activeCategory === cat ? 'active' : ''}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat}
                    <span className="cat-count">{ENDPOINTS[cat].length}</span>
                  </button>
                ))}
              </div>
            )}
            <div className="endpoint-list">
              {displayEndpoints.map(ep => (
                <div key={ep.endpoint + ep.method} className="ep-item" onClick={() => {
                  setCustomEndpoint(ep.endpoint)
                  setCustomMethod(ep.method)
                  setCustomBody(ep.body || '')
                }}>
                  <div className="ep-item-top">
                    <span className="ep-method" style={{ color: METHOD_COLORS[ep.method] }}>{ep.method}</span>
                    <button
                      className={`fav-btn ${isFav(ep) ? 'active' : ''}`}
                      onClick={e => { e.stopPropagation(); toggleFav(ep) }}
                    >★</button>
                  </div>
                  <div className="ep-label">{ep.label}</div>
                  <div className="ep-path dimmer">{ep.endpoint.substring(0, 40)}{ep.endpoint.length > 40 ? '…' : ''}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'favorites' && (
          <div className="endpoint-list">
            {favorites.length === 0 && <div className="ep-empty dimmer">No favorites yet.<br/>Click ★ to save.</div>}
            {favorites.map(ep => (
              <div key={ep.endpoint + ep.method} className="ep-item" onClick={() => {
                setCustomEndpoint(ep.endpoint)
                setCustomMethod(ep.method)
              }}>
                <div className="ep-item-top">
                  <span className="ep-method" style={{ color: METHOD_COLORS[ep.method] }}>{ep.method}</span>
                  <button className="fav-btn active" onClick={e => { e.stopPropagation(); toggleFav(ep); setFavorites(getFavorites()) }}>★</button>
                </div>
                <div className="ep-label">{ep.label || ep.endpoint}</div>
                <div className="ep-path dimmer">{ep.endpoint}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="explorer-main">
        {/* Request builder */}
        <div className="request-builder">
          <div className="builder-header">
            <div className="builder-label dimmer">// REQUEST</div>
          </div>
          <div className="request-row">
            <select
              value={customMethod}
              onChange={e => setCustomMethod(e.target.value)}
              className="method-select"
              style={{ color: METHOD_COLORS[customMethod] }}
            >
              {['GET','POST','PUT','DELETE','PATCH'].map(m => (
                <option key={m} value={m} style={{ color: METHOD_COLORS[m] }}>{m}</option>
              ))}
            </select>
            <div className="endpoint-wrap">
              <span className="endpoint-base dimmer">api.spotify.com/v1</span>
              <input
                type="text"
                value={customEndpoint}
                onChange={e => setCustomEndpoint(e.target.value)}
                className="endpoint-input"
                placeholder="/me"
                onKeyDown={e => { if (e.key === 'Enter') runRequest(customEndpoint, customMethod, customBody) }}
              />
            </div>
            <button
              className={`btn-send ${loading ? 'loading' : ''}`}
              onClick={() => runRequest(customEndpoint, customMethod, customBody)}
              disabled={loading}
            >
              {loading ? '◎' : '▶ Send'}
            </button>
          </div>

          {(customMethod !== 'GET' && customMethod !== 'DELETE') && (
            <div className="body-section">
              <div className="body-label dimmer">Body (JSON)</div>
              <textarea
                value={customBody}
                onChange={e => setCustomBody(e.target.value)}
                className="body-input"
                placeholder='{"context_uri": "spotify:album:...", "position_ms": 0}'
                rows={4}
              />
            </div>
          )}
        </div>

        {/* Response */}
        {result && (
          <div className="response-panel fade-in" ref={resultRef}>
            <div className="response-header">
              <div className="response-meta">
                <span className={`status-badge ${result.ok ? 'ok' : 'err'}`}>
                  {result.status}
                </span>
                <span className="dimmer" style={{ fontSize: 11 }}>{result.method} {result.endpoint}</span>
                <span className="dimmer" style={{ fontSize: 11 }}>{result.timestamp?.split('T')[1]?.split('.')[0]}</span>
              </div>
              <div className="response-actions">
                <button className={`view-btn ${viewMode === 'tree' ? 'active' : ''}`} onClick={() => setViewMode('tree')}>Tree</button>
                <button className={`view-btn ${viewMode === 'raw' ? 'active' : ''}`} onClick={() => setViewMode('raw')}>Raw</button>
                <button className="copy-btn" onClick={copyResult}>Copy</button>
              </div>
            </div>

            {result.headers && (
              <div className="response-headers-bar">
                {Object.entries(result.headers).slice(0,6).map(([k,v]) => (
                  <div key={k} className="resp-header-item">
                    <span className="resp-h-key dimmer">{k}:</span>
                    <span style={{ fontSize: 11 }}>{v}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="response-body">
              {viewMode === 'tree' ? (
                <div className="json-tree">
                  <JsonNode data={result.data} depth={0} />
                </div>
              ) : (
                <pre className="json-raw">{JSON.stringify(result.data, null, 2)}</pre>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
