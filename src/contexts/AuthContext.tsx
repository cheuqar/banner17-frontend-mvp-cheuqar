import React, { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session, User, AuthError, AuthChangeEvent } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { UserProfile } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  userProfile: UserProfile | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    const getSession = async () => {
      setIsLoading(true)
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting session:', error.message)
        }
        setSession(session)
        setUser(session?.user || null)
      } catch (error) {
        console.error('Session check failed:', error)
      } finally {
        setIsLoading(false)
      }
    }

    getSession()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('Auth state changed:', event, session?.user?.email)

        // Only update session if it's actually different to prevent unnecessary re-renders
        setSession(currentSession => {
          const hasChanged = currentSession?.access_token !== session?.access_token ||
                           currentSession?.user?.id !== session?.user?.id
          return hasChanged ? session : currentSession
        })

        setUser(session?.user || null)
        setIsLoading(false)

        // Clear profile when signing out
        if (event === 'SIGNED_OUT') {
          setUserProfile(null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Fetch user profile when user changes
  useEffect(() => {
    if (user) {
      fetchUserProfile(user.id)
    } else {
      setUserProfile(null)
    }
  }, [user?.id])

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle() // Use maybeSingle instead of single to handle no results gracefully

      if (error) {
        console.error('Error fetching user profile:', error.message)
        // Create fallback profile for any error
        if (user) {
          const fallbackProfile: UserProfile = {
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            avatar_url: user.user_metadata?.avatar_url || null,
            created_at: user.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            role_id: 3, // Default role
          }
          setUserProfile(fallbackProfile)
        }
        return
      }

      // If no profile exists (data is null), create a basic one
      if (!data) {
        console.log('No profile found, creating basic user profile')
        if (user) {
          const basicProfile: UserProfile = {
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            avatar_url: user.user_metadata?.avatar_url || null,
            created_at: user.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            role_id: 3, // Default role
          }
          setUserProfile(basicProfile)
        }
        return
      }

      // Profile exists, use it
      setUserProfile(data)
    } catch (error) {
      console.error('Unexpected error fetching user profile:', error)
      // Create fallback profile
      if (user) {
        const fallbackProfile: UserProfile = {
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          avatar_url: user.user_metadata?.avatar_url || null,
          created_at: user.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          role_id: 3,
        }
        setUserProfile(fallbackProfile)
      }
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setUserProfile(null)
  }

  const value = {
    user,
    session,
    userProfile,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}