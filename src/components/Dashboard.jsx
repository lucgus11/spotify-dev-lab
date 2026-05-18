import React, { useState, useEffect, useCallback } from 'react'
import { spotifyFetch } from '../utils/spotify'
import './Dashboard.css'

function ProgressBar({ value, max = 100, color = 'var(--green)', label }) {
  const pct = Math.round((value / max) * 100)
  return (
    <div className="prog-wrap">
      {label && <div className="prog-label dimmer">{label}</div>}
      <div className="prog-track">
        <div className="prog-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="prog-val">{pct}</div>
    </div>
  )
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div className="stat-card">
      <div className="stat-label dimmer">{label}</div>
      <div className="stat-value" style={accent ? { color: accent } : {}}>{value}</div>
      {sub && <div className="stat-sub dimmer">{sub}</div>}
    </div>
  )
}

export default function Dashboard() {
  const [playback, setPlayback] = useState(null)
  const [topArtists, setTopArtists] = useState([])
  const [topTracks, setTopTracks] = useState([])
  const [recentTracks, setRecentTracks] = useState([])
  const [devices, setDevices] = useState([])
  const [audioFeatures, setAudioFeatures] = useState(null)
  const [timeRange, setTimeRange] = useState('medium_term')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    const [pb, ta, tt, rt, dv] = await Promise.allSettled([
      spotifyFetch('/me/player'),
      spotifyFetch(`/me/top/artists?time_range=${timeRange}&limit=10`),
      spotifyFetch(`/me/top/tracks?time_range=${timeRange}&limit=10`),
      spotifyFetch('/me/player/recently-played?limit=8'),
      spotifyFetch('/me/player/devices'),
    ])

    if (pb.value?.ok) setPlayback(pb.value.data)
    if (ta.value?.ok) setTopArtists(ta.value.data.items || [])
    if (tt.value?.ok) setTopTracks(tt.value.data.items || [])
    if (rt.value?.ok) setRecentTracks(rt.value.data.items || [])
    if (dv.value?.ok) setDevices(dv.value.data.devices || [])

    // Load audio features for top track
    const tracks = tt.value?.data?.items
    if (tracks?.length > 0) {
      const ids = tracks.slice(0, 5).map(t => t.id).join(',')
      const af = await spotifyFetch(`/audio-features?ids=${ids}`)
      if (af.ok) setAudioFeatures(af.data.audio_features || [])
    }

    setLoading(false)
  }, [timeRange])

  useEffect(() => { loadData() }, [loadData])

  // Auto-refresh playback every 5s
  useEffect(() => {
    const interval = setInterval(async () => {
      setRefreshing(true)
      const res = await spotifyFetch('/me/player')
      if (res.ok) setPlayback(res.data)
      setRefreshing(false)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  async function sendControl(endpoint, method = 'POST') {
    await spotifyFetch(endpoint, { method })
    setTimeout(async () => {
      const res = await spotifyFetch('/me/player')
      if (res.ok) setPlayback(res.data)
    }, 800)
  }

  if (loading) return (
    <div className="dashboard-loading">
      <div className="loading-spinner">◎</div>
      <div className="dimmer">Loading dashboard...</div>
    </div>
  )

  const track = playback?.item
  const progress = playback?.progress_ms || 0
  const duration = track?.duration_ms || 1

  const avgFeatures = audioFeatures?.length > 0 ? {
    energy: audioFeatures.reduce((a,f) => a + (f?.energy||0), 0) / audioFeatures.length,
    valence: audioFeatures.reduce((a,f) => a + (f?.valence||0), 0) / audioFeatures.length,
    danceability: audioFeatures.reduce((a,f) => a + (f?.danceability||0), 0) / audioFeatures.length,
    acousticness: audioFeatures.reduce((a,f) => a + (f?.acousticness||0), 0) / audioFeatures.length,
    instrumentalness: audioFeatures.reduce((a,f) => a + (f?.instrumentalness||0), 0) / audioFeatures.length,
    tempo: audioFeatures.reduce((a,f) => a + (f?.tempo||0), 0) / audioFeatures.length,
  } : null

  return (
    <div className="dashboard fade-in">
      <div className="dash-header">
        <h1 className="dash-title display">Dashboard</h1>
        <div className="dash-controls">
          <div className="time-range-select">
            {[['short_term','4 Weeks'],['medium_term','6 Months'],['long_term','All Time']].map(([val, label]) => (
              <button key={val} className={`tr-btn ${timeRange === val ? 'active' : ''}`} onClick={() => setTimeRange(val)}>
                {label}
              </button>
            ))}
          </div>
          <button className="refresh-btn" onClick={loadData}>↻ Refresh</button>
        </div>
      </div>

      <div className="dash-grid">
        {/* Playback Card */}
        <div className="playback-card">
          <div className="section-label dimmer">// NOW PLAYING {refreshing && <span className="green"> ● LIVE</span>}</div>
          {track ? (
            <div className="now-playing">
              <div className="track-art">
                {track.album?.images?.[0]?.url
                  ? <img src={track.album.images[0].url} alt={track.album.name} />
                  : <div className="art-placeholder">♪</div>
                }
                {playback?.is_playing && <div className="playing-indicator"><span/><span/><span/></div>}
              </div>
              <div className="track-info">
                <div className="track-name">{track.name}</div>
                <div className="track-artist dimmer">{track.artists?.map(a=>a.name).join(', ')}</div>
                <div className="track-album dimmer">{track.album?.name}</div>
                <div className="track-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${(progress/duration)*100}%` }} />
                  </div>
                  <div className="progress-times">
                    <span className="dimmer">{msToTime(progress)}</span>
                    <span className="dimmer">{msToTime(duration)}</span>
                  </div>
                </div>
                <div className="playback-controls">
                  <button className="ctrl-btn" onClick={() => sendControl('/me/player/previous')}>⏮</button>
                  <button className="ctrl-btn primary" onClick={() => sendControl(playback?.is_playing ? '/me/player/pause' : '/me/player/play', 'PUT')}>
                    {playback?.is_playing ? '⏸' : '▶'}
                  </button>
                  <button className="ctrl-btn" onClick={() => sendControl('/me/player/next')}>⏭</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-playback dimmer">
              <span style={{ fontSize: 32 }}>⏸</span>
              <span>Nothing playing</span>
              <span style={{ fontSize: 11 }}>Open Spotify and start playing something</span>
            </div>
          )}

          {/* Devices */}
          {devices.length > 0 && (
            <div className="devices-list">
              <div className="devices-title dimmer">DEVICES</div>
              {devices.map(d => (
                <div key={d.id} className={`device-item ${d.is_active ? 'active' : ''}`}>
                  <span className="device-icon">{d.type === 'Computer' ? '🖥' : d.type === 'Smartphone' ? '📱' : '📻'}</span>
                  <span className="device-name">{d.name}</span>
                  {d.is_active && <span className="green" style={{fontSize:10}}>● ACTIVE</span>}
                  <span className="device-vol dimmer">{d.volume_percent}%</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Audio Features */}
        {avgFeatures && (
          <div className="features-card">
            <div className="section-label dimmer">// AUDIO PROFILE (avg top 5)</div>
            <div className="features-grid-inner">
              <ProgressBar label="Energy" value={avgFeatures.energy * 100} color="var(--orange)" />
              <ProgressBar label="Valence" value={avgFeatures.valence * 100} color="var(--yellow)" />
              <ProgressBar label="Danceability" value={avgFeatures.danceability * 100} color="var(--purple)" />
              <ProgressBar label="Acousticness" value={avgFeatures.acousticness * 100} color="var(--blue)" />
              <ProgressBar label="Instrumentalness" value={avgFeatures.instrumentalness * 100} color="var(--green)" />
            </div>
            <div className="tempo-display">
              <span className="dimmer">AVG TEMPO</span>
              <span className="tempo-val green">{Math.round(avgFeatures.tempo)} <span className="dimmer" style={{fontSize:12}}>BPM</span></span>
            </div>
          </div>
        )}

        {/* Top Artists */}
        <div className="top-card">
          <div className="section-label dimmer">// TOP ARTISTS</div>
          <div className="top-list">
            {topArtists.map((a, i) => (
              <div key={a.id} className="top-item slide-in" style={{ animationDelay: `${i * 0.04}s` }}>
                <span className="rank dimmer">{String(i+1).padStart(2,'0')}</span>
                {a.images?.[0]?.url && <img src={a.images[0].url} alt={a.name} className="top-img" />}
                <div className="top-info">
                  <span className="top-name">{a.name}</span>
                  <span className="top-sub dimmer">{a.genres?.slice(0,2).join(', ')}</span>
                </div>
                <div className="pop-meter">
                  <div className="pop-fill" style={{ height: `${a.popularity}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Tracks */}
        <div className="top-card">
          <div className="section-label dimmer">// TOP TRACKS</div>
          <div className="top-list">
            {topTracks.map((t, i) => (
              <div key={t.id} className="top-item slide-in" style={{ animationDelay: `${i * 0.04}s` }}>
                <span className="rank dimmer">{String(i+1).padStart(2,'0')}</span>
                {t.album?.images?.[0]?.url && <img src={t.album.images[0].url} alt={t.name} className="top-img" />}
                <div className="top-info">
                  <span className="top-name">{t.name}</span>
                  <span className="top-sub dimmer">{t.artists?.map(a=>a.name).join(', ')}</span>
                </div>
                <span className="pop-badge">{t.popularity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent */}
        <div className="recent-card">
          <div className="section-label dimmer">// RECENTLY PLAYED</div>
          <div className="recent-list">
            {recentTracks.map((item, i) => (
              <div key={item.played_at} className="recent-item">
                <img src={item.track?.album?.images?.[2]?.url || item.track?.album?.images?.[0]?.url} alt="" className="recent-img" />
                <div className="recent-info">
                  <span className="recent-name">{item.track?.name}</span>
                  <span className="recent-artist dimmer">{item.track?.artists?.map(a=>a.name).join(', ')}</span>
                </div>
                <span className="recent-time dimmer">{timeAgo(item.played_at)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function msToTime(ms) {
  const s = Math.floor(ms / 1000)
  return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso)
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  return `${Math.floor(m/60)}h ago`
}
