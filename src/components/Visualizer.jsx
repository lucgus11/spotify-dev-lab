import React, { useState, useEffect, useRef } from 'react'
import { spotifyFetch } from '../utils/spotify'
import './Visualizer.css'

const FEATURE_COLORS = {
  energy: '#ff6b2b',
  valence: '#ffd700',
  danceability: '#b04aff',
  acousticness: '#4a9eff',
  instrumentalness: '#1db954',
  speechiness: '#ff4444',
  liveness: '#ff9f43',
}

const FEATURE_LABELS = {
  energy: 'Energy', valence: 'Valence (Mood)', danceability: 'Danceability',
  acousticness: 'Acousticness', instrumentalness: 'Instrumentalness',
  speechiness: 'Speechiness', liveness: 'Liveness'
}

function RadarChart({ features, size = 280 }) {
  const keys = Object.keys(FEATURE_LABELS)
  const center = size / 2
  const radius = size * 0.38
  const n = keys.length

  function polarToCart(angle, r) {
    const a = (angle - Math.PI / 2)
    return { x: center + r * Math.cos(a), y: center + r * Math.sin(a) }
  }

  const gridLevels = [0.25, 0.5, 0.75, 1]
  const axisPoints = keys.map((_, i) => polarToCart((2 * Math.PI * i) / n, radius))

  const featurePoints = keys.map((k, i) => {
    const val = features[k] || 0
    return polarToCart((2 * Math.PI * i) / n, radius * val)
  })

  const pathD = featurePoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z'

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="radar-svg">
      {/* Grid */}
      {gridLevels.map(level => (
        <polygon key={level}
          points={keys.map((_, i) => {
            const p = polarToCart((2 * Math.PI * i) / n, radius * level)
            return `${p.x.toFixed(1)},${p.y.toFixed(1)}`
          }).join(' ')}
          fill="none" stroke="var(--border)" strokeWidth="1"
        />
      ))}

      {/* Axes */}
      {axisPoints.map((p, i) => (
        <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="var(--border)" strokeWidth="1" />
      ))}

      {/* Data polygon */}
      <path d={pathD} fill="rgba(29,185,84,0.15)" stroke="var(--green)" strokeWidth="2" />
      {featurePoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill={FEATURE_COLORS[keys[i]]} />
      ))}

      {/* Labels */}
      {keys.map((k, i) => {
        const p = polarToCart((2 * Math.PI * i) / n, radius + 22)
        return (
          <text key={k} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
            fill="var(--text-dim)" fontSize="9" fontFamily="var(--font-mono)" fontWeight="700"
          >
            {k.toUpperCase()}
          </text>
        )
      })}
    </svg>
  )
}

function WaveformDisplay({ analysis }) {
  if (!analysis?.segments) return null
  const segments = analysis.segments.slice(0, 200)
  const max = Math.max(...segments.map(s => s.loudness_max || 0))
  const min = Math.min(...segments.map(s => s.loudness_start || -60))

  return (
    <div className="waveform-wrap">
      <div className="waveform">
        {segments.map((s, i) => {
          const h = Math.max(4, ((s.loudness_max - min) / (max - min)) * 60)
          return <div key={i} className="waveform-bar" style={{ height: `${h}px` }} />
        })}
      </div>
    </div>
  )
}

function PitchWheel({ pitches }) {
  if (!pitches) return null
  const notes = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
  return (
    <div className="pitch-wheel">
      {notes.map((note, i) => (
        <div key={note} className="pitch-item">
          <div className="pitch-bar-wrap">
            <div className="pitch-bar" style={{ height: `${pitches[i] * 60}px` }} />
          </div>
          <span className="pitch-note">{note}</span>
        </div>
      ))}
    </div>
  )
}

