import React, { useState } from 'react'
import Avatar from './Avatar'
import ProfilePreview from './ProfilePreview'
import { Heart, MessageCircle, Share2 } from 'lucide-react'
import { likesAPI } from '../api'

export default function Post({ post, onOpenProfile }) {
  const [showPreview, setShowPreview] = useState(false)
  const [liked, setLiked] = useState(post?.liked_by_user || false)
  const [expanded, setExpanded] = useState(false)

  const contentPreview = post?.content || ''

  const [likes, setLikes] = useState(post?.likes_count || post?.likes_count || 0)

  const [liking, setLiking] = useState(false)

  const toggleLike = async () => {
    if (liking) return
    // optimistic update
    const prevLiked = liked
    const prevLikes = likes
    setLiked(!prevLiked)
    setLikes(prevLiked ? Math.max(0, likes - 1) : likes + 1)
    setLiking(true)
    try {
      const res = await likesAPI.toggleLike(post.id)
      if (res && typeof res.likes_count === 'number') setLikes(res.likes_count)
      if (res && typeof res.liked === 'boolean') setLiked(res.liked)
    } catch (err) {
      // rollback
      setLiked(prevLiked)
      setLikes(prevLikes)
    } finally {
      setLiking(false)
    }
  }

  return (
    <article className="post-card mb-4 p-4" role="article">
      <div className="post-inner flex flex-col md:flex-row md:items-start">
        <div className="flex-shrink-0 relative">
          
          <Avatar
            src={post.author?.avatar_url}
            alt={post.author?.username}
            size={56}
            onClick={() => onOpenProfile && onOpenProfile(post.author?.id)}
            className="cursor-pointer"
          />
          <div
            role="button"
            onMouseEnter={() => setShowPreview(true)}
            onMouseLeave={() => setShowPreview(false)}
            onClick={() => setShowPreview((s) => !s)}
            className="absolute -right-2 -top-2 w-0 h-0"
          />
          {showPreview && (
            <div className="absolute left-16 top-0 z-40">
              <ProfilePreview userId={post.author?.id} shortProfile={{ username: post.author?.username, avatar_url: post.author?.avatar_url }} />
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="post-author">
              <div className="flex items-center gap-2">
                <div className="font-bold text-base">{post.author?.username || 'Usuario'}</div>
                {post.author?.is_verified && (
                  <span className="text-[10px] px-2 py-1 rounded-full bg-twitter-600 text-white font-semibold">Verificado</span>
                )}
              </div>
              <div
                onClick={() => onOpenProfile && onOpenProfile(post.author?.id)}
                className="text-xs text-[rgb(var(--muted))] hover:underline cursor-pointer"
              >
                @{(post.author?.username || '').toLowerCase()}
              </div>
            </div>
            <div className="text-right md:text-right">
              <div className="ml-3 text-xs text-[rgb(var(--muted))] md:ml-0">{post.created_at ? new Date(post.created_at).toLocaleString() : ''}</div>
              <div className="text-sm text-[rgb(var(--muted))]">{likes} {likes === 1 ? 'like' : 'likes'}</div>
            </div>
          </div>

        <div className="mt-3">
          <div className="post-content text-base leading-7 md:text-base">
            {!expanded ? (
              <div className="line-clamp-3">{contentPreview}</div>
            ) : (
              <div>{contentPreview}</div>
            )}
          </div>

          {post?.content && post.content.length > 240 && (
            <div className="mt-2">
              <button
                className="show-more"
                onClick={() => setExpanded((s) => !s)}
              >
                {expanded ? 'Ver menos' : 'Ver más'}
              </button>
            </div>
          )}
        </div>

        {post.image_url && (
          <div className="post-media mt-3">
            <img src={post.image_url} alt="post media" />
          </div>
        )}

        <div className="mt-4 flex items-center gap-4 text-[rgb(var(--muted))] flex-wrap">
          <button onClick={toggleLike} disabled={liking} aria-pressed={liked} className={`btn-interact relative ${liked ? 'btn-like-active' : ''}`}>
            <Heart className={`like-icon ${liked ? 'like-anim' : ''}`} size={18} />
            <span className="text-sm">{likes} {likes === 1 ? 'like' : 'likes'}</span>
            {liked && (
              <>
                <span className="burst" style={{ left: 12, top: -6 }}></span>
                <span className="burst" style={{ left: 4, top: -12, background: 'rgba(29,155,240,0.9)' }}></span>
                <span className="burst" style={{ left: 20, top: -14, background: 'rgba(29,155,240,0.7)' }}></span>
              </>
            )}
          </button>

          <button className="btn-interact" aria-label="Comentar">
            <MessageCircle size={18} /> <span className="text-sm">Comentar</span>
          </button>

          <button className="btn-interact" aria-label="Compartir">
            <Share2 size={18} /> <span className="text-sm">Compartir</span>
          </button>
        </div>
        </div>
      </div>
    </article>
  )
}
