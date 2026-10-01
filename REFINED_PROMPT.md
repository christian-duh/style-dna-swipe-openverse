# Refined build prompt

Design and implement a mobile-first personal fashion preference-learning system for a 29-year-old gay man living in Washington, DC, with an active social life and a corporate-bank work environment. The end goal is not merely to collect liked outfit photos; it is to infer a durable, nuanced personal style profile and use it to build a versatile wardrobe from scratch, spanning shoes, bottoms, shorts, tops, outerwear, workout clothing, formalwear, and accessories.

## Product concept

Build a Tinder-like swipe interface for fashion inspiration. The user should be able to react instinctively to complete outfits with a left swipe for dislike and right swipe for like. The experience must be genuinely pleasant on an iPhone and simple enough to encourage hundreds of fast decisions.

## Learning design

Each outfit card must retain machine-readable context that can later be analyzed by a stronger LLM. Store the source image, source link, textual image description when available, life-context category, the search/style recipe that surfaced the image, and structured style tags such as silhouette, fit, proportion, color, texture, formality, layering, footwear, accessories, statement level, and masculine/feminine/androgynous expression where reasonably inferable.

Do not force the user to explain every reaction. Preserve the speed and intuitiveness of binary swiping. Provide an optional lightweight “why?” interaction for unusually informative looks, allowing the user to identify specific elements that drove the reaction (for example pants, shoes, proportions, color, texture, skin exposure, overall vibe, too basic, too corporate, too loud).

## Coverage

Train across a broad real-life wardrobe taxonomy, including at minimum:
- corporate office / business casual
- everyday casual
- dates and dinners
- nightlife / club / going-out looks
- brunch and social daytime
- hot-weather dressing and shorts
- workout / athleisure
- weddings and formal events
- travel / vacation
- cold-weather layering
- queer, gender-bendy, and statement fashion

The system should deliberately include both conventional and expressive looks. Do not assume the user wants stereotypical “gay fashion”; learn how much queerness, color, skin, femininity/androgyny, trendiness, or statement dressing he actually prefers.

## Recommendation / experimentation logic

Use an explore/exploit approach. As positive and negative signals emerge, show somewhat more of promising styles but preserve a meaningful exploration rate so the system can discover unexpected preferences and avoid an echo chamber. Track evidence strength and treat preferences as probabilistic rather than absolute.

## Outputs

The system must generate:
1. Full structured swipe history (JSON).
2. Flat analysis-ready history (CSV).
3. A copyable “ChatGPT analysis packet” containing aggregate signals plus swipe-level evidence so ChatGPT can infer the user's style, uncertainties, contradictions, and next experiments.
4. A compact shopping brief that can be sent to someone else (such as Gabo) who wants to buy outfits for the user.

The eventual analytical workflow should support moving from preference discovery → personal style model → wardrobe architecture → prioritized shopping list → exact item recommendations → outfit formulas → ongoing refinement based on purchases and real-world wear.

## Technical requirements for v1

Prefer a static, mobile-first Progressive Web App that can be hosted on GitHub Pages and added to the iPhone Home Screen. Avoid requiring a custom backend. Use a real online fashion/photo source with proper attribution and a user-supplied API key stored locally rather than committed in source code. Store user preference data locally by default. Make exports easy enough to share back into ChatGPT.

Build the working v1 now, while structuring it so richer fashion datasets, image embeddings, vision-language descriptions, closet inventory, and live shopping integrations can be added later.
