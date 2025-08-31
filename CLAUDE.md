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