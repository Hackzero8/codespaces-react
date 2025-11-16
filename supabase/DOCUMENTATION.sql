-- ============================================
-- DOCUMENTACIÓN DEL SISTEMA COMPLETO
-- ============================================
-- Sistema Twitter-like con:
-- ✅ Gestión de Perfiles (edición, avatares, covers)
-- ✅ Sistema de Notificaciones (likes, follows, menciones)
-- ✅ Búsqueda Avanzada (usuarios y posts)
-- ✅ Configuración de Usuario (temas, idioma, privacidad)
-- ✅ Bloques de Usuarios
-- ✅ Row Level Security (RLS)
-- ✅ Triggers y Funciones Automáticas

-- ============================================
-- TABLAS PRINCIPALES
-- ============================================

/**
 * TABLA: profiles
 * Descripción: Información del perfil de usuarios
 * Relación: Vinculada a auth.users
 * 
 * Campos:
 * - id: UUID (PK) - Referencia a auth.users
 * - username: text UNIQUE - Nombre único del usuario
 * - email: text UNIQUE - Email del usuario
 * - avatar_url: text - URL de la foto de perfil (almacenado en bucket 'avatars')
 * - cover_url: text - URL de la imagen de portada (almacenado en bucket 'covers')
 * - bio: text - Biografía (máx 160 caracteres)
 * - location: text - Ubicación del usuario
 * - website: text - Sitio web del usuario
 * - verified: boolean - Indica si está verificado
 * - followers_count: integer - Caché de seguidores
 * - following_count: integer - Caché de seguidos
 * - posts_count: integer - Caché de posts
 * - created_at: timestamptz - Fecha de creación
 * - updated_at: timestamptz - Fecha de última actualización
 * 
 * Índices:
 * - idx_profiles_username: búsquedas rápidas por username
 * - idx_profiles_email: búsquedas rápidas por email
 * 
 * Políticas RLS:
 * - Lectura: PÚBLICA (todos pueden ver perfiles)
 * - Escritura: Solo el propietario puede actualizar su perfil
 */

/**
 * TABLA: posts
 * Descripción: Posts/tweets de usuarios
 * 
 * Campos:
 * - id: bigint (PK) - ID auto-generado
 * - content: text - Contenido del post (máx 280 caracteres)
 * - author_id: uuid (FK) - Referencia al autor (profiles.id)
 * - image_url: text - URL de imagen adjunta (almacenado en bucket 'posts')
 * - likes_count: integer - Caché de likes
 * - replies_count: integer - Caché de respuestas
 * - reposts_count: integer - Caché de retweets
 * - created_at: timestamptz - Fecha de creación
 * - updated_at: timestamptz - Fecha de edición
 * 
 * Índices:
 * - idx_posts_created_at: ordenamiento por fecha
 * - idx_posts_author_id: búsquedas por autor
 * - idx_posts_content_search: búsqueda full-text en español
 * 
 * Políticas RLS:
 * - Lectura: PÚBLICA
 * - Insertar: Solo autenticados (author_id = current_user)
 * - Actualizar: Solo el autor
 * - Eliminar: Solo el autor
 */

/**
 * TABLA: follows
 * Descripción: Relaciones de seguimiento entre usuarios
 * 
 * Campos:
 * - id: bigint (PK) - ID auto-generado
 * - follower_id: uuid (FK) - Usuario que sigue
 * - following_id: uuid (FK) - Usuario siendo seguido
 * - created_at: timestamptz - Fecha de seguimiento
 * 
 * Constraints:
 * - unique_follow: (follower_id, following_id) - Un follow por par único
 * - no_self_follow: follower_id != following_id - No auto-seguirse
 * 
 * Índices:
 * - idx_follows_follower_id: búsquedas de "mis seguimientos"
 * - idx_follows_following_id: búsquedas de "mis seguidores"
 * 
 * Políticas RLS:
 * - Lectura: PÚBLICA
 * - Insertar: Solo autenticados (follower_id = current_user)
 * - Eliminar: Solo el seguidor puede dejar de seguir
 */

