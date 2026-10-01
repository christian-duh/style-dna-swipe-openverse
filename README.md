# Style DNA — Fashion-only build (v1.2)

This build fixes the biggest problem in the prior version: **the swipe deck is no longer sourced from a generic image search.**

## Image source

The app now uses the public Hugging Face Dataset Viewer API against `AbstractPhil/qwen-deepfashion`, a purpose-built dataset of full-body fashion looks with rich outfit captions. It filters the feed to male/masculine-presenting looks (with `person` allowed only in the statement/androgynous context). No API key is required for public Dataset Viewer access.

The app deliberately has **no Openverse/Wikimedia fallback**. If the fashion feed cannot load, it shows an error rather than serving irrelevant photography.

## What stays the same

- Tinder-style left/right swiping
- 11 life contexts
- optional “why?” detail tags
- adaptive exploration
- local browser storage
- Style DNA dashboard
- JSON/CSV/ChatGPT/shopping-brief exports

## Upgrade an existing GitHub Pages install

1. Upload/overwrite every file in this folder at the root of your existing repository.
2. Commit the changes.
3. Keep the existing GitHub Pages configuration.
4. Fully close the old Home Screen app/Safari tab, then reopen it. The service worker cache version is bumped and old app caches are deleted on activation.
5. Start swiping.

The app automatically discards old Openverse/Wikimedia swipe records so irrelevant cards do not contaminate the style profile.

## Why this source is better

Unlike Openverse/Wikimedia, the source pool is itself a fashion dataset. Each record includes a full-body fashion image plus detailed image-grounded captions, allowing the app to extract actual style signals such as tailoring, wide-leg trousers, shorts, denim, knitwear, sheer/mesh, loafers, sneakers, layering, color, and statement styling.

## Current limitation

The main dataset is AI-generated rather than Pinterest photography. It is useful for controlled preference discovery because the images are full-body and richly described, but a future build can add a Pinterest-board ingestion mode for real-world inspiration while retaining this controlled feed for targeted A/B style testing.
