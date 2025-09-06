import { Calendar, ChevronDown } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { apiClient } from '@/lib/api-client'
import type { Article, ArticleSearchParams, ArticlesResponse } from '@/lib/types'
import SearchBar from './search-bar'
import TagFilter from './tag-filter'

interface ArticleListProps {
  initialArticles: Article[]
  initialTags: string[]
}

export default function ArticleList({ initialArticles, initialTags }: ArticleListProps) {
  const [allArticles, setAllArticles] = useState<Article[]>(initialArticles) // 全記事データ
  const [articles, setArticles] = useState<Article[]>(initialArticles) // 表示用記事データ
  const [tags] = useState<string[]>(initialTags)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialArticles.length >= 10)
  const [error, setError] = useState<string | null>(null)

  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  // 記事のタグをパース
  const parseArticleTags = (tagsString: string | null): string[] => {
    if (!tagsString) return []
    try {
      return JSON.parse(tagsString) as string[]
    } catch {
      return []
    }
  }

  // 記事を取得する関数
  const fetchArticles = useCallback(async (params: ArticleSearchParams, replace = false) => {
    setLoading(true)
    setError(null)

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
        setAllArticles(data.data)
      } else {
        setAllArticles((prev) => [...prev, ...data.data])
      }

      setHasMore(data.data.length >= 10)
    } catch (err) {
      setError(err instanceof Error ? err.message : '記事の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [])

  // 検索やフィルタ条件が変更された時の処理
  useEffect(() => {
    const hasFilters = searchQuery || selectedTags.length > 0

    if (hasFilters) {
      const params: ArticleSearchParams = {
        limit: 50, // 複数タグフィルタのため多めに取得
        offset: 0,
      }

      if (searchQuery) params.search = searchQuery
      // タグフィルタはクライアント側で実装するため、サーバー側では検索のみ

      fetchArticles(params, true)
    } else {
      // フィルタがない場合は初期データに戻す
      setAllArticles(initialArticles)
      setHasMore(initialArticles.length >= 10)
    }
  }, [searchQuery, selectedTags, fetchArticles, initialArticles])

  // クライアント側でのタグフィルタリング
  useEffect(() => {
    if (selectedTags.length === 0) {
      setArticles(allArticles)
    } else {
      const filteredArticles = allArticles.filter((article) => {
        const articleTags = parseArticleTags(article.tags)
        // 選択されたすべてのタグが記事に含まれているかチェック（AND条件）
        return selectedTags.every((selectedTag) => articleTags.includes(selectedTag))
      })
      setArticles(filteredArticles)
    }
  }, [allArticles, selectedTags])

  // 無限スクロールの設定
  useEffect(() => {
    if (!hasMore || loading) return

    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && hasMore && !loading) {
          const currentOffset = allArticles.length
          const params: ArticleSearchParams = {
            limit: 10,
            offset: currentOffset,
          }

          if (searchQuery) params.search = searchQuery
          // タグフィルタはクライアント側で実装

          fetchArticles(params)
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [allArticles.length, hasMore, loading, searchQuery, fetchArticles])

  // タグフィルタの処理（複数選択対応）
  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const handleClearAllTags = () => {
    setSelectedTags([])
  }

  // 記事の日付フォーマット
  const formatDate = (dateString: string | null) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className='flex flex-col md:flex-row gap-4 md:gap-8 h-full min-h-0'>
      {/* 左サイドバー（固定） - モバイルでは上に表示 */}
      <div className='w-full md:w-80 md:flex-shrink-0 space-y-3 md:space-y-6 flex-shrink-0'>
        {/* 検索バー */}
        <div className='space-y-2'>
          <h3 className='hidden md:block font-semibold text-sm text-muted-foreground'>検索</h3>
          <SearchBar onSearch={setSearchQuery} />
        </div>

        {/* 記事数表示 */}
        <div className='text-sm text-muted-foreground'>{articles.length} 件の記事</div>

        {/* タグフィルター */}
        <div className='space-y-2'>
          <h3 className='hidden md:block font-semibold text-sm text-muted-foreground'>タグ</h3>
          <TagFilter
            tags={tags}
            selectedTags={selectedTags}
            onTagToggle={handleTagToggle}
            onClearAll={handleClearAllTags}
          />
        </div>

        {/* エラー表示 */}
        {error && (
          <div className='bg-destructive/10 text-destructive p-4 rounded-lg text-sm'>{error}</div>
        )}
      </div>

      {/* 右側記事一覧エリア（スクロール可能） */}
      <div className='flex-1 min-h-0 overflow-auto'>
        <div className='space-y-6'>
          {/* 記事一覧 */}
          <div className='grid gap-6'>
            {articles.map((article) => (
              <Card key={article.id} className='hover:shadow-lg transition-shadow cursor-pointer'>
                <CardHeader>
                  <div className='flex items-start justify-between gap-4'>
                    <div className='space-y-2 flex-1'>
                      <CardTitle className='line-clamp-2'>
                        <a
                          href={`/posts/${article.slug}`}
                          className='hover:text-primary transition-colors'
                        >
                          {article.title}
                        </a>
                      </CardTitle>
                      {article.description && (
                        <p className='text-sm text-muted-foreground line-clamp-2'>
                          {article.description}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='flex flex-col sm:flex-row sm:items-center gap-3 justify-between'>
                    <div className='flex flex-wrap gap-2'>
                      {parseArticleTags(article.tags).map((tag) => (
                        <Badge
                          key={tag}
                          variant='secondary'
                          className='text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors'
                          onClick={(e) => {
                            e.preventDefault()
                            handleTagToggle(tag)
                          }}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    {article.publishDate && (
                      <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                        <Calendar className='h-3 w-3' />
                        {formatDate(article.publishDate)}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* ローディング表示 */}
          {loading && (
            <div className='grid gap-6'>
              <Card>
                <CardHeader>
                  <Skeleton className='h-6 w-3/4' />
                  <Skeleton className='h-4 w-full' />
                </CardHeader>
                <CardContent>
                  <div className='flex gap-2'>
                    <Skeleton className='h-5 w-16' />
                    <Skeleton className='h-5 w-20' />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Skeleton className='h-6 w-3/4' />
                  <Skeleton className='h-4 w-full' />
                </CardHeader>
                <CardContent>
                  <div className='flex gap-2'>
                    <Skeleton className='h-5 w-16' />
                    <Skeleton className='h-5 w-20' />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Skeleton className='h-6 w-3/4' />
                  <Skeleton className='h-4 w-full' />
                </CardHeader>
                <CardContent>
                  <div className='flex gap-2'>
                    <Skeleton className='h-5 w-16' />
                    <Skeleton className='h-5 w-20' />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 無限スクロール用の要素 */}
          {hasMore && !loading && (
            <div ref={loadMoreRef} className='flex justify-center py-8'>
              <Button variant='outline' className='gap-2' disabled>
                <ChevronDown className='h-4 w-4' />
                スクロールして続きを読み込み
              </Button>
            </div>
          )}

          {/* これ以上記事がない場合 */}
          {!hasMore && articles.length > 0 && (
            <div className='text-center py-8 text-muted-foreground'>すべての記事を表示しました</div>
          )}

          {/* 記事が見つからない場合 */}
          {articles.length === 0 && !loading && (
            <div className='text-center py-12 space-y-4'>
              <div className='text-muted-foreground'>記事が見つかりませんでした</div>
              {(searchQuery || selectedTags.length > 0) && (
                <Button
                  variant='outline'
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedTags([])
                  }}
                >
                  フィルタをクリア
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
