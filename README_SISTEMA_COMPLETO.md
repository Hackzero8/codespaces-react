# Sistema Completo de Twitter-like Clone

## 📋 Descripción General

Sistema completo de red social tipo Twitter con:
- ✅ Gestión de Perfiles Completa (edición, fotos, covers)
- ✅ Sistema de Notificaciones (likes, follows, menciones)
- ✅ Búsqueda Avanzada (full-text en español)
- ✅ Configuración de Usuario (tema, idioma, privacidad)
- ✅ Bloqueo de Usuarios
- ✅ Row Level Security (RLS) completo
- ✅ Triggers y Funciones automáticas
- ✅ Storage de Imágenes

---

## 🗄️ Estructura de Base de Datos

### Tablas Principales

#### 1. **profiles**
```sql
Campos:
- id (UUID, PK) - Referencia a auth.users
- username (TEXT, UNIQUE) - Nombre único
- email (TEXT, UNIQUE) - Email
- avatar_url (TEXT) - Foto de perfil
- cover_url (TEXT) - Imagen de portada
- bio (TEXT) - Biografía (max 160 chars)
- location (TEXT) - Ubicación
- website (TEXT) - Sitio web
- verified (BOOLEAN) - Verificado
- followers_count (INTEGER) - Caché de seguidores
- following_count (INTEGER) - Caché de seguidos
- posts_count (INTEGER) - Caché de posts
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)

Índices:
- idx_profiles_username
- idx_profiles_email
```

#### 2. **posts**
```sql
Campos:
- id (BIGINT, PK, auto-generado)
- content (TEXT) - Contenido del post
- author_id (UUID, FK) - Referencia a profiles
- image_url (TEXT) - Imagen adjunta
- likes_count (INTEGER) - Caché
- replies_count (INTEGER) - Caché
- reposts_count (INTEGER) - Caché
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)

Índices:
- idx_posts_created_at - Ordenamiento
- idx_posts_author_id - Por autor
- idx_posts_content_search - Full-text en español
```

#### 3. **follows**
```sql
Campos:
- id (BIGINT, PK)
- follower_id (UUID, FK)
- following_id (UUID, FK)
- created_at (TIMESTAMPTZ)

Constraints:
- unique_follow (follower_id, following_id)
- no_self_follow (follower_id != following_id)

Índices:
- idx_follows_follower_id
- idx_follows_following_id
```

#### 4. **likes**
```sql
Campos:
- id (BIGINT, PK)
- post_id (BIGINT, FK)
- user_id (UUID, FK)
- created_at (TIMESTAMPTZ)

Constraints:
- unique_like (post_id, user_id)

Índices:
- idx_likes_post_id
- idx_likes_user_id
```

#### 5. **notifications**
```sql
Campos:
- id (BIGINT, PK)
- user_id (UUID, FK) - Destinatario
- actor_id (UUID, FK) - Quien realizó la acción
- type (TEXT) - 'like', 'follow', 'reply', 'repost', 'mention'
- post_id (BIGINT, FK) - Post relacionado
- related_notification_id (BIGINT, FK) - Para agrupación
- read (BOOLEAN) - Si ha sido leída
- created_at (TIMESTAMPTZ)

Índices:
- idx_notifications_user_id
- idx_notifications_created_at
- idx_notifications_read
- idx_notifications_actor_id
```

#### 6. **user_settings**
```sql
Campos:
- id (UUID, PK) - Referencia a profiles
- theme (TEXT) - 'light', 'dark', 'auto'
- language (TEXT) - 'es', 'en', 'pt', 'fr'
- private_account (BOOLEAN)
- allow_notifications (BOOLEAN)
- email_notifications (BOOLEAN)
- push_notifications (BOOLEAN)
- notification_follows (BOOLEAN)
- notification_likes (BOOLEAN)
- notification_replies (BOOLEAN)
- notification_mentions (BOOLEAN)
- analytics_enabled (BOOLEAN)
- two_factor_enabled (BOOLEAN)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

#### 7. **search_history**
```sql
Campos:
- id (BIGINT, PK)
- user_id (UUID, FK)
- query (TEXT)
- type (TEXT) - 'people', 'posts', 'general'
- created_at (TIMESTAMPTZ)

