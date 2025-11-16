import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Home,
  Search,
  Bell,
  Mail,
  Bookmark,
  Heart,
  User,
  Settings,
  LogOut,
  MoreHorizontal,
  Share2,
} from 'lucide-react'
import ThemeToggle from './ThemeToggle'

export default function Sidebar({ page, setPage, user, onLogout }) {
  const navigate = useNavigate()
  const navItems = [
    { icon: Home, label: 'Inicio', page: 'feed', color: 'text-blue-600', hoverColor: 'hover:bg-blue-50 dark:hover:bg-blue-900/20' },
    { icon: Search, label: 'Explorar', page: 'search', color: 'text-purple-600', hoverColor: 'hover:bg-purple-50 dark:hover:bg-purple-900/20' },
    { icon: Bell, label: 'Notificaciones', page: 'notifications', color: 'text-orange-600', hoverColor: 'hover:bg-orange-50 dark:hover:bg-orange-900/20' },
    { icon: Mail, label: 'Mensajes', page: 'messages', color: 'text-pink-600', hoverColor: 'hover:bg-pink-50 dark:hover:bg-pink-900/20' },
    { icon: Bookmark, label: 'Guardados', page: 'saved', color: 'text-green-600', hoverColor: 'hover:bg-green-50 dark:hover:bg-green-900/20' },
    { icon: Heart, label: 'Mis Likes', page: 'likes', color: 'text-red-600', hoverColor: 'hover:bg-red-50 dark:hover:bg-red-900/20' },
    { icon: User, label: 'Perfil', page: 'profile', color: 'text-indigo-600', hoverColor: 'hover:bg-indigo-50 dark:hover:bg-indigo-900/20' },
    { icon: Settings, label: 'Configuración', page: 'settings', color: 'text-gray-600', hoverColor: 'hover:bg-gray-50 dark:hover:bg-gray-800' },
  ]

  return (
    <div className="hidden">{/* Deprecated — sidebar converted to DropdownMenu */}
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-twitter-800">
          <div className="text-3xl font-bold text-twitter-600 dark:text-twitter-400 flex items-center justify-between">
            <span className="ml-1 md:ml-0">𝕏</span>
            <Share2 size={20} className="text-twitter-600 hidden md:inline" />
          </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
        {navItems.map(({ icon: Icon, label, page: itemPage, color, hoverColor }) => (
          <button
            key={itemPage}
            onClick={() => { setPage(itemPage); navigate(itemPage === 'feed' ? '/' : `/${itemPage}`) }}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-full font-semibold transition-all duration-200 group ${
              page === itemPage
                ? `${color} bg-opacity-10 dark:bg-opacity-10 border-2 border-current`
                : `text-gray-700 dark:text-gray-300 ${hoverColor} border-2 border-transparent`
            }`}
          >
            <Icon size={24} className={page === itemPage ? color : 'group-hover:' + color} />
            <span className={`hidden md:inline ${page === itemPage ? color : ''}`}>{label}</span>
          </button>
        ))}
      </nav>

      {/* Botón Crear */}
      <div className="px-4 mb-4 hidden md:block">
        <button
          onClick={() => { setPage('compose'); navigate('/compose') }}
          className="w-full bg-gradient-to-r from-twitter-600 to-blue-600 hover:from-twitter-700 hover:to-blue-700 text-white font-bold py-3 rounded-full text-lg transition-all duration-300 hover:shadow-lg"
        >
          Componer
        </button>
      </div>

      {/* User Profile Card */}
      {user && (
        <div className="border-t border-gray-200 dark:border-twitter-800 p-4">
          <div className="flex items-center justify-between group cursor-pointer hover:bg-gray-100 dark:hover:bg-twitter-800 p-3 rounded-full transition-all duration-200">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-12 h-12 bg-gradient-to-br from-twitter-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                {user.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-gray-900 dark:text-white truncate">
                  {user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">@{user.email?.split('@')[0] || 'user'}</p>
              </div>
            </div>
            <MoreHorizontal size={16} className="text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Dropdown Menu (visible on hover) */}
          <div className="hidden md:block group-hover:block absolute left-4 right-4 bottom-20 bg-white dark:bg-twitter-800 border border-gray-200 dark:border-twitter-700 rounded-lg shadow-xl overflow-hidden">
              <button className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-twitter-700 text-sm font-medium text-gray-900 dark:text-white" onClick={() => navigate(`/profile/${user?.id}`)}>
              Ver perfil
            </button>
              <button className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-twitter-700 text-sm font-medium text-gray-900 dark:text-white border-t border-gray-200 dark:border-twitter-700">
              Cambiar cuenta
            </button>
            <div className="px-4 py-3 border-t border-gray-200 dark:border-twitter-700 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tema</span>
              <ThemeToggle />
            </div>
            <button
              onClick={() => onLogout?.()}
              className="w-full text-left px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium text-red-600 dark:text-red-400 border-t border-gray-200 dark:border-twitter-700 flex items-center gap-2"
            >
              <LogOut size={16} />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