/**
 * TABLA: likes
 * Descripción: Me gusta en posts
 * 
 * Campos:
 * - id: bigint (PK) - ID auto-generado
 * - post_id: bigint (FK) - Referencia al post
 * - user_id: uuid (FK) - Usuario que da like
 * - created_at: timestamptz - Fecha del like
 * 
 * Constraints:
 * - unique_like: (post_id, user_id) - Un like por usuario por post
 * 
 * Índices:
 * - idx_likes_post_id: búsquedas de likes en un post
 * - idx_likes_user_id: búsquedas de posts liked por usuario
 * 
 * Políticas RLS:
 * - Lectura: PÚBLICA
 * - Insertar: Solo autenticados (user_id = current_user)
 * - Eliminar: Solo el usuario puede remover su like
 */

/**
 * TABLA: notifications
 * Descripción: Notificaciones de usuarios
 * Tipos: 'like', 'follow', 'reply', 'repost', 'mention'
 * 
 * Campos:
 * - id: bigint (PK) - ID auto-generado
 * - user_id: uuid (FK) - Destinatario de la notificación
 * - actor_id: uuid (FK) - Usuario que realizó la acción
 * - type: text - Tipo de notificación
 * - post_id: bigint (FK) - Post relacionado (opcional)
 * - related_notification_id: bigint (FK) - Notificación relacionada (agrupación)
 * - read: boolean - Si ha sido leída
 * - created_at: timestamptz - Fecha de creación
 * 
 * Índices:
 * - idx_notifications_user_id: búsquedas de notificaciones del usuario
 * - idx_notifications_created_at: ordenamiento temporal
 * - idx_notifications_read: búsquedas de no-leídas
 * - idx_notifications_actor_id: búsquedas por actor
 * 
 * Políticas RLS:
 * - Lectura: Solo el destinatario
 * - Insertar: Sistema (triggers)
 * - Actualizar: Solo el destinatario
 * - Eliminar: Solo el destinatario
 */

/**
 * TABLA: user_settings
 * Descripción: Configuración personal de usuarios
 * 
 * Campos:
 * - id: uuid (PK) - Referencia a profiles.id
 * - theme: text - Tema ('light', 'dark', 'auto')
 * - language: text - Idioma preferido ('es', 'en', 'pt', 'fr')
 * - private_account: boolean - Cuenta privada
 * - allow_notifications: boolean - Permitir notificaciones
 * - email_notifications: boolean - Notificaciones por email
 * - push_notifications: boolean - Notificaciones push
 * - notification_follows: boolean - Notif de nuevos followers
 * - notification_likes: boolean - Notif de likes
 * - notification_replies: boolean - Notif de respuestas
 * - notification_mentions: boolean - Notif de menciones
 * - analytics_enabled: boolean - Permitir análisis
 * - two_factor_enabled: boolean - Autenticación de dos factores
 * - created_at: timestamptz
 * - updated_at: timestamptz
 * 
 * Políticas RLS:
 * - Lectura: Solo el propietario
 * - Insertar: Solo el propietario
 * - Actualizar: Solo el propietario
 */

/**
 * TABLA: search_history
 * Descripción: Historial de búsquedas del usuario
 * 
 * Campos:
 * - id: bigint (PK) - ID auto-generado
 * - user_id: uuid (FK) - Usuario que buscó
 * - query: text - Término buscado
 * - type: text - Tipo de búsqueda ('people', 'posts', 'general')
 * - created_at: timestamptz - Fecha de búsqueda
 * 
 * Índices:
 * - idx_search_history_user_id: búsquedas del usuario
 * - idx_search_history_created_at: ordenamiento temporal
 * 
 * Políticas RLS:
 * - Lectura: Solo el propietario
 * - Insertar: Solo el propietario
 * - Eliminar: Solo el propietario
 */

/**
 * TABLA: blocked_users
 * Descripción: Usuarios bloqueados
 * 
 * Campos:
 * - id: bigint (PK) - ID auto-generado
 * - blocker_id: uuid (FK) - Usuario que bloquea
 * - blocked_id: uuid (FK) - Usuario bloqueado
 * - created_at: timestamptz - Fecha del bloqueo
 * 
 * Constraints:
 * - unique_block: (blocker_id, blocked_id) - Un bloqueo por par único
 * - no_self_block: blocker_id != blocked_id - No auto-bloquearse
 * 
 * Índices:
 * - idx_blocked_users_blocker_id: búsquedas de usuarios que bloqueé
 * - idx_blocked_users_blocked_id: búsquedas de quién me bloquea
 * 
 * Políticas RLS:
 * - Lectura: Solo el bloqueador
 * - Insertar: Solo el bloqueador
 * - Eliminar: Solo el bloqueador
 */

