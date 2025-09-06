// Astro + Cloudflare の型定義

export interface CloudflareRuntime {
  env: {
    DB: D1Database
    R2: R2Bucket
    [key: string]: unknown
  }
  cf: IncomingRequestCfProperties
  ctx: ExecutionContext
}

export interface AstroLocals {
  runtime?: CloudflareRuntime
  DB?: D1Database
  R2?: R2Bucket
  [key: string]: unknown
}

// 型安全なヘルパー関数
export function getCloudflareEnv(locals: AstroLocals) {
  if (locals.runtime?.env) {
    return locals.runtime.env
  }
  if (locals.DB && locals.R2) {
    return { DB: locals.DB, R2: locals.R2 }
  }
  throw new Error('Cloudflare bindings not available in locals')
}
