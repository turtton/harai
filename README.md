# Harai

HonoX + Cloudflare WorkersによるMarkdownブログサイト

## 概要

Cloudflareエコシステムで完結する、Markdown記事とPDFスライドに対応したブログサイトです。記事管理とサイトデプロイが分離された構成で、外部APIを通じた動的な記事更新に対応しています。

## 特徴

- 📝 Markdown記事の公開・管理
- 📊 PDFスライドの埋め込み表示
- 🔍 記事検索・タグフィルタリング
- 🖼️ 動的画像リサイズ・最適化
- 🌐 OGP画像の自動生成
- 🚀 Cloudflare Workers上での高速動作
- 📱 レスポンシブデザイン対応

## 技術スタック

- **フレームワーク**: HonoX
- **実行環境**: Cloudflare Workers
- **データベース**: Cloudflare D1
- **ファイルストレージ**: Cloudflare R2
- **スタイリング**: Tailwind CSS
- **UIコンポーネント**: shadcn/ui
- **Markdownパーサー**: marked + Shiki
- **PDFビューワー**: PDF.js
- **パッケージマネージャー**: Bun

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
# スキーマを適用
wrangler d1 execute harai-blog --file=./schema.sql
```

## 開発

```bash
# 開発サーバー起動
bun run dev

# ビルド
bun run build

# プレビュー（Wrangler使用）
bun run preview

# デプロイ
bun run deploy
```

## API仕様

### 公開エンドポイント

- `GET /` - 記事一覧（トップページ）
- `GET /posts/[slug]` - 記事詳細ページ
- `GET /api/search` - 記事検索API
- `GET /api/resources/[r2_key]` - リソース配信
- `GET /og/[slug]` - OGP画像生成

### 管理エンドポイント

- `POST /api/deploy` - 記事デプロイ用Webhook（要認証）

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
- PDF: `![PDFタイトル](リソースslug)`

## アーキテクチャ

```
[記事リポジトリ] → [GitHub Actions] → [ブログサイトAPI] → [D1/R2]
                                              ↓
                                    [ブログサイト表示]
```

- **記事管理**: 外部リポジトリでMarkdownファイルを管理
- **自動デプロイ**: GitHub Actionsで記事とアセットを収集・API経由でアップロード
- **表示**: HonoXアプリケーションでD1からデータを取得して表示
- **アセット配信**: R2からの動的リサイズ・配信

## データベース設計

### articles テーブル
記事のメタデータとMarkdown本文を格納

### resources テーブル  
記事に関連するアセット（画像・PDF）の管理

### image_cache テーブル
リサイズ済み画像のキャッシュ情報

## ライセンス

MIT License