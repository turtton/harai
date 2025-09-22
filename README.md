# Harai

Astro + Hono による Markdown ブログサイト（モノレポ構成）

## 概要

Cloudflare エコシステムで完結する Markdown ベースのブログサイトです。Bun workspace によるモノレポ構成で、Frontend（Astro）と Backend（Hono）が分離されており、単一の Cloudflare Worker で静的ファイルと API の両方を配信する構成になっています。

## 特徴

- **モノレポ構成**: Bun workspace による Frontend/Backend 分離
- **型安全性**: Backend の型定義を Frontend が import
- **単一 Worker**: 静的ファイルと API を同一 Worker で配信
- Markdown 記事の公開・管理
- 記事検索・タグフィルタリング
- nanostores による状態管理
- Cloudflare Workers 上での高速動作
- レスポンシブデザイン対応

## 技術スタック

### モノレポ構成
- **Package Manager**: Bun workspace
- **Frontend Package**: `packages/frontend` (Astro + React)
- **Backend Package**: `packages/backend` (Hono API + 静的ファイル配信)

### 技術詳細
- **Runtime**: Cloudflare Workers with Node.js compatibility
- **Frontend Framework**: Astro v5 (静的ビルド) with React islands
- **API Framework**: Hono v4 for API routing
- **状態管理**: nanostores + React integration
- **Database**: Cloudflare D1 (SQLite-compatible) with Drizzle ORM
- **Storage**: Cloudflare R2 (S3-compatible object storage)
- **Styling**: Tailwind CSS v4 with Vite plugin
- **UI Components**: Radix UI with shadcn/ui integration
- **Icons**: Lucide React
- **Validation**: Zod for schema validation
- **Build**: Vite with Astro Cloudflare adapter
- **Testing**: Vitest with Testing Library
- **Development Environment**: Nix flake with wrangler

## セットアップ

### 前提条件

- Bun
- Wrangler CLI
- Cloudflareアカウント

### インストール

```bash
# 全パッケージの依存関係をインストール
bun install
```

### 環境構築

1. Cloudflare D1 データベースを作成:
```bash
cd packages/backend
wrangler d1 create harai-blog
```

2. Cloudflare R2 バケットを作成:
```bash
cd packages/backend
wrangler r2 bucket create harai-assets
```

3. `packages/backend/wrangler.jsonc` を設定（D1・R2 のバインディング設定）

4. 環境変数を設定:
```bash
cd packages/backend
# デプロイ用認証トークン
wrangler secret put DEPLOY_TOKEN
```

### データベースマイグレーション

```bash
cd packages/backend

# マイグレーション実行
wrangler d1 migrations apply harai-blog --local  # ローカル環境
wrangler d1 migrations apply harai-blog --remote # 本番環境

# シードデータ投入
wrangler d1 execute harai-blog --local --file=migrations/dev_data.sql
```

## 開発コマンド

### 開発・ビルド
```bash
# 開発サーバー起動（Frontend: 4321, Backend: 8787）
bun run dev

# プロダクション用ビルド（Frontend → Backend にコピー）
bun run build

# ローカルプレビュー（Backend の Wrangler dev で静的ファイル配信テスト）
bun run preview

# デプロイ（ビルド後に Cloudflare Workers へデプロイ）
bun run deploy

# ステージング・プロダクション環境へのデプロイ
bun run deploy:staging
bun run deploy:production
```

### コード品質管理・テスト
```bash
# 全パッケージのコード品質チェック
bun run check       # typecheck + biome check（書き込みあり）
bun run ci          # CI 用チェック（チェックのみ）
bun run typecheck   # 型チェックのみ
bun run lint        # lint チェックのみ
bun run format      # フォーマットのみ

# テスト実行
bun run test        # 全パッケージのテスト実行
bun run test:run    # CI 用（watch なし）
bun run test:coverage # カバレッジ付きテスト
```

### パッケージ別実行
```bash
# Frontend のみ
bun run --filter frontend dev
bun run --filter frontend build
bun run --filter frontend test

# Backend のみ
bun run --filter backend dev
bun run --filter backend build
bun run --filter backend test
```

## アーキテクチャ

### モノレポ構成
```
packages/
├── frontend/              # Astro + React Islands
│   ├── src/
│   │   ├── pages/         # Astro ページ（静的ビルド）
│   │   ├── islands/       # React Islands（クライアントサイド）
│   │   ├── components/    # UI コンポーネント
│   │   ├── stores/        # nanostores 状態管理
│   │   └── lib/           # API クライアント・型定義
│   └── dist/              # ビルド成果物
└── backend/               # Hono API + 静的ファイル配信
    ├── src/               # API 実装
    ├── assets/            # Frontend から コピーされた静的ファイル
    └── migrations/        # DB マイグレーション
```

