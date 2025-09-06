import { hc } from 'hono/client'
import type { App } from '@/pages/api/[...route]'

// 型安全なAPIクライアント
const client = hc<App>('/', {
  fetch: (input: RequestInfo | URL, init?: RequestInit) => {
    // Astroのベースパスを自動的に解決
    if (typeof input === 'string' && !input.startsWith('http') && typeof window !== 'undefined') {
      // クライアントサイド：現在のorigin使用
      input = `${window.location.origin}${input}`
    }
    return fetch(input, init)
  },
})

export const apiClient = client.api
