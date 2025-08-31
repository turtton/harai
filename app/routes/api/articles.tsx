import { Hono } from 'hono';
import { createDrizzleClient, type Env } from '../../../db/client';
import { DatabaseOperations } from '../../../db/operations';

const app = new Hono<{ Bindings: Env }>();

// 公開記事一覧を取得
app.get('/', async (c) => {
  try {
    const db = createDrizzleClient(c.env.DB);
    const dbOps = new DatabaseOperations(db);

    const limit = Number(c.req.query('limit')) || 20;
    const offset = Number(c.req.query('offset')) || 0;
    const tag = c.req.query('tag');
    const search = c.req.query('search');

    let articles;
    
    if (tag) {
      articles = await dbOps.articles.searchByTag(tag);
    } else if (search) {
      articles = await dbOps.articles.searchArticles(search);
    } else {
      articles = await dbOps.articles.getPublishedArticles(limit, offset);
    }

    return c.json({
      success: true,
      data: articles,
      meta: {
        limit,
        offset,
        count: articles.length,
      },
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return c.json(
      {
        success: false,
        error: 'Failed to fetch articles',
      },
      500
    );
  }
});

// スラッグで特定記事を取得
app.get('/:slug', async (c) => {
  try {
    const slug = c.req.param('slug');
    const db = createDrizzleClient(c.env.DB);
    const dbOps = new DatabaseOperations(db);

    const article = await dbOps.articles.getArticleBySlug(slug);
    
    if (!article) {
      return c.json(
        {
          success: false,
          error: 'Article not found',
        },
        404
      );
    }

    // 記事に関連するリソースも取得
    const relatedResources = await dbOps.resources.getResourcesByArticleId(article.id);

    return c.json({
      success: true,
      data: {
        ...article,
        resources: relatedResources,
      },
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    return c.json(
      {
        success: false,
        error: 'Failed to fetch article',
      },
      500
    );
  }
});

// 記事作成 (認証が必要 - 後で実装)
app.post('/', async (c) => {
  return c.json(
    {
      success: false,
      error: 'Article creation endpoint - authentication required',
    },
    501
  );
});

// 記事更新 (認証が必要 - 後で実装)
app.put('/:id', async (c) => {
  return c.json(
    {
      success: false,
      error: 'Article update endpoint - authentication required',
    },
    501
  );
});

// 記事削除 (認証が必要 - 後で実装)
app.delete('/:id', async (c) => {
  return c.json(
    {
      success: false,
      error: 'Article deletion endpoint - authentication required',
    },
    501
  );
});

export default app;