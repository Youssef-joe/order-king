// composables/useAuth.ts
export const useAuth = () => {
  const supabase = useSupabaseClient()
  const user = ref(null)
  const loading = ref(true)

  // Initialize auth state
  const initAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      user.value = session?.user || null
      console.log('Auth initialized:', user.value?.email)
    } catch (error) {
      console.error('Auth init error:', error)
    } finally {
      loading.value = false
    }
  }

  // Listen for auth changes
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth event:', event, session?.user?.email)
    user.value = session?.user || null
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