-- ============================================
-- FUNCIONES DISPONIBLES
-- ============================================

/**
 * FUNCIÓN: update_profile_counts()
 * Tipo: TRIGGER FUNCTION
 * Propósito: Actualiza contadores en caché de profiles
 * 
 * Acciones:
 * - Incrementa/decrementa posts_count cuando se crea/elimina un post
 * - Incrementa/decrementa followers_count en el seguido
 * - Incrementa/decrementa following_count en el seguidor
 * 
 * Triggers:
 * - update_posts_count: después de INSERT/DELETE en posts
 * - update_follows_count: después de INSERT/DELETE en follows
 */

/**
 * FUNCIÓN: update_post_counts()
 * Tipo: TRIGGER FUNCTION
 * Propósito: Actualiza contadores de likes en posts
 * 
 * Acciones:
 * - Incrementa/decrementa likes_count en post
 * 
 * Triggers:
 * - update_likes_count: después de INSERT/DELETE en likes
 */

/**
 * FUNCIÓN: create_notification(p_user_id, p_actor_id, p_type, p_post_id)
 * Tipo: PROCEDURE
 * Propósito: Crea una notificación
 * 
 * Parámetros:
 * - p_user_id: uuid - Destinatario
 * - p_actor_id: uuid - Usuario que realizó la acción
 * - p_type: text - Tipo ('like', 'follow', 'reply', 'repost', 'mention')
 * - p_post_id: bigint (opcional) - Post relacionado
 * 
 * Ejemplo:
 * SELECT create_notification('user_id'::uuid, 'actor_id'::uuid, 'like', 123);
 */

/**
 * FUNCIÓN: handle_like_notification()
 * Tipo: TRIGGER FUNCTION
 * Propósito: Crea automáticamente una notificación cuando hay un like
 * 
 * Condiciones:
 * - El usuario que da like no es el autor del post
 * 
 * Triggers:
 * - trigger_like_notification: después de INSERT en likes
 */

/**
 * FUNCIÓN: handle_follow_notification()
 * Tipo: TRIGGER FUNCTION
 * Propósito: Crea automáticamente una notificación cuando alguien sigue
 * 
 * Triggers:
 * - trigger_follow_notification: después de INSERT en follows
 */

/**
 * FUNCIÓN: search_users(search_query, limit_count)
 * Tipo: SET RETURNING FUNCTION
 * Propósito: Busca usuarios por username o bio
 * 
 * Parámetros:
 * - search_query: text - Término de búsqueda (case-insensitive)
 * - limit_count: int - Máximo de resultados (default 20)
 * 
 * Retorna:
 * - id, username, avatar_url, bio, followers_count
 * 
 * Ejemplo:
 * SELECT * FROM search_users('john', 20);
 */

/**
 * FUNCIÓN: search_posts(search_query, limit_count)
 * Tipo: SET RETURNING FUNCTION
 * Propósito: Busca posts por contenido (full-text search en español)
 * 
 * Parámetros:
 * - search_query: text - Término de búsqueda
 * - limit_count: int - Máximo de resultados (default 20)
 * 
 * Retorna:
 * - id, content, author_id, author_username, author_avatar, created_at, likes_count
 * 
 * Ejemplo:
 * SELECT * FROM search_posts('tecnología', 20);
 */

/**
 * FUNCIÓN: get_unread_notifications_count(p_user_id)
 * Tipo: SCALAR FUNCTION
 * Propósito: Obtiene el número de notificaciones no leídas
 * 
 * Parámetros:
 * - p_user_id: uuid - ID del usuario
 * 
 * Retorna: integer - Cantidad de notificaciones no leídas
 * 
 * Ejemplo:
 * SELECT get_unread_notifications_count('user_id'::uuid);
 */

/**
 * FUNCIÓN: mark_notifications_as_read(p_user_id)
 * Tipo: PROCEDURE
 * Propósito: Marca todas las notificaciones como leídas
 * 
 * Parámetros:
 * - p_user_id: uuid - ID del usuario
 * 
 * Ejemplo:
 * SELECT mark_notifications_as_read('user_id'::uuid);
 */

