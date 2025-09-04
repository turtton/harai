import { and, asc, desc, eq, isNull, lt, sql } from 'drizzle-orm'
import type { Database } from './client'
import { CACHE_RETENTION_MS } from './constants'
import { articles, imageCache, resources } from './schema'

// 記事操作
export class ArticleOperations {
  constructor(private db: Database) {}

  // すべての公開記事を取得
  async getPublishedArticles(limit = 20, offset = 0) {
    return await this.db
      .select()
      .from(articles)
      .where(eq(articles.published, true))
      .orderBy(desc(articles.publishDate))
      .limit(limit)
      .offset(offset)
  }

  // スラッグで記事を取得
  async getArticleBySlug(slug: string) {
    const result = await this.db.select().from(articles).where(eq(articles.slug, slug)).limit(1)

    return result[0] || null
  }

  // 記事を作成
  async createArticle(data: typeof articles.$inferInsert) {
    return await this.db.insert(articles).values(data).returning()
  }

  // 記事とリソースを一緒に取得 (N+1問題を回避)
  async getArticleWithResourcesBySlug(slug: string) {
    const result = await this.db
      .select({
        article: articles,
        resource: resources,
      })
      .from(articles)
      .leftJoin(resources, eq(articles.id, resources.articleId))
      .where(eq(articles.slug, slug))

    if (result.length === 0) {
      return null
    }

    const article = result[0].article
    const articleResources = result
      .filter((row) => row.resource !== null)
      .map((row) => row.resource!)

    return {
      ...article,
      resources: articleResources,
    }
  }

  // 記事を更新
  async updateArticle(id: string, data: Partial<typeof articles.$inferInsert>) {
    return await this.db
      .update(articles)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(articles.id, id))
      .returning()
  }

  // 記事を削除
  async deleteArticle(id: string) {
    return await this.db.delete(articles).where(eq(articles.id, id))
  }

  // タグで検索
  async searchByTag(tag: string) {
    // SQLインジェクション対策: JSON配列内の文字列検索（完全一致）
    const searchPattern = `%"${tag.replace(/"/g, '"')}"%`
    return await this.db
      .select()
      .from(articles)
      .where(
        and(
          eq(articles.published, true),
          sql`json_extract(${articles.tags}, '$') LIKE ${searchPattern}`
        )
      )
      .orderBy(desc(articles.publishDate))
  }

  // タイトルまたは内容で検索
  async searchArticles(query: string) {
    // SQLインジェクション対策: LIKE特殊文字をエスケープしてパラメータ化
    const escapedQuery = query.replace(/[%_\\]/g, '\\$&')
    const searchPattern = `%${escapedQuery}%`
    return await this.db
      .select()
      .from(articles)
      .where(
        and(eq(articles.published, true), sql`${articles.title} LIKE ${searchPattern} ESCAPE '\\'`)
      )
      .orderBy(desc(articles.publishDate))
  }

  // 公開記事から全タグを取得（重複除去、使用頻度順）
  async getAllTags() {
    const publishedArticles = await this.db
      .select({ tags: articles.tags })
      .from(articles)
      .where(eq(articles.published, true))

    const tagCounts = new Map<string, number>()

    for (const article of publishedArticles) {
      if (article.tags) {
        try {
          const tags = JSON.parse(article.tags) as string[]
          for (const tag of tags) {
            if (tag.trim()) {
              const count = tagCounts.get(tag) || 0
              tagCounts.set(tag, count + 1)
            }
          }
        } catch {
          // JSON パースエラーの場合はスキップ
        }
      }
    }

    // 使用頻度順（降順）でソートしてタグ名のみを返す
    return Array.from(tagCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([tag]) => tag)
  }
}

// リソース操作
export class ResourceOperations {
  constructor(private db: Database) {}

  // 記事のリソースを取得
  async getResourcesByArticleId(articleId: string) {
    return await this.db
      .select()
      .from(resources)
      .where(eq(resources.articleId, articleId))
      .orderBy(asc(resources.createdAt))
  }

  // スラッグでリソースを取得
  async getResourceBySlug(articleId: string, slug: string) {
    const result = await this.db
      .select()
      .from(resources)
      .where(and(eq(resources.articleId, articleId), eq(resources.slug, slug)))
      .limit(1)

    return result[0] || null
  }

  // リソースを作成
  async createResource(data: typeof resources.$inferInsert) {
    return await this.db.insert(resources).values(data).returning()
  }

  // リソースを削除
  async deleteResource(id: string) {
    return await this.db.delete(resources).where(eq(resources.id, id))
  }

  // 記事のすべてのリソースを削除
  async deleteResourcesByArticleId(articleId: string) {
    return await this.db.delete(resources).where(eq(resources.articleId, articleId))
  }
}

// 画像キャッシュ操作
export class ImageCacheOperations {
  constructor(private db: Database) {}

  // キャッシュされた画像を取得
  async getCachedImage(originalR2Key: string, width: number, height?: number, format?: string) {
    const conditions = [eq(imageCache.originalR2Key, originalR2Key), eq(imageCache.width, width)]

    if (height !== undefined) {
      conditions.push(eq(imageCache.height, height))
    } else {
      conditions.push(isNull(imageCache.height))
    }

    if (format) {
      conditions.push(eq(imageCache.format, format))
    } else {
      conditions.push(isNull(imageCache.format))
    }

    const result = await this.db
      .select()
      .from(imageCache)
      .where(and(...conditions))
      .limit(1)

    return result[0] || null
  }

  // キャッシュを作成
  async createCache(data: Omit<typeof imageCache.$inferInsert, 'id'>) {
    const cacheData = {
      id: crypto.randomUUID(), // UUID を生成
      ...data,
    }
    return await this.db.insert(imageCache).values(cacheData).returning()
  }

  // 古いキャッシュを削除 (作成から設定された期間以上経過)
  async cleanOldCache() {
    const cutoffDate = new Date(Date.now() - CACHE_RETENTION_MS).toISOString()
    return await this.db.delete(imageCache).where(lt(imageCache.createdAt, cutoffDate))
  }

  // 特定の画像のすべてのキャッシュを削除
  async deleteCachesByOriginalKey(originalR2Key: string) {
    return await this.db.delete(imageCache).where(eq(imageCache.originalR2Key, originalR2Key))
  }
}

// 統合されたデータベース操作クラス
export class DatabaseOperations {
  public articles: ArticleOperations
  public resources: ResourceOperations
  public imageCache: ImageCacheOperations

  constructor(db: Database) {
    this.articles = new ArticleOperations(db)
    this.resources = new ResourceOperations(db)
    this.imageCache = new ImageCacheOperations(db)
  }
}
