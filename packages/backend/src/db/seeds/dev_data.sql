-- 開発用テストデータ (SQL版)
-- 実行方法: wrangler d1 execute harai-blog --local --file=db/seeds/dev_data.sql

-- 既存データをクリア (開発環境のみ)
DELETE FROM resources;
DELETE FROM articles;

-- 記事データを投入
INSERT INTO articles (id, slug, title, description, content, tags, published, publish_date, created_at, updated_at) VALUES
  (
    'test-1', 
    'hello-world', 
    'Hello World', 
    'はじめての記事です', 
    '# Hello World

Markdown content here

![image](sample-image)', 
    '["tech", "blog"]', 
    1, 
    datetime('now'),
    datetime('now'),
    datetime('now')
  ),
  (
    'test-2', 
    'sample-post', 
    'Sample Post', 
    'サンプル記事', 
    '# Sample

## セクション

With image: ![image](sample-image)', 
    '["sample"]', 
    1, 
    datetime('now', '-1 day'),
    datetime('now', '-1 day'),
    datetime('now', '-1 day')
  );

-- リソースデータを投入
INSERT INTO resources (id, article_id, slug, type, r2_key, original_name, size, created_at) VALUES
  (
    'resource-1',
    'test-1',
    'sample-image',
    'image',
    'articles/test-1/sample-image.jpg',
    'sample.jpg',
    102400,
    datetime('now')
  ),
  (
    'resource-2',
    'test-2',
    'sample-image',
    'image',
    'articles/test-2/sample-image.png',
    'sample.png',
    204800,
    datetime('now', '-1 day')
  );