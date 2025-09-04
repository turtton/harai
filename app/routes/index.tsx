import { createRoute } from 'honox/factory'
import { createDrizzleClient } from '../../db/client'
import { logError } from '../../db/logger'
import { DatabaseOperations } from '../../db/operations'
import ArticleList from '../islands/article-list'
import type { Article } from '../lib/types'

export default createRoute(async (c) => {
  try {
    // データベースから初期データを取得
    const db = createDrizzleClient(c.env.DB)
    const dbOps = new DatabaseOperations(db)

    // 初期記事データ (10件) とタグ一覧を並行取得
    const [initialArticles, allTags] = await Promise.all([
      dbOps.articles.getPublishedArticles(10, 0),
      dbOps.articles.getAllTags(),
    ])

    return c.render(
      <div className='h-screen bg-background flex flex-col'>
        <title>ブログ - 記事一覧</title>
        <meta name='description' content='技術記事とPDFスライドを配信するブログサイト' />

        {/* ヘッダー */}
        <header className='border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
          <div className='container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0'>
            <div className='flex gap-6 md:gap-10'>
              <a href='/' className='flex items-center space-x-2'>
                <span className='inline-block font-bold text-xl'>Blog</span>
              </a>
            </div>
          </div>
        </header>

        {/* メインコンテンツ */}
        <main className='container py-8 flex-1 min-h-0'>
          <div className='h-full flex flex-col space-y-8'>
            <div className='space-y-2 flex-shrink-0'>
              <h1 className='text-3xl font-bold tracking-tight'>記事一覧</h1>
              <p className='text-muted-foreground'>技術記事と PDF スライドを配信するブログ</p>
            </div>

            {/* 記事一覧コンポーネント（残りの高さを占有） */}
            <div className='flex-1 min-h-0'>
              <ArticleList initialArticles={initialArticles as Article[]} initialTags={allTags} />
            </div>
          </div>
        </main>

        {/* フッター */}
        <footer className='border-t py-6 md:py-0'>
          <div className='container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row'>
            <p className='text-center text-sm text-muted-foreground md:text-left'>
              © 2024 Blog. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    )
  } catch (error) {
    logError('Failed to load homepage', error, {
      operation: 'getHomepageData',
    })

    // エラーが発生した場合はエラーページを表示
    return c.render(
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <title>エラー - ブログ</title>
        <div className='text-center space-y-4'>
          <h1 className='text-2xl font-bold'>エラーが発生しました</h1>
          <p className='text-muted-foreground'>しばらく時間をおいてから再度お試しください。</p>
          <a
            href='/'
            className='inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
          >
            再読み込み
          </a>
        </div>
      </div>
    )
  }
})
