import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { X, Upload, Loader } from 'lucide-react'

export default function EditProfile({ user, onClose, onUpdate }) {
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    bio: '',
    location: '',
    website: '',
    avatar_url: '',
    cover_url: ''
  })
  const [avatarFile, setAvatarFile] = useState(null)
  const [coverFile, setCoverFile] = useState(null)

  useEffect(() => {
    fetchProfile()
  }, [user])

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      if (data) setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const uploadFile = async (file, bucket, path) => {
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
      console.error(`Error uploading file to ${bucket}:`, error)
      return null
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      let avatarUrl = profile.avatar_url
      let coverUrl = profile.cover_url

      if (avatarFile) {
        const url = await uploadFile(avatarFile, 'avatars', user.id)
        if (url) avatarUrl = url
      }

      if (coverFile) {
        const url = await uploadFile(coverFile, 'covers', user.id)
        if (url) coverUrl = url
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          username: profile.username,
          email: profile.email,
          bio: profile.bio,
          location: profile.location,
          website: profile.website,
          avatar_url: avatarUrl,
          cover_url: coverUrl,
          updated_at: new Date()
        })
        .eq('id', user.id)

      if (error) throw error

      setProfile(prev => ({
        ...prev,
        avatar_url: avatarUrl,
        cover_url: coverUrl
      }))

      onUpdate && onUpdate()
      onClose()
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Error al actualizar perfil')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-twitter-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-twitter-800 bg-white dark:bg-twitter-900">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Editar Perfil</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Cover Image */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Imagen de Portada
            </label>
            <div className="relative bg-gray-100 dark:bg-twitter-800 rounded-lg h-32 overflow-hidden">
              {profile.cover_url && (
                <img src={profile.cover_url} alt="Cover" className="w-full h-full object-cover" />
              )}
              <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                <Upload className="text-white" size={24} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverFile(e.target.files?.[0])}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Avatar Image */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Foto de Perfil
            </label>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-100 dark:bg-twitter-800">
                {profile.avatar_url && (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                )}
                <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                  <Upload className="text-white" size={18} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAvatarFile(e.target.files?.[0])}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Usuario
            </label>
            <input
              type="text"
              value={profile.username}
              onChange={(e) => setProfile({ ...profile, username: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-twitter-700 bg-white dark:bg-twitter-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-twitter-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-twitter-700 bg-white dark:bg-twitter-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-twitter-500"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Biografía
            </label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              maxLength={160}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-twitter-700 bg-white dark:bg-twitter-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-twitter-500 resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">{profile.bio?.length || 0}/160</p>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Ubicación
            </label>
            <input
              type="text"
              value={profile.location}
              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-twitter-700 bg-white dark:bg-twitter-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-twitter-500"
            />
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Sitio Web
            </label>
            <input
              type="url"
              value={profile.website}
              onChange={(e) => setProfile({ ...profile, website: e.target.value })}
              placeholder="https://example.com"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-twitter-700 bg-white dark:bg-twitter-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-twitter-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-twitter-800">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-full font-bold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-twitter-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-full font-bold bg-twitter-500 text-white hover:bg-twitter-600 disabled:opacity-50 flex items-center gap-2 transition-colors"
            >
              {loading && <Loader size={18} className="animate-spin" />}
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