Índices:
- idx_search_history_user_id
- idx_search_history_created_at
```

#### 8. **blocked_users**
```sql
Campos:
- id (BIGINT, PK)
- blocker_id (UUID, FK)
- blocked_id (UUID, FK)
- created_at (TIMESTAMPTZ)

Constraints:
- unique_block (blocker_id, blocked_id)
- no_self_block (blocker_id != blocked_id)

Índices:
- idx_blocked_users_blocker_id
- idx_blocked_users_blocked_id
```

---

## 🔧 Funciones SQL Disponibles

### 1. **search_users(search_query, limit_count)**
Busca usuarios por nombre o biografía
```sql
SELECT * FROM search_users('john', 20);
```

### 2. **search_posts(search_query, limit_count)**
Busca posts con full-text search en español
```sql
SELECT * FROM search_posts('tecnología', 20);
```

### 3. **get_unread_notifications_count(p_user_id)**
Obtiene número de notificaciones no leídas
```sql
SELECT get_unread_notifications_count('user_id'::uuid);
```

### 4. **mark_notifications_as_read(p_user_id)**
Marca todas las notificaciones como leídas
```sql
SELECT mark_notifications_as_read('user_id'::uuid);
```

### 5. **get_timeline_feed(p_user_id, p_limit, p_offset)**
Obtiene el timeline del usuario
```sql
SELECT * FROM get_timeline_feed('user_id'::uuid, 20, 0);
```

### 6. **is_following(p_follower_id, p_following_id)**
Verifica si un usuario sigue a otro
```sql
SELECT is_following('follower_id'::uuid, 'following_id'::uuid);
```

### 7. **is_blocked(p_blocker_id, p_blocked_id)**
Verifica si un usuario está bloqueado
```sql
SELECT is_blocked('blocker_id'::uuid, 'blocked_id'::uuid);
```

### 8. **block_user(p_blocker_id, p_blocked_id)**
Bloquea a un usuario
```sql
SELECT block_user('blocker_id'::uuid, 'blocked_id'::uuid);
```

### 9. **unblock_user(p_blocker_id, p_blocked_id)**
Desbloquea a un usuario
```sql
SELECT unblock_user('blocker_id'::uuid, 'blocked_id'::uuid);
```

### 10. **get_user_suggestions(p_user_id, p_limit)**
Obtiene sugerencias de usuarios a seguir
```sql
SELECT * FROM get_user_suggestions('user_id'::uuid, 10);
```

---

## 📦 Storage Buckets

### Buckets Disponibles

#### 1. **avatars** (Fotos de Perfil)
```
Ruta: /avatars/{user_id}/{filename}
Permisos: Lectura pública, Escritura solo del propietario
URL: https://your-project.supabase.co/storage/v1/object/public/avatars/...
```

#### 2. **covers** (Imágenes de Portada)
```
Ruta: /covers/{user_id}/{filename}
Permisos: Lectura pública, Escritura solo del propietario
URL: https://your-project.supabase.co/storage/v1/object/public/covers/...
```

#### 3. **posts** (Imágenes de Posts)
```
Ruta: /posts/{user_id}/{post_id}/{filename}
Permisos: Lectura pública, Escritura solo del autor
URL: https://your-project.supabase.co/storage/v1/object/public/posts/...
```

---

## 🔐 Row Level Security (RLS)

### Políticas Implementadas

#### **profiles**
- `SELECT`: Pública (todos pueden ver)
- `UPDATE`: Solo el propietario
- `INSERT`: Solo el propietario

#### **posts**
- `SELECT`: Pública
- `INSERT`: Solo autenticados (author_id = current_user)
- `UPDATE`: Solo el autor
- `DELETE`: Solo el autor

#### **likes**
- `SELECT`: Pública
- `INSERT`: Solo autenticados (user_id = current_user)
- `DELETE`: Solo el usuario

#### **follows**
- `SELECT`: Pública
- `INSERT`: Solo autenticados (follower_id = current_user)
- `DELETE`: Solo el seguidor

#### **notifications**
- `SELECT`: Solo el destinatario (user_id = current_user)
- `INSERT`: Sistema
- `UPDATE`: Solo el destinatario
- `DELETE`: Solo el destinatario

#### **user_settings**
- `SELECT`: Solo el propietario
- `INSERT`: Solo el propietario
- `UPDATE`: Solo el propietario

#### **search_history**
- `SELECT`: Solo el propietario
- `INSERT`: Solo el propietario
- `DELETE`: Solo el propietario

#### **blocked_users**
- `SELECT`: Solo el bloqueador
- `INSERT`: Solo el bloqueador
- `DELETE`: Solo el bloqueador

---

## 🚀 Componentes React

### 1. **EditProfile.jsx**
Modal para editar perfil del usuario
```jsx
<EditProfile 
  user={user}
  onClose={() => setShowEditModal(false)}
  onUpdate={fetchProfile}
