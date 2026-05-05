// composables/useAuth.ts
import { readonly, onMounted } from 'vue'
import type { SupabaseClient, User } from '@supabase/supabase-js'
import { useApi } from './useApi'

// Declare auto-imports provided by @nuxtjs/supabase at runtime
declare function useSupabaseClient(): SupabaseClient
declare function useSupabaseUser(): ReturnType<typeof import('vue').ref<User | null>>

export const useAuth = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const { apiFetch } = useApi()

  const ensureUserExists = async (authUser: User) => {
    try {
      await apiFetch('/users/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          fullName: authUser.user_metadata?.full_name || authUser.user_metadata?.name,
          avatarUrl: authUser.user_metadata?.avatar_url,
        }),
      })
    } catch {
      // Profile will be created on first order via findOrCreate
    }
  }

  onMounted(async () => {
    if (user.value) await ensureUserExists(user.value)

    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        ensureUserExists(session.user)
      }
    })
  })

  return {
    user: readonly(user),
    signIn: () => supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` },
    }),
    signOut: () => supabase.auth.signOut(),
  }
}
