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
