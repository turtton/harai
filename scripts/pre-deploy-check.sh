#!/usr/bin/env bash
set -euo pipefail

echo "Running pre-deploy checks..."

# テスト実行
echo "Running tests..."
if ! bun run test:run; then
  echo "Error: Tests failed"
  exit 1
fi

# 型チェック
echo "Running type check..."
if ! bun run typecheck; then
  echo "Error: Type check failed"
  exit 1
fi

# リンターチェック
echo "Running linter..."
if ! bun run ci; then
  echo "Error: Linter check failed"
  exit 1
fi

# ビルドチェック
echo "Running build check..."
if ! bun run build; then
  echo "Error: Build failed"
  exit 1
fi

echo "All pre-deploy checks passed!"