/**
 * FUNCIÓN: get_timeline_feed(p_user_id, p_limit, p_offset)
 * Tipo: SET RETURNING FUNCTION
 * Propósito: Obtiene el timeline del usuario (posts propios + seguidos)
 * 
 * Parámetros:
 * - p_user_id: uuid - ID del usuario
 * - p_limit: int - Cantidad de posts (default 20)
 * - p_offset: int - Salto para paginación (default 0)
 * 
 * Retorna:
 * - Todos los campos del post + info del autor + liked_by_user
 * 
 * Ejemplo:
 * SELECT * FROM get_timeline_feed('user_id'::uuid, 20, 0);
 */

/**
 * FUNCIÓN: is_following(p_follower_id, p_following_id)
 * Tipo: SCALAR FUNCTION
 * Propósito: Verifica si un usuario sigue a otro
 * 
 * Parámetros:
 * - p_follower_id: uuid - Usuario que sigue
 * - p_following_id: uuid - Usuario siendo seguido
 * 
 * Retorna: boolean
 * 
 * Ejemplo:
 * SELECT is_following('follower_id'::uuid, 'following_id'::uuid);
 */

/**
 * FUNCIÓN: is_blocked(p_blocker_id, p_blocked_id)
 * Tipo: SCALAR FUNCTION
 * Propósito: Verifica si un usuario está bloqueado
 * 
 * Parámetros:
 * - p_blocker_id: uuid - Usuario que bloquea
 * - p_blocked_id: uuid - Usuario potencialmente bloqueado
 * 
 * Retorna: boolean
 * 
 * Ejemplo:
 * SELECT is_blocked('blocker_id'::uuid, 'blocked_id'::uuid);
 */

/**
 * FUNCIÓN: block_user(p_blocker_id, p_blocked_id)
 * Tipo: PROCEDURE
 * Propósito: Bloquea a un usuario
 * 
 * Parámetros:
 * - p_blocker_id: uuid - Usuario que bloquea
 * - p_blocked_id: uuid - Usuario a bloquear
 * 
 * Ejemplo:
 * SELECT block_user('blocker_id'::uuid, 'blocked_id'::uuid);
 */

/**
 * FUNCIÓN: unblock_user(p_blocker_id, p_blocked_id)
 * Tipo: PROCEDURE
 * Propósito: Desbloquea a un usuario
 * 
 * Parámetros:
 * - p_blocker_id: uuid - Usuario que desbloquea
 * - p_blocked_id: uuid - Usuario a desbloquear
 * 
 * Ejemplo:
 * SELECT unblock_user('blocker_id'::uuid, 'blocked_id'::uuid);
 */

/**
 * FUNCIÓN: get_user_suggestions(p_user_id, p_limit)
 * Tipo: SET RETURNING FUNCTION
 * Propósito: Obtiene sugerencias de usuarios a seguir
 * 
 * Parámetros:
 * - p_user_id: uuid - ID del usuario
 * - p_limit: int - Cantidad de sugerencias (default 10)
 * 
 * Retorna:
 * - Usuarios que no sigue, ordenados por followers_count
 * 
 * Ejemplo:
 * SELECT * FROM get_user_suggestions('user_id'::uuid, 10);
 */

-- ============================================
-- STORAGE BUCKETS
-- ============================================

/**
 * BUCKET: avatars
 * Propósito: Almacenar fotos de perfil de usuarios
 * Ruta: /avatars/{user_id}/{filename}
 * Políticas:
 * - LECTURA: Pública (todos pueden ver)
 * - ESCRITURA: Solo el propietario
 * 
 * Ejemplos de URL:
 * https://your-project.supabase.co/storage/v1/object/public/avatars/uuid/image.jpg
 */

/**
 * BUCKET: covers
 * Propósito: Almacenar imágenes de portada de perfiles
 * Ruta: /covers/{user_id}/{filename}
 * Políticas:
 * - LECTURA: Pública
 * - ESCRITURA: Solo el propietario
 */

/**
 * BUCKET: posts
 * Propósito: Almacenar imágenes adjuntas en posts
 * Ruta: /posts/{user_id}/{post_id}/{filename}
 * Políticas:
 * - LECTURA: Pública
 * - ESCRITURA: Solo el autor del post
 */