/>
```

**Características:**
- Editar username, email, bio
- Subir foto de perfil (avatar)
- Subir imagen de portada (cover)
- Editar ubicación y sitio web
- Validación de campos

### 2. **SettingsPage.jsx**
Página completa de configuración con tabs
```jsx
<SettingsPage user={user} />
```

**Tabs:**
- **General**: Idioma y configuración general
- **Notificaciones**: Tipos de notificaciones
- **Privacidad**: Cuenta privada, 2FA, análisis
- **Apariencia**: Tema (claro/oscuro/auto)

### 3. **SearchPage.jsx**
Búsqueda avanzada con historial
```jsx
<SearchPage user={user} onProfile={onProfileClick} />
```

**Características:**
- Búsqueda de usuarios y posts
- Tabs para filtrar resultados
- Historial de búsquedas
- Eliminar historial

### 4. **NotificationsPage.jsx**
Centro de notificaciones completo
```jsx
<NotificationsPage user={user} onProfile={onProfileClick} />
```

**Características:**
- Listar todas las notificaciones
- Filtrar por tipo (likes, follows, etc.)
- Marcar como leído
- Eliminar notificaciones
- Contador de no leídas

### 5. **ProfilePage.jsx**
Perfil de usuario mejorado
```jsx
<ProfilePage userId={userId} currentUser={currentUser} />
```

**Características:**
- Ver perfil completo con cover y avatar
- Botón Editar/Seguir
- Listar posts del usuario
- Dar like a posts
- Estadísticas (seguidores, seguidos, posts)

---

## 📚 Utilities (api.js)

### SearchAPI
```javascript
import { searchAPI } from './api'

// Buscar usuarios
const users = await searchAPI.searchUsers('john', 20)

// Buscar posts
const posts = await searchAPI.searchPosts('tecnología', 20)

// Obtener historial
const history = await searchAPI.getSearchHistory(userId)

// Guardar búsqueda
await searchAPI.saveSearchHistory(userId, 'query', 'general')

// Limpiar historial
await searchAPI.clearSearchHistory(userId)
```

### NotificationsAPI
```javascript
import { notificationsAPI } from './api'

// Obtener notificaciones
const notifs = await notificationsAPI.getNotifications(userId, 20, 0)

// Obtener no leídas
const unread = await notificationsAPI.getUnreadNotifications(userId)

// Contar no leídas
const count = await notificationsAPI.getUnreadCount(userId)

// Marcar como leído
await notificationsAPI.markAsRead(notificationId)

// Marcar todas como leídas
await notificationsAPI.markAllAsRead(userId)
```

### FollowAPI
```javascript
import { followAPI } from './api'

// Verificar si sigue
const following = await followAPI.isFollowing(followerId, followingId)

// Seguir usuario
await followAPI.follow(followerId, followingId)

// Dejar de seguir
await followAPI.unfollow(followerId, followingId)

// Obtener sugerencias
const suggestions = await followAPI.getSuggestions(userId, 10)
```

### BlockAPI
```javascript
import { blockAPI } from './api'

// Verificar bloqueo
const blocked = await blockAPI.isBlocked(blockerId, blockedId)

// Bloquear usuario
await blockAPI.block(blockerId, blockedId)

// Desbloquear usuario
await blockAPI.unblock(blockerId, blockedId)
```

### LikeAPI
```javascript
import { likeAPI } from './api'

// Verificar like
const liked = await likeAPI.hasLiked(postId, userId)

// Dar like
await likeAPI.like(postId, userId)

// Quitar like
await likeAPI.unlike(postId, userId)
```

### StorageAPI
```javascript
import { storageAPI } from './api'

// Subir imagen
const url = await storageAPI.uploadImage(file, 'avatars', userId)

