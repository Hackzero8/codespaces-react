import React, { useState, useRef, useEffect } from 'react'
import { Home, Search, Bell, Bookmark, Heart, User, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function DropdownMenu({ page, setPage }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    function onDoc(e) {
      if (!ref.current?.contains(e.target)) setOpen(false)
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('click', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('click', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const items = [
    { icon: Home, label: 'Inicio', page: 'feed', path: '/' },
    { icon: Search, label: 'Explorar', page: 'search', path: '/search' },
    { icon: Bell, label: 'Notificaciones', page: 'notifications', path: '/notifications' },
    { icon: User, label: 'Perfil', page: 'profile' },
    { icon: Heart, label: 'Mis Likes', page: 'likes' },
    { icon: Bookmark, label: 'Guardados', page: 'saved' },
    { icon: Settings, label: 'Ajustes', page: 'settings' },
  ]

  useEffect(() => {
    if (open) {
      // Focus first element for keyboard users
      const btn = ref.current?.querySelector('[data-first]')
      btn?.focus()
    }
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((s) => !s)}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-twitter-800 transition-colors"
        title="Menu"
      >
        <span className="text-xl">☰</span>
      </button>

      {open && (
        <div className="absolute left-0 top-10 z-50 w-52 bg-white dark:bg-twitter-900 border border-gray-200 dark:border-twitter-800 rounded-lg shadow-lg py-2 menu-anim">
            {items.map(({ icon: Icon, label, page: itemPage, path }, i) => (
            <button
              key={itemPage}
              onClick={() => {
                setOpen(false)
                setPage && setPage(itemPage)
                try { navigate(path ?? (itemPage === 'feed' ? '/' : `/${itemPage}`)) } catch (e) {}
              }}
              data-first={i === 0}
              className="w-full px-3 py-2 text-left flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-twitter-800"
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
