import React, { useEffect, useState } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './components/Home'
import Explorer from './components/Explorer'
import Dashboard from './components/Dashboard'
import History from './components/History'
import Callback from './components/Callback'
import Visualizer from './components/Visualizer'
import { isLoggedIn } from './utils/spotify'

export default function App() {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn())

  const handleAuth = () => setLoggedIn(isLoggedIn())

  return (
    <Routes>
      <Route path="/callback" element={<Callback onAuth={handleAuth} />} />
      <Route path="/" element={<Layout loggedIn={loggedIn} onLogout={() => { setLoggedIn(false) }} />}>
        <Route index element={<Home loggedIn={loggedIn} onAuth={handleAuth} />} />
        <Route path="explorer" element={<Explorer />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="history" element={<History />} />
        <Route path="visualizer" element={<Visualizer />} />
      </Route>
    </Routes>
  )
}
