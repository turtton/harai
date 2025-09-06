# CLAUDE.md

- Premature Optimization is the Root of All Evil
- 一切忖度しないこと
- 常に日本語を利用すること
- 全角と半角の間には半角スペースを入れること
- 絵文字を使わないこと

## Linter/Formatter

このプロジェクトでは Biome を使用してコードの品質管理を行う:

- **必須**: コード変更後は `bun run check` を実行する
- **統合チェック**: `bun run check` (typecheck + prettier + biome check を書き込みあり)
- **CI チェック**: `bun run ci` (typecheck + biome check をチェックのみ)
- **型チェック**: `bun run typecheck` (wrangler types + tsc noEmit)

個別実行が必要な場合:
- **Format コマンド**: `bun run format` (prettier + biome format を書き込みあり)
- **Lint コマンド**: `bun run lint` (typecheck + biome lint をチェックのみ)
- **テスト**: `bun run test` (Vitest), `bun run test:run` (CI用), `bun run test:coverage` (カバレッジ)

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

This is an Astro blog application with Hono API backend for Cloudflare Workers. The system combines Astro's static site generation capabilities with Hono's API routing, designed as a Markdown-based blog using Cloudflare's ecosystem (D1, R2, Workers) for complete infrastructure.

## Development Commands

- `bun run dev` - Start Astro development server with hot reload (port 4321)
- `bun run build` - Build for production (Astro SSR build)
- `bun run preview` - Preview locally using Wrangler
- `bun run deploy` - Build and deploy to Cloudflare Workers
- `bun run deploy:staging` - Deploy to staging environment
- `bun run deploy:production` - Deploy to production environment

## Architecture

### Blog System Architecture
This is a decoupled blog system where content deployment is separated from site deployment:
- **Content Flow**: [Article Repository] → [GitHub Actions] → [Blog API] → [D1/R2] → [Blog Display]
- **Data Persistence**: Cloudflare D1 for metadata, R2 for assets
- **Content Update**: External API-driven, no admin interface

### Astro + Hono Application Structure
- **Pages**: Located in `src/pages/` directory
  - `index.astro` - Homepage with article list and search
  - `api/[...route].ts` - Catch-all API route handler using Hono
    - `/api/articles` - Article listing with pagination, search, tag filtering
    - `/api/articles/:slug` - Individual article retrieval
    - `/api/tags` - Tag listing
    - `/api/resources/:key` - Asset serving from R2 storage

- **Islands**: Interactive client components in `src/components/islands/`
  - `search-bar.tsx` - Search interface with real-time filtering
  - `article-list.tsx` - Article display with infinite scroll
  - `tag-filter.tsx` - Tag filtering system
  - `counter.tsx` - Interactive counter component

- **Components**: UI components in `src/components/ui/`
  - Reusable UI components (button, card, input, badge, skeleton)
  - Built with Tailwind CSS and class-variance-authority

- **Configuration**:
  - `astro.config.mjs` - Astro configuration with Cloudflare adapter
  - `src/styles/global.css` - Global styles (processed through Tailwind CSS v4)
  - Path alias `@/*` points to `src/*`

## Tech Stack

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

## Database Schema

### Database Schema (Drizzle ORM)

#### articles table
- `id` (TEXT PRIMARY KEY) - UUID
- `slug` (TEXT UNIQUE) - URL identifier
- `title`, `description`, `content` - Article metadata and Markdown content
- `tags` (TEXT) - JSON array of tags
- `published` (BOOLEAN), `publish_date` - Publication control
- `created_at`, `updated_at` - Timestamps

#### resources table
- Links articles to R2-stored assets (images, PDFs)
- Tracks original filenames and metadata

#### image_cache table
- Caches resized images to optimize performance

**Database Configuration**:
- Drizzle Kit for schema management and migrations
- Schema definition: `src/db/schema.ts`
- Client configuration: `src/db/client.ts`
- Migration directory: `./migrations`

## Key Features

- **Markdown Blog**: Article content with metadata support
- **Resource Management**: Images and assets stored in R2, served via `/api/resources/:key`
- **Search & Filtering**: Full-text search with tag filtering via `/api/articles`
- **API Endpoints**: RESTful API using Hono framework
  - Article listing with pagination (`/api/articles`)
  - Individual article retrieval (`/api/articles/:slug`)
  - Tag management (`/api/tags`)
  - Asset serving with caching (`/api/resources/:key`)
- **Type Safety**: Zod validation for API requests and responses
- **Error Handling**: Structured error responses with logging

## Security & Authentication

- **Deploy API**: Requires `X-Deploy-Token` header for content updates
- **Read-Only Frontend**: No user authentication, public content only
- **XSS Protection**: Markdown sanitization for safe HTML output

## Deployment Configuration

The project is configured for Cloudflare Workers deployment via `wrangler.jsonc` with environment-specific configs:
- `wrangler.jsonc` - Default configuration
- `wrangler.staging.jsonc` - Staging environment
- `wrangler.production.jsonc` - Production environment

**Required Bindings**:
- D1 database binding (`DB`)
- R2 bucket for asset storage (`R2`)
- Environment variables as needed

**Build Output**:
- Astro builds to `./dist` directory
- Main worker file: `./dist/_worker.js`
- Static assets served from `./dist` directory

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