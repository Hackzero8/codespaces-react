import React, { useEffect, useState } from 'react'
import { profileAPI } from '../api'
import Avatar from './Avatar'

export default function ProfilePreview({ userId, shortProfile, onFollowToggle }) {
  const [profile, setProfile] = useState(shortProfile || null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchProfile() {
      if (!userId) return
      setLoading(true)
      try {
        const data = await profileAPI.getProfile(userId)
        setProfile(data)
      } catch (err) {
        console.error('Profile preview error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [userId])

  if (!profile) return null

  return (
    <div className="bg-white dark:bg-twitter-900 border border-gray-200 dark:border-twitter-800 rounded-lg shadow-md w-72 p-3">
      <div className="flex items-center gap-3">
        <Avatar src={profile.avatar_url} alt={profile.username} size={48} />
        <div className="flex-1">
          <div className="font-semibold">{profile.username}</div>
          <div className="text-xs text-[rgb(var(--muted))]">@{profile.username?.toLowerCase()}</div>
        </div>
        {onFollowToggle && (
          <button onClick={onFollowToggle} className="px-3 py-1 rounded-full btn-secondary">Seguir</button>
        )}
      </div>
      {profile.bio && <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{profile.bio}</p>}
      <div className="mt-3 flex items-center gap-4 text-sm text-[rgb(var(--muted))]">
        <div>{profile.followers_count || 0} seguidores</div>
        <div>{profile.following_count || 0} siguiendo</div>
        <div>{profile.posts_count || 0} posts</div>
      </div>
    </div>
  )
}
