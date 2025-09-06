import { useStore } from '@nanostores/react'
import { ChevronDown } from 'lucide-react'
import { useCallback, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import type { ArticleSearchParams } from '@/lib/types'
import {
  $allArticles,
  $hasMore,
  $loading,
  $searchQuery,
  $selectedTags,
  articleActions,
} from '@/stores/article-store'

export default function LoadMoreTrigger() {
  const allArticles = useStore($allArticles)
  const hasMore = useStore($hasMore)
  const loading = useStore($loading)
  const searchQuery = useStore($searchQuery)
  const selectedTags = useStore($selectedTags)

  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  const loadMoreArticles = useCallback(async () => {
    if (loading || !hasMore) return

    const params: ArticleSearchParams = {
      limit: 10,
      offset: allArticles.length,
    }

    // 検索クエリがある場合のみサーバー側で検索を実行
    // タグフィルタはクライアント側で処理
    if (searchQuery) {
      params.search = searchQuery
    }

    await articleActions.fetchArticles(params, false)
  }, [loading, hasMore, allArticles.length, searchQuery])

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
          loadMoreArticles()
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
  }, [hasMore, loading, loadMoreArticles])

  // フィルタ適用時は無限スクロールを無効化
  const hasActiveFilters = selectedTags.length > 0 || searchQuery.trim()

  // フィルタ適用時、または記事がない場合は何も表示しない
  if (hasActiveFilters || allArticles.length === 0) {
    return null
  }

  return (
    <div className='space-y-4'>
      {/* 無限スクロール用の要素 */}
      {hasMore && !loading && (
        <div ref={loadMoreRef} className='flex justify-center py-8'>
          <Button variant='outline' className='gap-2' disabled>
            <ChevronDown className='h-4 w-4' />
            スクロールして続きを読み込み
          </Button>
        </div>
      )}

      {/* 手動読み込みボタン（フォールバック） */}
      {hasMore && !loading && (
        <div className='flex justify-center py-4'>
          <Button variant='outline' onClick={loadMoreArticles} className='gap-2'>
            <ChevronDown className='h-4 w-4' />
            続きを読み込み
          </Button>
        </div>
      )}

      {/* これ以上記事がない場合 */}
      {!hasMore && allArticles.length > 0 && (
        <div className='text-center py-8 text-muted-foreground'>すべての記事を表示しました</div>
      )}
    </div>
  )
}
