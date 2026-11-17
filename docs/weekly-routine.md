# 60-Minute Weekly Operating Routine (Prompt 140)

This operating playbook establishes a disciplined 60-minute weekly workflow for the **India Paperwork Guide** founder and editorial team. Executing this routine once a week (e.g. every Monday morning 09:00–10:00 AM IST) keeps content fresh, captures citizen search demand, resolves user feedback, and compounds portal authority.

---

## 1. Weekly Routine Timeline

```
┌────────────────────────────────────────────────────────────────────────┐
│ 60-MINUTE WEEKLY OPERATING SCHEDULE                                    │
├─────────────┬──────────────────────────────────────────────────────────┤
│ 00 – 10 min │ Step 1: Review Search Console Queries & Demand Gaps      │
│ 10 – 25 min │ Step 2: Prioritize 3 New Guides from High-Impression Gaps│
│ 25 – 40 min │ Step 3: Re-Verify 5 Oldest Guides on Official Portals    │
│ 40 – 50 min │ Step 4: Review & Resolve Citizen Error Reports           │
│ 50 – 55 min │ Step 5: Check Ad Placement Health & Policy Integrity     │
│ 55 – 60 min │ Step 6: Broadcast 2 Shareable Checklists (WhatsApp)      │
└─────────────┴──────────────────────────────────────────────────────────┘
```

---

## 2. Step-by-Step Operating Guide

### Step 1 (00–10 min): Review Search Console Queries

- **Goal**: Identify citizen paperwork queries with high search impressions but low clicks (unmet citizen demand).
- **Tool**: Google Search Console > Performance > Search results > Date: Last 28 days > Filter by Impressions (descending).
- **CLI Helper**:
  ```bash
  npm run weekly
  ```
  Step 1 of the report prints candidate queries from the demand queue (e.g., "voter id online apply", "ration card split after marriage").

### Step 2 (10–25 min): Prioritize 3 New Guides

- **Goal**: Expand content coverage directly aligned with citizen search traffic.
- **Action**:
  1. Pick 3 high-volume paperwork tasks from the demand table.
  2. Create task JSON files in `src/content/tasks/` following `docs/content-format.md`.
  3. Validate against quality gates:
     ```bash
     npm run content:validate
     npm run content:gate
     ```

### Step 3 (25–40 min): Re-Verify 5 Oldest Guides Against Official Portals

- **Goal**: Maintain 100% statutory fee and procedure accuracy. Zero stale information.
- **Action**:
  1. Step 3 of `npm run weekly` lists the 5 oldest guides by verification date.
  2. Open the official `.gov.in` portal links directly in browser.
  3. Verify statutory fees, required forms, and submission steps.
  4. Update `lastVerifiedAt` with today's date in `src/content/tasks/[task].json`.
  5. Run `npm run content:stale` to confirm 0 stale guides remain.

### Step 4 (40–50 min): Resolve Citizen Error Reports

- **Goal**: Honor citizen feedback and close errors within 7 days.
- **Action**:
  1. Log in to the Admin Dashboard: `https://indiapaperwork.in/admin/reports`.
  2. Review incoming error reports submitted via the "Report a Mistake" modal.
  3. Check suggested corrections against official department notifications.
  4. If verified, edit the guide and mark the report status as `RESOLVED`.
  5. If user provided an email, send the polite acknowledgment template.

### Step 5 (50–55 min): Ad Placement Health & Policy Check

- **Goal**: Maximize user trust, zero layout shifts, and strict Google AdSense policy adherence.
- **Action**:
  1. Open Google AdSense Dashboard > Reports.
  2. Verify Viewability rate (> 65%) and zero policy compliance alerts.
  3. Confirm that no ads appear on legal disclaimer pages (`/disclaimer`, `/privacy-policy`).
  4. Verify mobile anchor ad is dismissable and CLS remains 0.

### Step 6 (55–60 min): Broadcast 2 Shareable Checklist Cards

- **Goal**: Drive organic citizen traffic through high-trust WhatsApp and social sharing.
- **Action**:
  1. Step 6 of `npm run weekly` prints 2 pre-formatted WhatsApp checklist messages.
  2. Copy and broadcast to your WhatsApp status, community broadcast lists, or social channels.
  3. Format example:
     ```text
     📋 Documents required for Learner's Licence Application:
     1. Age Proof (School LC or Birth Certificate)
     2. Address Proof (Aadhaar, Electricity Bill)
     3. Medical Certificate Form 1

     Full verified steps & official Parivahan link: https://indiapaperwork.in/driving-licence-learner
     ```

---

## 3. Automation Scripts

All weekly routine data is available in a single command:

```bash
npm run weekly
```

- Prints search query demand gaps
- Shows the top 3 guide candidates
- Identifies the 5 oldest guides with direct government portal links
- Displays open error reports count
- Checks ad layout shift and policy status
- Generates 2 WhatsApp-ready checklist message cards
