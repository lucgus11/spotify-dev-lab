import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { initiateLogin, isLoggedIn, spotifyFetch } from '../utils/spotify'
import './Home.css'

export default function Home({ loggedIn, onAuth }) {
  const navigate = useNavigate()
  const [clientId, setClientId] = useState(localStorage.getItem('client_id_override') || '')
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    if (loggedIn) {
      spotifyFetch('/me').then(r => { if (r.ok) setProfile(r.data) })
      spotifyFetch('/me/top/tracks?limit=5&time_range=short_term').then(r => {
        if (r.ok) setStats(s => ({ ...s, topTracks: r.data.items }))
      })
      spotifyFetch('/me/player/recently-played?limit=3').then(r => {
        if (r.ok) setStats(s => ({ ...s, recent: r.data.items }))
      })
    }
  }, [loggedIn])

  function saveClientId() {
    if (clientId) {
      localStorage.setItem('client_id_override', clientId)
      // Store as env-like for the current session
      window.__SPOTIFY_CLIENT_ID = clientId
    }
  }

  function handleLogin() {
    if (clientId) localStorage.setItem('client_id_override', clientId)
    initiateLogin()
  }

  if (loggedIn && profile) {
    return (
      <div className="home connected fade-in">
        <div className="connected-hero">
          <div className="connected-status">
            <span className="status-indicator" />
            CONNECTED
          </div>
          <h1 className="connected-title">
            Welcome back,<br />
            <span className="green">{profile.display_name || profile.id}</span>
          </h1>
          <p className="connected-sub">
            {profile.email} · {profile.product?.toUpperCase()} · {profile.followers?.total} followers
          </p>

          <div className="quick-actions">
            <button className="action-card" onClick={() => navigate('/explorer')}>
              <span className="action-icon">◈</span>
              <span className="action-label">API Explorer</span>
              <span className="action-desc">Browse & test all endpoints</span>
            </button>
            <button className="action-card" onClick={() => navigate('/dashboard')}>
              <span className="action-icon">◉</span>
              <span className="action-label">Dashboard</span>
              <span className="action-desc">Live playback & top charts</span>
            </button>
            <button className="action-card" onClick={() => navigate('/visualizer')}>
              <span className="action-icon">◎</span>
              <span className="action-label">Visualizer</span>
              <span className="action-desc">Audio features & analysis</span>
            </button>
            <button className="action-card" onClick={() => navigate('/history')}>
              <span className="action-icon">◇</span>
              <span className="action-label">History</span>
              <span className="action-desc">Request log & replay</span>
            </button>
          </div>

          {stats?.topTracks && (
            <div className="mini-stats">
              <div className="mini-stat-title">// TOP TRACKS THIS MONTH</div>
              <div className="mini-tracks">
                {stats.topTracks.map((t, i) => (
                  <div key={t.id} className="mini-track">
                    <span className="mini-rank dimmer">{String(i+1).padStart(2,'0')}</span>
                    <div className="mini-track-info">
                      <span className="mini-track-name">{t.name}</span>
                      <span className="mini-track-artist dimmer">{t.artists.map(a=>a.name).join(', ')}</span>
                    </div>
                    <span className="mini-track-pop">{t.popularity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="home fade-in">
      <div className="hero">
        <div className="hero-badge">DEVELOPER TOOL</div>
        <h1 className="hero-title">
          <span className="green">Spotify</span><br />
          Dev Lab<span className="cursor">_</span>
        </h1>
        <p className="hero-sub">
          Full-featured playground for the Spotify Web API.<br />
          Test endpoints, visualize audio data, track request history.
        </p>

        <div className="features-grid">
          {[
            ['◈', 'API Explorer', 'Browse 40+ endpoints across all Spotify API categories'],
            ['◉', 'Live Dashboard', 'Real-time playback state, top artists, and listening stats'],
            ['◎', 'Audio Visualizer', 'Visualize tempo, energy, valence and audio features'],
            ['◇', 'Request History', 'Full log with replay, export, and favorites'],
            ['⬡', 'PKCE Auth', 'Secure OAuth 2.0 with PKCE — no server needed'],
            ['◬', 'PWA Ready', 'Install as app, works offline for cached data'],
          ].map(([icon, title, desc]) => (
            <div key={title} className="feature-card">
              <span className="feature-icon green">{icon}</span>
              <span className="feature-title">{title}</span>
              <span className="feature-desc dimmer">{desc}</span>
            </div>
          ))}
        </div>

        <div className="setup-box">
          <div className="setup-title">// SETUP</div>
          <div className="setup-steps">
            <div className="step">
              <span className="step-num green">01</span>
              <div className="step-content">
                <strong>Create a Spotify App</strong>
                <span className="dimmer">Go to <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noreferrer" className="green">developer.spotify.com/dashboard</a> → Create app</span>
              </div>
            </div>
            <div className="step">
              <span className="step-num green">02</span>
              <div className="step-content">
                <strong>Add Redirect URI</strong>
                <span className="dimmer">In app settings → Redirect URIs → Add: <code>{window.location.origin}/callback</code></span>
              </div>
            </div>
            <div className="step">
              <span className="step-num green">03</span>
              <div className="step-content">
                <strong>Enter Client ID</strong>
                <div className="client-id-input">
                  <input
                    type="text"
                    placeholder="Paste your Client ID here..."
                    value={clientId}
                    onChange={e => setClientId(e.target.value)}
                    onBlur={saveClientId}
                  />
                  {clientId && <span className="green">✓</span>}
                </div>
              </div>
            </div>
            <div className="step">
              <span className="step-num green">04</span>
              <div className="step-content">
                <strong>Connect your account</strong>
                <span className="dimmer">Authorize Spotify access to start testing</span>
              </div>
            </div>
          </div>

          <button
            className={`btn-connect ${!clientId ? 'disabled' : ''}`}
            onClick={handleLogin}
            disabled={!clientId}
          >
            <span>⬡</span> Connect with Spotify
          </button>

          {!clientId && (
            <p className="connect-hint dimmer">↑ Enter your Client ID first</p>
          )}
        </div>

        <div className="env-hint">
          <span className="dimmer">For deployment: set </span>
          <code>VITE_SPOTIFY_CLIENT_ID</code>
          <span className="dimmer"> and </span>
          <code>VITE_REDIRECT_URI</code>
          <span className="dimmer"> in Vercel environment variables</span>
        </div>
      </div>
    </div>
  )
}
