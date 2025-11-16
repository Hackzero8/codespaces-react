import { useEffect, useState } from 'react'
import supabase from '../supabase'

export default function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function init() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (mounted) setUser(user)
      } catch (err) {
        console.error('useAuth init error', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    init()

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      // session?.user || null
      const u = session?.user ?? null
      setUser(u)
    })

    return () => {
      mounted = false
      listener?.subscription?.unsubscribe?.()
    }
  }, [])

  return { user, loading }
}
