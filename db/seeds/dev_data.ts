import { createDrizzleClient } from '../client';
import { articles, resources } from '../schema';

// 開発用テストデータ
const seedArticles = [
  {
    id: 'test-1',
    slug: 'hello-world',
    title: 'Hello World',
    description: 'はじめての記事です',
    content: '# Hello World\n\nMarkdown content here\n\n![image](sample-image)',
    tags: '["tech", "blog"]',
    published: true,
    publishDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'test-2',
    slug: 'sample-post',
    title: 'Sample Post',
    description: 'サンプル記事',
    content: '# Sample\n\n## セクション\n\nWith image: ![image](sample-image)',
    tags: '["sample"]',
    published: true,
    publishDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1日前
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

const seedResources = [
  {
    id: 'resource-1',
    articleId: 'test-1',
    slug: 'sample-image',
    type: 'image',
    r2Key: 'articles/test-1/sample-image.jpg',
    originalName: 'sample.jpg',
    size: 102400, // 100KB
    createdAt: new Date().toISOString(),
  },
  {
    id: 'resource-2',
    articleId: 'test-2',
    slug: 'sample-image',
    type: 'image',
    r2Key: 'articles/test-2/sample-image.png',
    originalName: 'sample.png',
    size: 204800, // 200KB
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

// シードデータ投入関数
export async function seedDevData(d1: D1Database) {
  const db = createDrizzleClient(d1);

  console.log('🌱 Seeding development data...');

  // 既存データをクリア (開発環境のみ)
  await db.delete(resources);
  await db.delete(articles);

  // 記事データを投入
  await db.insert(articles).values(seedArticles);
  console.log('✅ Articles seeded');

  // リソースデータを投入
  await db.insert(resources).values(seedResources);
  console.log('✅ Resources seeded');

  console.log('🎉 Development data seeded successfully!');
}