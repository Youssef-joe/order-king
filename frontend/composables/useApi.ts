// composables/useApi.ts
import { useRuntimeConfig } from 'nuxt/app'
import type { Ref } from 'vue'
import type { Session } from '@supabase/supabase-js'

declare function useSupabaseSession(): Ref<Omit<Session, 'user'> | null>

export function useApi() {
  const config = useRuntimeConfig()
  const session = useSupabaseSession()

  async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = session.value?.access_token
    console.log('[apiFetch] token present:', !!token, '| first 20 chars:', token?.slice(0, 20))

    const res = await fetch(`${config.public.apiBaseUrl as string}/api${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }))
      throw new Error(err.message || `API error ${res.status}`)
    }

    return res.json()
  }

  return { apiFetch }
}
