# Delivery status

The initial source and all ten pinned dependencies were restored and committed at `3145ce58820901ddaab5f35ee9f3758c8b115909`. The original import run `35151631674` completed its tests, packing and GitHub Pages deployment successfully.

The one-shot import workflow has now been retired. It must not overwrite subsequent development with the archived 0.1.0 payload. Normal pushes to main run core tests, independent fontTools validation, declaration checks, fresh npm-package consumer checks, and source/distribution browser checks before publishing Pages. Pull requests test without deploying.

The `.import` data is retained as historical, SHA-256-verified provenance, not as the current source of truth. The editable `app`, `packages`, `scripts`, and `tests` directories are authoritative. CI uploads a fresh Git source archive and verification evidence for every run. Hardware WebGPU qualification is separate from software-rendered Chromium verification.
