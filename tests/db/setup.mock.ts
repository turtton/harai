import { vi } from 'vitest'
import type { Database } from '../../db/client'

// モック用のデータベース操作
export function createMockDatabase(): Database {
  const mockData = {
    articles: [
      {
        id: 'test-article-1',
        slug: 'test-article',
        title: 'Test Article',
        description: 'This is a test article',
        content: '# Test Content\n\nThis is test content.',
        tags: '["test", "article"]',
        published: true,
        publishDate: '2024-01-01T00:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ],
    resources: [
      {
        id: 'test-resource-1',
        articleId: 'test-article-1',
        slug: 'test-image',
        type: 'image',
        r2Key: 'test/image.jpg',
        originalName: 'image.jpg',
        size: 1024,
        createdAt: '2024-01-01T00:00:00Z',
      },
    ],
    imageCache: [
      {
        id: 'test-cache-1',
        originalR2Key: 'test/image.jpg',
        width: 800,
        height: 600,
        format: 'webp',
        cachedR2Key: 'cache/image-800x600.webp',
        createdAt: '2024-01-01T00:00:00Z',
      },
    ],
  }

  const mockDb = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([]),
    get: vi.fn().mockResolvedValue(null),
    all: vi.fn().mockResolvedValue([]),
    run: vi.fn().mockResolvedValue({ changes: 0 }),
  }

  // 基本的なクエリの挙動をモック
  mockDb.select.mockImplementation(() => {
    const query = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      offset: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
    }

    // 記事の基本的な検索パターン
    query.from.mockImplementation((table) => {
      if (table === 'articles') {
        return Promise.resolve(mockData.articles)
      }
      if (table === 'resources') {
        return Promise.resolve(mockData.resources)
      }
      if (table === 'image_cache') {
        return Promise.resolve(mockData.imageCache)
      }
      return Promise.resolve([])
    })

    return query
  })

  return mockDb as unknown as Database
}

export function resetMockDatabase() {
  // モックデータのリセット処理
}