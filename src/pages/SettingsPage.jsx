import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { Save, Loader, Bell, Lock, Palette, Globe } from 'lucide-react'

export default function SettingsPage({ user }) {
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
    theme: 'light',
    language: 'es',
    private_account: false,
    allow_notifications: true,
    email_notifications: true,
    push_notifications: true,
    notification_follows: true,
    notification_likes: true,
    notification_replies: true,
    notification_mentions: true,
    analytics_enabled: true,
    two_factor_enabled: false
  })

  const [activeTab, setActiveTab] = useState('general')

  useEffect(() => {
    if (user) fetchSettings()
  }, [user])

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      if (data) {
        setSettings(data)
      } else {
        // Create default settings
        await supabase
          .from('user_settings')
          .insert([{ id: user.id, ...settings }])
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          id: user.id,
          ...settings,
          updated_at: new Date()
        })

      if (error) throw error
      alert('Configuración guardada exitosamente')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Error al guardar configuración')
    } finally {
      setLoading(false)
    }
  }

  const toggleSetting = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  if (!user) return (
    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
      Inicia sesión para acceder a configuración
    </div>
  )

  return (
    <div className="w-full h-full bg-white dark:bg-twitter-900 flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-twitter-800 p-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Configuración</h2>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-twitter-800 overflow-x-auto sticky top-0 bg-white dark:bg-twitter-900">
        {[
          { id: 'general', label: 'General', icon: Globe },
          { id: 'notifications', label: 'Notificaciones', icon: Bell },
          { id: 'privacy', label: 'Privacidad', icon: Lock },
          { id: 'appearance', label: 'Apariencia', icon: Palette }
        ].map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-twitter-500 text-twitter-600 dark:text-twitter-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Configuración General</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Idioma
                  </label>
                  <select
                    value={settings.language}
                    onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-twitter-700 bg-white dark:bg-twitter-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-twitter-500"
                  >
                    <option value="es">Español</option>
                    <option value="en">English</option>
                    <option value="pt">Português</option>
                    <option value="fr">Français</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notification Settings */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Notificaciones</h3>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-twitter-800 hover:bg-gray-50 dark:hover:bg-twitter-800 cursor-pointer transition-colors">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Permitir notificaciones</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Recibir notificaciones en la plataforma</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.allow_notifications}
                    onChange={() => toggleSetting('allow_notifications')}
                    className="w-5 h-5 rounded cursor-pointer"
                  />
                </label>

                {settings.allow_notifications && (
                  <>
                    <label className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-twitter-800 hover:bg-gray-50 dark:hover:bg-twitter-800 cursor-pointer transition-colors">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Email Notifications</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Recibir notificaciones por email</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.email_notifications}
                        onChange={() => toggleSetting('email_notifications')}
                        className="w-5 h-5 rounded cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-twitter-800 hover:bg-gray-50 dark:hover:bg-twitter-800 cursor-pointer transition-colors">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Notificaciones Push</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Recibir notificaciones push</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.push_notifications}
                        onChange={() => toggleSetting('push_notifications')}
                        className="w-5 h-5 rounded cursor-pointer"
                      />
                    </label>

                    <div className="border-t border-gray-200 dark:border-twitter-800 pt-4 mt-4">
                      <p className="font-semibold text-gray-900 dark:text-white mb-4">Tipos de notificación</p>
                      <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.notification_follows}
                            onChange={() => toggleSetting('notification_follows')}
                            className="w-4 h-4 rounded cursor-pointer"
                          />
                          <span className="text-gray-900 dark:text-white">Cuando alguien me sigue</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.notification_likes}
                            onChange={() => toggleSetting('notification_likes')}
                            className="w-4 h-4 rounded cursor-pointer"
                          />
                          <span className="text-gray-900 dark:text-white">Me dan "Me gusta"</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.notification_replies}
                            onChange={() => toggleSetting('notification_replies')}
                            className="w-4 h-4 rounded cursor-pointer"
                          />
                          <span className="text-gray-900 dark:text-white">Respuestas a mis posts</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.notification_mentions}
                            onChange={() => toggleSetting('notification_mentions')}
                            className="w-4 h-4 rounded cursor-pointer"
                          />
                          <span className="text-gray-900 dark:text-white">Me mencionan en posts</span>
                        </label>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Privacy Settings */}
        {activeTab === 'privacy' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Privacidad y Seguridad</h3>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-twitter-800 hover:bg-gray-50 dark:hover:bg-twitter-800 cursor-pointer transition-colors">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Cuenta Privada</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Solo mis seguidores pueden ver mis posts</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.private_account}
                    onChange={() => toggleSetting('private_account')}
                    className="w-5 h-5 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-twitter-800 hover:bg-gray-50 dark:hover:bg-twitter-800 cursor-pointer transition-colors">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Autenticación de dos factores</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Proteger tu cuenta con 2FA</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.two_factor_enabled}
                    onChange={() => toggleSetting('two_factor_enabled')}
                    className="w-5 h-5 rounded cursor-pointer"
                    disabled
                  />
                </label>

                <label className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-twitter-800 hover:bg-gray-50 dark:hover:bg-twitter-800 cursor-pointer transition-colors">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Análisis Habilitado</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Permitir recopilar datos de análisis</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.analytics_enabled}
                    onChange={() => toggleSetting('analytics_enabled')}
                    className="w-5 h-5 rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Appearance Settings */}
        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Apariencia</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Tema
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['light', 'dark', 'auto'].map(theme => (
                      <button
                        key={theme}
                        onClick={() => setSettings({ ...settings, theme })}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          settings.theme === theme
                            ? 'border-twitter-500 bg-twitter-50 dark:bg-twitter-900'
                            : 'border-gray-300 dark:border-twitter-700'
                        }`}
                      >
                        <p className="font-semibold text-gray-900 dark:text-white capitalize">
                          {theme === 'light' && '☀️ Claro'}
                          {theme === 'dark' && '🌙 Oscuro'}
                          {theme === 'auto' && '⚙️ Auto'}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-twitter-800 p-4 flex justify-end gap-3">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-2 rounded-full font-bold bg-twitter-500 text-white hover:bg-twitter-600 disabled:opacity-50 flex items-center gap-2 transition-colors"
        >
          {loading ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
          Guardar
        </button>
      </div>
    </div>
  )
}
