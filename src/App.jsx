import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Layout from './components/Layout'
import Timeline from './components/Timeline'
import LandingPage from './pages/LandingPage'
import RequireAuth from './components/RequireAuth'
import SearchPage from './pages/SearchPage'
import NotificationsPage from './pages/NotificationsPage'
import SettingsPage from './pages/SettingsPage'
import ProfilePage from './pages/ProfilePage'
import CreatePost from './pages/CreatePost'
import Auth from './components/Auth'
import Ping from './pages/Ping'
import supabase from './supabase'
import useAuth from './hooks/useAuth'

function App() {
  const { user } = useAuth()
  const [page, setPage] = useState('feed')

  const handleLogout = () => {
    setUser(null)
    setPage('feed')
  }

  // user is provided by useAuth

  return (
    <BrowserRouter>
      <Layout page={page} setPage={setPage} user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/feed" element={<Timeline onOpenProfile={(id) => { setPage('profile'); }} />} />
          <Route path="/search" element={<SearchPage onProfile={(id) => { setPage('profile'); }} />} />
          <Route path="/notifications" element={<RequireAuth><NotificationsPage user={user} /></RequireAuth>} />
          <Route path="/settings" element={<RequireAuth><SettingsPage user={user} /></RequireAuth>} />
          <Route path="/profile/:id" element={<RequireAuth><ProfilePage /></RequireAuth>} />
          <Route path="/compose" element={<RequireAuth><CreatePost user={user} onClose={() => window.history.back()} onPosted={() => window.history.back()} /></RequireAuth>} />
          <Route path="/signup" element={<Auth onUser={(u) => { setUser(u); }} />} />
          <Route path="/ping" element={<Ping />} />
          <Route path="*" element={<div className="p-8 text-center">Página no encontrada</div>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App;

