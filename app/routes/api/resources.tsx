import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { createDrizzleClient, type Env } from '../../../db/client'
import { DatabaseError, getErrorResponse, NotFoundError } from '../../../db/errors'
import { logError } from '../../../db/logger'
import { DatabaseOperations } from '../../../db/operations'
import { resourceParamsSchema, resourceQuerySchema } from '../../../db/validators'

const app = new Hono<{ Bindings: Env }>()

// 記事のリソース一覧を取得
app.get('/', zValidator('query', resourceQuerySchema), async (c) => {
  try {
    const { article_id } = c.req.valid('query')

    const db = createDrizzleClient(c.env.DB)
    const dbOps = new DatabaseOperations(db)

    const resources = await dbOps.resources.getResourcesByArticleId(article_id)

    return c.json({
      success: true,
      data: resources,
    })
  } catch (error) {
    const { article_id } = c.req.valid('query')
    logError('Failed to fetch resources', error, {
      operation: 'getResourcesByArticleId',
      articleId: article_id,
    })

    const errorResponse = getErrorResponse(
      new DatabaseError('Failed to fetch resources', 'getResourcesByArticleId', error)
    )

    return new Response(JSON.stringify(errorResponse), {
      status: errorResponse.status,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})

// 特定リソースを取得
app.get('/:articleId/:slug', zValidator('param', resourceParamsSchema), async (c) => {
  try {
    const { articleId, slug } = c.req.valid('param')

    const db = createDrizzleClient(c.env.DB)
    const dbOps = new DatabaseOperations(db)

    const resource = await dbOps.resources.getResourceBySlug(articleId, slug)

    if (!resource) {
      const notFoundError = new NotFoundError(
        'Resource not found',
        'resource',
        `${articleId}/${slug}`
      )
      const errorResponse = getErrorResponse(notFoundError)
      return new Response(JSON.stringify(errorResponse), {
        status: errorResponse.status,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return c.json({
      success: true,
      data: resource,
    })
  } catch (error) {
    const { articleId, slug } = c.req.valid('param')
    logError('Failed to fetch resource', error, {
      operation: 'getResourceBySlug',
      articleId,
      slug,
    })

    const errorResponse = getErrorResponse(
      new DatabaseError('Failed to fetch resource', 'getResourceBySlug', error)
    )

    return new Response(JSON.stringify(errorResponse), {
      status: errorResponse.status,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})

// リソース作成 (認証が必要 - 後で実装)
app.post('/', async (c) => {
  return c.json(
    {
      success: false,
      error: 'Resource creation endpoint - authentication required',
    },
    501
  )
})

// リソース削除 (認証が必要 - 後で実装)
app.delete('/:id', async (c) => {
  return c.json(
    {
      success: false,
      error: 'Resource deletion endpoint - authentication required',
    },
    501
  )
})

export default app
