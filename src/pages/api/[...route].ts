import { zValidator } from '@hono/zod-validator'
import type { APIRoute } from 'astro'
import { Hono } from 'hono'
import { createDrizzleClient, type Env } from '@/db/client.ts'
import { DatabaseError, getErrorResponse, NotFoundError } from '@/db/errors.ts'
import { logError } from '@/db/logger.ts'
import { DatabaseOperations } from '@/db/operations.ts'
import { articleQuerySchema, articleSlugSchema } from '@/db/validators.ts'
import { type AstroLocals, getCloudflareEnv } from '@/types/astro.ts'

const app = new Hono<{ Bindings: Env }>().basePath('/api')

// デバッグ用ミドルウェア
app.use('*', async (c, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEBUG] ${c.req.method} ${c.req.url}`)
    console.log(`[DEBUG] Path: ${c.req.path}`)
  }
  await next()
})

// 公開記事一覧を取得
app.get('/articles', zValidator('query', articleQuerySchema), async (c) => {
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
app.get('/articles/:slug', zValidator('param', articleSlugSchema), async (c) => {
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
app.get('/tags', async (c) => {
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
app.get('/resources/:key', async (c) => {
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

export type App = typeof app

export const GET: APIRoute = (context) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[DEBUG] GET request to API route')
    console.log('[DEBUG] Request URL:', context.request.url)
  }

  const request = context.request
  const locals = context.locals as AstroLocals
  const env = getCloudflareEnv(locals)

  if (process.env.NODE_ENV === 'development') {
    console.log('[DEBUG] Environment bindings available:', {
      hasDB: !!env.DB,
      hasR2: !!env.R2,
    })
  }

  return app.fetch(request, env)
}

export const POST: APIRoute = (context) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[DEBUG] POST request to API route')
  }
  const request = context.request
  const locals = context.locals as AstroLocals
  const env = getCloudflareEnv(locals)
  return app.fetch(request, env)
}

export const PUT: APIRoute = (context) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[DEBUG] PUT request to API route')
  }
  const request = context.request
  const locals = context.locals as AstroLocals
  const env = getCloudflareEnv(locals)
  return app.fetch(request, env)
}

export const DELETE: APIRoute = (context) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[DEBUG] DELETE request to API route')
  }
  const request = context.request
  const locals = context.locals as AstroLocals
  const env = getCloudflareEnv(locals)
  return app.fetch(request, env)
}
