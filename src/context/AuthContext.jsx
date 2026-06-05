import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabase'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser]               = useState(null)
  const [artistProfile, setProfile]   = useState(null)
  const [loading, setLoading]         = useState(true)

  const fetchProfile = async (u) => {
    if (!u) { setProfile(null); return }
    const { data } = await supabase.from('artists').select('*').eq('id', u.id).single()
    setProfile(data ?? null)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      fetchProfile(session?.user ?? null).then(() => setLoading(false))
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      fetchProfile(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const isAdmin  = !!artistProfile?.is_admin
  const isArtist = !!artistProfile

  return (
    <AuthContext.Provider value={{ user, artistProfile, isAdmin, isArtist, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
