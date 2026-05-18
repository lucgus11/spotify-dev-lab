import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { exchangeCode } from '../utils/spotify'

export default function Callback({ onAuth }) {
  const navigate = useNavigate()
  const [status, setStatus] = useState('Exchanging tokens...')
  const [error, setError] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const err = params.get('error')
    const state = params.get('state')

    if (err) {
      setError(`Authorization denied: ${err}`)
      return
    }

    if (!code) {
      setError('No authorization code received')
      return
    }

    const savedState = sessionStorage.getItem('auth_state')
    if (state !== savedState) {
      setError('State mismatch — possible CSRF attack')
      return
    }

    exchangeCode(code)
      .then(data => {
        if (data.access_token) {
          setStatus('✓ Connected successfully!')
          onAuth()
          setTimeout(() => navigate('/'), 1000)
        } else {
          setError(data.error_description || 'Token exchange failed')
        }
      })
      .catch(e => setError(e.message))
  }, [])

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', flexDirection: 'column', gap: 16, padding: 40,
      fontFamily: 'var(--font-mono)'
    }}>
      {error ? (
        <>
          <div style={{ color: 'var(--red)', fontSize: 14, fontWeight: 700 }}>✗ Error</div>
          <div style={{ color: 'var(--text-dim)', fontSize: 12, maxWidth: 400, textAlign: 'center' }}>{error}</div>
          <button onClick={() => navigate('/')} style={{
            background: 'var(--bg-3)', color: 'var(--text)', padding: '8px 20px',
            borderRadius: 4, fontSize: 12, border: '1px solid var(--border)', cursor: 'pointer', marginTop: 8
          }}>← Back to Home</button>
        </>
      ) : (
        <>
          <div style={{ color: 'var(--green)', fontSize: 24, animation: 'spin 1s linear infinite', display: 'inline-block' }}>◎</div>
          <div style={{ color: 'var(--text-dim)', fontSize: 12 }}>{status}</div>
        </>
      )}
    </div>
  )
}
