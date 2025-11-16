import { supabase } from './supabase'

// ============================================
// SEARCH UTILITIES
// ============================================

export const searchAPI = {
  /**
   * Busca usuarios por nombre de usuario o biografía
   * @param {string} query - Término de búsqueda
   * @param {number} limit - Máximo de resultados
   * @returns {Promise<Array>}
   */
  searchUsers: async (query, limit = 20) => {
    try {
      const { data, error } = await supabase.rpc('search_users', {
        search_query: query,
        limit_count: limit
      })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error searching users:', error)
      return []
    }
  },

  /**
   * Busca posts por contenido
   * @param {string} query - Término de búsqueda
   * @param {number} limit - Máximo de resultados
   * @returns {Promise<Array>}
   */
  searchPosts: async (query, limit = 20) => {
    try {
      const { data, error } = await supabase.rpc('search_posts', {
        search_query: query,
        limit_count: limit
      })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error searching posts:', error)
      return []
    }
  },

  /**
   * Obtiene historial de búsquedas del usuario
   * @param {string} userId - ID del usuario
   * @returns {Promise<Array>}
   */
  getSearchHistory: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('search_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching search history:', error)
      return []
    }
  },

  /**
   * Guarda una búsqueda en el historial
   * @param {string} userId - ID del usuario
   * @param {string} query - Término buscado
   * @param {string} type - Tipo de búsqueda ('people', 'posts', 'general')
   * @returns {Promise<boolean>}
   */
  saveSearchHistory: async (userId, query, type = 'general') => {
    try {
      const { error } = await supabase.from('search_history').insert({
        user_id: userId,
        query,
        type
      })

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error saving search history:', error)
      return false
    }
  },

  /**
   * Elimina un elemento del historial
   * @param {number} historyId - ID del historial
   * @returns {Promise<boolean>}
   */
  deleteSearchHistory: async (historyId) => {
    try {
      const { error } = await supabase
        .from('search_history')
        .delete()
        .eq('id', historyId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting search history:', error)
      return false
    }
  },

  /**
   * Limpia todo el historial de búsquedas
   * @param {string} userId - ID del usuario
   * @returns {Promise<boolean>}
   */
  clearSearchHistory: async (userId) => {
    try {
      const { error } = await supabase
        .from('search_history')
        .delete()
        .eq('user_id', userId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error clearing search history:', error)
      return false
    }
  }
}

// ============================================
// NOTIFICATION UTILITIES
// ============================================

export const notificationsAPI = {
  /**
   * Obtiene todas las notificaciones del usuario
   * @param {string} userId - ID del usuario
   * @param {number} limit - Máximo de resultados
   * @param {number} offset - Salto para paginación
   * @returns {Promise<Array>}
   */
  getNotifications: async (userId, limit = 20, offset = 0) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          actor:actor_id(id, username, avatar_url),
          post:post_id(id, content)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)
        .offset(offset)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching notifications:', error)
      return []
    }
  },

  /**
   * Obtiene notificaciones no leídas
   * @param {string} userId - ID del usuario
   * @returns {Promise<Array>}
   */
  getUnreadNotifications: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          actor:actor_id(id, username, avatar_url),
          post:post_id(id, content)
        `)
        .eq('user_id', userId)
        .eq('read', false)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching unread notifications:', error)
      return []
    }
  },

  /**
   * Obtiene el conteo de notificaciones no leídas
   * @param {string} userId - ID del usuario
   * @returns {Promise<number>}
   */
  getUnreadCount: async (userId) => {
    try {
      const { data, error } = await supabase.rpc(
        'get_unread_notifications_count',
        { p_user_id: userId }
      )

      if (error) throw error
      return data || 0
    } catch (error) {
      console.error('Error getting unread count:', error)
      return 0
    }
  },

  /**
   * Marca una notificación como leída
   * @param {number} notificationId - ID de la notificación
   * @returns {Promise<boolean>}
   */
  markAsRead: async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error marking as read:', error)
      return false
    }
  },

  /**
   * Marca todas las notificaciones como leídas
   * @param {string} userId - ID del usuario
   * @returns {Promise<boolean>}
   */
  markAllAsRead: async (userId) => {
    try {
      const { error } = await supabase.rpc(
        'mark_notifications_as_read',
        { p_user_id: userId }
      )

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error marking all as read:', error)
      return false
    }
  },

  /**
   * Elimina una notificación
   * @param {number} notificationId - ID de la notificación
   * @returns {Promise<boolean>}
   */
  deleteNotification: async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting notification:', error)
      return false
    }
  },

  /**
   * Filtra notificaciones por tipo
   * @param {Array} notifications - Array de notificaciones
   * @param {string} type - Tipo a filtrar
   * @returns {Array}
   */
  filterByType: (notifications, type) => {
    return notifications.filter(n => n.type === type)
  },

  /**
   * Agrupa notificaciones del mismo tipo
   * @param {Array} notifications - Array de notificaciones
   * @returns {Object}
   */
  groupByType: (notifications) => {
    return notifications.reduce((acc, notif) => {
      if (!acc[notif.type]) {
        acc[notif.type] = []
      }
      acc[notif.type].push(notif)
      return acc
    }, {})
  }
}

// ============================================
// LIKE UTILITIES
// ============================================

export const likesAPI = {
  toggleLike: async (postId) => {
    try {
      const { data, error } = await supabase.rpc('toggle_like', { p_post_id: postId })
      if (error) throw error
      // toggle_like returns a table with 'liked' and 'likes_count'
      return data && data[0] ? data[0] : { liked: false, likes_count: 0 }
    } catch (error) {
      console.error('Error toggling like:', error)
      return { liked: false, likes_count: null }
    }
  }
}

// ============================================
// PROFILE UTILITIES
// ============================================

export const profileAPI = {
  /**
   * Obtiene el perfil de un usuario
   * @param {string} userId - ID del usuario
   * @returns {Promise<Object|null>}
   */
  getProfile: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data || null
    } catch (error) {
      console.error('Error fetching profile:', error)
      return null
    }
  },

  /**
   * Actualiza el perfil del usuario
   * @param {string} userId - ID del usuario
   * @param {Object} updates - Datos a actualizar
   * @returns {Promise<boolean>}
   */
  updateProfile: async (userId, updates) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date()
        })
        .eq('id', userId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error updating profile:', error)
      return false
    }
  },

  /**
   * Obtiene las configuraciones del usuario
   * @param {string} userId - ID del usuario
   * @returns {Promise<Object|null>}
   */
  getSettings: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data || null
    } catch (error) {
      console.error('Error fetching settings:', error)
      return null
    }
  },

  /**
   * Actualiza las configuraciones del usuario
   * @param {string} userId - ID del usuario
   * @param {Object} settings - Configuraciones a actualizar
   * @returns {Promise<boolean>}
   */
  updateSettings: async (userId, settings) => {
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          id: userId,
          ...settings,
          updated_at: new Date()
        })

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error updating settings:', error)
      return false
    }
  }
}

// ============================================
// FOLLOW UTILITIES
// ============================================

export const followAPI = {
  /**
   * Verifica si un usuario sigue a otro
   * @param {string} followerId - ID del que sigue
   * @param {string} followingId - ID del seguido
   * @returns {Promise<boolean>}
   */
  isFollowing: async (followerId, followingId) => {
    try {
      const { data, error } = await supabase.rpc('is_following', {
        p_follower_id: followerId,
        p_following_id: followingId
      })

      if (error) throw error
      return data || false
    } catch (error) {
      console.error('Error checking follow status:', error)
      return false
    }
  },

  /**
   * Sigue a un usuario
   * @param {string} followerId - ID del que va a seguir
   * @param {string} followingId - ID del usuario a seguir
   * @returns {Promise<boolean>}
   */
  follow: async (followerId, followingId) => {
    try {
      const { error } = await supabase.from('follows').insert({
        follower_id: followerId,
        following_id: followingId
      })

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error following user:', error)
      return false
    }
  },

  /**
   * Deja de seguir a un usuario
   * @param {string} followerId - ID del que va a dejar de seguir
   * @param {string} followingId - ID del usuario a dejar de seguir
   * @returns {Promise<boolean>}
   */
  unfollow: async (followerId, followingId) => {
    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', followingId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error unfollowing user:', error)
      return false
    }
  },

  /**
   * Obtiene sugerencias de usuarios a seguir
   * @param {string} userId - ID del usuario
   * @param {number} limit - Cantidad de sugerencias
   * @returns {Promise<Array>}
   */
  getSuggestions: async (userId, limit = 10) => {
    try {
      const { data, error } = await supabase.rpc('get_user_suggestions', {
        p_user_id: userId,
        p_limit: limit
      })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting suggestions:', error)
      return []
    }
  }
}

// ============================================
// BLOCK UTILITIES
// ============================================

export const blockAPI = {
  /**
   * Verifica si un usuario está bloqueado
   * @param {string} blockerId - ID del que bloquea
   * @param {string} blockedId - ID del potencialmente bloqueado
   * @returns {Promise<boolean>}
   */
  isBlocked: async (blockerId, blockedId) => {
    try {
      const { data, error } = await supabase.rpc('is_blocked', {
        p_blocker_id: blockerId,
        p_blocked_id: blockedId
      })

      if (error) throw error
      return data || false
    } catch (error) {
      console.error('Error checking block status:', error)
      return false
    }
  },

  /**
   * Bloquea a un usuario
   * @param {string} blockerId - ID del que bloquea
   * @param {string} blockedId - ID del usuario a bloquear
   * @returns {Promise<boolean>}
   */
  block: async (blockerId, blockedId) => {
    try {
      const { error } = await supabase.rpc('block_user', {
        p_blocker_id: blockerId,
        p_blocked_id: blockedId
      })

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error blocking user:', error)
      return false
    }
  },

  /**
   * Desbloquea a un usuario
   * @param {string} blockerId - ID del que desbloquea
   * @param {string} blockedId - ID del usuario a desbloquear
   * @returns {Promise<boolean>}
   */
  unblock: async (blockerId, blockedId) => {
    try {
      const { error } = await supabase.rpc('unblock_user', {
        p_blocker_id: blockerId,
        p_blocked_id: blockedId
      })

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error unblocking user:', error)
      return false
    }
  }
}

// ============================================
// LIKE UTILITIES
// ============================================

export const likeAPI = {
  /**
   * Verifica si un usuario dio like a un post
   * @param {number} postId - ID del post
   * @param {string} userId - ID del usuario
   * @returns {Promise<boolean>}
   */
  hasLiked: async (postId, userId) => {
    try {
      const { data, error } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return !!data
    } catch (error) {
      console.error('Error checking like:', error)
      return false
    }
  },

  /**
   * Da like a un post
   * @param {number} postId - ID del post
   * @param {string} userId - ID del usuario
   * @returns {Promise<boolean>}
   */
  like: async (postId, userId) => {
    try {
      const { error } = await supabase.from('likes').insert({
        post_id: postId,
        user_id: userId
      })

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error liking post:', error)
      return false
    }
  },

  /**
   * Retira el like de un post
   * @param {number} postId - ID del post
   * @param {string} userId - ID del usuario
   * @returns {Promise<boolean>}
   */
  unlike: async (postId, userId) => {
    try {
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error unliking post:', error)
      return false
    }
  }
}

// ============================================
// STORAGE UTILITIES
// ============================================

export const storageAPI = {
  /**
   * Sube una imagen a storage
   * @param {File} file - Archivo a subir
   * @param {string} bucket - Nombre del bucket ('avatars', 'covers', 'posts')
   * @param {string} path - Ruta donde guardar
   * @returns {Promise<string|null>} - URL pública o null
   */
  uploadImage: async (file, bucket, path) => {
    if (!file) return null

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${path}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error(`Error uploading to ${bucket}:`, error)
      return null
    }
  },

  /**
   * Elimina una imagen de storage
   * @param {string} bucket - Nombre del bucket
   * @param {string} filePath - Ruta del archivo
   * @returns {Promise<boolean>}
   */
  deleteImage: async (bucket, filePath) => {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath])

      if (error) throw error
      return true
    } catch (error) {
      console.error(`Error deleting from ${bucket}:`, error)
      return false
    }
  }
}
