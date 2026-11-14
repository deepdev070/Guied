# Task Content Authoring Format Specification

This document defines the authoring format for all government paperwork procedures on **India Paperwork Guide**.

All guides are authored as structured JSON files located in:

```text
src/content/tasks/<task-slug>.json
```

---

## The 4 Cardinal Rules for Authors

> [!IMPORTANT]
>
> 1. **Every fee, date, rule, and number MUST have a verified source**:
>    Every item (`fee`, `step`, `document`, `officialLink`) must cite an official government URL (`sourceUrl`) and a verification date (`lastVerifiedAt` or `verifiedOn`). Unverified or hearsay rules are strictly rejected by the automated validator.
>
> 2. **Class 8 Reading Level**:
>    Instructions must be clear, direct, and jargon-free. If legal terms like _indemnity bond_ or _Form 1A_ are required, provide a plain-language explanation in the `description` or `helper`.
>
> 3. **Direct Official Portal Links Only**:
>    Never link to private agents, blog aggregators, or intermediary service providers. Only direct government portals ending in `.gov.in`, `.nic.in`, or official state domains (e.g. `digitalgujarat.gov.in`, `parivahan.gov.in`).
>
> 4. **National Default + State Overrides**:
>    The `national` block defines the baseline Central procedure. The `states` dictionary contains only state-specific delta overrides (e.g. Gujarat's faceless e-KYC rules or state-specific stamp duty).

---

## File Structure (`src/content/tasks/<task-slug>.json`)

```json
{
  "slug": "driving-licence-learner",
  "name": "Learner's Licence Application",
  "description": "How to apply for a learner driving licence (LLR) online or at an RTO in India.",
  "categorySlug": "vehicles",
  "national": {
    "title": "How to Get a Learner's Licence in India (2026)",
    "summary": "Complete document checklist, ₹200 official statutory fee breakdown, and step-by-step application instructions for Learner Licence across all Indian states.",
    "estimatedTime": "15-30 days",
    "difficulty": "easy",
    "status": "PUBLISHED",
    "lastVerifiedAt": "2026-11-14T00:00:00.000Z",
    "verifiedBy": "Civic Research Editorial Team",
    "sourceUrl": "https://parivahan.gov.in/parivahan//en/content/learner-licence",
    "steps": [
      {
        "stepNumber": 1,
        "title": "Submit Form 2 on the Sarathi Parivahan Portal",
        "description": "Go to parivahan.gov.in, choose your State, and select 'Apply for Learner Licence'. Fill out your applicant details, address, and select vehicle class (MCWG for geared motorcycle, LMV for car).",
        "where": "Official Sarathi Portal (parivahan.gov.in)",
        "estimatedTime": "15 minutes",
        "officialLinkUrl": "https://sarathi.parivahan.gov.in",
        "officialLinkLabel": "Open Sarathi Parivahan Application Portal",
        "calloutType": "tip",
        "calloutTitle": "Aadhaar e-KYC Tip",
        "calloutText": "If your mobile number is linked to Aadhaar, choose 'Applicant with Aadhaar' for paperless online verification without an in-person RTO visit for document submission.",
        "status": "PUBLISHED",
        "lastVerifiedAt": "2026-11-14T00:00:00.000Z",
        "sourceUrl": "https://sarathi.parivahan.gov.in"
      },
      {
        "stepNumber": 2,
        "title": "Upload Required Documents & Photo",
        "description": "Upload scanned copies of Proof of Age, Proof of Address, and Form 1 (Self-declaration of physical fitness). If not using Aadhaar e-KYC, upload your signature and passport-size photograph.",
        "where": "Online Portal",
        "estimatedTime": "10 minutes",
        "status": "PUBLISHED",
        "lastVerifiedAt": "2026-11-14T00:00:00.000Z",
        "sourceUrl": "https://sarathi.parivahan.gov.in"
      },
      {
        "stepNumber": 3,
        "title": "Pay Government Fee (₹200)",
        "description": "Pay the statutory fee of ₹150 for application processing plus ₹50 for computerized test fee via net banking, debit card, or UPI. Download and print payment receipt Form 2.",
        "where": "Integrated Bharatkosh / State Payment Gateway",
        "estimatedTime": "5 minutes",
        "calloutType": "warning",
        "calloutTitle": "Keep Payment Receipt Safe",
        "calloutText": "Print the e-receipt immediately. The transaction reference number is required if payment status enters 'Pending'.",
        "status": "PUBLISHED",
        "lastVerifiedAt": "2026-11-14T00:00:00.000Z",
        "sourceUrl": "https://morth.nic.in"
      },
      {
        "stepNumber": 4,
        "title": "Take the Computerized Learner Test (LL Test)",
        "description": "Take the 15-question test on traffic signs and road safety. You have 30 seconds per question; score at least 11/15 (60%) to pass. On passing, your digital learner licence (Form 3) is generated instantly.",
        "where": "Online from home (for Aadhaar e-KYC applicants) or at designated RTO Sub-Center",
        "estimatedTime": "20 minutes",
        "status": "PUBLISHED",
        "lastVerifiedAt": "2026-11-14T00:00:00.000Z",
        "sourceUrl": "https://sarathi.parivahan.gov.in"
      }
    ],
    "documentRequirements": [
      {
        "name": "Proof of Age (Aadhaar / 10th Marksheet / Birth Certificate)",
        "description": "Any officially valid document displaying your full date of birth (DD/MM/YYYY).",
        "requirementType": "required",
        "copiesHint": "Original + 1 self-attested photocopy",
        "status": "PUBLISHED",
        "lastVerifiedAt": "2026-11-14T00:00:00.000Z",
        "sourceUrl": "https://morth.nic.in"
      },
      {
        "name": "Proof of Current Residential Address",
        "description": "Aadhaar Card, Voter ID, Electricity Bill, or registered rent agreement in applicant's name.",
        "requirementType": "required",
        "copiesHint": "Original + 1 photocopy",
        "status": "PUBLISHED",
        "lastVerifiedAt": "2026-11-14T00:00:00.000Z",
        "sourceUrl": "https://morth.nic.in"
      },
      {
        "name": "Form 1 Physical Fitness Self-Declaration",
        "description": "Online self-declaration form confirming you have no epilepsy, night blindness, or loss of limbs.",
        "requirementType": "required",
        "copiesHint": "Filled online during application",
        "status": "PUBLISHED",
        "lastVerifiedAt": "2026-11-14T00:00:00.000Z",
        "sourceUrl": "https://sarathi.parivahan.gov.in"
      },
      {
        "name": "Form 1A Medical Fitness Certificate",
        "description": "Medical certificate signed by a registered MBBS medical practitioner with doctor's registration seal.",
        "requirementType": "conditional",
        "copiesHint": "Original doctor signed copy",
        "appliesWhen": {
          "or": [{ "applicantAge": { "gte": 40 } }, { "licenceCategory": "commercial_transport" }]
        },
        "status": "PUBLISHED",
        "lastVerifiedAt": "2026-11-14T00:00:00.000Z",
        "sourceUrl": "https://morth.nic.in"
      }
    ],
    "fees": [
      {
        "label": "Learner's Licence Application Processing Fee",
        "amount": 150,
        "currency": "INR",
        "paymentMode": "online",
        "rulesReference": "Central Motor Vehicles Rules (CMVR), Rule 32",
        "status": "PUBLISHED",
        "lastVerifiedAt": "2026-11-14T00:00:00.000Z",
        "sourceUrl": "https://morth.nic.in"
      },
      {
        "label": "Computerized LL Test Fee",
        "amount": 50,
        "currency": "INR",
        "paymentMode": "online",
        "rulesReference": "Central Motor Vehicles Rules (CMVR), Rule 32",
        "status": "PUBLISHED",
        "lastVerifiedAt": "2026-11-14T00:00:00.000Z",
        "sourceUrl": "https://morth.nic.in"
      }
    ],
    "officialLinks": [
      {
        "label": "Sarathi Parivahan Citizen Portal",
        "url": "https://sarathi.parivahan.gov.in",
        "isPrimary": true,
        "department": "Ministry of Road Transport and Highways (MoRTH)",
        "portalName": "Parivahan Sewa",
        "status": "PUBLISHED",
        "lastVerifiedAt": "2026-11-14T00:00:00.000Z",
        "sourceUrl": "https://parivahan.gov.in"
      }
    ],
    "faqItems": [
      {
        "question": "How long is a Learner's Licence valid in India?",
        "answer": "A Learner's Licence is valid for exactly 6 months (180 days) from the date of issue across all states and Union Territories.",
        "status": "PUBLISHED",
        "lastVerifiedAt": "2026-11-14T00:00:00.000Z",
        "sourceUrl": "https://parivahan.gov.in"
      },
      {
        "question": "Can I drive alone on public roads with a Learner's Licence?",
        "answer": "No. You must be accompanied by an instructor or an individual who holds a valid permanent driving licence for that vehicle category, and your vehicle must display red 'L' plates on front and back.",
        "status": "PUBLISHED",
        "lastVerifiedAt": "2026-11-14T00:00:00.000Z",
        "sourceUrl": "https://morth.nic.in"
      }
    ],
    "rejectionReasons": [
      {
        "title": "Name or Date of Birth Mismatch on Aadhaar",
        "description": "If the name on your 10th marksheet or birth certificate does not match the name returned by Aadhaar e-KYC, the application is halted.",
        "solution": "Update your Aadhaar details first at an Aadhaar Seva Kendra, or apply via non-Aadhaar mode with physical document scrutiny at the RTO.",
        "status": "PUBLISHED",
        "lastVerifiedAt": "2026-11-14T00:00:00.000Z",
        "sourceUrl": "https://sarathi.parivahan.gov.in"
      }
    ],
    "sourceRefs": [
      {
        "title": "The Motor Vehicles (Amendment) Act, 2019",
        "actOrRuleNumber": "Section 8 and 9",
        "issuingAuthority": "Parliament of India / MoRTH",
        "url": "https://morth.nic.in",
        "status": "PUBLISHED",
        "lastVerifiedAt": "2026-11-14T00:00:00.000Z"
      }
    ]
  },
  "states": {
    "GJ": {
      "title": "How to Apply for Learner's Licence in Gujarat (2026)",
      "summary": "Gujarat offers 100% contactless online Learner Licence services with home-based computerized testing through Sarathi Parivahan and Digital Gujarat.",
      "estimatedTime": "7-15 days"
    }
  }
}
```

---

## State Overrides Mechanism

When a citizen visits `/[task]/[state]` (e.g. `/driving-licence-learner/gujarat`):

1. The system loads `src/content/tasks/<task>.json`.
2. The `national` variant serves as the baseline data.
3. If an entry exists under `states[stateCode]`, its fields override the corresponding baseline properties.
4. Deep lists (such as `fees` or `steps`) replace or augment the baseline, allowing state-specific fee revisions and local portal redirects without duplicating identical checklists.
