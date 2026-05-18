import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { logout } from '../utils/spotify'
import './Layout.css'

const NAV = [
  { to: '/', icon: '⬡', label: 'Home', exact: true },
  { to: '/explorer', icon: '◈', label: 'API Explorer' },
  { to: '/dashboard', icon: '◉', label: 'Dashboard' },
  { to: '/visualizer', icon: '◎', label: 'Visualizer' },
  { to: '/history', icon: '◇', label: 'History' },
]

export default function Layout({ loggedIn, onLogout }) {
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  function handleLogout() {
    logout()
    onLogout()
    navigate('/')
  }

  return (
    <div className={`layout ${collapsed ? 'collapsed' : ''}`}>
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">◈</span>
            {!collapsed && <span className="logo-text">Spotify<br /><em>Dev Lab</em></span>}
          </div>
          <button className="collapse-btn" onClick={() => setCollapsed(c => !c)} title="Toggle sidebar">
            {collapsed ? '›' : '‹'}
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to} end={n.exact} className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">{n.icon}</span>
              {!collapsed && <span className="nav-label">{n.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          {loggedIn ? (
            <button className="btn-logout" onClick={handleLogout} title="Logout">
              <span>⏻</span>{!collapsed && ' Logout'}
            </button>
          ) : (
            <div className={`auth-status ${collapsed ? 'mini' : ''}`}>
              {collapsed ? <span className="status-dot offline" /> : <><span className="status-dot offline" /> Not connected</>}
            </div>
          )}
          {!collapsed && (
            <div className="sidebar-version">
              <span className="dimmer">v1.0.0 · Spotify API v1</span>
            </div>
          )}
        </div>
      </aside>

      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}
