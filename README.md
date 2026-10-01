# Style DNA v1.3.0 — recovery build

This build fixes two separate problems found in v1.2:

1. **Visible versioning / cache diagnostics.** The header always says `v1.3.0`; the menu shows the exact build and feed status; and **Force app update / clear cache** unregisters old service workers and deletes app caches without deleting local swipe history. Static assets also use cache-busting query strings.
2. **Broken fashion source.** v1.2 attempted to use the default Qwen DeepFashion Dataset Viewer search endpoint, which is not reliable for that large split, and its `rank0` / `rank1` preview fallback contains only women. v1.3 instead uses `zoha-ahmed07/Garment_to_Front_Pose_V1`, a compact 165-row male/androgynous full-body fashion dataset with detailed captions.

## Deploy
Upload every file in this folder to the root of the existing GitHub Pages repository, replacing the old copies. After Pages finishes deploying, open the site in Safari with `?build=1.3.0` appended once.

You are definitely on the new build only if the header reads **Discover · v1.3.0**.

The app no longer registers an offline service worker while the project is still changing rapidly. That is intentional; avoiding stale PWA code is more important than offline use during development.