// Eliminar imagen
await storageAPI.deleteImage('avatars', filePath)
```

---

## 🔄 Triggers Automáticos

### 1. **update_posts_count**
Actualiza `posts_count` en profiles cuando se crea/elimina un post

### 2. **update_follows_count**
Actualiza `followers_count` y `following_count` cuando hay nuevos follows

### 3. **update_likes_count**
Actualiza `likes_count` en posts cuando hay likes

### 4. **trigger_like_notification**
Crea notificación automática cuando alguien da like

### 5. **trigger_follow_notification**
Crea notificación automática cuando alguien sigue

### 6. **on_auth_user_created**
Crea perfil automáticamente cuando se registra un usuario

---

## 🚀 Instalación y Deploy

### 1. Clonar y Configurar
```bash
git clone <repo>
cd codespaces-react
npm install
```

### 2. Variables de Entorno (.env.local)
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Ejecutar SQL Schema
1. Ir a Supabase SQL Editor
2. Copiar y pegar todo el contenido de `supabase/schema.sql`
3. Ejecutar (Run)

### 4. Crear Storage Buckets
```javascript
// En Supabase, ir a Storage
- Crear bucket: avatars (Public)
- Crear bucket: covers (Public)
- Crear bucket: posts (Public)
```

### 5. Configurar RLS Policies
Las políticas ya están en el schema.sql, solo ejecutar

### 6. Iniciar la App
```bash
npm run dev
```

---

## 📊 Vistas Disponibles

### user_stats
Estadísticas de usuarios
```sql
SELECT * FROM user_stats ORDER BY followers_count DESC LIMIT 10;
```

### trending_posts
Posts en tendencia de últimos 7 días
```sql
SELECT * FROM trending_posts LIMIT 20;
```

---

## 🎯 Casos de Uso

### Crear un Post
```javascript
const { data, error } = await supabase.from('posts').insert({
  content: 'Hello World!',
  author_id: userId
})
```

### Obtener Timeline
```javascript
const { data } = await supabase.rpc('get_timeline_feed', {
  p_user_id: userId,
  p_limit: 20,
  p_offset: 0
})
```

### Buscar Usuarios
```javascript
const { data } = await supabase.rpc('search_users', {
  search_query: 'john',
  limit_count: 20
})
```

### Seguir Usuario
```javascript
const { data, error } = await supabase.from('follows').insert({
  follower_id: currentUserId,
  following_id: userToFollowId
})
```

### Dar Like a Post
```javascript
const { data, error } = await supabase.from('likes').insert({
  post_id: postId,
  user_id: userId
})
```

### Obtener Notificaciones
```javascript
const { data } = await supabase
  .from('notifications')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
```

---

## 📝 Notas Importantes

1. **RLS Activo**: Todas las tablas tienen RLS habilitado
2. **Caché**: Los contadores se actualizan automáticamente
3. **Triggers**: Las notificaciones se crean automáticamente
4. **Full-Text Search**: Búsqueda de posts en español
5. **Storage**: Las imágenes se almacenan en Supabase Storage
6. **Realtime**: Se pueden suscribir a cambios en tiempo real

---

## 🐛 Troubleshooting

### Error: "RLS violation"
- Verificar que el usuario está autenticado
- Verificar que las políticas RLS están correctas
- Revisar el auth context

### Error: "Storage bucket not found"
- Crear los buckets en Supabase Storage
- Verificar nombres: avatars, covers, posts

### Error: "Function not found"
- Ejecutar nuevamente todo el schema.sql
- Verificar que no hay errores en la ejecución

### Notificaciones no aparecen
- Verificar que los triggers están activos
- Revisar logs en Supabase

---

## 📚 Referencias

- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Full-Text Search](https://www.postgresql.org/docs/current/textsearch.html)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [React Hooks](https://react.dev/reference/react)

---

## ✅ Checklist de Implementación

- [ ] Base de datos creada con schema.sql
- [ ] Storage buckets creados (avatars, covers, posts)
- [ ] RLS policies habilitadas
- [ ] Variables de entorno configuradas
- [ ] Componentes React integrados
- [ ] API utilities importadas
- [ ] Auth configurado en Supabase
- [ ] Triggers verificados en SQL
- [ ] Búsqueda funcionando
- [ ] Notificaciones funcionando
- [ ] Edición de perfil funcionando
- [ ] Settings guardando correctamente

---

**Creado con ❤️ - Sistema Completo de Twitter-like Clone**
