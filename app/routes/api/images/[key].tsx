import { Hono } from 'hono';
import { createDrizzleClient, type Env } from '../../../../db/client';
import { DatabaseOperations } from '../../../../db/operations';

const app = new Hono<{ Bindings: Env }>();

// 画像リサイズ・キャッシュエンドポイント
app.get('/:key', async (c) => {
  try {
    const key = c.req.param('key');
    const width = Number(c.req.query('w')) || undefined;
    const height = Number(c.req.query('h')) || undefined;
    const format = c.req.query('f') || undefined;
    
    if (!key) {
      return c.json(
        {
          success: false,
          error: 'Image key is required',
        },
        400
      );
    }

    const db = createDrizzleClient(c.env.DB);
    const dbOps = new DatabaseOperations(db);

    // キャッシュから画像を検索
    if (width) {
      const cachedImage = await dbOps.imageCache.getCachedImage(key, width, height, format);
      
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
        });
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
    });
  } catch (error) {
    console.error('Error handling image request:', error);
    return c.json(
      {
        success: false,
        error: 'Failed to handle image request',
      },
      500
    );
  }
});

// 画像キャッシュ作成 (内部使用 - 認証が必要)
app.post('/:key/cache', async (c) => {
  try {
    const key = c.req.param('key');
    const body = await c.req.json();
    
    const { width, height, format, cached_r2_key } = body;
    
    if (!key || !width || !cached_r2_key) {
      return c.json(
        {
          success: false,
          error: 'Missing required parameters',
        },
        400
      );
    }

    const db = createDrizzleClient(c.env.DB);
    const dbOps = new DatabaseOperations(db);

    const cacheData = {
      originalR2Key: key,
      width: Number(width),
      height: height ? Number(height) : null,
      format: format || null,
      cachedR2Key: cached_r2_key,
      createdAt: new Date().toISOString(),
    };

    const result = await dbOps.imageCache.createCache(cacheData);

    return c.json({
      success: true,
      data: result[0],
    });
  } catch (error) {
    console.error('Error creating image cache:', error);
    return c.json(
      {
        success: false,
        error: 'Failed to create image cache',
      },
      500
    );
  }
});

export default app;