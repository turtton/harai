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

This is a monorepo Astro + Hono blog application for Cloudflare Workers. The system is structured as a Bun workspace with separated Frontend (Astro) and Backend (Hono) packages, where a single Cloudflare Worker serves both static files and API endpoints. Frontend uses nanostores for state management and imports types from the Backend for type safety.

## Development Commands

### Primary Commands
- `bun run dev` - Start both Frontend (4321) and Backend (8787) development servers
- `bun run build` - Build Frontend static files and copy to Backend assets
- `bun run preview` - Preview production build using Backend Wrangler dev
- `bun run deploy` - Build and deploy to Cloudflare Workers
- `bun run deploy:staging` - Deploy to staging environment
- `bun run deploy:production` - Deploy to production environment

### Package-specific Commands
- `bun run --filter frontend dev` - Frontend development server only
- `bun run --filter backend dev` - Backend development server only
- `bun run --filter frontend build` - Frontend build only
- `bun run --filter backend build` - Backend build (copy Frontend assets)

## Architecture

### Monorepo Structure
```
packages/
├── frontend/              # Astro + React Islands
│   ├── src/
│   │   ├── pages/         # Astro pages (static build)
│   │   ├── islands/       # React Islands (client-side)
│   │   ├── components/    # UI components
│   │   ├── stores/        # nanostores state management
│   │   └── lib/           # API client & types
│   └── dist/              # Build output
└── backend/               # Hono API + static file serving
    ├── src/               # API implementation
    ├── assets/            # Static files copied from Frontend
    └── migrations/        # DB migrations
```

### Data Flow
1. **Development**: Frontend (4321) → Vite proxy → Backend (8787)
2. **Production**: All served from Backend Worker
   - `/api/*` → Hono API
   - `/*` → Static files (Frontend build output)

### Type Safety
```typescript
// Backend exports types
export type App = typeof api

// Frontend imports types
import type { App } from 'backend/types'
```

### Blog System Architecture
This is a decoupled blog system where content deployment is separated from site deployment:
- **Content Flow**: [Article Repository] → [GitHub Actions] → [Blog API] → [D1/R2] → [Blog Display]
- **Data Persistence**: Cloudflare D1 for metadata, R2 for assets
- **Content Update**: External API-driven, no admin interface

### Frontend Structure (packages/frontend)
- **Pages**: `src/pages/` directory
  - `index.astro` - Homepage with article list and search
- **Islands**: Interactive client components in `src/islands/`
  - `article-grid.tsx` - Article display with state management
  - `search-control.tsx` - Search interface
  - `tag-filter-control.tsx` - Tag filtering
  - `load-more-trigger.tsx` - Infinite scroll trigger
- **State Management**: nanostores for client state
- **API Client**: Hono client for type-safe communication

### Backend Structure (packages/backend)
- **API Routes**: Defined in `src/index.ts`
  - `/api/articles` - Article listing with pagination, search, tag filtering
  - `/api/articles/:slug` - Individual article retrieval
  - `/api/tags` - Tag listing
  - `/api/resources/:key` - Asset serving from R2 storage
- **Static Serving**: Frontend build output served via `serveStatic`

## Tech Stack

### Monorepo Management
- **Package Manager**: Bun workspace
- **Frontend Package**: `packages/frontend` (Astro + React)
- **Backend Package**: `packages/backend` (Hono API + static serving)

### Technical Details
- **Runtime**: Cloudflare Workers with Node.js compatibility
- **Frontend Framework**: Astro v5 (static build) with React islands
- **API Framework**: Hono v4 for API routing
- **State Management**: nanostores + React integration
- **Database**: Cloudflare D1 (SQLite-compatible) with Drizzle ORM
- **Storage**: Cloudflare R2 (S3-compatible object storage)
- **Styling**: Tailwind CSS v4 with Vite plugin
- **UI Components**: Radix UI with shadcn/ui integration
- **Icons**: Lucide React
- **Validation**: Zod for schema validation
- **Build**: Vite with Astro Cloudflare adapter
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

**Database Configuration** (packages/backend):
- Drizzle Kit for schema management and migrations
- Schema definition: `packages/backend/src/db/schema.ts`
- Client configuration: `packages/backend/src/db/client.ts`
- Migration directory: `packages/backend/migrations/`

## Key Features

### Frontend Features (packages/frontend)
- **Static Site Generation**: Astro for fast static builds
- **React Islands**: Interactive client-side components
- **State Management**: nanostores for lightweight state management
- **Search & Filtering**: Real-time search, tag filtering, infinite scroll

### Backend Features (packages/backend)
- **API Server**: Hono for fast API endpoints
- **Static File Serving**: Frontend build output serving
- **Database**: Cloudflare D1 + Drizzle ORM
- **Storage**: Cloudflare R2 for image and asset management
- **Type Safety**: Backend type definitions used by Frontend

### Integration Features
- **Monorepo Structure**: Bun workspace with separated concerns
- **Type Safety**: Backend exports types that Frontend imports
- **Single Worker**: Both static files and API served from one Worker
- **Development Proxy**: Vite proxy for seamless development experience

## Security & Authentication

- **Deploy API**: Requires `X-Deploy-Token` header for content updates
- **Read-Only Frontend**: No user authentication, public content only
- **XSS Protection**: Markdown sanitization for safe HTML output

## Deployment Configuration

The project is configured for Cloudflare Workers deployment via `packages/backend/wrangler.jsonc`:
- `packages/backend/wrangler.jsonc` - Default configuration
- `packages/backend/wrangler.staging.jsonc` - Staging environment
- `packages/backend/wrangler.production.jsonc` - Production environment

**Required Bindings**:
- D1 database binding (`DB`)
- R2 bucket for asset storage (`R2`)
- Environment variables as needed

**Build Process**:
1. Frontend builds to `packages/frontend/dist/`
2. Backend copies Frontend assets to `packages/backend/assets/`
3. Backend Worker serves both API and static files
4. Deploy script runs Backend build and Wrangler deploy

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