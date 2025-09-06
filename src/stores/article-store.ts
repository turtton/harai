import { atom, computed } from 'nanostores'
import { apiClient } from '@/lib/api-client'
import type { Article, ArticleSearchParams, ArticlesResponse } from '@/lib/types'

export interface ArticleState {
  allArticles: Article[]
  selectedTags: string[]
  searchQuery: string
  loading: boolean
  error: string | null
  hasMore: boolean
  availableTags: string[]
}

// アトムの定義
export const $allArticles = atom<Article[]>([])
export const $selectedTags = atom<string[]>([])
export const $searchQuery = atom<string>('')
export const $loading = atom<boolean>(false)
export const $error = atom<string | null>(null)
export const $hasMore = atom<boolean>(false)
export const $availableTags = atom<string[]>([])

// 記事のタグをパースする関数
const parseArticleTags = (tagsString: string | null): string[] => {
  if (!tagsString) return []
  try {
    return JSON.parse(tagsString) as string[]
  } catch {
    return []
  }
}

// フィルタリングされた記事の computed
export const $filteredArticles = computed(
  [$allArticles, $selectedTags, $searchQuery],
  (allArticles, selectedTags, searchQuery) => {
    let filtered = allArticles

    // タグフィルタ
    if (selectedTags.length > 0) {
      filtered = filtered.filter((article) => {
        const articleTags = parseArticleTags(article.tags)
        return selectedTags.every((selectedTag) => articleTags.includes(selectedTag))
      })
    }

    // 検索フィルタ
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter((article) => {
        const title = article.title.toLowerCase()
        const description = article.description?.toLowerCase() || ''
        const tags = parseArticleTags(article.tags).join(' ').toLowerCase()
        return title.includes(query) || description.includes(query) || tags.includes(query)
      })
    }

    return filtered
  }
)

// 記事数の computed
export const $articleCount = computed($filteredArticles, (articles) => articles.length)

// アクション関数
export const articleActions = {
  setInitialData(articles: Article[], initialArticleMaxCount: number, tags: string[]) {
    $allArticles.set(articles)
    $availableTags.set(tags)
    $hasMore.set(articles.length >= initialArticleMaxCount)
  },

  setLoading(loading: boolean) {
    $loading.set(loading)
  },

  setError(error: string | null) {
    $error.set(error)
  },

  setSearchQuery(query: string) {
    $searchQuery.set(query)
  },

  toggleTag(tag: string) {
    const currentTags = $selectedTags.get()
    if (currentTags.includes(tag)) {
      $selectedTags.set(currentTags.filter((t) => t !== tag))
    } else {
      $selectedTags.set([...currentTags, tag])
    }
  },

  clearTags() {
    $selectedTags.set([])
  },

  addArticles(articles: Article[]) {
    const current = $allArticles.get()
    $allArticles.set([...current, ...articles])
  },

  replaceArticles(articles: Article[]) {
    $allArticles.set(articles)
  },

  setHasMore(hasMore: boolean) {
    $hasMore.set(hasMore)
  },

  async fetchArticles(params: ArticleSearchParams, replace = false): Promise<void> {
    articleActions.setLoading(true)
    articleActions.setError(null)

    try {
      const response = await apiClient.articles.$get({
        query: {
          ...(params.limit && { limit: params.limit.toString() }),
          ...(params.offset && { offset: params.offset.toString() }),
          ...(params.search && { search: params.search }),
          ...(params.tag && { tag: params.tag }),
        },
      })

      if (!response.ok) {
        throw new Error('記事の取得に失敗しました')
      }

      const data = (await response.json()) as ArticlesResponse

      if (replace) {
        articleActions.replaceArticles(data.data)
      } else {
        articleActions.addArticles(data.data)
      }

      articleActions.setHasMore(data.data.length >= 10)
    } catch (err) {
      articleActions.setError(err instanceof Error ? err.message : '記事の取得に失敗しました')
    } finally {
      articleActions.setLoading(false)
    }
  },
}
