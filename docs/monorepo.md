# Monorepo Architecture: Turborepo & npm Workspaces

## 1. Overview

The **India Paperwork Guide** repository is architected as a high-performance monorepo using **Turborepo v2** and **npm workspaces**. This setup enables maximum code reuse across the Next.js web application (`apps/web`) and the Expo / React Native mobile application (`apps/mobile`), while maintaining strict modularity, sub-second incremental builds, and zero regression across citizen guide pages.

---

## 2. Monorepo Folder Layout

```
.
├── apps/
│   ├── web/                     # Next.js 16 (App Router + Turbopack) Civic Portal
│   │   ├── src/                 # App Router pages, civic UI components, contexts
│   │   ├── public/              # PWA manifest, service worker (sw.js), icons
│   │   ├── prisma/              # Schema, migrations, categories & states seed data
│   │   ├── scripts/             # Gate checkers, validators, plain language auditors
│   │   ├── tests/               # 70+ automated unit and accessibility test suites
│   │   ├── e2e/                 # Playwright end-to-end and offline test suites
│   │   ├── next.config.ts       # Next.js configuration and canonical 308 redirects
│   │   ├── tsconfig.json        # TypeScript configuration resolving @/ and @civic/*
│   │   └── package.json         # Workspace package: @civic/web
│   │
│   └── mobile/                  # Expo / React Native Mobile App (Prompt 118 scaffold)
│       ├── app/                 # Expo Router file-based screens
│       │   └── index.tsx        # Mobile Home entry screen
│       ├── app.json             # Expo configuration (light-only UI, blue theme)
│       ├── tsconfig.json        # TypeScript configuration resolving @civic/*
│       └── package.json         # Workspace package: @civic/mobile
│
├── packages/
│   ├── types/                   # Shared TypeScript Types & Zod Schemas (@civic/types)
│   │   ├── src/
│   │   │   └── index.ts         # TaskContentSchema, TaskVariantSchema, FeeSchema, etc.
│   │   ├── tsconfig.json
│   │   └── package.json         # Workspace package: @civic/types
│   │
│   └── utils/                   # Shared Domain Utilities (@civic/utils)
│       ├── src/
│       │   └── index.ts         # Freshness auditor (isFresh), appliesWhen evaluator
│       ├── tsconfig.json
│       └── package.json         # Workspace package: @civic/utils
│
├── docs/                        # Architecture & civic portal specifications
├── turbo.json                   # Turborepo task pipeline configuration
└── package.json                 # Root monorepo workspace configuration
```

---

## 3. Shared Packages & Boundary Design

### `@civic/types` (`packages/types`)

Contains pure Zod validation schemas and inferred TypeScript types:

- `TaskContentSchema`, `TaskContent`
- `TaskVariantSchema`, `TaskVariant`
- `DocumentRequirementSchema`, `DocumentRequirement`, `DocumentSpecSchema`
- `FeeSchema`, `Fee`, `FeeCalculatorConfigSchema`
- `StepSchema`, `Step`
- `OfficialLinkSchema`, `OfficialLink`
- `FaqItemSchema`, `FaqItem`
- `RejectionReasonSchema`, `RejectionReason`
- `SourceRefSchema`, `SourceRef`
- `ContentStatusSchema`, `ContentStatus`

### `@civic/utils` (`packages/utils`)

Contains pure business logic shared across web and mobile:

- **Freshness Auditor**: `getFreshnessInfo`, `isFresh`, `isStale` enforcing the statutory verification timeline (≤ 90 days fresh, 91–180 days aging, > 180 days needs update).
- **Rule Evaluator (`appliesWhen`)**: Evaluates boolean and relational conditions (`eq`, `ne`, `lt`, `lte`, `gt`, `gte`, `in`, `nin`, `and`, `or`, `not`) against user answers without external dependencies.

---

## 4. Backward Compatibility Strategy

To ensure zero breakage of existing website imports:

1. `src/types/content.ts` re-exports all schemas from `@civic/types`:
   ```ts
   export * from "@civic/types";
   ```
2. `src/lib/freshness.ts` and `src/lib/rule-evaluator.ts` re-export from `@civic/utils`:
   ```ts
   export * from "@civic/utils";
   ```
3. TypeScript path mapping in `tsconfig.json` maps `@civic/types` and `@civic/utils` to their respective package sources, enabling immediate IDE autocompletion and compile-time type checking.

---

## 5. Build & Execution Pipeline

- **Build Everything**: `npm run build` or `npx turbo run build`
- **Typecheck All Packages**: `npm run typecheck` or `npx turbo run typecheck`
- **Lint All Packages**: `npm run lint` or `npx turbo run lint`
- **Unit Tests**: `npm test` (398 tests across 71 suites)
- **Comprehensive Quality Check**: `npm run check` (typecheck + lint + format + test + validate + content gate)
