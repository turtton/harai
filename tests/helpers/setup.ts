import { afterEach, beforeEach } from 'vitest'
import '@testing-library/jest-dom'

export function setupTestEnvironment() {
  beforeEach(async () => {
    // テストの前処理
  })

  afterEach(async () => {
    // テストの後処理
  })
}

// グローバルセットアップが必要な場合はここに記述
setupTestEnvironment()
