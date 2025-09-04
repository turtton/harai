import { Calendar, ChevronDown } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { Article, ArticleSearchParams, ArticlesResponse } from '@/lib/types'
import SearchBar from './search-bar'
import TagFilter from './tag-filter'

interface ArticleListProps {
  initialArticles: Article[]
  initialTags: string[]
}

export default function ArticleList({ initialArticles, initialTags }: ArticleListProps) {
  const [articles, setArticles] = useState<Article[]>(initialArticles)
  const [tags] = useState<string[]>(initialTags)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialArticles.length >= 10)
  const [error, setError] = useState<string | null>(null)

  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  // 記事を取得する関数
  const fetchArticles = useCallback(async (params: ArticleSearchParams, replace = false) => {
    setLoading(true)
    setError(null)

    try {
      const queryParams = new URLSearchParams()
      if (params.limit) queryParams.append('limit', params.limit.toString())
      if (params.offset) queryParams.append('offset', params.offset.toString())
      if (params.search) queryParams.append('search', params.search)
      if (params.tag) queryParams.append('tag', params.tag)

      const response = await fetch(`/api/articles?${queryParams}`)

      if (!response.ok) {
        throw new Error('記事の取得に失敗しました')
      }

      const data: ArticlesResponse = await response.json()

      if (replace) {
        setArticles(data.data)
      } else {
        setArticles((prev) => [...prev, ...data.data])
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
        limit: 10,
        offset: 0,
      }

      if (searchQuery) params.search = searchQuery
      if (selectedTags.length === 1) params.tag = selectedTags[0]

      fetchArticles(params, true)
    } else {
      // フィルタがない場合は初期データに戻す
      setArticles(initialArticles)
      setHasMore(initialArticles.length >= 10)
    }
  }, [searchQuery, selectedTags, fetchArticles, initialArticles])

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
          const currentOffset = articles.length
          const params: ArticleSearchParams = {
            limit: 10,
            offset: currentOffset,
          }

          if (searchQuery) params.search = searchQuery
          if (selectedTags.length === 1) params.tag = selectedTags[0]

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
  }, [articles.length, hasMore, loading, searchQuery, selectedTags, fetchArticles])

  // タグフィルタの処理
  const handleTagToggle = (tag: string) => {
    setSelectedTags(
      (prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [tag]) // 現在は単一選択のみサポート
    )
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

  // 記事のタグをパース
  const parseArticleTags = (tagsString: string | null): string[] => {
    if (!tagsString) return []
    try {
      return JSON.parse(tagsString) as string[]
    } catch {
      return []
    }
  }

  return (
    <div className='space-y-8'>
      {/* 検索バー */}
      <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
        <SearchBar onSearch={setSearchQuery} />
        <div className='text-sm text-muted-foreground'>{articles.length} 件の記事</div>
      </div>

      {/* タグフィルター */}
      <TagFilter
        tags={tags}
        selectedTags={selectedTags}
        onTagToggle={handleTagToggle}
        onClearAll={handleClearAllTags}
      />

      {/* エラー表示 */}
      {error && <div className='bg-destructive/10 text-destructive p-4 rounded-lg'>{error}</div>}

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
  )
}
