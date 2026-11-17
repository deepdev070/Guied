# Database Backups & Data Safety Runbook (Prompt 138)

This document establishes the multi-layer disaster recovery and backup architecture for the **India Paperwork Guide** portal, ensuring zero data loss and business continuity.

---

## 1. Multi-Layered Backup Strategy

We implement three complementary layers of data protection:

```
[Layer 1: Provider PITR]     Continuous write-ahead logging (WAL) with 7-day instant point-in-time recovery
            ↓
[Layer 2: Daily pg_dump]      Nightly compressed dump with SHA256 checksum to Cloudflare R2 / S3
            ↓
[Layer 3: Content JSON]       Human-readable snapshot of all guides, revisions, and civic metadata
```

### Layer 1: Provider Continuous WAL & PITR

- **Managed Provider**: Neon, Supabase, or AWS RDS.
- **Continuous Archival**: Every write operation is recorded in transaction logs.
- **Recovery Point Objective (RPO)**: < 5 minutes.
- **Recovery Time Objective (RTO)**: < 15 minutes.
- Instant rollback to any timestamp in the past 7 to 30 days via provider dashboard.

### Layer 2: Automated Daily `pg_dump` to Cloud Storage

- **Script**: `scripts/backup-db.ts` (`npm run backup:db`)
- **Output Format**: PostgreSQL custom compressed archive (`.dump`) with companion `.sha256` hash.
- **Destination**: Durable cloud object storage (Cloudflare R2 / AWS S3) or secure offsite volume.
- **Automated Retention Schedule**:
  - Keep 7 Daily backups
  - Keep 4 Weekly snapshots
  - Keep 3 Monthly archives

### Layer 3: Secondary Content JSON Backup

- **Script**: `scripts/backup-content-json.ts` (`npm run backup:content`)
- **Admin UI Action**: Accessible via `/admin/import-export` (**Export All Guides as JSON**).
- **Format**: Complete unified JSON bundle containing all published guides, regional variations, categories, glossary terms, and revision history.
- **Advantage**: Independent of PostgreSQL major versions; instantly inspectable, editable, and portable.

---

## 2. Command Reference

### Run Daily Database Backup

```bash
npm run backup:db
```

Generates:

- `backups/db/pg_backup_YYYY-MM-DD_HHMMSS.dump`
- `backups/db/pg_backup_YYYY-MM-DD_HHMMSS.dump.sha256`

### Run Secondary Content JSON Backup

```bash
npm run backup:content
```

Generates:

- `backups/content/content_backup_YYYY-MM-DD_HHMMSS.json`
- `backups/content/content_backup_YYYY-MM-DD_HHMMSS.sha256`

### Run Restore Verification Drill

```bash
npm run restore:test
# Or specify a target file:
npm run restore:test -- backups/db/pg_backup_2026-11-16.dump
```

---

## 3. Scheduled Automation (GitHub Actions Cron)

A scheduled GitHub Actions workflow runs nightly at 02:00 UTC (07:30 IST):

```yaml
name: Nightly Database Backup Drill
on:
  schedule:
    - cron: "0 2 * * *"
  workflow_dispatch:

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm install --legacy-peer-deps
      - run: npm run backup:content
      - run: npm run backup:db
      - run: npm run restore:test
```

---

## 4. Disaster Recovery & Restore Testing Drill

Test restores must be conducted every quarter to confirm archive integrity:

1. **Verify Checksum**:
   ```bash
   sha256sum -c backups/db/pg_backup_YYYY-MM-DD.dump.sha256
   ```
2. **Restore to Staging Database**:
   ```bash
   export RESTORE_DB="postgresql://user:pass@staging-db/civic_recovery_test"
   pg_restore --clean --if-exists -d "$RESTORE_DB" backups/db/pg_backup_YYYY-MM-DD.dump
   ```
3. **Data Sanity Validation**:
   - Verify task count >= published guide count.
   - Verify categories table count matches seed data.
   - Verify zero corrupted records.
