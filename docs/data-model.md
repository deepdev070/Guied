# Data Architecture & Entity Relationship Diagram

This document describes the structured database schema for the **India Paperwork Guide** civic platform, implemented in `prisma/schema.prisma`.

## Core Architectural Principles

1. **National Default vs State Variants**:
   - Each `Task` represents a national procedure (e.g. `driving-licence-learner`, `passport-renewal`).
   - A `TaskVariant` with `stateId = null` acts as the **National Default**.
   - A `TaskVariant` linked to a `State` (e.g. `Gujarat` / `GJ`) contains state-specific document rules, local fees, and designated sub-registrar/RTO portal links.

2. **Verification & Freshness Audit Trail**:
   - Every content row carries `status` (`DRAFT`, `REVIEW`, `PUBLISHED`, `ARCHIVED`), `lastVerifiedAt`, `verifiedBy`, and official `sourceUrl`.

3. **Conditional Document Logic**:
   - `DocumentRequirement` stores a JSON rule in `appliesWhen` (e.g., `{"applicantAge": {"lt": 18}}` or `{"vehicleType": "commercial"}`).

---

## Mermaid Entity Relationship Diagram

```mermaid
erDiagram
    Category ||--o{ Task : contains
    Task ||--o{ TaskVariant : has
    State ||--o{ TaskVariant : customizes

    TaskVariant ||--o{ Step : defines
    TaskVariant ||--o{ DocumentRequirement : requires
    TaskVariant ||--o{ Fee : charges
    TaskVariant ||--o{ OfficialLink : directs_to
    TaskVariant ||--o{ FaqItem : answers
    TaskVariant ||--o{ RejectionReason : warns_against
    TaskVariant ||--o{ SourceRef : cites
    TaskVariant ||--o{ ContentRevision : tracks
    TaskVariant ||--o{ ErrorReport : receives

    Category {
        string id PK
        string slug UK
        string name
        string icon
        int displayOrder
    }

    Task {
        string id PK
        string slug UK
        string name
        string categoryId FK
    }

    State {
        string id PK
        string code UK
        string name
        string nativeName
        string portalUrl
    }

    TaskVariant {
        string id PK
        string taskId FK
        string stateId FK
        string title
        string summary
        enum status
        datetime lastVerifiedAt
        string verifiedBy
        string sourceUrl
    }

    Step {
        string id PK
        string variantId FK
        int stepNumber
        string title
        string description
        string where
        string estimatedTime
        string officialLinkUrl
    }

    DocumentRequirement {
        string id PK
        string variantId FK
        string name
        string requirementType
        string copiesHint
        json appliesWhen
    }

    Fee {
        string id PK
        string variantId FK
        string label
        int amount
        string currency
        string paymentMode
        string rulesReference
    }

    OfficialLink {
        string id PK
        string variantId FK
        string label
        string url
        boolean isPrimary
        string portalName
    }

    FaqItem {
        string id PK
        string variantId FK
        string question
        string answer
        int displayOrder
    }

    RejectionReason {
        string id PK
        string variantId FK
        string title
        string description
        string solution
    }

    SourceRef {
        string id PK
        string variantId FK
        string title
        string actOrRuleNumber
        string url
    }

    ContentRevision {
        string id PK
        string variantId FK
        int revisionNumber
        string author
        json payload
        datetime createdAt
    }

    ErrorReport {
        string id PK
        string variantId FK
        string issueType
        string description
        string status
        datetime createdAt
    }
```

---

## Verification & Status Workflow

```mermaid
stateDiagram-v2
    [*] --> DRAFT : Author writes procedure JSON
    DRAFT --> REVIEW : Automated validator passes
    REVIEW --> PUBLISHED : Researcher checks official portal links
    PUBLISHED --> REVIEW : Outdated rule flagged / ErrorReport verified
    PUBLISHED --> ARCHIVED : Procedure obsolete or superseded by gazette
```
