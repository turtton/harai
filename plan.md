## HonoX + Cloudflare Workers ブログサイト仕様書

### 1. システム概要

#### 1.1 目的
Cloudflareエコシステムで完結する、Markdown記事とPDFスライドに対応したブログサイトの構築

#### 1.2 基本要件
- デプロイサイクルと記事管理の分離
- 記事データはDBから動的に取得
- 管理画面なし、外部からのAPI経由での記事更新
- Read Onlyなフロントエンド

### 2. システムアーキテクチャ

#### 2.1 全体構成
```
[記事リポジトリ] → [GitHub Actions] → [ブログサイトAPI] → [D1/R2]
                                              ↓
                                    [ブログサイト表示]
```

#### 2.2 採用技術
- **フレームワーク**: HonoX
- **実行環境**: Cloudflare Workers
- **データベース**: Cloudflare D1
- **ファイルストレージ**: Cloudflare R2
- **スタイリング**: Tailwind CSS
 **UIコンポーネント**: shadcn/ui
- **Markdownパーサー**: marked
- **シンタックスハイライト**: Shiki
- **PDFビューワー**: PDF.js

### 3. データベース設計

#### 3.1 テーブル構成

##### articles（記事テーブル）
| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | TEXT PRIMARY KEY | UUID |
| slug | TEXT UNIQUE NOT NULL | URL用の識別子 |
| title | TEXT NOT NULL | 記事タイトル |
| description | TEXT | 記事概要 |
| content | TEXT NOT NULL | Markdown本文（リソースURL変換済み） |
| tags | TEXT | タグのJSON配列 |
| published | BOOLEAN | 公開フラグ |
| publish_date | DATETIME | 公開日時 |
| created_at | DATETIME | 作成日時 |
| updated_at | DATETIME | 更新日時 |

##### resources（リソース管理テーブル）
| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | TEXT PRIMARY KEY | UUID |
| article_id | TEXT NOT NULL | 記事ID（外部キー） |
| slug | TEXT NOT NULL | リソース識別子 |
| type | TEXT NOT NULL | 'image' or 'pdf' |
| r2_key | TEXT NOT NULL | R2オブジェクトキー |
| original_name | TEXT | 元ファイル名 |
| size | INTEGER | ファイルサイズ |
| created_at | DATETIME | 作成日時 |

##### image_cache（画像キャッシュテーブル）
| カラム名 | 型 | 説明 |
|---------|-----|------|
| original_r2_key | TEXT | 元画像のR2キー |
| width | INTEGER | リサイズ後の幅 |
| height | INTEGER | リサイズ後の高さ |
| format | TEXT | 画像フォーマット |
| cached_r2_key | TEXT | キャッシュのR2キー |
| created_at | DATETIME | 作成日時 |

### 4. API仕様

#### 4.1 公開エンドポイント

##### GET /
- **説明**: トップページ（記事一覧）
- **機能**:
    - 記事カード表示
    - 無限スクロール対応
    - タグフィルタリング
    - 検索機能

##### GET /posts/[slug]
- **説明**: 記事詳細ページ
- **機能**:
    - Markdown表示
    - シンタックスハイライト
    - PDFスライド埋め込み

##### GET /api/resources/[r2_key]
- **説明**: リソース配信
- **機能**:
    - 画像の動的リサイズ
    - PDFファイル配信

##### GET /api/search
- **説明**: 記事検索API
- **パラメータ**:
    - q: 検索クエリ
    - tags: タグフィルタ
    - offset: ページネーション用

##### GET /og/[slug]
- **説明**: OGP画像生成
- **機能**: SVG形式でタイトル入り画像を動的生成

#### 4.2 管理エンドポイント（認証必須）

##### POST /api/deploy
- **説明**: 記事デプロイ用Webhook
- **認証**: X-Deploy-Tokenヘッダー
- **リクエストボディ**:
```json
{
  "articleSlug": "記事のslug",
  "markdown": "Markdown本文（Front Matter含む）",
  "resources": [
    {
      "slug": "リソース識別子",
      "type": "image|pdf",
      "data": "Base64エンコードされたデータ",
      "originalName": "元ファイル名",
      "size": "ファイルサイズ"
    }
  ]
}
```

### 5. 機能仕様

#### 5.1 記事管理

##### Front Matter形式
```yaml
---
title: 記事タイトル
description: 記事の概要
tags: [tag1, tag2]
published: true/false
---
```

##### リソース参照
- 画像: `![代替テキスト](slug)`
- PDF: `![PDFタイトル](slug)`

#### 5.2 記事更新フロー
1. GitHub Actionsが記事とリソースを収集
2. /api/deployエンドポイントにPOST
3. 既存記事の場合、不要なリソースをR2から削除
4. 新規リソースをR2にアップロード
5. Markdown内のリソース参照をURLに変換
6. D1に記事データを保存

#### 5.3 検索機能
- 検索対象: タイトル、概要、タグ
- D1のLIKE検索を使用
- リアルタイム検索（デバウンス付き）

#### 5.4 画像最適化
- リクエスト時に動的リサイズ
- リサイズ済み画像はR2にキャッシュ
- URLパラメータ: `?w=幅&h=高さ&format=webp`

#### 5.5 PDFスライド表示
- PDF.jsを使用したスライド形式表示
- ページ送り機能
- フルスクリーン対応

### 6. UI/UX仕様

#### 6.1 レイアウト構成

##### トップページ
```
[ヘッダー]
[検索バー]
[タグ一覧] | [記事カード一覧]
           | [無限スクロール]
```

##### 記事詳細ページ
```
[ヘッダー]
[記事タイトル]
[公開日・タグ]
[本文エリア]
  - Markdown表示
  - PDFスライド埋め込み
```

#### 6.2 レスポンシブ対応
- モバイル: 1カラム表示
- タブレット以上: サイドバー付き2カラム

### 7. セキュリティ要件

- デプロイAPIは認証トークン必須
- CSRFトークン不要（Read Onlyのため）
- XSS対策: Markdown出力時のサニタイズ
- R2アクセスはWorker経由で直接実行

### 8. パフォーマンス要件

- 初回表示: 記事10件
- 無限スクロール: 10件ずつ追加読み込み
- 画像: 遅延読み込み実装
- OGP画像: 24時間キャッシュ

### 9. エラーハンドリング

- 404: 記事が見つからない場合
- 500: サーバーエラー時
- リソース読み込みエラー: フォールバック画像表示

### 10. 今後の拡張性考慮

- アクセス解析連携
- ダークモード対応