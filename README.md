# Style DNA v1.4.0 — Wearable Mix

This build fixes the feed balance problem in v1.3.

## What changed

- **Default feed = mostly normal clothes.** The app now blends two separate fashion sources instead of treating an experimental menswear dataset as the whole universe.
- **85% everyday / 15% statement by default.** You can change that from 95/5 up to 60/40.
- **Everyday pool:** adult / young-adult men's casual, minimalist, office, sporty, streetwear, and elegant looks from `lihicarmeli/fashion-stylist-multimodal-v2`.
- **Statement pool:** the more editorial `zoha-ahmed07/Garment_to_Front_Pose_V1` source is now deliberately a minority source, except in the explicit Queer / statement context.
- **Learning exploration is separate from weirdness.** The exploration slider now means “keep testing alternatives,” not “show stranger clothes.”
- **Old v1.3 experimental swipes are preserved but automatically downweighted** when the preference scores are rebuilt, so an oversupply of runway-ish looks does not dominate your profile.
- **Visible version:** the header and drawer both say `v1.4.0`.
- No Openverse/Wikimedia/generic fallback.

## Updating GitHub Pages

Replace the files in your existing Style DNA repository with all files from this folder and commit. Then open the Pages URL in Safari with `?build=1.4.0` appended once. The top of the app should say `Discover · v1.4.0`.

The Force App Update button clears browser/service-worker caches but does **not** erase swipe history.
