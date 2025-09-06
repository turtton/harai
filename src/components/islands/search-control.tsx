import { useStore } from '@nanostores/react'
import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { $searchQuery, articleActions } from '@/stores/article-store'

interface SearchControlProps {
  placeholder?: string
}

export default function SearchControl({ placeholder = '記事を検索...' }: SearchControlProps) {
  const searchQuery = useStore($searchQuery)
  const [localQuery, setLocalQuery] = useState(searchQuery)

  // デバウンス処理 - 500ms 待機後に検索実行
  useEffect(() => {
    const timer = setTimeout(() => {
      articleActions.setSearchQuery(localQuery)
    }, 500)

    return () => clearTimeout(timer)
  }, [localQuery])

  return (
    <div className='space-y-2'>
      <h3 className='hidden md:block font-semibold text-sm text-muted-foreground'>検索</h3>
      <div className='relative w-full'>
        <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
        <Input
          type='text'
          placeholder={placeholder}
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          className='pl-10'
        />
      </div>
    </div>
  )
}
