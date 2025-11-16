import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Home, Search, Bell, Mail, User, MoreHorizontal } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import DropdownMenu from './DropdownMenu'

export default function Navbar({ user, setPage }) {
  const navigate = useNavigate()
  return (
    // single fixed header with center logo, semi-window black effect
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-twitter-900 backdrop-blur-sm border-b border-gray-200 dark:border-white/10">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
        {/* left - dropdown menu */}
        <div className="flex items-center gap-3">
          <DropdownMenu setPage={setPage} />
        </div>

        {/* center - logo (Twitter-like) */}
        <div className="flex-1 flex items-center justify-center">
          <div className="flex-none">
            <img src="/Octocat.png" alt="logo" className="h-10 w-auto rounded-md shadow-2xl" />
          </div>
        </div>

        {/* right - actions */}
        <div className="flex items-center gap-3">
          <button onClick={() => { setPage('feed'); navigate('/feed') }} className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-twitter-800 transition-colors">
            <Home size={18} />
            <span className="hidden xl:inline text-sm font-semibold">Inicio</span>
          </button>

          <button onClick={() => { setPage('search'); navigate('/search') }} className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-twitter-800 transition-colors">
            <MoreHorizontal size={18} />
            <span className="hidden xl:inline text-sm font-semibold">Explorar</span>
          </button>

          <button onClick={() => { setPage('notifications'); navigate('/notifications') }} className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-twitter-800 transition-colors">
            <Bell size={18} />
          </button>

          <button onClick={() => { setPage('messages'); navigate('/messages') }} className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-twitter-800 transition-colors">
            <Mail size={18} />
          </button>

          <div className="flex items-center gap-2">
            <button onClick={() => { if (!user) { navigate('/signup'); return } setPage('profile'); navigate(`/profile/${user.id}`) }} className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-twitter-800 transition-colors">
              <User size={18} />
              <span className="hidden md:inline text-sm">{user?.email ? user.email.split('@')[0] : 'Perfil'}</span>
            </button>
          </div>
          {/* Theme toggle */}
          <ThemeToggle />
        </div>
      </div>
    </nav>
  )
}
