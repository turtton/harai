# Harai

Astro + Hono による Markdown ブログサイト

## 概要

Cloudflare エコシステムで完結する Markdown ベースのブログサイトです。Astro の静的サイト生成機能と Hono の API ルーティングを組み合わせ、記事管理とサイトデプロイが分離された構成で、外部 API を通じた動的な記事更新に対応しています。

## 特徴

- Markdown 記事の公開・管理
- 記事検索・タグフィルタリング
- 動的画像リサイズ・最適化
- Cloudflare Workers 上での高速動作
- レスポンシブデザイン対応

## 技術スタック

- **Runtime**: Cloudflare Workers with Node.js compatibility
- **Frontend Framework**: Astro v5 with React integration
- **API Framework**: Hono v4 for API routing
- **Database**: Cloudflare D1 (SQLite-compatible) with Drizzle ORM
- **Storage**: Cloudflare R2 (S3-compatible object storage)
- **Styling**: Tailwind CSS v4 with Vite plugin
- **UI Components**: Radix UI with shadcn/ui integration
- **Icons**: Lucide React
- **Validation**: Zod for schema validation
- **Build**: Vite with Astro Cloudflare adapter
- **Package Manager**: Bun
- **Testing**: Vitest with Testing Library
- **Development Environment**: Nix flake with wrangler

## セットアップ

### 前提条件

- Bun
- Wrangler CLI
- Cloudflareアカウント

### インストール

```bash
bun install
```

### 環境構築

1. Cloudflare D1データベースを作成:
```bash
wrangler d1 create harai-blog
```

2. Cloudflare R2バケットを作成:
```bash
wrangler r2 bucket create harai-assets
```

3. `wrangler.jsonc`を設定（D1・R2のバインディング設定）

4. 環境変数を設定:
```bash
# デプロイ用認証トークン
wrangler secret put DEPLOY_TOKEN
```

### データベースマイグレーション

```bash
# マイグレーション実行
wrangler d1 migrations apply harai-blog --local  # ローカル環境
wrangler d1 migrations apply harai-blog --remote # 本番環境

# シードデータ投入
wrangler d1 execute harai-blog --local --file=db/seeds/dev_data.sql
```

## 開発コマンド

```bash
# 開発サーバー起動 (Astro development server with hot reload, port 4321)
bun run dev

# プロダクション用ビルド (Astro SSR build)
bun run build

# ローカルプレビュー (Wrangler 使用)
bun run preview

# デプロイ (Build and deploy to Cloudflare Workers)
bun run deploy

# ステージング環境へのデプロイ
bun run deploy:staging

# プロダクション環境へのデプロイ
bun run deploy:production

# コード品質管理・テスト
bun run check       # コード品質チェック
bun run test        # テスト実行
```

## アーキテクチャ

### ブログシステムアーキテクチャ
記事管理とサイトデプロイが分離された構成:
- **コンテンツフロー**: [記事リポジトリ] → [GitHub Actions] → [ブログ API] → [D1/R2] → [ブログ表示]
- **データ永続化**: Cloudflare D1 でメタデータ、R2 でアセット
- **コンテンツ更新**: 外部 API 駆動、管理画面なし

### Astro + Hono アプリケーション構造
- **Pages**: `src/pages/` ディレクトリに配置
  - `index.astro` - 記事一覧と検索機能付きホームページ
  - `api/[...route].ts` - Hono を使用したキャッチオール API ルートハンドラー
    - `/api/articles` - ページネーション、検索、タグフィルタリング付き記事一覧
    - `/api/articles/:slug` - 個別記事取得
    - `/api/tags` - タグ一覧
    - `/api/resources/:key` - R2 ストレージからのアセット配信

- **Islands**: インタラクティブなクライアントコンポーネント
- **Components**: 再利用可能な UI コンポーネント

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

## データベース設計 (Drizzle ORM)

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

## 主要機能

- Markdown ブログ記事の管理・表示
- 記事検索・タグフィルタリング
- 画像・アセットの動的配信
- 型安全な API エンドポイント

## ライセンス

MIT License