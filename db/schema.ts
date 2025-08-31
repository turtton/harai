import { sql } from 'drizzle-orm'
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// articles テーブル
export const articles = sqliteTable(
  'articles',
  {
    id: text('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    description: text('description'),
    content: text('content').notNull(),
    tags: text('tags'), // JSON array として保存
    published: integer('published', { mode: 'boolean' }).default(false),
    publishDate: text('publish_date'), // ISO 8601 string として保存
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    slugIdx: index('idx_articles_slug').on(table.slug),
    publishedIdx: index('idx_articles_published').on(table.published),
    publishDateIdx: index('idx_articles_publish_date').on(table.publishDate),
  })
)

// resources テーブル
export const resources = sqliteTable(
  'resources',
  {
    id: text('id').primaryKey(),
    articleId: text('article_id')
      .notNull()
      .references(() => articles.id, { onDelete: 'cascade' }),
    slug: text('slug').notNull(),
    type: text('type').notNull(),
    r2Key: text('r2_key').notNull(),
    originalName: text('original_name'),
    size: integer('size'),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    articleIdIdx: index('idx_resources_article_id').on(table.articleId),
    r2KeyIdx: index('idx_resources_r2_key').on(table.r2Key),
    uniqueArticleSlug: index('idx_resources_article_slug').on(table.articleId, table.slug),
  })
)

// image_cache テーブル
export const imageCache = sqliteTable(
  'image_cache',
  {
    originalR2Key: text('original_r2_key').notNull(),
    width: integer('width').notNull(),
    height: integer('height'),
    format: text('format'),
    cachedR2Key: text('cached_r2_key').notNull(),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    originalIdx: index('idx_image_cache_original').on(table.originalR2Key),
    // 複合主キー (original_r2_key, width, height, format)
    pk: index('pk_image_cache').on(table.originalR2Key, table.width, table.height, table.format),
  })
)
