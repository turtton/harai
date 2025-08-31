import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { createDrizzleClient, type Env } from '../../../../db/client'
import { DatabaseOperations } from '../../../../db/operations'
import {
  imageCacheCreateSchema,
  imageParamsSchema,
  imageQuerySchema,
} from '../../../../db/validators'

const app = new Hono<{ Bindings: Env }>()

// 画像リサイズ・キャッシュエンドポイント
app.get(
  '/:key',
  zValidator('param', imageParamsSchema),
  zValidator('query', imageQuerySchema),
  async (c) => {
    try {
      const { key } = c.req.valid('param')
      const { w: width, h: height, f: format } = c.req.valid('query')

      const db = createDrizzleClient(c.env.DB)
      const dbOps = new DatabaseOperations(db)

      // キャッシュから画像を検索
      if (width) {
        const cachedImage = await dbOps.imageCache.getCachedImage(key, width, height, format)

        if (cachedImage) {
          return c.json({
            success: true,
            data: {
              original: key,
              cached: cachedImage.cachedR2Key,
              width: cachedImage.width,
              height: cachedImage.height,
              format: cachedImage.format,
              cached_at: cachedImage.createdAt,
            },
          })
        }
      }

      // キャッシュにない場合は、画像処理が必要であることを示す
      return c.json({
        success: true,
        data: {
          original: key,
          cached: null,
          needs_processing: true,
          requested_width: width,
          requested_height: height,
          requested_format: format,
        },
      })
    } catch (error) {
      console.error('Error handling image request:', error)
      return c.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to handle image request',
        },
        500
      )
    }
  }
)

// 画像キャッシュ作成 (内部使用 - 認証が必要)
app.post(
  '/:key/cache',
  zValidator('param', imageParamsSchema),
  zValidator('json', imageCacheCreateSchema),
  async (c) => {
    try {
      const { key } = c.req.valid('param')
      const { width, height, format, cached_r2_key } = c.req.valid('json')

      const db = createDrizzleClient(c.env.DB)
      const dbOps = new DatabaseOperations(db)

      const cacheData = {
        originalR2Key: key,
        width,
        height: height || null,
        format: format || null,
        cachedR2Key: cached_r2_key,
        createdAt: new Date().toISOString(),
      }

      const result = await dbOps.imageCache.createCache(cacheData)

      return c.json({
        success: true,
        data: result[0],
      })
    } catch (error) {
      console.error('Error creating image cache:', error)
      return c.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create image cache',
        },
        500
      )
    }
  }
)

export default app
