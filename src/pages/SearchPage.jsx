import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { Search as SearchIcon, Loader, Trash2, Clock } from 'lucide-react'

export default function SearchPage({ user, onProfile }) {
  const [query, setQuery] = useState('')
  const [profiles, setProfiles] = useState([])
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [searchHistory, setSearchHistory] = useState([])
  const [showHistory, setShowHistory] = useState(true)

  useEffect(() => {
    if (user) fetchSearchHistory()
  }, [user])

  const fetchSearchHistory = async () => {
    if (!user) return
    try {
      const { data } = await supabase
        .from('search_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      setSearchHistory(data || [])
    } catch (error) {
      console.error('Error fetching search history:', error)
    }
  }

  const doSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setProfiles([])
      setPosts([])
      return
    }

    setLoading(true)
    try {
      const q = searchQuery.trim()

      // Save search to history
      if (user) {
        await supabase.from('search_history').insert({
          user_id: user.id,
          query: q,
          type: activeTab
        })
      }

      // Search users
      if (activeTab === 'all' || activeTab === 'people') {
        const { data: profs } = await supabase
          .rpc('search_users', { search_query: q, limit_count: 20 })

        setProfiles(profs || [])
      } else {
        setProfiles([])
      }

      // Search posts
      if (activeTab === 'all' || activeTab === 'posts') {
        const { data: psts } = await supabase
          .rpc('search_posts', { search_query: q, limit_count: 30 })

        setPosts(psts || [])
      } else {
        setPosts([])
      }

      setShowHistory(false)
    } catch (error) {
      console.error('Error searching:', error)
      // Fallback to simple search
      if (activeTab === 'all' || activeTab === 'people') {
        const { data: profs } = await supabase
          .from('profiles')
          .select('*')
          .ilike('username', `%${q}%`)
          .limit(20)
        setProfiles(profs || [])
      }

      if (activeTab === 'all' || activeTab === 'posts') {
        const { data: psts } = await supabase
          .from('posts')
          .select('*, profiles(username, avatar_url)')
          .ilike('content', `%${q}%`)
          .order('created_at', { ascending: false })
          .limit(30)
        setPosts(psts || [])
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    doSearch(query)
  }

  const handleHistoryClick = (historyQuery) => {
    setQuery(historyQuery)
    doSearch(historyQuery)
  }

  const deleteSearchHistory = async (id) => {
    try {
      await supabase.from('search_history').delete().eq('id', id)
      fetchSearchHistory()
    } catch (error) {
      console.error('Error deleting search history:', error)
    }
  }

  return (
    <div className="w-full h-full bg-white dark:bg-twitter-900 flex flex-col">
      {/* Search Header */}
      <div className="sticky top-0 border-b border-gray-200 dark:border-twitter-800 p-4 bg-white dark:bg-twitter-900 z-10">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-4 top-3 text-gray-500" size={20} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowHistory(true)}
              placeholder="Buscar usuarios, posts..."
              className="w-full pl-12 pr-4 py-3 rounded-full bg-gray-100 dark:bg-twitter-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-twitter-500"
            />
          </div>
        </form>

        {/* Tabs */}
        {(profiles.length > 0 || posts.length > 0) && (
          <div className="flex gap-4 mt-4 border-b border-gray-200 dark:border-twitter-800">
            {[
              { id: 'all', label: 'Todo' },
              { id: 'people', label: 'Personas' },
              { id: 'posts', label: 'Posts' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-twitter-500 text-twitter-600 dark:text-twitter-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader className="animate-spin text-twitter-500" size={32} />
          </div>
        )}

        {!loading && showHistory && !query && searchHistory.length > 0 && (
          <div className="p-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Búsquedas recientes</h3>
            <div className="space-y-2">
              {searchHistory.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-twitter-800 group cursor-pointer transition-colors"
                >
                  <button
                    onClick={() => handleHistoryClick(item.query)}
                    className="flex-1 text-left flex items-center gap-3"
                  >
                    <Clock className="text-gray-400" size={18} />
                    <span className="text-gray-900 dark:text-white">{item.query}</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteSearchHistory(item.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="text-gray-400 hover:text-red-500" size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && !showHistory && profiles.length === 0 && posts.length === 0 && query && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
            <SearchIcon size={48} className="mb-4 opacity-50" />
            <p>No se encontraron resultados para "{query}"</p>
          </div>
        )}

        {/* People Section */}
        {(activeTab === 'all' || activeTab === 'people') && profiles.length > 0 && (
          <div className="border-b border-gray-200 dark:border-twitter-800">
            {activeTab === 'all' && (
              <div className="px-4 py-3 font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-twitter-800">
                Personas
              </div>
            )}
            <div className="divide-y divide-gray-200 dark:divide-twitter-800">
              {profiles.map(profile => (
                <button
                  key={profile.id}
                  onClick={() => onProfile && onProfile(profile.id)}
                  className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-twitter-800 transition-colors flex items-center gap-3"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-twitter-500 to-twitter-600 text-white flex items-center justify-center font-bold">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      profile.username?.[0]?.toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 dark:text-white truncate">{profile.username}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{profile.bio}</p>
                    <p className="text-xs text-gray-500 mt-1">{profile.followers_count} seguidores</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Posts Section */}
        {(activeTab === 'all' || activeTab === 'posts') && posts.length > 0 && (
          <div>
            {activeTab === 'all' && (
              <div className="px-4 py-3 font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-twitter-800">
                Posts
              </div>
            )}
            <div className="divide-y divide-gray-200 dark:divide-twitter-800">
              {posts.map(post => (
                <div key={post.id} className="p-4 hover:bg-gray-50 dark:hover:bg-twitter-800 transition-colors cursor-pointer border-b border-gray-200 dark:border-twitter-800">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-twitter-500 to-twitter-600 text-white flex items-center justify-center font-bold">
                      {post.author_avatar ? (
                        <img src={post.author_avatar} alt={post.author_username} className="w-full h-full object-cover rounded-full" />
                      ) : (
                        post.author_username?.[0]?.toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 dark:text-white">{post.author_username}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(post.created_at).toLocaleDateString('es-ES')}
                      </p>
                      <p className="text-gray-900 dark:text-white mt-2">{post.content}</p>
                      <p className="text-sm text-gray-500 mt-2">{post.likes_count} me gusta</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
