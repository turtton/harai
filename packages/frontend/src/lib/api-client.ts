import type { App } from '@harai/backend/types'
import { hc } from 'hono/client'

// 型安全なAPIクライアント
const client = hc<App>('/', {
  fetch: (input: RequestInfo | URL, init?: RequestInit) => {
    // Astroのベースパスを自動的に解決
    if (typeof input === 'string' && !input.startsWith('http') && typeof window !== 'undefined') {
      // クライアントサイド：現在のorigin使用
      input = `${window.location.origin}/api${input}`
    }
    return fetch(input, init)
  },
})

export const apiClient = client
