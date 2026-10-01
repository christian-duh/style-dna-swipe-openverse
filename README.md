# Style DNA — Openverse build

A mobile-first swipe app for learning your fashion preferences from real outfit photography and exporting the evidence for deeper analysis in ChatGPT.

## What changed

This build replaces Pexels with **Openverse**. Openverse supports anonymous API requests, so there is **no API key, account, or secret to configure**. If an Openverse request fails or returns nothing, the app automatically falls back to the public Wikimedia Commons API, which also supports anonymous browser requests. Search results preserve creator, source, and license metadata.

## What the app does

- Tinder-like left/right swipe interface optimized for a phone.
- Searches across 11 life contexts: office, everyday casual, dates, nightlife, brunch/social, hot weather/shorts, workout, events, travel, cold weather, and queer/statement fashion.
- Each search recipe carries structured style tags so a swipe produces machine-readable preference evidence even when the source caption is sparse.
- Optional detail chips let you mark why an unusually informative outfit worked or failed without interrupting every swipe.
- Adaptive sampling gradually gives more weight to styles that test well while preserving an adjustable exploration rate.
- Stores preferences locally in the browser.
- Exports JSON, CSV, a full ChatGPT analysis packet, and a compact shopping brief.
- Progressive Web App manifest/service worker support Add to Home Screen when hosted over HTTPS such as GitHub Pages.

## Setup — easiest phone workflow

1. Create a new GitHub repository, for example `style-dna`.
2. Upload the contents of this folder **to the root of the repository**.
3. In GitHub, open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Pick the `main` branch and `/ (root)`, then Save.
6. Open the Pages URL on iPhone Safari.
7. Tap **Share → Add to Home Screen**.
8. Launch Style DNA, choose your life contexts, and start swiping. No API setup is required.

## Recommended training protocol

- First pass: 100–150 fast swipes across all relevant contexts. Use the detail button only when a reaction has a clear reason.
- First analysis: export/copy the ChatGPT brief. Ask ChatGPT to identify strong signals, contradictions, and the biggest uncertainties.
- Second pass: 50–100 targeted swipes designed around those uncertainties rather than just showing more of what already tested well.
- Wardrobe design: after roughly 200–300 informative swipes, translate the profile into a wardrobe architecture, then into exact shopping targets.
- Keep a smaller challenge stream forever so exploration prevents the model from freezing you into an early version of your style.

## Data model

Every swipe stores the like/nope decision, life context, style recipe/query, structured style tags, source description/title, image/source link, creator, source/provider, license metadata, optional user detail tags and note, and timestamp.

## Privacy

There is no backend in this build. Swipe history stays in browser localStorage. Exported files are only created when you press an export control.

## Notes / limitations

Openverse searches openly licensed media from multiple providers, with Wikimedia Commons as a no-key fallback; neither is a purpose-built menswear lookbook. Search quality can vary. The app therefore retains the query/style recipe and source metadata, and irrelevant cards can simply be rejected. A later version can add a curated fashion feed, AI vision descriptions, user-uploaded inspiration, closet inventory, and live shopping links.