### データフロー
1. **開発時**: Frontend (4321) → Vite proxy → Backend (8787)
2. **本番時**: すべて Backend Worker で配信
   - `/api/*` → Hono API
   - `/*` → 静的ファイル（Frontend ビルド成果物）

### 型安全性
```typescript
// Backend で型をエクスポート
export type App = typeof api

// Frontend でインポート
import type { App } from 'backend/types'
```

### ブログシステムアーキテクチャ
記事管理とサイトデプロイが分離された構成:
- **コンテンツフロー**: [記事リポジトリ] → [GitHub Actions] → [ブログ API] → [D1/R2] → [ブログ表示]
- **データ永続化**: Cloudflare D1 でメタデータ、R2 でアセット
- **コンテンツ更新**: 外部 API 駆動、管理画面なし

### Frontend 構造（packages/frontend）
- **Pages**: `src/pages/` ディレクトリに配置
  - `index.astro` - 記事一覧と検索機能付きホームページ
- **Islands**: `src/islands/` インタラクティブな React コンポーネント
  - `article-grid.tsx` - 記事一覧表示
  - `search-control.tsx` - 検索インターフェース
  - `tag-filter-control.tsx` - タグフィルタリング
  - `load-more-trigger.tsx` - 無限スクロールトリガー
- **状態管理**: nanostores でクライアント状態管理
- **API クライアント**: Hono クライアントで型安全通信

### Backend 構造（packages/backend）
- **API ルート**: `src/index.ts` で定義
  - `/api/articles` - ページネーション、検索、タグフィルタリング付き記事一覧
  - `/api/articles/:slug` - 個別記事取得
  - `/api/tags` - タグ一覧
  - `/api/resources/:key` - R2 ストレージからのアセット配信
- **静的ファイル配信**: Frontend ビルド成果物を `serveStatic` で配信

## API エンドポイント

### 公開エンドポイント
- `GET /` - 記事一覧と検索機能付きホームページ
- `GET /api/articles` - ページネーション、検索、タグフィルタリング付き記事一覧
- `GET /api/articles/:slug` - 個別記事取得
- `GET /api/tags` - タグ管理
- `GET /api/resources/:key` - キャッシュ付きアセット配信

### 管理エンドポイント
- デプロイ API: コンテンツ更新には `X-Deploy-Token` ヘッダーが必要

## 記事の書き方

### Front Matter形式

```yaml
---
title: 記事タイトル
description: 記事の概要
tags: [tag1, tag2]
published: true
---

記事の本文をMarkdownで記述...
```

### リソース参照

- 画像: `![代替テキスト](リソースslug)`
- その他アセット: R2 ストレージ経由でアクセス

## データベース設計（packages/backend）

**Drizzle ORM 使用**: `src/db/schema.ts` で定義

### articles テーブル
- `id` (TEXT PRIMARY KEY) - UUID
- `slug` (TEXT UNIQUE) - URL 識別子
- `title`, `description`, `content` - 記事メタデータと Markdown コンテンツ
- `tags` (TEXT) - JSON 配列のタグ
- `published` (BOOLEAN), `publish_date` - 公開制御
- `created_at`, `updated_at` - タイムスタンプ

### resources テーブル
- 記事と R2 保存アセット（画像、PDF）をリンク
- 元のファイル名とメタデータを追跡

### image_cache テーブル
- パフォーマンス最適化のためのリサイズ済み画像キャッシュ

**設定ファイル**:
- Schema: `packages/backend/src/db/schema.ts`
- Client: `packages/backend/src/db/client.ts`
- Migrations: `packages/backend/migrations/`

## 主要機能

### Frontend（packages/frontend）
- **静的サイト生成**: Astro による高速な静的ビルド
- **React Islands**: インタラクティブなクライアントコンポーネント
- **状態管理**: nanostores による軽量な状態管理
- **記事検索・フィルタリング**: リアルタイム検索、タグフィルタ、無限スクロール

### Backend（packages/backend）
- **API サーバー**: Hono による高速 API
- **静的ファイル配信**: Frontend ビルド成果物の配信
- **データベース**: Cloudflare D1 + Drizzle ORM
- **ストレージ**: Cloudflare R2 での画像・アセット管理
- **型安全性**: Backend の型定義を Frontend で利用

## ライセンス

MIT License