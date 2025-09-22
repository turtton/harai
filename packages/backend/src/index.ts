import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'
import { cors } from 'hono/cors'

// 開発環境では manifest を空オブジェクトで代用
let manifest: Record<string, string> = {}
if (typeof globalThis !== 'undefined' && '__STATIC_CONTENT_MANIFEST' in globalThis) {
  try {
    // @ts-expect-error - __STATIC_CONTENT_MANIFEST は本番環境でのみ利用可能
    manifest = __STATIC_CONTENT_MANIFEST
  } catch {
    // 開発環境では空の manifest を使用
  }
}

import { createDrizzleClient, type Env } from '@/db/client'
import { DatabaseError, getErrorResponse, NotFoundError } from '@/db/errors'
import { logError } from '@/db/logger'
import { DatabaseOperations } from '@/db/operations'
import { articleQuerySchema, articleSlugSchema } from '@/db/validators'

const app = new Hono<{ Bindings: Env }>()

// API ルート
const api = new Hono<{ Bindings: Env }>()
  // CORS 設定
  .use(
    '*',
    cors({
      origin:
        process.env.NODE_ENV === 'production'
          ? ['https://harai.example.com']
          : ['http://localhost:4321'],
      credentials: true,
    })
  )
  // デバッグ用ミドルウェア
  .use('*', async (c, next) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${c.req.method} ${c.req.url}`)
      console.log(`[DEBUG] Path: ${c.req.path}`)
    }
    await next()
  })
  // 公開記事一覧を取得
  .get('/articles', zValidator('query', articleQuerySchema), async (c) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[DEBUG] /articles endpoint hit')
    }
    try {
      const db = createDrizzleClient(c.env.DB)
      const dbOps = new DatabaseOperations(db)

      const { limit, offset, tag, search } = c.req.valid('query')
      if (process.env.NODE_ENV === 'development') {
        console.log('[DEBUG] Query params:', { limit, offset, tag, search })
      }

      let articles: Awaited<ReturnType<typeof dbOps.articles.getPublishedArticles>>

      if (tag) {
        articles = await dbOps.articles.searchByTag(tag)
      } else if (search) {
        articles = await dbOps.articles.searchArticles(search)
      } else {
        articles = await dbOps.articles.getPublishedArticles(limit, offset)
      }

      if (process.env.NODE_ENV === 'development') {
        console.log(`[DEBUG] Found ${articles.length} articles`)
      }

      return c.json({
        success: true,
        data: articles,
        meta: {
          limit,
          offset,
          count: articles.length,
        },
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[DEBUG] Error in /articles:', error)
      }
      logError('Failed to fetch articles', error, {
        operation: 'getPublishedArticles',
        query: c.req.valid('query'),
      })

      const errorResponse = getErrorResponse(
        new DatabaseError('Failed to fetch articles', 'getPublishedArticles', error)
      )

      return new Response(JSON.stringify(errorResponse), {
        status: errorResponse.status,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  })
  // スラッグで特定記事を取得
  .get('/articles/:slug', zValidator('param', articleSlugSchema), async (c) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[DEBUG] /articles/:slug endpoint hit')
    }
    try {
      const { slug } = c.req.valid('param')
      if (process.env.NODE_ENV === 'development') {
        console.log('[DEBUG] Article slug:', slug)
      }

      const db = createDrizzleClient(c.env.DB)
      const dbOps = new DatabaseOperations(db)

      const articleWithResources = await dbOps.articles.getArticleWithResourcesBySlug(slug)

      if (!articleWithResources) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[DEBUG] Article not found:', slug)
        }
        const notFoundError = new NotFoundError('Article not found', 'article', slug)
        const errorResponse = getErrorResponse(notFoundError)
        return new Response(JSON.stringify(errorResponse), {
          status: errorResponse.status,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('[DEBUG] Article found:', articleWithResources.title)
      }
      return c.json({
        success: true,
        data: articleWithResources,
      })
    } catch (error) {
      const { slug } = c.req.valid('param')
      if (process.env.NODE_ENV === 'development') {
        console.error('[DEBUG] Error in /articles/:slug:', error)
      }
      logError('Failed to fetch article', error, {
        operation: 'getArticleWithResourcesBySlug',
        slug,
      })

      const errorResponse = getErrorResponse(
        new DatabaseError('Failed to fetch article', 'getArticleWithResourcesBySlug', error)
      )

      return new Response(JSON.stringify(errorResponse), {
        status: errorResponse.status,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  })
  // タグ一覧を取得
  .get('/tags', async (c) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[DEBUG] /tags endpoint hit')
    }
    try {
      const db = createDrizzleClient(c.env.DB)
      const dbOps = new DatabaseOperations(db)

      const tags = await dbOps.articles.getAllTags()
      if (process.env.NODE_ENV === 'development') {
        console.log(`[DEBUG] Found ${tags.length} tags`)
      }

      return c.json({
        success: true,
        data: tags,
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[DEBUG] Error in /tags:', error)
      }
      logError('Failed to fetch tags', error, {
        operation: 'getAllTags',
      })

      const errorResponse = getErrorResponse(
        new DatabaseError('Failed to fetch tags', 'getAllTags', error)
      )

      return new Response(JSON.stringify(errorResponse), {
        status: errorResponse.status,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  })
  // リソース取得（画像リサイズ等）
  .get('/resources/:key', async (c) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[DEBUG] /resources/:key endpoint hit')
    }
    try {
      const key = c.req.param('key')
      if (process.env.NODE_ENV === 'development') {
        console.log('[DEBUG] Resource key:', key)
      }

      // R2 からファイルを直接取得
      const object = await c.env.R2.get(key)
      if (!object) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[DEBUG] File not found in R2:', key)
        }
        return new Response('File not found in storage', { status: 404 })
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('[DEBUG] File found in R2:', key)
      }
      const headers = new Headers()
      headers.set('Content-Type', object.httpMetadata?.contentType || 'application/octet-stream')
      headers.set('Cache-Control', 'public, max-age=31536000, immutable')

      return new Response(object.body, { headers })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[DEBUG] Error in /resources/:key:', error)
      }
      logError('Failed to fetch resource', error, {
        operation: 'getResource',
        key: c.req.param('key'),
      })

      return new Response('Internal server error', { status: 500 })
    }
  })

// メインアプリ
app
  // API ルートを /api にマウント
  .route('/api', api)
  // 静的ファイル配信（Frontend の成果物）
  .get('*', serveStatic({ root: './assets', manifest }))

// 型エクスポート（Frontend で使用）
export type App = typeof api

export default app
