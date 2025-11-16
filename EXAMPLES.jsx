/**
 * EJEMPLOS DE USO - Sistema Completo
 * 
 * Este archivo contiene ejemplos prácticos de cómo usar
 * todos los componentes, funciones y APIs del sistema
 */

// ============================================
// IMPORTS
// ============================================

import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { 
  searchAPI, 
  notificationsAPI, 
  profileAPI, 
  followAPI, 
  blockAPI, 
  likeAPI, 
  storageAPI 
} from './api'

import EditProfile from './components/EditProfile'
import SettingsPage from './pages/SettingsPage'
import SearchPage from './pages/SearchPage'
import NotificationsPage from './pages/NotificationsPage'
import ProfilePage from './pages/ProfilePage'

// ============================================
// EJEMPLO 1: Buscar Usuarios
// ============================================

export function ExampleSearchUsers() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Buscar usuarios
      const users = await searchAPI.searchUsers(query, 20)
      setResults(users)

      // Guardar en historial
      await searchAPI.saveSearchHistory(userId, query, 'people')
    } catch (error) {
      console.error('Error searching:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <form onSubmit={handleSearch}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar usuarios..."
        />
        <button type="submit" disabled={loading}>Buscar</button>
      </form>

      <div>
        {results.map(user => (
          <div key={user.id}>
            <h3>{user.username}</h3>
            <p>{user.bio}</p>
            <p>{user.followers_count} seguidores</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================
// EJEMPLO 2: Buscar Posts
// ============================================

export function ExampleSearchPosts() {
  const [query, setQuery] = useState('')
  const [posts, setPosts] = useState([])

  const handleSearch = async (e) => {
    e.preventDefault()

    try {
      // Búsqueda full-text en español
      const results = await searchAPI.searchPosts(query, 30)
      setPosts(results)

      // Guardar búsqueda
      await searchAPI.saveSearchHistory(userId, query, 'posts')
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <form onSubmit={handleSearch}>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar posts..."
      />
      <button type="submit">Buscar</button>

      {posts.map(post => (
        <div key={post.id}>
          <h4>{post.author_username}</h4>
          <p>{post.content}</p>
          <p>{post.likes_count} me gusta</p>
        </div>
      ))}
    </form>
  )
}

// ============================================
// EJEMPLO 3: Historial de Búsquedas
// ============================================

export function ExampleSearchHistory({ userId }) {
  const [history, setHistory] = useState([])

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    const h = await searchAPI.getSearchHistory(userId)
    setHistory(h)
  }

  const deleteHistoryItem = async (id) => {
    await searchAPI.deleteSearchHistory(id)
    loadHistory()
  }

  const clearAll = async () => {
    await searchAPI.clearSearchHistory(userId)
    setHistory([])
  }

  return (
    <div>
      <h3>Búsquedas Recientes</h3>
      {history.map(item => (
        <div key={item.id}>
          <span>{item.query}</span>
          <button onClick={() => deleteHistoryItem(item.id)}>Eliminar</button>
        </div>
      ))}
      <button onClick={clearAll}>Limpiar todo</button>
    </div>
  )
}

// ============================================
// EJEMPLO 4: Sistema de Notificaciones
// ============================================

export function ExampleNotifications({ userId }) {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    loadNotifications()
    // Recargar cada 5 segundos
    const interval = setInterval(loadNotifications, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadNotifications = async () => {
    // Obtener todas las notificaciones
    const notifs = await notificationsAPI.getNotifications(userId, 20, 0)
    setNotifications(notifs)

    // Obtener contador
    const count = await notificationsAPI.getUnreadCount(userId)
    setUnreadCount(count)
  }

  const handleMarkAsRead = async (notifId) => {
    await notificationsAPI.markAsRead(notifId)
    loadNotifications()
  }

  const handleMarkAllAsRead = async () => {
    await notificationsAPI.markAllAsRead(userId)
    loadNotifications()
  }

  const handleDelete = async (notifId) => {
    await notificationsAPI.deleteNotification(notifId)
    loadNotifications()
  }

  return (
    <div>
      <div>
        <h2>Notificaciones ({unreadCount} sin leer)</h2>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllAsRead}>
            Marcar todas como leídas
          </button>
        )}
      </div>

      {notifications.map(notif => (
        <div key={notif.id} style={{
          backgroundColor: notif.read ? 'white' : 'lightblue'
        }}>
          <img 
            src={notif.actor?.avatar_url} 
            alt={notif.actor?.username}
            style={{ width: 40, height: 40, borderRadius: '50%' }}
          />
          <div>
            <strong>{notif.actor?.username}</strong>
            {notif.type === 'like' && ' te dio me gusta'}
            {notif.type === 'follow' && ' ahora te sigue'}
            {notif.type === 'reply' && ' respondió tu post'}
            {notif.type === 'mention' && ' te mencionó'}
          </div>
          {notif.post && <p>{notif.post.content}</p>}

          <div>
            {!notif.read && (
              <button onClick={() => handleMarkAsRead(notif.id)}>
                Marcar como leído
              </button>
            )}
            <button onClick={() => handleDelete(notif.id)}>
              Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

// ============================================
// EJEMPLO 5: Edición de Perfil
// ============================================

export function ExampleEditProfile({ user }) {
  const [showModal, setShowModal] = useState(false)

  const handleUpdateProfile = async () => {
    // Los datos se guardan desde el componente EditProfile
    console.log('Perfil actualizado')
  }

  return (
    <div>
      <button onClick={() => setShowModal(true)}>
        Editar Perfil
      </button>

      {showModal && (
        <EditProfile
          user={user}
          onClose={() => setShowModal(false)}
          onUpdate={handleUpdateProfile}
        />
      )}
    </div>
  )
}

// ============================================
// EJEMPLO 6: Configuración de Usuario
// ============================================

export function ExampleSettings({ user }) {
  return (
    <div>
      <SettingsPage user={user} />
    </div>
  )
}

// ============================================
// EJEMPLO 7: Sistema de Likes
// ============================================

export function ExampleLikes() {
  const [likedPosts, setLikedPosts] = useState(new Set())

  const toggleLike = async (postId, userId) => {
    try {
      if (likedPosts.has(postId)) {
        // Quitar like
        await likeAPI.unlike(postId, userId)
        const newSet = new Set(likedPosts)
        newSet.delete(postId)
        setLikedPosts(newSet)
      } else {
        // Agregar like
        await likeAPI.like(postId, userId)
        setLikedPosts(new Set(likedPosts).add(postId))
      }
    } catch (error) {
      console.error('Error with like:', error)
    }
  }

  return (
    <div>
      {[1, 2, 3].map(postId => (
        <button
          key={postId}
          onClick={() => toggleLike(postId, userId)}
          style={{
            color: likedPosts.has(postId) ? 'red' : 'gray'
          }}
        >
          ❤️ {likedPosts.has(postId) ? 'Liked' : 'Like'}
        </button>
      ))}
    </div>
  )
}

// ============================================
// EJEMPLO 8: Sistema de Seguimiento
// ============================================

export function ExampleFollowSystem({ currentUserId, targetUserId }) {
  const [isFollowing, setIsFollowing] = useState(false)

  useEffect(() => {
    checkFollowStatus()
  }, [])

  const checkFollowStatus = async () => {
    const following = await followAPI.isFollowing(currentUserId, targetUserId)
    setIsFollowing(following)
  }

  const handleFollow = async () => {
    if (isFollowing) {
      await followAPI.unfollow(currentUserId, targetUserId)
      setIsFollowing(false)
    } else {
      await followAPI.follow(currentUserId, targetUserId)
      setIsFollowing(true)
    }
  }

  const getSuggestions = async () => {
    const suggestions = await followAPI.getSuggestions(currentUserId, 10)
    console.log('Sugerencias:', suggestions)
  }

  return (
    <div>
      <button onClick={handleFollow}>
        {isFollowing ? 'Siguiendo' : 'Seguir'}
      </button>
      <button onClick={getSuggestions}>
        Ver Sugerencias
      </button>
    </div>
  )
}

// ============================================
// EJEMPLO 9: Sistema de Bloqueos
// ============================================

export function ExampleBlockSystem({ currentUserId, targetUserId }) {
  const [isBlocked, setIsBlocked] = useState(false)

  useEffect(() => {
    checkBlockStatus()
  }, [])

  const checkBlockStatus = async () => {
    const blocked = await blockAPI.isBlocked(currentUserId, targetUserId)
    setIsBlocked(blocked)
  }

  const handleBlock = async () => {
    if (isBlocked) {
      await blockAPI.unblock(currentUserId, targetUserId)
      setIsBlocked(false)
    } else {
      await blockAPI.block(currentUserId, targetUserId)
      setIsBlocked(true)
    }
  }

  return (
    <button onClick={handleBlock}>
      {isBlocked ? 'Desbloqueado' : 'Bloquear'}
    </button>
  )
}

// ============================================
// EJEMPLO 10: Subir Imágenes a Storage
// ============================================

export function ExampleUploadImage({ userId }) {
  const [uploading, setUploading] = useState(false)

  const handleUploadAvatar = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      // Subir avatar
      const url = await storageAPI.uploadImage(file, 'avatars', userId)
      
      if (url) {
        // Actualizar perfil con nueva URL
        await profileAPI.updateProfile(userId, {
          avatar_url: url
        })
        console.log('Avatar actualizado:', url)
      }
    } catch (error) {
      console.error('Error uploading:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleUploadCover = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      // Subir cover
      const url = await storageAPI.uploadImage(file, 'covers', userId)
      
      if (url) {
        // Actualizar perfil
        await profileAPI.updateProfile(userId, {
          cover_url: url
        })
        console.log('Cover actualizado:', url)
      }
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <div>
        <label>Avatar:</label>
        <input
          type="file"
          onChange={handleUploadAvatar}
          disabled={uploading}
          accept="image/*"
        />
      </div>

      <div>
        <label>Cover:</label>
        <input
          type="file"
          onChange={handleUploadCover}
          disabled={uploading}
          accept="image/*"
        />
      </div>

      {uploading && <p>Subiendo...</p>}
    </div>
  )
}

// ============================================
// EJEMPLO 11: Obtener Perfil Completo
// ============================================

export function ExampleGetProfile({ userId }) {
  const [profile, setProfile] = useState(null)
  const [settings, setSettings] = useState(null)

  useEffect(() => {
    loadProfileData()
  }, [userId])

  const loadProfileData = async () => {
    // Obtener perfil
    const profileData = await profileAPI.getProfile(userId)
    setProfile(profileData)

    // Obtener configuración
    const settingsData = await profileAPI.getSettings(userId)
    setSettings(settingsData)
  }

  if (!profile) return <p>Cargando...</p>

  return (
    <div>
      <img src={profile.avatar_url} alt={profile.username} />
      <h2>{profile.username}</h2>
      <p>{profile.bio}</p>
      <p>📍 {profile.location}</p>
      <p>🌐 {profile.website}</p>

      <div>
        <p>👥 {profile.followers_count} seguidores</p>
        <p>📧 {profile.following_count} siguiendo</p>
        <p>📝 {profile.posts_count} posts</p>
      </div>

      {settings && (
        <div>
          <p>Tema: {settings.theme}</p>
          <p>Idioma: {settings.language}</p>
          <p>Cuenta privada: {settings.private_account ? 'Sí' : 'No'}</p>
        </div>
      )}
    </div>
  )
}

// ============================================
// EJEMPLO 12: Actualizar Configuración
// ============================================

export function ExampleUpdateSettings({ userId }) {
  const [theme, setTheme] = useState('light')
  const [language, setLanguage] = useState('es')

  const handleSave = async () => {
    const success = await profileAPI.updateSettings(userId, {
      theme,
      language,
      private_account: false,
      allow_notifications: true
    })

    if (success) {
      console.log('Configuración guardada')
    }
  }

  return (
    <div>
      <div>
        <label>Tema:</label>
        <select value={theme} onChange={(e) => setTheme(e.target.value)}>
          <option value="light">Claro</option>
          <option value="dark">Oscuro</option>
          <option value="auto">Auto</option>
        </select>
      </div>

      <div>
        <label>Idioma:</label>
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="es">Español</option>
          <option value="en">English</option>
          <option value="pt">Português</option>
          <option value="fr">Français</option>
        </select>
      </div>

      <button onClick={handleSave}>
        Guardar
      </button>
    </div>
  )
}

// ============================================
// EJEMPLO 13: Obtener Timeline
// ============================================

export function ExampleTimeline({ userId }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTimeline()
  }, [])

  const loadTimeline = async () => {
    try {
      const { data, error } = await supabase.rpc('get_timeline_feed', {
        p_user_id: userId,
        p_limit: 20,
        p_offset: 0
      })

      if (error) throw error
      setPosts(data || [])
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <p>Cargando...</p>

  return (
    <div>
      {posts.map(post => (
        <div key={post.id}>
          <img 
            src={post.author_avatar} 
            alt={post.author_username}
            style={{ width: 40, height: 40, borderRadius: '50%' }}
          />
          <h4>{post.author_username}</h4>
          <p>{post.content}</p>
          <p>❤️ {post.likes_count}</p>
        </div>
      ))}
    </div>
  )
}

// ============================================
// EJEMPLO 14: Crear un Post
// ============================================

export function ExampleCreatePost({ userId, onPostCreated }) {
  const [content, setContent] = useState('')
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      let imageUrl = null

      // Si hay imagen, subirla
      if (image) {
        imageUrl = await storageAPI.uploadImage(
          image, 
          'posts', 
          `${userId}`
        )
      }

      // Crear post
      const { error } = await supabase.from('posts').insert({
        content,
        author_id: userId,
        image_url: imageUrl
      })

      if (error) throw error

      setContent('')
      setImage(null)
      onPostCreated?.()
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="¿Qué está pasando?"
        maxLength={280}
      />

      <input
        type="file"
        onChange={(e) => setImage(e.target.files?.[0])}
        accept="image/*"
      />

      <button type="submit" disabled={loading || !content.trim()}>
        {loading ? 'Publicando...' : 'Publicar'}
      </button>
    </form>
  )
}

// ============================================
// EJEMPLO 15: Componente Principal Integrado
// ============================================

export function ExampleMainApp() {
  const [user, setUser] = useState(null)
  const [page, setPage] = useState('feed') // feed, search, notifications, profile, settings

  useEffect(() => {
    // Cargar usuario
    const loadUser = async () => {
      const { data } = await supabase.auth.getSession()
      setUser(data?.session?.user)
    }

    loadUser()
  }, [])

  if (!user) return <p>Por favor, inicia sesión</p>

  return (
    <div>
      <nav>
        <button onClick={() => setPage('feed')}>Inicio</button>
        <button onClick={() => setPage('search')}>Buscar</button>
        <button onClick={() => setPage('notifications')}>
          Notificaciones
        </button>
        <button onClick={() => setPage('profile')}>Perfil</button>
        <button onClick={() => setPage('settings')}>Configuración</button>
      </nav>

      <main>
        {page === 'feed' && <ExampleTimeline userId={user.id} />}
        {page === 'search' && <SearchPage user={user} />}
        {page === 'notifications' && (
          <NotificationsPage user={user} />
        )}
        {page === 'profile' && (
          <ProfilePage userId={user.id} currentUser={user} />
        )}
        {page === 'settings' && <SettingsPage user={user} />}
      </main>
    </div>
  )
}

/**
 * EXPORTAR LOS EJEMPLOS
 * 
 * Puedes usar cualquiera de estos componentes en tu app:
 * 
 * import {
 *   ExampleSearchUsers,
 *   ExampleNotifications,
 *   ExampleEditProfile,
 *   ExampleSettings,
 *   ExampleMainApp
 * } from './examples'
 */
