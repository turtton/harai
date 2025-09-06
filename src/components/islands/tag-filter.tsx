import { ChevronDown, ChevronUp, X } from 'lucide-react'
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
  const [isExpanded, setIsExpanded] = useState(false) // アコーディオン制御

  // デスクトップで表示するタグ数
  const displayTags = showAll ? tags : tags.slice(0, 10)

  if (tags.length === 0) {
    return null
  }

  return (
    <div className='space-y-4'>
      {/* モバイル用アコーディオンヘッダー */}
      <div className='md:hidden'>
        <Button
          variant='ghost'
          onClick={() => setIsExpanded(!isExpanded)}
          className='w-full justify-between h-auto py-2 px-0'
        >
          <span className='font-semibold text-sm'>
            タグで絞り込み {selectedTags.length > 0 && `(${selectedTags.length})`}
          </span>
          {isExpanded ? <ChevronUp className='h-4 w-4' /> : <ChevronDown className='h-4 w-4' />}
        </Button>

        {/* モバイル展開時のタグ（横並び） */}
        {isExpanded && (
          <div className='mt-4 space-y-3'>
            {/* クリアボタン */}
            {selectedTags.length > 0 && (
              <Button
                variant='outline'
                size='sm'
                onClick={onClearAll}
                className='w-full h-8 text-xs'
              >
                <X className='mr-1 h-3 w-3' />
                選択解除
              </Button>
            )}

            {/* タグリスト（横並び・折り返しあり） */}
            <div className='flex flex-wrap gap-2'>
              {tags.map((tag) => (
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
            </div>
          </div>
        )}
      </div>

      {/* デスクトップ用（従来の縦並び） */}
      <div className='hidden md:block space-y-4'>
        {/* クリアボタン */}
        {selectedTags.length > 0 && (
          <Button variant='outline' size='sm' onClick={onClearAll} className='w-full h-8 text-xs'>
            <X className='mr-1 h-3 w-3' />
            選択解除
          </Button>
        )}

        {/* タグリスト（縦並び） */}
        <div className='space-y-2'>
          {displayTags.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? 'default' : 'secondary'}
              className='w-full justify-between cursor-pointer hover:opacity-80 transition-opacity py-2 px-3'
              onClick={() => onTagToggle(tag)}
            >
              <span>{tag}</span>
              {selectedTags.includes(tag) && <X className='h-3 w-3' />}
            </Badge>
          ))}
        </div>

        {/* もっと見るボタン */}
        {tags.length > 10 && (
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setShowAll(!showAll)}
            className='w-full h-8 text-xs text-muted-foreground'
          >
            {showAll ? '少なく表示' : `他 ${tags.length - 10} 個のタグを表示`}
          </Button>
        )}

        {/* フィルタ状態表示 */}
        {selectedTags.length > 0 && (
          <div className='text-xs text-muted-foreground text-center p-2 bg-muted rounded'>
            {selectedTags.length} 個のタグでフィルタリング中
          </div>
        )}
      </div>
    </div>
  )
}
