# Phase 13: Troubleshooting Prompts Reference Playbook

> Keep these 10 on-demand troubleshooting prompts handy. Use them whenever code breaks, UI looks misaligned, or safe refactoring/verification is required.

---

### PROMPT 147: Fix a build or type error

```text
The build is failing. Here is the full error output:

[PASTE ERROR]

Find the root cause (do not just silence it with any or ts-ignore), fix it, run npm run check, and explain the cause in 3 lines.
```

**Standard Resolution Procedure:**

1. Isolate the failing file and line number.
2. Verify module imports, schema mismatches, or missing union cases.
3. Fix cleanly without bypassing strict mode.
4. Run `npm run check` (typecheck + format + lint + test).

---

### PROMPT 148: UI looks wrong

```text
This screen does not match our design system: [describe or attach screenshot]. Compare it with the tokens and components in PROJECT_CONTEXT.md and /design. Fix spacing, colour, typography and responsiveness at 360px, 768px and 1280px. Do not change functionality.
```

**Standard Resolution Procedure:**

1. Check design tokens (`colors`, `spacing`, `typography` in Tailwind config).
2. Ensure strict light theme adherence (`color-scheme: light !important`, no dark mode).
3. Test layout at 360px (mobile viewport), 768px (tablet), and 1280px (desktop).
4. Verify WCAG 2.2 AA contrast ratios (>= 4.5:1).

---

### PROMPT 149: Review before I commit

```text
Review all changes since the last commit as a strict senior reviewer. Check for bugs, accessibility issues, security problems, missing error handling, unused code and performance problems. Give a prioritised list; fix the high-priority items.
```

**Standard Resolution Procedure:**

1. Run `git diff` against HEAD.
2. Check OWASP top 10 (CSRF, XSS, rate limiting, sanitization).
3. Check accessibility invariants (semantic HTML, aria labels, focus ring).
4. Verify 100% test pass rate and clean build.

---

### PROMPT 150: Refactor safely

```text
Refactor [file/folder] to remove duplication and improve readability without changing behaviour. First write or confirm tests that lock current behaviour, then refactor, then run all tests.
```

**Standard Resolution Procedure:**

1. Execute unit test suite covering the target component/library.
2. Refactor in small, verifiable steps.
3. Verify test assertions pass with zero regressions.

---

### PROMPT 151: Explain this code to me

```text
Explain how [file/feature] works step by step as if I am a mid-level developer. Include the data flow, the files involved and what could break it. Then suggest 3 improvements, but do not change code.
```

**Standard Resolution Procedure:**

1. Map entry points, handlers, and data transformation pipeline.
2. Document failure modes and error boundaries.
3. Propose non-breaking architecture improvements.

---

### PROMPT 152: Make it faster

```text
The page [route] feels slow. Profile it: check bundle size, number of client components, database queries, image sizes and render blocking resources. Give the top 5 causes with evidence, fix the safest 3, and show before/after numbers.
```

**Standard Resolution Procedure:**

1. Check bundle analyzer / Next.js route build output.
2. Convert unnecessary client components to React Server Components.
3. Optimize Core Web Vitals (LCP < 2.5s, CLS < 0.1, INP < 200ms).

---

### PROMPT 153: Mobile layout bug

```text
On a 360px wide screen, [describe problem]. Reproduce it with a Playwright screenshot, find the CSS cause, fix it with mobile-first Tailwind classes, and add a regression test.
```

**Standard Resolution Procedure:**

1. Inspect 360px viewport overflow (e.g. min-w without wrap, padding clipping).
2. Fix using mobile-first classes (`w-full sm:w-auto`, `overflow-x-auto`).
3. Add Playwright / layout regression test in `tests/ad-layout-regression.test.ts` or `e2e/`.

---

### PROMPT 154: Database migration help

```text
I need to change the schema: [describe]. Create the Prisma migration, update seed scripts, zod schemas, queries, admin forms and tests. Warn me about any data-loss risk before running it.
```

**Standard Resolution Procedure:**

1. Assess breaking changes and data migration needs.
2. Update `prisma/schema.prisma`.
3. Update Zod validation schemas and seed scripts.
4. Run integration tests.

---

### PROMPT 155: Content accuracy double-check

```text
Re-verify the guide [slug] against the official source. Open each sourceUrl, compare every fee, document and step, list discrepancies in a table (our text, official text, URL), and propose corrections. Never assume - mark unreachable sources as "COULD NOT VERIFY".
```

**Standard Resolution Procedure:**

1. Cross-reference official `.gov.in` / `.nic.in` portal links.
2. Audit statutory fees, payment modes, and valid dates.
3. Flag discrepancies with explicit `NEEDS VERIFICATION`.

---

### PROMPT 156: Plan before coding

```text
Before writing code for [feature], give me a short plan: files to create/change, data changes, edge cases, and how we will test it. Wait for my "go" before implementing.
```

**Standard Resolution Procedure:**

1. Outline architecture, affected components, and API routes.
2. Define edge cases and accessibility requirements.
3. List testing strategy before writing implementation code.
