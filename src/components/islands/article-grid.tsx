import { useStore } from '@nanostores/react'
import { Calendar } from 'lucide-react'
import { useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { Article } from '@/lib/types'
import {
  $articleCount,
  $error,
  $filteredArticles,
  $loading,
  articleActions,
} from '@/stores/article-store'

interface ArticleGridProps {
  initialArticles: Article[]
  initialTags: string[]
}

const parseArticleTags = (tagsString: string | null): string[] => {
  if (!tagsString) return []
  try {
    return JSON.parse(tagsString) as string[]
  } catch {
    return []
  }
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function ArticleGrid({ initialArticles, initialTags }: ArticleGridProps) {
  const filteredArticles = useStore($filteredArticles)
  const loading = useStore($loading)
  const error = useStore($error)
  const articleCount = useStore($articleCount)

  useEffect(() => {
    // 初期データを設定（一度だけ）
    if (initialArticles.length > 0) {
      articleActions.setInitialData(initialArticles, initialTags)
    }
  }, [initialArticles, initialTags])

  const handleTagClick = (tag: string) => {
    articleActions.toggleTag(tag)
  }

  if (error) {
    return (
      <div className='bg-destructive/10 text-destructive p-4 rounded-lg text-sm text-center'>
        {error}
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* 記事数表示 */}
      <div className='text-sm text-muted-foreground'>{articleCount} 件の記事</div>

      {/* 記事一覧 */}
      <div className='grid gap-6'>
        {filteredArticles.map((article) => (
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
                        handleTagClick(tag)
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

      {/* ローディング時のスケルトン */}
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

      {/* 記事が見つからない場合 */}
      {filteredArticles.length === 0 && !loading && (
        <div className='text-center py-12 space-y-4'>
          <div className='text-muted-foreground'>記事が見つかりませんでした</div>
        </div>
      )}
    </div>
  )
}
