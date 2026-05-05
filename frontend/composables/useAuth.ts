// composables/useAuth.ts
export const useAuth = () => {
  const supabase = useSupabaseClient()
  const user = ref(null)
  const loading = ref(true)
  const { apiFetch } = useApi()

  // Initialize auth state
  const initAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      user.value = session?.user || null
      
      // If user is logged in, ensure their data is stored in the backend
      if (user.value) {
        await ensureUserExists(user.value)
      }
      
      console.log('Auth initialized:', user.value?.email)
    } catch (error) {
      console.error('Auth init error:', error)
    } finally {
      loading.value = false
    }
  }

  // Ensure user data is stored in the backend
  const ensureUserExists = async (authUser: any) => {
    try {
      await apiFetch('/users/profile', { method: 'GET' })
    } catch (error) {
      // User doesn't exist yet, but that's ok - will be created on first order
      console.log('User profile will be created on first order')
    }
  }

  // Listen for auth changes
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth event:', event, session?.user?.email)
    user.value = session?.user || null
    
    if (event === 'SIGNED_IN' && session?.user) {
      ensureUserExists(session.user)
    }
  })

  // Initialize on mount
  onMounted(initAuth)

  return {
    user: readonly(user),
    loading: readonly(loading),
    signIn: () => supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` },
    }),
    signOut: () => supabase.auth.signOut(),
  }
}