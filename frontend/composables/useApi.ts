// composables/useApi.ts
export function useApi() {
  const config = useRuntimeConfig()
  const { auth } = useSupabaseClient()

  async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const { data: session } = await auth.getSession()
    const token = session?.session?.access_token

    const res = await fetch(`${config.public.apiBaseUrl}/api${path}`, {
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
