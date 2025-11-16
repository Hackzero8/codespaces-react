import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { Heart, User, MessageSquare, Repeat2, Loader } from 'lucide-react'

export default function NotificationsPage({ user, onProfile }) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [activeFilter, setActiveFilter] = useState('all')

  useEffect(() => {
    if (user) {
      fetchNotifications()
      const interval = setInterval(() => {
        fetchNotifications()
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [user])

  const fetchNotifications = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          actor:actor_id(id, username, avatar_url),
          post:post_id(id, content)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setNotifications(data || [])

      // Count unread
      const unread = data?.filter(n => !n.read).length || 0
      setUnreadCount(unread)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)

      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      )
      setUnreadCount(Math.max(0, unreadCount - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false)

      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const deleteNotification = async (notificationId) => {
    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      setNotifications(prev => prev.filter(n => n.id !== notificationId))
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <Heart size={18} className="text-red-500" />
      case 'follow':
        return <User size={18} className="text-blue-500" />
      case 'reply':
        return <MessageSquare size={18} className="text-green-500" />
      case 'repost':
        return <Repeat2 size={18} className="text-purple-500" />
      default:
        return <User size={18} className="text-twitter-500" />
    }
  }

  const getNotificationText = (notification) => {
    const actor = notification.actor?.username || 'Usuario'
    switch (notification.type) {
      case 'like':
        return `${actor} le dio me gusta a tu post`
      case 'follow':
        return `${actor} ahora te sigue`
      case 'reply':
        return `${actor} respondió tu post`
      case 'repost':
        return `${actor} compartió tu post`
      case 'mention':
        return `${actor} te mencionó`
      default:
        return `Notificación de ${actor}`
    }
  }

  const filteredNotifications = activeFilter === 'all'
    ? notifications
    : notifications.filter(n => n.type === activeFilter)

  if (!user) {
    return (
      <div className="w-full h-full bg-white dark:bg-twitter-900 flex items-center justify-center">
        <div className="text-center">
          <Bell size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Inicia sesión para ver notificaciones</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-white dark:bg-twitter-900 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 border-b border-gray-200 dark:border-twitter-800 p-4 bg-white dark:bg-twitter-900 z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Notificaciones</h2>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm px-3 py-1 rounded-full bg-twitter-500 text-white hover:bg-twitter-600 transition-colors"
            >
              Marcar como leídas ({unreadCount})
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { id: 'all', label: 'Todo' },
            { id: 'like', label: 'Me gusta' },
            { id: 'follow', label: 'Seguimientos' },
            { id: 'reply', label: 'Respuestas' },
            { id: 'mention', label: 'Menciones' }
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                activeFilter === filter.id
                  ? 'bg-twitter-500 text-white'
                  : 'bg-gray-100 dark:bg-twitter-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-twitter-700'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader className="animate-spin text-twitter-500" size={32} />
          </div>
        )}

        {!loading && filteredNotifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400">
            <Bell size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-semibold mb-1">
              {activeFilter === 'all' ? 'Sin notificaciones nuevas' : 'Sin notificaciones de este tipo'}
            </p>
            <p className="text-sm">Aquí aparecerán cuando recibas interacciones</p>
          </div>
        )}

        {!loading && filteredNotifications.length > 0 && (
          <div className="divide-y divide-gray-200 dark:divide-twitter-800">
            {filteredNotifications.map(notification => (
              <div
                key={notification.id}
                onClick={() => !notification.read && markAsRead(notification.id)}
                className={`p-4 hover:bg-gray-50 dark:hover:bg-twitter-800 transition-colors cursor-pointer ${
                  !notification.read ? 'bg-twitter-50 dark:bg-twitter-900' : ''
                }`}
              >
                <div className="flex gap-3">
                  {/* Icon */}
                  <div className="flex-shrink-0 flex items-start justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-twitter-800">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onProfile && onProfile(notification.actor_id)
                      }}
                      className="flex items-center gap-2 mb-1 hover:underline"
                    >
                      {notification.actor?.avatar_url && (
                        <img
                          src={notification.actor.avatar_url}
                          alt={notification.actor?.username}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      )}
                      <span className="font-bold text-gray-900 dark:text-white">
                        {notification.actor?.username}
                      </span>
                    </button>

                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {getNotificationText(notification)}
                    </p>

                    {notification.post?.content && (
                      <p className="mt-2 text-gray-900 dark:text-white text-sm line-clamp-2">
                        {notification.post.content}
                      </p>
                    )}

                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(notification.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 flex gap-2">
                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full bg-twitter-500 mt-2" />
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteNotification(notification.id)
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors p-2"
                      title="Eliminar notificación"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

