export default defineNuxtPlugin(async () => {
  const supabase = useSupabaseClient()

  // Get initial session
  const { data: { session } } = await supabase.auth.getSession()
  console.log('Initial session:', session?.user?.email)

  // Listen for auth changes
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state change:', event, session?.user?.email)

    // Update the user state in the composables
    if (event === 'SIGNED_IN' && session) {
      // The @nuxtjs/supabase module should handle this automatically,
      // but let's make sure the state is updated
      console.log('User signed in successfully')
    } else if (event === 'SIGNED_OUT') {
      console.log('User signed out')
    }
  })
})