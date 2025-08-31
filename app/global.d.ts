import type {} from 'hono'

declare module 'hono' {
  interface Env {
    Variables: Record<string, unknown>
    Bindings: {
      R2: R2Bucket
    }
  }
}

import '@hono/react-renderer'

declare module '@hono/react-renderer' {
  interface Props {
    title?: string
  }
}
