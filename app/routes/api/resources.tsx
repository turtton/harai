import { Hono } from 'hono'
import { createDrizzleClient, type Env } from '../../../db/client'
import { DatabaseOperations } from '../../../db/operations'

const app = new Hono<{ Bindings: Env }>()

// 記事のリソース一覧を取得
app.get('/', async (c) => {
  try {
    const articleId = c.req.query('article_id')

    if (!articleId) {
      return c.json(
        {
          success: false,
          error: 'article_id parameter is required',
        },
        400
      )
    }

    const db = createDrizzleClient(c.env.DB)
    const dbOps = new DatabaseOperations(db)

    const resources = await dbOps.resources.getResourcesByArticleId(articleId)

    return c.json({
      success: true,
      data: resources,
    })
  } catch (error) {
    console.error('Error fetching resources:', error)
    return c.json(
      {
        success: false,
        error: 'Failed to fetch resources',
      },
      500
    )
  }
})

// 特定リソースを取得
app.get('/:articleId/:slug', async (c) => {
  try {
    const articleId = c.req.param('articleId')
    const slug = c.req.param('slug')

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
        error: 'Failed to fetch resource',
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
