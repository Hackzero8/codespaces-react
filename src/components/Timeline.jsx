import React, { useEffect, useState } from 'react'
import supabase from '../supabase'
import { MessageCircle, Repeat, Heart, Share2 } from 'lucide-react'
import Post from './Post'

export default function Timeline({ onOpenProfile }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchPosts = async () => {
    setLoading(true)
    // Try to get user id for timeline personalization
    const {
      data: { user }
    } = await supabase.auth.getUser()

    const { data, error } = user
      ? await supabase.rpc('get_timeline_feed', { p_user_id: user.id, p_limit: 20, p_offset: 0 })
      : await supabase
          .from('posts')
          .select('id, content, created_at, author_id, profiles(username, avatar_url), likes_count')
          .order('created_at', { ascending: false })

    setLoading(false)

    if (error) return console.error(error)

    // Map to a unified object structure consumed by <Post>
    const mapped = (data || []).map((p) => ({
      ...p,
      author: {
        id: p.author_id || p.author_id,
        username: p.author_username || p.profiles?.username,
        avatar_url: p.author_avatar || p.profiles?.avatar_url,
      },
      likes_count: p.likes_count || p.likes_count || 0,
      liked_by_user: p.liked_by_user || false
    }))

    setPosts(mapped)
  }

  // Helper function to format time
  function formatTime(dateString) {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffSecs < 60) return 'ahora'
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 7) return `${diffDays}d`
    return date.toLocaleDateString('es-ES')
  }

  useEffect(() => {
    fetchPosts()

    // realtime updates
    const postsSub = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        fetchPosts()
      })
      .subscribe()

    return () => {
      postsSub.unsubscribe()
    }
  }, [])

  return (
    <div className="w-full bg-white dark:bg-twitter-900 border-r border-gray-200 dark:border-twitter-800">
      {/* Header */}
      {/** Removed duplicate page header so only `Navbar` acts as the single visible header */}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin">
            <span className="text-4xl">🔄</span>
          </div>
        </div>
      )}

      {/* Posts list */}
      <div className="divide-y divide-gray-200 dark:divide-twitter-800">
        {/* skeleton if loading */}
        {loading && (
          <div className="p-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-100 dark:bg-twitter-800 rounded-md p-4 mb-4 animate-pulse-subtle">
                <div className="h-4 w-1/4 bg-gray-200 dark:bg-twitter-700 rounded mb-2"></div>
                <div className="h-6 w-full bg-gray-200 dark:bg-twitter-700 rounded"></div>
              </div>
            ))}
          </div>
        )}
        {posts.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <span className="text-4xl mb-3">📝</span>
            <p className="text-gray-600 dark:text-gray-400 text-center">
              No hay posts todavía. ¡Sé el primero en publicar!
            </p>
          </div>
        )}

        {posts.map((p, idx) => (
          <div key={p.id} style={{ animationDelay: `${idx * 50}ms` }} className="animate-fade-in">
            <Post post={{
              ...p,
              author: {
                username: p.profiles?.username,
                avatar_url: p.profiles?.avatar_url
              }
            }} onOpenProfile={() => onOpenProfile && onOpenProfile(p.author_id)} />
          </div>
        ))}
      </div>
    </div>
  )
}
