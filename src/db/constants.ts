// データベース操作の定数設定

// キャッシュ保持期間 (30日)
export const CACHE_RETENTION_DAYS = 30
export const CACHE_RETENTION_MS = CACHE_RETENTION_DAYS * 24 * 60 * 60 * 1000

// デフォルトのページング設定
export const DEFAULT_PAGE_LIMIT = 20
export const MAX_PAGE_LIMIT = 100

// 検索・バリデーション設定
export const MAX_SLUG_LENGTH = 255
export const MAX_TAG_LENGTH = 50
export const MAX_SEARCH_QUERY_LENGTH = 255
export const MAX_IMAGE_KEY_LENGTH = 500

// 画像処理設定
export const MAX_IMAGE_WIDTH = 2000
export const MAX_IMAGE_HEIGHT = 2000
export const SUPPORTED_IMAGE_FORMATS = ['webp', 'png', 'jpg', 'jpeg'] as const
