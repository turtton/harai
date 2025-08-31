# CLAUDE.md

- Premature Optimization is the Root of All Evil
- 一切忖度しないこと
- 常に日本語を利用すること
- 全角と半角の間には半角スペースを入れること
- 絵文字を使わないこと

## Linter/Formatter

このプロジェクトでは Biome を使用してコードの品質管理を行う:

- **必須**: コード変更後は `bun run check` を実行する
- **統合チェック**: `bun run check` (format + lint を書き込みあり)
- **CI チェック**: `bun run ci` (format + lint をチェックのみ)

個別実行が必要な場合:
- **Format コマンド**: `bun run format` (書き込みあり)
- **Lint コマンド**: `bun run lint` (チェックのみ)

## レビューについて

- レビューはかなり厳しくすること
- レビューの表現は、シンプルにすること
- レビューの表現は、日本語で行うこと
- レビューの表現は、指摘内容を明確にすること
- レビューの表現は、指摘内容を具体的にすること
- レビューの表現は、指摘内容を優先順位をつけること
- レビューの表現は、指摘内容を優先順位をつけて、重要なものから順に記載すること

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a HonoX blog application - a full-stack React framework built on top of Hono for Cloudflare Workers. The system is designed as a Markdown-based blog with PDF slide support, using Cloudflare's ecosystem (D1, R2, Workers) for complete infrastructure.

## Development Commands

- `bun run dev` - Start development server with hot reload
- `bun run build` - Build for production (builds both client and server)
- `bun run preview` - Preview locally using Wrangler
- `bun run deploy` - Build and deploy to Cloudflare Workers

## Architecture

### Blog System Architecture
This is a decoupled blog system where content deployment is separated from site deployment:
- **Content Flow**: [Article Repository] → [GitHub Actions] → [Blog API] → [D1/R2] → [Blog Display]
- **Data Persistence**: Cloudflare D1 for metadata, R2 for assets
- **Content Update**: External API-driven, no admin interface

### HonoX Application Structure
- **Routes**: Located in `app/routes/` directory
  - `index.tsx` - Homepage with article list and search
  - `posts/[slug].tsx` - Article detail pages with Markdown rendering
  - `api/deploy.tsx` - Webhook for content deployment (authenticated)
  - `api/search.tsx` - Article search endpoint
  - `api/resources/[key].tsx` - Dynamic asset serving with image resizing
  - `og/[slug].tsx` - Dynamic OGP image generation
  - `_renderer.tsx` - Root HTML renderer with JSX
  - `_404.tsx` and `_error.tsx` - Error handling routes

- **Islands**: Interactive client components in `app/islands/`
  - Search interface with real-time filtering
  - Infinite scroll for article lists
  - PDF viewer for embedded slides
  - Tag filtering system

- **Entry Points**:
  - `app/server.ts` - Server entry point using `createApp()`
  - `app/client.ts` - Client entry point using `createClient()`
  - `app/style.css` - Global styles (processed through Tailwind CSS)

## Tech Stack

- **Runtime**: Cloudflare Workers with Node.js compatibility
- **Framework**: HonoX (full-stack React framework)
- **Database**: Cloudflare D1 (SQLite-compatible)
- **Storage**: Cloudflare R2 (S3-compatible object storage)
- **Styling**: Tailwind CSS v4 with Vite plugin
- **Markdown Processing**: marked with Shiki syntax highlighting
- **PDF Handling**: PDF.js for slide viewing
- **Build**: Vite with specialized Hono plugins
- **Package Manager**: Bun
- **Development Environment**: Nix flake with wrangler

## Database Schema

### articles table
- `id` (TEXT PRIMARY KEY) - UUID
- `slug` (TEXT UNIQUE) - URL identifier
- `title`, `description`, `content` - Article metadata and Markdown content
- `tags` (TEXT) - JSON array of tags
- `published` (BOOLEAN), `publish_date` - Publication control
- `created_at`, `updated_at` - Timestamps

### resources table
- Links articles to R2-stored assets (images, PDFs)
- Tracks original filenames and metadata

### image_cache table
- Caches resized images to optimize performance

## Key Features

- **Markdown Blog**: Front Matter support with title, description, tags, publish date
- **Resource Management**: Images and PDFs stored in R2, referenced by slug in Markdown
- **Dynamic Image Resizing**: On-demand image optimization with caching
- **PDF Slides**: Embedded PDF viewer with navigation controls
- **Search & Filtering**: Full-text search with tag filtering
- **OGP Generation**: Dynamic Open Graph images for social sharing
- **Deployment Webhook**: External content updates via `/api/deploy` endpoint

## Security & Authentication

- **Deploy API**: Requires `X-Deploy-Token` header for content updates
- **Read-Only Frontend**: No user authentication, public content only
- **XSS Protection**: Markdown sanitization for safe HTML output

## Deployment Configuration

The project is configured for Cloudflare Workers deployment via `wrangler.jsonc`. Requires setup of:
- D1 database binding
- R2 bucket for asset storage
- Environment variables for deploy token

## Testing Guidelines

### テストの基本方針
- **効果的なテストのみ**を書く - テストはコストがかかるため、価値のあるものに限定
- **Pure Function 優先** - 副作用のない純粋な関数のテストを重視
- **Mock は最小限** - モックが多いテストは実際のバグを見逃す可能性が高い

### テストすべきもの
1. **Pure Function** - 入力に対して決定的な出力を返す関数
   - バリデーション関数 (`file-utils.ts` の各種バリデーション)
   - 変換・計算処理 (パス生成、文字列変換など)
   - ビジネスロジック (複雑な条件分岐など)

2. **Edge Case の処理** - エラーハンドリングや境界値
   - 不正な入力に対する適切なエラー
   - 空文字列、null、undefined の処理
   - セキュリティ関連 (パストラバーサル防止など)

### テストしないもの
1. **External Service との統合** - R2、D1 などの外部サービス操作
   - アップロード/ダウンロード処理 (R2 があれば成功して当然)
   - データベース CRUD 操作 (実装が単純すぎる)
   - 接続テスト (モックでは意味がない)

2. **Framework の機能** - Hono、React など外部ライブラリの動作
   - ルーティング処理
   - レンダリング処理
   - HTTP リクエスト/レスポンス

3. **設定値やコンスタント** - 変更されることのない定数値

### テスト実装前チェック
新しいテストを書く前に以下を確認：
- [ ] この関数は Pure Function か？
- [ ] このテストで実際のバグを発見できるか？
- [ ] モックを使わずにテストできるか？
- [ ] テストの保守コストは価値に見合うか？