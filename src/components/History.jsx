import React, { useState } from 'react'
import { getHistory, clearHistory, deleteHistoryEntry, exportHistory } from '../utils/storage'
import { spotifyFetch } from '../utils/spotify'
import { METHOD_COLORS } from '../utils/endpoints'
import './History.css'

export default function History() {
  const [history, setHistory] = useState(getHistory())
  const [selected, setSelected] = useState(null)
  const [replayResult, setReplayResult] = useState(null)
  const [replayLoading, setReplayLoading] = useState(false)
  const [filter, setFilter] = useState('')
  const [methodFilter, setMethodFilter] = useState('ALL')

  function refresh() { setHistory(getHistory()) }

  function handleClear() {
    if (confirm('Clear all request history?')) {
      clearHistory()
      setHistory([])
      setSelected(null)
    }
  }

  function handleDelete(id) {
    deleteHistoryEntry(id)
    refresh()
    if (selected?.id === id) setSelected(null)
  }

  async function handleReplay(item) {
    setReplayLoading(true)
    setReplayResult(null)
    try {
      const opts = { method: item.method }
      if (item.body) opts.body = item.body
      const res = await spotifyFetch(item.endpoint, opts)
      setReplayResult(res)
    } catch (e) {
      setReplayResult({ ok: false, status: 0, data: { error: e.message } })
    }
    setReplayLoading(false)
  }

  const filtered = history.filter(h => {
    const matchText = !filter || h.endpoint?.toLowerCase().includes(filter.toLowerCase())
    const matchMethod = methodFilter === 'ALL' || h.method === methodFilter
    return matchText && matchMethod
  })

  const stats = {
    total: history.length,
    ok: history.filter(h => h.ok).length,
    err: history.filter(h => !h.ok).length,
    methods: history.reduce((a, h) => { a[h.method] = (a[h.method]||0)+1; return a }, {})
  }

  return (
    <div className="history-page">
      <div className="history-sidebar">
        <div className="history-header">
          <div className="history-title display">History</div>
          <div className="history-actions">
            <button className="hist-btn" onClick={exportHistory} title="Export JSON">↓ Export</button>
            <button className="hist-btn danger" onClick={handleClear} title="Clear all">✕ Clear</button>
          </div>
        </div>

        {/* Stats */}
        <div className="hist-stats">
          <div className="hist-stat"><span className="hist-stat-val">{stats.total}</span><span className="dimmer">Total</span></div>
          <div className="hist-stat"><span className="hist-stat-val green">{stats.ok}</span><span className="dimmer">OK</span></div>
          <div className="hist-stat"><span className="hist-stat-val" style={{color:'var(--red)'}}>{stats.err}</span><span className="dimmer">Error</span></div>
        </div>

        {/* Filters */}
        <div className="hist-filters">
          <input type="text" placeholder="Filter endpoints..." value={filter} onChange={e => setFilter(e.target.value)} className="hist-search" />
          <div className="method-filters">
            {['ALL','GET','POST','PUT','DELETE'].map(m => (
              <button key={m} className={`mf-btn ${methodFilter === m ? 'active' : ''}`}
                style={methodFilter === m && m !== 'ALL' ? { color: METHOD_COLORS[m] } : {}}
                onClick={() => setMethodFilter(m)}
              >{m}</button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="hist-list">
          {filtered.length === 0 && (
            <div className="hist-empty dimmer">No requests yet.<br/>Use the Explorer to make API calls.</div>
          )}
          {filtered.map(h => (
            <div
              key={h.id}
              className={`hist-item ${selected?.id === h.id ? 'active' : ''} ${h.ok ? '' : 'has-error'}`}
              onClick={() => { setSelected(h); setReplayResult(null) }}
            >
              <div className="hist-item-top">
                <span className="hist-method" style={{ color: METHOD_COLORS[h.method] }}>{h.method}</span>
                <span className={`hist-status ${h.ok ? 'ok' : 'err'}`}>{h.status}</span>
                <button className="hist-del" onClick={e => { e.stopPropagation(); handleDelete(h.id) }}>✕</button>
              </div>
              <div className="hist-endpoint">{h.endpoint}</div>
              <div className="hist-time dimmer">{formatTime(h.savedAt)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="history-main">
        {selected ? (
          <div className="hist-detail fade-in">
            <div className="hist-detail-header">
              <div>
                <div className="hist-detail-method" style={{ color: METHOD_COLORS[selected.method] }}>
                  {selected.method} <span style={{ color: 'var(--text)' }}>{selected.endpoint}</span>
                </div>
                <div className="hist-detail-meta dimmer">{selected.timestamp || selected.savedAt}</div>
              </div>
              <button
                className="replay-btn"
                onClick={() => handleReplay(selected)}
                disabled={replayLoading}
              >
                {replayLoading ? '◎ Replaying...' : '▶ Replay'}
              </button>
            </div>

            {selected.body && (
              <div className="hist-section">
                <div className="hist-section-title dimmer">// REQUEST BODY</div>
                <pre className="hist-code">{selected.body}</pre>
              </div>
            )}

            <div className="hist-section">
              <div className="hist-section-title dimmer">
                // {replayResult ? 'REPLAY RESPONSE' : 'ORIGINAL RESPONSE'}
                {replayResult && <span className={replayResult.ok ? 'green' : ''} style={{color: replayResult.ok ? 'var(--green)' : 'var(--red)'}}> [{replayResult.status}]</span>}
              </div>
              <pre className="hist-code">{JSON.stringify((replayResult || selected).data, null, 2)}</pre>
            </div>

            {selected.headers && (
              <div className="hist-section">
                <div className="hist-section-title dimmer">// RESPONSE HEADERS</div>
                <div className="hist-headers">
                  {Object.entries(selected.headers).map(([k, v]) => (
                    <div key={k} className="hist-header-row">
                      <span className="hist-header-key dimmer">{k}:</span>
                      <span className="hist-header-val">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="hist-placeholder">
            <div className="hist-placeholder-icon dimmer">◇</div>
            <div className="dimmer">Select a request to inspect</div>

            {/* Method breakdown */}
            {Object.keys(stats.methods).length > 0 && (
              <div className="method-breakdown">
                {Object.entries(stats.methods).map(([method, count]) => (
                  <div key={method} className="method-bar-row">
                    <span className="mb-method" style={{ color: METHOD_COLORS[method] }}>{method}</span>
                    <div className="mb-track">
                      <div className="mb-fill" style={{ width: `${(count / stats.total) * 100}%`, background: METHOD_COLORS[method] }} />
                    </div>
                    <span className="mb-count dimmer">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function formatTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
