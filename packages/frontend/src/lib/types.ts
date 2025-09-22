// 記事データの型定義
export interface Article {
  id: string
  slug: string
  title: string
  description: string | null
  content: string
  tags: string | null
  published: boolean
  publishDate: string | null
  createdAt: string
  updatedAt: string
}

// 記事一覧レスポンスの型定義
export interface ArticlesResponse {
  success: boolean
  data: Article[]
  meta: {
    limit: number
    offset: number
    count: number
  }
}

// 検索パラメータの型定義
export interface ArticleSearchParams {
  limit?: number
  offset?: number
  search?: string
  tag?: string
}

// データベースレコードの型定義
interface DbArticle {
  id?: unknown
  slug?: unknown
  title?: unknown
  description?: unknown
  content?: unknown
  tags?: unknown
  published?: unknown
  publishDate?: unknown
  createdAt?: unknown
  updatedAt?: unknown
}

// データベースから取得したデータを Article 型に安全に変換する関数
export function dbArticleToArticle(dbArticle: DbArticle): Article {
  return {
    id: String(dbArticle.id || ''),
    slug: String(dbArticle.slug || ''),
    title: String(dbArticle.title || ''),
    description: dbArticle.description ? String(dbArticle.description) : null,
    content: String(dbArticle.content || ''),
    tags: dbArticle.tags ? String(dbArticle.tags) : null,
    published: Boolean(dbArticle.published),
    publishDate: dbArticle.publishDate ? String(dbArticle.publishDate) : null,
    createdAt: String(dbArticle.createdAt || ''),
    updatedAt: String(dbArticle.updatedAt || ''),
  }
}
