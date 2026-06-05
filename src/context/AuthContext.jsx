import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabase'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser]               = useState(null)
  const [artistProfile, setProfile]   = useState(null)
  const [loading, setLoading]         = useState(true)

  const fetchProfile = async (u) => {
    if (!u) { setProfile(null); setLoading(false); return }
    let data = null
    for (let i = 0; i < 3; i++) {
      const { data: rows, error } = await supabase
        .from('artists')
        .select('*')
        .eq('id', u.id)
        .limit(1)
      if (rows && rows.length > 0) { data = rows[0]; break }
      // Fallback: try matching by email
      if (!data && u.email) {
        const { data: byEmail } = await supabase
          .from('artists')
          .select('*')
          .eq('email', u.email)
          .limit(1)
        if (byEmail && byEmail.length > 0) { data = byEmail[0]; break }
      }
      if (i < 2) await new Promise(r => setTimeout(r, 600))
    }
    setProfile(data)
    setLoading(false)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      fetchProfile(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(true)
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
