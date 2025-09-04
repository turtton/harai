import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'

interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
  initialValue?: string
}

export default function SearchBar({
  onSearch,
  placeholder = '記事を検索...',
  initialValue = '',
}: SearchBarProps) {
  const [query, setQuery] = useState(initialValue)

  // デバウンス処理 - 500ms 待機後に検索実行
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query)
    }, 500)

    return () => clearTimeout(timer)
  }, [query, onSearch])

  return (
    <div className='relative w-full max-w-md'>
      <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
      <Input
        type='text'
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className='pl-10'
      />
    </div>
  )
}
