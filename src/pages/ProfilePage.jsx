import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { Heart, MessageSquare, Share, MoreHorizontal, Edit, MapPin, Link as LinkIcon, Calendar } from 'lucide-react'
import EditProfile from '../components/EditProfile'

export default function ProfilePage({ userId, currentUser }) {
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [likedPosts, setLikedPosts] = useState(new Set())

  useEffect(() => {
    if (!userId) return
    fetchProfile()
    fetchPosts()
    if (currentUser) fetchFollowStatus()
  }, [userId, currentUser])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('author_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      setPosts(data || [])

      // Get likes
      if (currentUser) {
        const { data: likeData } = await supabase
          .from('likes')
          .select('post_id')
          .eq('user_id', currentUser.id)
          .in('post_id', (data || []).map(p => p.id))

        setLikedPosts(new Set(likeData?.map(l => l.post_id) || []))
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    }
  }

  const fetchFollowStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', currentUser.id)
        .eq('following_id', userId)
        .single()

      setIsFollowing(!!data)
    } catch (error) {
      setIsFollowing(false)
    }
  }

  const toggleFollow = async () => {
    if (!currentUser || userId === currentUser.id) return

    try {
      if (isFollowing) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUser.id)
          .eq('following_id', userId)
      } else {
        await supabase
          .from('follows')
          .insert({
            follower_id: currentUser.id,
            following_id: userId
          })
      }

      setIsFollowing(!isFollowing)
      fetchProfile() // Refresh counts
    } catch (error) {
      console.error('Error toggling follow:', error)
    }
  }

  const toggleLike = async (postId) => {
    if (!currentUser) return

    try {
      if (likedPosts.has(postId)) {
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', currentUser.id)

        setLikedPosts(prev => {
          const newSet = new Set(prev)
          newSet.delete(postId)
          return newSet
        })
      } else {
        await supabase
          .from('likes')
          .insert({
            post_id: postId,
            user_id: currentUser.id
          })

        setLikedPosts(prev => new Set(prev).add(postId))
      }

      fetchPosts()
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  if (loading) {
    return (
      <div className="w-full h-full bg-white dark:bg-twitter-900 flex items-center justify-center">
        <div className="text-twitter-500">Cargando...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="w-full h-full bg-white dark:bg-twitter-900 flex items-center justify-center">
        <div className="text-gray-500">Perfil no encontrado</div>
      </div>
    )
  }

  const isOwnProfile = currentUser?.id === userId

  return (
    <div className="w-full h-full bg-white dark:bg-twitter-900 flex flex-col overflow-hidden">
      {/* Profile Header */}
      <div className="border-b border-gray-200 dark:border-twitter-800">
        {/* Cover Image */}
        <div className="h-40 bg-gradient-to-r from-twitter-500 to-twitter-600 relative">
          {profile.cover_url && (
            <img src={profile.cover_url} alt="Cover" className="w-full h-full object-cover" />
          )}
        </div>

        {/* Profile Info */}
        <div className="px-4 pb-4">
          <div className="flex justify-between items-start -mt-16 mb-4">
            <div className="w-32 h-32 rounded-full border-4 border-white dark:border-twitter-900 bg-gradient-to-br from-twitter-500 to-twitter-600 overflow-hidden">
              {profile.avatar_url && (
                <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
              )}
            </div>

            {isOwnProfile ? (
              <button
                onClick={() => setShowEditModal(true)}
                className="mt-4 px-6 py-2 rounded-full border-2 border-twitter-500 text-twitter-500 dark:text-twitter-400 font-bold hover:bg-twitter-50 dark:hover:bg-twitter-900 transition-colors flex items-center gap-2"
              >
                <Edit size={18} />
                Editar perfil
              </button>
            ) : (
              <button
                onClick={toggleFollow}
                className={`mt-4 px-6 py-2 rounded-full font-bold transition-colors ${
                  isFollowing
                    ? 'bg-white dark:bg-twitter-800 text-gray-900 dark:text-white border border-gray-300 dark:border-twitter-700 hover:bg-gray-100 dark:hover:bg-twitter-700'
                    : 'bg-twitter-500 text-white hover:bg-twitter-600'
                }`}
              >
                {isFollowing ? 'Siguiendo' : 'Seguir'}
              </button>
            )}
          </div>

          {/* Profile Details */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.username}</h1>
            <p className="text-gray-600 dark:text-gray-400">@{profile.username}</p>

            {profile.bio && (
              <p className="mt-3 text-gray-900 dark:text-white">{profile.bio}</p>
            )}

            {/* Location & Website */}
            <div className="flex gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
              {profile.location && (
                <div className="flex items-center gap-1">
                  <MapPin size={16} />
                  {profile.location}
                </div>
              )}
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-twitter-500 hover:underline"
                >
                  <LinkIcon size={16} />
                  Sitio web
                </a>
              )}
              <div className="flex items-center gap-1">
                <Calendar size={16} />
                Se unió {new Date(profile.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6 mt-4 text-sm">
              <div>
                <span className="font-bold text-gray-900 dark:text-white">{profile.following_count || 0}</span>
                <span className="text-gray-600 dark:text-gray-400"> Siguiendo</span>
              </div>
              <div>
                <span className="font-bold text-gray-900 dark:text-white">{profile.followers_count || 0}</span>
                <span className="text-gray-600 dark:text-gray-400"> Seguidores</span>
              </div>
              <div>
                <span className="font-bold text-gray-900 dark:text-white">{profile.posts_count || 0}</span>
                <span className="text-gray-600 dark:text-gray-400"> Posts</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-200 dark:divide-twitter-800">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400">
            <MessageSquare size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-semibold">Sin posts</p>
            <p className="text-sm">{profile.username} aún no ha publicado nada</p>
          </div>
        ) : (
          posts.map(post => (
            <div key={post.id} className="p-4 hover:bg-gray-50 dark:hover:bg-twitter-800 transition-colors cursor-pointer">
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-twitter-500 to-twitter-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900 dark:text-white">{profile.username}</p>
                      <p className="text-gray-600 dark:text-gray-400">@{profile.username}</p>
                      <p className="text-gray-600 dark:text-gray-400">•</p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {new Date(post.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <MoreHorizontal size={16} className="text-gray-500" />
                  </div>

                  <p className="mt-3 text-gray-900 dark:text-white">{post.content}</p>

                  {post.image_url && (
                    <img
                      src={post.image_url}
                      alt="Post"
                      className="mt-3 rounded-xl max-h-96 w-full object-cover"
                    />
                  )}

                  <div className="flex justify-between mt-3 max-w-xs text-gray-600 dark:text-gray-400 text-sm">
                    <button className="flex items-center gap-2 hover:text-twitter-500 group">
                      <div className="group-hover:bg-twitter-500 group-hover:bg-opacity-20 p-2 rounded-full transition-colors">
                        <MessageSquare size={16} />
                      </div>
                    </button>

                    <button className="flex items-center gap-2 hover:text-green-500 group">
                      <div className="group-hover:bg-green-500 group-hover:bg-opacity-20 p-2 rounded-full transition-colors">
                        <Share size={16} />
                      </div>
                    </button>

                    <button
                      onClick={() => toggleLike(post.id)}
                      className="flex items-center gap-2 hover:text-red-500 group"
                    >
                      <div className="group-hover:bg-red-500 group-hover:bg-opacity-20 p-2 rounded-full transition-colors">
                        <Heart
                          size={16}
                          fill={likedPosts.has(post.id) ? 'currentColor' : 'none'}
                          className={likedPosts.has(post.id) ? 'text-red-500' : ''}
                        />
                      </div>
                      <span className={likedPosts.has(post.id) ? 'text-red-500' : ''}>
                        {post.likes_count || 0}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <EditProfile
          user={currentUser}
          onClose={() => setShowEditModal(false)}
          onUpdate={fetchProfile}
        />
      )}
    </div>
  )
}
