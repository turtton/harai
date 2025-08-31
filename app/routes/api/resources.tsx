import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { createDrizzleClient, type Env } from '../../../db/client'
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
    console.error('Error fetching resources:', error)
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch resources',
      },
      500
    )
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
      return c.json(
        {
          success: false,
          error: 'Resource not found',
        },
        404
      )
    }

    return c.json({
      success: true,
      data: resource,
    })
  } catch (error) {
    console.error('Error fetching resource:', error)
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch resource',
      },
      500
    )
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