-- ============================================
-- VISTAS (VIEWS)
-- ============================================

/**
 * VISTA: user_stats
 * Propósito: Estadísticas generales de usuarios
 * 
 * Columnas:
 * - id: uuid - ID del usuario
 * - username: text - Nombre de usuario
 * - posts_count: integer - Total de posts
 * - followers_count: integer - Total de seguidores
 * - following_count: integer - Total de seguimientos
 * - likes_received: integer - Total de likes recibidos
 * - total_posts: integer - Total de posts (duplicado para verificación)
 * 
 * Uso:
 * SELECT * FROM user_stats ORDER BY followers_count DESC LIMIT 10;
 */

/**
 * VISTA: trending_posts
 * Propósito: Posts en tendencia de últimos 7 días
 * 
 * Columnas:
 * - id: bigint - ID del post
 * - content: text - Contenido
 * - author_id: uuid - Autor
 * - username: text - Nombre del autor
 * - likes_count: integer - Total de likes
 * - created_at: timestamptz - Fecha
 * - trending_rank: integer - Posición en trending
 * 
 * Uso:
 * SELECT * FROM trending_posts LIMIT 20;
 */

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

/**
 * POLÍTICA: Public profiles are viewable by everyone
 * Tabla: profiles
 * Tipo: SELECT
 * Condición: always true (PÚBLICA)
 * 
 * Permite a cualquiera ver todos los perfiles
 */

/**
 * POLÍTICA: Users can update own profile
 * Tabla: profiles
 * Tipo: UPDATE
 * Condición: auth.uid() = id
 * 
 * Solo el propietario puede editar su perfil
 */

/**
 * POLÍTICA: Users can insert own profile
 * Tabla: profiles
 * Tipo: INSERT
 * Condición: auth.uid() = id
 * 
 * Solo puede crear su propio perfil (usado por trigger)
 */

/**
 * POLÍTICA: Public posts are viewable by everyone
 * Tabla: posts
 * Tipo: SELECT
 * Condición: always true (PÚBLICA)
 */

/**
 * POLÍTICA: Authenticated users can create posts
 * Tabla: posts
 * Tipo: INSERT
 * Condición: auth.role() = 'authenticated' AND auth.uid() = author_id
 * 
 * Solo usuarios autenticados pueden crear posts
 */

/**
 * POLÍTICA: Users can update own posts
 * Tabla: posts
 * Tipo: UPDATE
 * Condición: auth.uid() = author_id
 */

/**
 * POLÍTICA: Users can delete own posts
 * Tabla: posts
 * Tipo: DELETE
 * Condición: auth.uid() = author_id
 */

/**
 * POLÍTICA: Users can read own notifications
 * Tabla: notifications
 * Tipo: SELECT
 * Condición: auth.uid() = user_id
 * 
 * Solo puede ver sus propias notificaciones
 */

/**
 * POLÍTICA: System can insert notifications
 * Tabla: notifications
 * Tipo: INSERT
 * Condición: always true
 * 
 * Las notificaciones se crean via triggers del sistema
 */

/**
 * POLÍTICA: Users can update own notifications
 * Tabla: notifications
 * Tipo: UPDATE
 * Condición: auth.uid() = user_id
 * 
 * Solo puede marcar/editar sus propias notificaciones
 */

/**
 * POLÍTICA: Users can read own settings
 * Tabla: user_settings
 * Tipo: SELECT
 * Condición: auth.uid() = id
 */

/**
 * POLÍTICA: Users can update own settings
 * Tabla: user_settings
 * Tipo: UPDATE
 * Condición: auth.uid() = id
 */

/**
 * POLÍTICA: Users can insert own settings
 * Tabla: user_settings
 * Tipo: INSERT
 * Condición: auth.uid() = id
 */

/**
 * POLÍTICA: Users can read own search history
 * Tabla: search_history
 * Tipo: SELECT
 * Condición: auth.uid() = user_id
 */

/**
 * POLÍTICA: Users can insert own search history
 * Tabla: search_history
 * Tipo: INSERT
 * Condición: auth.uid() = user_id
 */

/**
 * POLÍTICA: Users can delete own search history
 * Tabla: search_history
 * Tipo: DELETE
 * Condición: auth.uid() = user_id
 */

