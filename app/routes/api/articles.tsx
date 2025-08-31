import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { createDrizzleClient, type Env } from '../../../db/client'
import { DatabaseError, getErrorResponse, NotFoundError } from '../../../db/errors'
import { logError } from '../../../db/logger'
import { DatabaseOperations } from '../../../db/operations'
import { articleQuerySchema, articleSlugSchema } from '../../../db/validators'

const app = new Hono<{ Bindings: Env }>()

// 公開記事一覧を取得
app.get('/', zValidator('query', articleQuerySchema), async (c) => {
  try {
    const db = createDrizzleClient(c.env.DB)
    const dbOps = new DatabaseOperations(db)

    const { limit, offset, tag, search } = c.req.valid('query')

    let articles: Awaited<ReturnType<typeof dbOps.articles.getPublishedArticles>>

    if (tag) {
      articles = await dbOps.articles.searchByTag(tag)
    } else if (search) {
      articles = await dbOps.articles.searchArticles(search)
    } else {
      articles = await dbOps.articles.getPublishedArticles(limit, offset)
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
    logError('Failed to fetch articles', error, {
      operation: 'getPublishedArticles',
      query: c.req.valid('query'),
    })

    const errorResponse = getErrorResponse(
      new DatabaseError('Failed to fetch articles', 'getPublishedArticles', error)
    )

    return c.json(errorResponse, errorResponse.status as any)
  }
})

// スラッグで特定記事を取得
app.get('/:slug', zValidator('param', articleSlugSchema), async (c) => {
  try {
    const { slug } = c.req.valid('param')
    const db = createDrizzleClient(c.env.DB)
    const dbOps = new DatabaseOperations(db)

    // N+1問題を回避した効率的なクエリを使用
    const articleWithResources = await dbOps.articles.getArticleWithResourcesBySlug(slug)

    if (!articleWithResources) {
      const notFoundError = new NotFoundError('Article not found', 'article', slug)
      const errorResponse = getErrorResponse(notFoundError)
      return c.json(errorResponse, errorResponse.status as any)
    }

    return c.json({
      success: true,
      data: articleWithResources,
    })
  } catch (error) {
    const { slug } = c.req.valid('param')
    logError('Failed to fetch article', error, {
      operation: 'getArticleWithResourcesBySlug',
      slug,
    })

    const errorResponse = getErrorResponse(
      new DatabaseError('Failed to fetch article', 'getArticleWithResourcesBySlug', error)
    )

    return c.json(errorResponse, errorResponse.status as any)
  }
})

// 記事作成 (認証が必要 - 後で実装)
app.post('/', async (c) => {
  return c.json(
    {
      success: false,
      error: 'Article creation endpoint - authentication required',
    },
    501
  )
})

// 記事更新 (認証が必要 - 後で実装)
app.put('/:id', async (c) => {
  return c.json(
    {
      success: false,
      error: 'Article update endpoint - authentication required',
    },
    501
  )
})

// 記事削除 (認証が必要 - 後で実装)
app.delete('/:id', async (c) => {
  return c.json(
    {
      success: false,
      error: 'Article deletion endpoint - authentication required',
    },
    501
  )
})

export default app
