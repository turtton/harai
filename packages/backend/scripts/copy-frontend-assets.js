#!/usr/bin/env node

import { cp, rm, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function copyFrontendAssets() {
  try {
    const frontendDistPath = path.resolve(__dirname, '../../frontend/dist')
    const backendAssetsPath = path.resolve(__dirname, '../assets')

    console.log('Frontend dist path:', frontendDistPath)
    console.log('Backend assets path:', backendAssetsPath)

    // Frontend のビルド成果物が存在するかチェック
    if (!existsSync(frontendDistPath)) {
      console.error('Frontend dist directory not found. Please build frontend first.')
      process.exit(1)
    }

    // 既存の assets ディレクトリを削除
    if (existsSync(backendAssetsPath)) {
      await rm(backendAssetsPath, { recursive: true })
      console.log('Removed existing assets directory')
    }

    // assets ディレクトリを作成
    await mkdir(backendAssetsPath, { recursive: true })

    // Frontend の成果物を assets にコピー
    await cp(frontendDistPath, backendAssetsPath, { recursive: true })
    console.log('✅ Frontend assets copied to backend/assets')

  } catch (error) {
    console.error('❌ Error copying frontend assets:', error)
    process.exit(1)
  }
}

copyFrontendAssets()