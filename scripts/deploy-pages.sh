#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
npm run build
cp dist/index.html dist/404.html
touch dist/.nojekyll
for r in pantry reflect swaps privacy; do
  mkdir -p "dist/$r"
  cp dist/index.html "dist/$r/index.html"
done
rm -rf /tmp/forkward-pages && mkdir -p /tmp/forkward-pages && cp -a dist/. /tmp/forkward-pages/
cd /tmp/forkward-pages
git init -b gh-pages
git -c user.name="Luna Reflect AI" -c user.email="luna-reflect-ai@users.noreply.github.com" add -A
git -c user.name="Luna Reflect AI" -c user.email="luna-reflect-ai@users.noreply.github.com" commit -m "Deploy Forkward Pages"
git remote add origin https://github.com/damienmueller-cloud/forkward.git
git push -f origin gh-pages
