#!/usr/bin/env bash
set -e

echo "Running pre-deploy checks..."

# テスト実行
echo "Running tests..."
bun run test:run

# 型チェック
echo "Running type check..."
bun run typecheck

# リンターチェック
echo "Running linter..."
bun run ci

# ビルドチェック
echo "Running build check..."
bun run build

echo "All pre-deploy checks passed!"