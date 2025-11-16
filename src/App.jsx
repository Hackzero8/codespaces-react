import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import Layout from './components/Layout'
import Timeline from './components/Timeline'
import SearchPage from './pages/SearchPage'
import NotificationsPage from './pages/NotificationsPage'
import SettingsPage from './pages/SettingsPage'
import ProfilePage from './pages/ProfilePage'
import CreatePost from './pages/CreatePost'
import Ping from './pages/Ping'

function App() {
  const [user, setUser] = useState(null)
  const [page, setPage] = useState('feed')

  const handleLogout = () => {
    setUser(null)
    setPage('feed')
  }

  return (
    <BrowserRouter>
      <Layout page={page} setPage={setPage} user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Timeline onOpenProfile={(id) => { setPage('profile'); }} />} />
          <Route path="/search" element={<SearchPage onProfile={(id) => { setPage('profile'); }} />} />
          <Route path="/notifications" element={<NotificationsPage user={user} />} />
          <Route path="/settings" element={<SettingsPage user={user} />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="/compose" element={<CreatePost user={user} onClose={() => window.history.back()} onPosted={() => window.history.back()} />} />
          <Route path="/ping" element={<Ping />} />
          <Route path="*" element={<div className="p-8 text-center">Página no encontrada</div>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App;