export default function Visualizer() {
  const [trackId, setTrackId] = useState('4cOdK2wGLETKBW3PvgPWqT')
  const [features, setFeatures] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [track, setTrack] = useState(null)
  const [loading, setLoading] = useState(false)
  const [currentSegment, setCurrentSegment] = useState(0)
  const [compareMode, setCompareMode] = useState(false)
  const [compareId, setCompareId] = useState('')
  const [compareFeatures, setCompareFeatures] = useState(null)
  const [compareTrack, setCompareTrack] = useState(null)

  async function loadTrack(id = trackId) {
    if (!id) return
    setLoading(true)
    const [f, a, t] = await Promise.allSettled([
      spotifyFetch(`/audio-features/${id}`),
      spotifyFetch(`/audio-analysis/${id}`),
      spotifyFetch(`/tracks/${id}`),
    ])
    if (f.value?.ok) setFeatures(f.value.data)
    if (a.value?.ok) setAnalysis(a.value.data)
    if (t.value?.ok) setTrack(t.value.data)

    // Auto-cycle segments for animation
    if (a.value?.data?.segments) {
      setCurrentSegment(0)
    }
    setLoading(false)
  }

  async function loadCompare() {
    if (!compareId) return
    const [f, t] = await Promise.allSettled([
      spotifyFetch(`/audio-features/${compareId}`),
      spotifyFetch(`/tracks/${compareId}`),
    ])
    if (f.value?.ok) setCompareFeatures(f.value.data)
    if (t.value?.ok) setCompareTrack(t.value.data)
  }

  useEffect(() => {
    loadTrack()
  }, [])

  useEffect(() => {
    if (!analysis?.segments) return
    const interval = setInterval(() => {
      setCurrentSegment(s => (s + 1) % Math.min(analysis.segments.length, 32))
    }, 300)
    return () => clearInterval(interval)
  }, [analysis])

  const seg = analysis?.sections?.[Math.floor(currentSegment / 2) % (analysis.sections?.length || 1)]
  const pitches = analysis?.segments?.[currentSegment]?.pitches

  function formatKey(key, mode) {
    const keys = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
    return `${keys[key] || '?'} ${mode === 1 ? 'Major' : 'Minor'}`
  }

  return (
    <div className="visualizer fade-in">
      <div className="vis-header">
        <h1 className="vis-title display">Audio Visualizer</h1>
        <div className="vis-search">
          <input
            type="text"
            value={trackId}
            onChange={e => setTrackId(e.target.value)}
            placeholder="Spotify Track ID"
            className="vis-input"
            onKeyDown={e => e.key === 'Enter' && loadTrack()}
          />
          <button className="vis-load-btn" onClick={() => loadTrack()} disabled={loading}>
            {loading ? '◎' : 'Analyze'}
          </button>
        </div>
      </div>

      {track && (
        <div className="vis-track-info">
          {track.album?.images?.[1]?.url && <img src={track.album.images[1].url} alt="" className="vis-track-img" />}
          <div>
            <div className="vis-track-name">{track.name}</div>
            <div className="vis-track-artist dimmer">{track.artists?.map(a=>a.name).join(', ')} · {track.album?.name}</div>
          </div>
        </div>
      )}

      {features && (
        <div className="vis-grid">
          {/* Radar Chart */}
          <div className="vis-card radar-card">
            <div className="vis-card-title dimmer">// AUDIO PROFILE</div>
            <div className="radar-wrap">
              <RadarChart features={features} size={280} />
              {compareFeatures && (
                <div className="radar-compare">
                  <span className="green">━</span> {track?.name?.substring(0,20)}
                  <span style={{color:'var(--blue)'}}>━</span> {compareTrack?.name?.substring(0,20)}
                </div>
              )}
            </div>
          </div>

          {/* Feature Bars */}
          <div className="vis-card">
            <div className="vis-card-title dimmer">// FEATURE BREAKDOWN</div>
            <div className="feature-bars">
              {Object.entries(FEATURE_LABELS).map(([key, label]) => {
                const val = features[key] || 0
                const cval = compareFeatures?.[key] || 0
                return (
                  <div key={key} className="feat-row">
                    <div className="feat-label">{label}</div>
                    <div className="feat-bars-wrap">
                      <div className="feat-bar-track">
                        <div className="feat-bar-fill" style={{ width: `${val*100}%`, background: FEATURE_COLORS[key] }} />
                      </div>
                      {compareFeatures && (
                        <div className="feat-bar-track compare">
                          <div className="feat-bar-fill" style={{ width: `${cval*100}%`, background: 'var(--blue)' }} />
                        </div>
                      )}
                    </div>
                    <div className="feat-val">{(val * 100).toFixed(0)}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Key Stats */}
          <div className="vis-card stats-card">
            <div className="vis-card-title dimmer">// TRACK ANALYSIS</div>
            <div className="stats-grid">
              {[
                ['KEY', formatKey(features.key, features.mode)],
                ['TEMPO', `${Math.round(features.tempo)} BPM`],
                ['TIME SIG', `${features.time_signature}/4`],
                ['LOUDNESS', `${features.loudness?.toFixed(1)} dB`],
                ['DURATION', msToMin(features.duration_ms)],
                ['POPULARITY', track?.popularity ? `${track.popularity}/100` : '—'],
              ].map(([k, v]) => (
                <div key={k} className="vis-stat">
                  <div className="vis-stat-key dimmer">{k}</div>
                  <div className="vis-stat-val green">{v}</div>
                </div>
              ))}
            </div>

            {analysis?.sections && (
              <>
                <div className="vis-card-title dimmer" style={{marginTop:20}}>// SECTIONS ({analysis.sections.length})</div>
                <div className="sections-wrap">
                  {analysis.sections.map((s, i) => (
                    <div key={i} className={`section-block ${Math.floor(currentSegment/2) % analysis.sections.length === i ? 'active' : ''}`}
                      style={{ flex: s.duration }}
                      title={`${s.start.toFixed(1)}s · ${Math.round(s.tempo)}BPM · ${formatKey(s.key, s.mode)}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Live Pitch */}
          {pitches && (
            <div className="vis-card pitch-card">
              <div className="vis-card-title dimmer">// LIVE PITCH DISTRIBUTION</div>
              <PitchWheel pitches={pitches} />
              <div className="dimmer" style={{fontSize:10,textAlign:'center',marginTop:8}}>
                Animating through segments · {currentSegment}/{Math.min(analysis?.segments?.length||0,32)}
              </div>
            </div>
          )}

          {/* Waveform */}
          {analysis?.segments && (
            <div className="vis-card waveform-card">
              <div className="vis-card-title dimmer">// LOUDNESS WAVEFORM ({analysis.segments.length} segments)</div>
              <WaveformDisplay analysis={analysis} />
            </div>
          )}

          {/* Compare */}
          <div className="vis-card compare-card">
            <div className="vis-card-title dimmer">// COMPARE TRACKS</div>
            <div className="compare-inputs">
              <div className="compare-track-label">
                <span className="green">◈</span>
                <span style={{fontSize:12}}>{track?.name || 'Track A'}</span>
              </div>
              <div className="compare-input-row">
                <input type="text" value={compareId} onChange={e => setCompareId(e.target.value)}
                  placeholder="Track B Spotify ID" className="vis-input small"
                  onKeyDown={e => e.key === 'Enter' && loadCompare()}
                />
                <button className="vis-load-btn small" onClick={loadCompare}>Load</button>
              </div>
              {compareTrack && (
                <div className="compare-track-label">
                  <span style={{color:'var(--blue)'}}>◈</span>
                  <span style={{fontSize:12}}>{compareTrack.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!features && !loading && (
        <div className="vis-empty">
          <div className="vis-empty-icon">◎</div>
          <div>Enter a Spotify Track ID and click Analyze</div>
          <div className="dimmer" style={{fontSize:12}}>Example: 4cOdK2wGLETKBW3PvgPWqT (Night Owl — Galimatias)</div>
        </div>
      )}
    </div>
  )
}

function msToMin(ms) {
  const s = Math.floor(ms / 1000)
  return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`
}
