import { X } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface TagFilterProps {
  tags: string[]
  selectedTags: string[]
  onTagToggle: (tag: string) => void
  onClearAll: () => void
}

export default function TagFilter({ tags, selectedTags, onTagToggle, onClearAll }: TagFilterProps) {
  const [showAll, setShowAll] = useState(false)

  // デフォルトで表示するタグ数
  const displayTags = showAll ? tags : tags.slice(0, 10)

  if (tags.length === 0) {
    return null
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center gap-2'>
        <span className='text-sm font-medium text-muted-foreground'>タグでフィルター:</span>
        {selectedTags.length > 0 && (
          <Button variant='outline' size='sm' onClick={onClearAll} className='h-6 px-2 text-xs'>
            <X className='mr-1 h-3 w-3' />
            すべて解除
          </Button>
        )}
      </div>

      <div className='flex flex-wrap gap-2'>
        {displayTags.map((tag) => (
          <Badge
            key={tag}
            variant={selectedTags.includes(tag) ? 'default' : 'secondary'}
            className='cursor-pointer hover:opacity-80 transition-opacity'
            onClick={() => onTagToggle(tag)}
          >
            {tag}
            {selectedTags.includes(tag) && <X className='ml-1 h-3 w-3' />}
          </Badge>
        ))}

        {tags.length > 10 && (
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setShowAll(!showAll)}
            className='h-6 px-2 text-xs text-muted-foreground'
          >
            {showAll ? '少なく表示' : `+${tags.length - 10} 個を表示`}
          </Button>
        )}
      </div>

      {selectedTags.length > 0 && (
        <div className='text-xs text-muted-foreground'>
          {selectedTags.length} 個のタグでフィルタリング中
        </div>
      )}
    </div>
  )
}
