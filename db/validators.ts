import { z } from 'zod'

// 記事 API のバリデーション
export const articleQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  offset: z.coerce.number().min(0).optional().default(0),
  tag: z.string().min(1).max(50).optional(),
  search: z.string().min(1).max(255).optional(),
})

export const articleSlugSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9-]+$/, 'スラッグは小文字、数字、ハイフンのみ使用可能'),
})

// リソース API のバリデーション
export const resourceQuerySchema = z.object({
  article_id: z.string().min(1).max(255),
})

export const resourceParamsSchema = z.object({
  articleId: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
})

// 画像 API のバリデーション
export const imageQuerySchema = z.object({
  w: z.coerce.number().min(1).max(2000).optional(),
  h: z.coerce.number().min(1).max(2000).optional(),
  f: z.enum(['webp', 'png', 'jpg', 'jpeg']).optional(),
})

export const imageParamsSchema = z.object({
  key: z.string().min(1).max(500),
})

export const imageCacheCreateSchema = z.object({
  width: z.coerce.number().min(1).max(2000),
  height: z.coerce.number().min(1).max(2000).optional(),
  format: z.enum(['webp', 'png', 'jpg', 'jpeg']).optional(),
  cached_r2_key: z.string().min(1).max(500),
})

// 共通のエラー型
export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public code?: string
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}
