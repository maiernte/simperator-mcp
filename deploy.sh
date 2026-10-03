#!/bin/bash
# 一键发布 simperator-mcp 到 npm：升版本号 → 编译 → 发布 → 推送 git 提交与 tag
#
# 用法：
#   pnpm run deploy         # 补丁版本 0.1.0 → 0.1.1（修 bug、改文案）
#   pnpm run deploy minor # 次版本   0.1.0 → 0.2.0（加新工具）
#   pnpm run deploy major # 主版本   0.1.0 → 1.0.0（不兼容改动）
#
# 前提：改动已经 commit（npm version 要求工作区干净，它会自己提交版本号并打 tag）；本机已 npm login。
set -e
cd "$(dirname "$0")"

BUMP=${1:-patch}
case "$BUMP" in patch|minor|major) ;; *) echo "❌ 参数只能是 patch / minor / major"; exit 1 ;; esac

if [ -n "$(git status --porcelain)" ]; then
  echo "❌ 还有没提交的改动，先 commit 再发布："
  git status --short
  exit 1
fi

npm whoami >/dev/null 2>&1 || { echo "❌ 没有登录 npm，先运行 npm login"; exit 1; }

echo "======= 升版本号 ($BUMP) ======="
npm version "$BUMP" -m "release: v%s"
VERSION=$(node -p "require('./package.json').version")

echo "======= 编译并发布 v${VERSION} ======="
# prepublishOnly 会先跑 npm run build
npm publish --access public

echo "======= 推送 git ======="
git push && git push --tags

echo "✅ 已发布 simperator-mcp@${VERSION}（用户的 npx simperator-mcp@latest 下次启动即生效）"
