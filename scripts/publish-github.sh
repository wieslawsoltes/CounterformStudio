#!/usr/bin/env bash
# Explicit owner-run publishing helper. Requires authenticated GitHub CLI.
set -euo pipefail
cd "$(dirname "$0")/.."
repo="${1:-wieslawsoltes/CounterformStudio}"
command -v gh >/dev/null || { echo 'Install and authenticate the GitHub CLI first.' >&2; exit 1; }
gh auth status
if ! gh repo view "$repo" >/dev/null 2>&1; then
  gh repo create "$repo" --public --description 'Counterform Studio — modular browser-based font authoring with SkiaSharpWeb'
fi
if [ ! -d .git ]; then git init -b main; fi
git add .
if ! git diff --cached --quiet; then git commit -m 'Build Counterform Studio modular font editor, compilers and verification'; fi
if git remote get-url origin >/dev/null 2>&1; then
  url="$(git remote get-url origin)"
  case "$url" in
    "https://github.com/$repo"|"https://github.com/$repo.git"|"git@github.com:$repo.git") ;;
    *) echo "Refusing unexpected origin: $url" >&2; exit 1 ;;
  esac
else
  git remote add origin "https://github.com/$repo.git"
fi
git push -u origin main
printf '\nSource pushed. Enable GitHub Pages (Actions), then run the Pages workflow explicitly.\n'
