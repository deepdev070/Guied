# `src/components/ads/` — Monetization & Ad Slots

This folder houses ad placement containers and network integration components designed to fulfill Goal #3 (sustainable ad monetization without ruining UX):

- **Reserved Ad Slots:** Pre-dimensioned responsive wrappers with explicit min-height/width to eliminate Cumulative Layout Shift (CLS).
- **Clear Labelling:** Standardized "Advertisement" badge / aria-label markings for strict ad network policy compliance.
- **Placements:** Header leaderboard, in-article breaks, sticky footer anchor, and sidebar slots.
- **Fallbacks:** Visual skeleton or placeholder views for development and ad-blocked states.
