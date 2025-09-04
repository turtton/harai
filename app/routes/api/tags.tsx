import { Hono } from 'hono'
import { createDrizzleClient, type Env } from '../../../db/client'
import { DatabaseError, getErrorResponse } from '../../../db/errors'
import { logError } from '../../../db/logger'
import { DatabaseOperations } from '../../../db/operations'

const app = new Hono<{ Bindings: Env }>()

// 全タグを取得
app.get('/', async (c) => {
  try {
    const db = createDrizzleClient(c.env.DB)
    const dbOps = new DatabaseOperations(db)

    const tags = await dbOps.articles.getAllTags()

    return c.json({
      success: true,
      data: tags,
      meta: {
        count: tags.length,
      },
    })
  } catch (error) {
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

export default app
