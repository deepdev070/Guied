# `src/lib/` — Core Utilities & Server Libraries

This folder contains shared utility modules, backend clients, and business logic:

- **`db/`:** Prisma client singleton and database query helpers.
- **`utils/`:** Shared helper functions (INR currency formatting, date formatters, Tailwind class merging `cn()`, string helpers).
- **`seo/`:** Canonical URL resolvers, dynamic sitemap builders, and metadata generation helpers for `generateMetadata()`.
- **`search/`:** Search and filtering algorithms for finding guides by task keyword and Indian state.
- **`validations/`:** Zod schemas ensuring runtime type-safety for tasks, states, checklists, and incoming API payloads.
