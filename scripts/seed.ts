#!/usr/bin/env bun

// シードデータ投入スクリプト
// 使用方法: bun run scripts/seed.ts

import { seedDevData } from '../db/seeds/dev_data';

// このスクリプトは実際の D1 データベースではなく、
// wrangler d1 execute を使用してシードデータを投入する際の参考として使用

async function main() {
  console.log('このスクリプトは参考用です。');
  console.log('実際のシードデータ投入は以下のコマンドを使用してください:');
  console.log('');
  console.log('# ローカル環境:');
  console.log('wrangler d1 execute harai-blog --local --file=db/seeds/dev_data.sql');
  console.log('');
  console.log('# 本番環境 (注意して使用):');
  console.log('wrangler d1 execute harai-blog --remote --file=db/seeds/dev_data.sql');
}

main().catch(console.error);