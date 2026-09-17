#!/usr/bin/env bash
# Explicit owner-run push from an existing, clean checkout. Never force-pushes.
set -euo pipefail
cd "$(dirname "$0")/.."
repo="${1:-wieslawsoltes/CounterformStudio}"
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || { echo 'Apply the supplied patch in an existing repository clone first.' >&2; exit 1; }
[ "$(git branch --show-current)" = main ] || { echo 'Switch to main before publishing.' >&2; exit 1; }
[ -z "$(git status --porcelain)" ] || { echo 'Commit or stash local changes before publishing.' >&2; exit 1; }
url="$(git remote get-url origin)"
case "$url" in
  "https://github.com/$repo"|"https://github.com/$repo.git"|"git@github.com:$repo.git") ;;
  *) echo "Refusing unexpected origin: $url" >&2; exit 1 ;;
esac
git push origin HEAD:main
printf '\nSource pushed. The existing verification workflow gates automatic GitHub Pages deployment.\n'