/**
 * POLÍTICA: Users can read own blocks
 * Tabla: blocked_users
 * Tipo: SELECT
 * Condición: auth.uid() = blocker_id
 * 
 * Solo puede ver los usuarios que ha bloqueado
 */

/**
 * POLÍTICA: Users can create blocks
 * Tabla: blocked_users
 * Tipo: INSERT
 * Condición: auth.uid() = blocker_id
 */

/**
 * POLÍTICA: Users can delete own blocks
 * Tabla: blocked_users
 * Tipo: DELETE
 * Condición: auth.uid() = blocker_id
 */

-- ============================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ============================================

-- Full-text search en español para posts
-- CREATE INDEX idx_posts_content_search ON posts USING gin(to_tsvector('spanish', content));

-- Búsquedas por creación temporal
-- CREATE INDEX idx_posts_created_at ON posts (created_at DESC);
-- CREATE INDEX idx_notifications_created_at ON notifications (created_at DESC);
-- CREATE INDEX idx_search_history_created_at ON search_history (created_at DESC);

-- Búsquedas por IDs (Foreign Keys)
-- CREATE INDEX idx_posts_author_id ON posts (author_id);
-- CREATE INDEX idx_likes_post_id ON likes (post_id);
-- CREATE INDEX idx_follows_follower_id ON follows (follower_id);
-- CREATE INDEX idx_notifications_user_id ON notifications (user_id);
-- CREATE INDEX idx_blocked_users_blocker_id ON blocked_users (blocker_id);

-- Búsquedas combinadas
-- CREATE INDEX idx_notifications_read ON notifications (user_id, read);

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================

/*
1. EDICIÓN DE PERFILES:
   - Los usuarios pueden editar su propio perfil
   - Las imágenes se guardan en buckets de storage
   - Los contadores se actualizan automáticamente

2. NOTIFICACIONES:
   - Se crean automáticamente via triggers
   - Cuando alguien da like, sigue, o menciona
   - Cada usuario solo ve sus propias notificaciones

3. BÚSQUEDA:
   - search_users: búsqueda simple por nombre/bio
   - search_posts: búsqueda full-text en español
   - Se guarda en search_history automáticamente

4. CONFIGURACIÓN:
   - Cada usuario tiene sus settings personales
   - Tema, idioma, privacidad, notificaciones
   - Se guardan en user_settings

5. SEGURIDAD RLS:
   - Todos los datos están protegidos con RLS
   - Solo se muestra lo que el usuario puede ver
   - Las notificaciones privadas están completamente aseguradas

6. CACHÉ:
   - Los contadores (likes, followers, posts) están en caché
   - Se actualizan automáticamente con triggers
   - Mejora el rendimiento de lecturas

7. BUCKETS DE STORAGE:
   - avatars: Fotos de perfil (públicas)
   - covers: Imágenes de portada (públicas)
   - posts: Imágenes de posts (públicas)

8. TRIGGERS AUTOMÁTICOS:
   - handle_new_user: Crea perfil cuando se registra
   - update_posts_count: Actualiza contador de posts
   - update_likes_count: Actualiza contador de likes
   - update_follows_count: Actualiza contadores de followers/following
   - handle_like_notification: Crea notificación de like
   - handle_follow_notification: Crea notificación de seguimiento
*/

-- ============================================
-- INSTRUCCIONES DE DEPLOY
-- ============================================

/*
1. Ejecutar todo el contenido de schema.sql en Supabase SQL Editor

2. Crear Storage Buckets:
   - Ir a Storage en Supabase
   - Crear buckets: avatars, covers, posts
   - Hacer públicos (enable public access)

3. Configurar Políticas de Storage:
   - Permitir lectura pública
   - Permitir escritura solo al propietario

4. Configurar Auth:
   - Habilitar Email provider
   - Configurar JWT secrets
   - Configurar redirect URLs

5. En la app React:
   - Usar los componentes de edición de perfil
   - Usar la búsqueda avanzada
   - Usar las notificaciones
   - Usar los settings

6. Variables de Entorno (.env.local):
   - VITE_SUPABASE_URL=https://your-project.supabase.co
   - VITE_SUPABASE_ANON_KEY=your-anon-key
*/
