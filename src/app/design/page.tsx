"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";
import { Select } from "@/components/ui/Select";
import { SearchField } from "@/components/ui/SearchField";
import { Card, IconCard, CardTitle, CardBody, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Chip } from "@/components/ui/Chip";
import { Callout } from "@/components/ui/Callout";
import { StepList } from "@/components/ui/StepList";
import { ChecklistItem } from "@/components/ui/ChecklistItem";
import { Accordion, AccordionItem, FaqList } from "@/components/ui/Accordion";
import { Tabs } from "@/components/ui/Tabs";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Skeleton, SkeletonText, SkeletonCard } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Prose } from "@/components/ui/Prose";
import { CATEGORY_THEMES } from "@/lib/icons";
import {
  HeroIllustration,
  EmptyIllustration,
  SuccessIllustration,
} from "@/components/illustrations";

export default function DesignShowcasePage() {
  // Interactive state hooks
  const [searchValue, setSearchValue] = React.useState("");
  const [activeChip, setActiveChip] = React.useState("all");
  const [activeTab, setActiveTab] = React.useState("docs");
  const [activeMode, setActiveMode] = React.useState("online");
  const [activeLang, setActiveLang] = React.useState("en");

  // Checklist items completion state
  const [checkedDocs, setCheckedDocs] = React.useState<Record<string, boolean>>({
    doc1: true,
    doc2: false,
    doc3: false,
  });

  const toggleDoc = (id: string) => {
    setCheckedDocs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const sampleFaqs = [
    {
      question: "Can I apply for a driving licence online in Gujarat without visiting RTO?",
      answer:
        "Yes! Under Gujarat's faceless e-KYC service on the Parivahan Sarathi portal, you can complete Aadhaar e-KYC, pay the ₹200 fee, and take the online learner test from home. You only visit the physical RTO for the permanent driving track test after 30 days.",
    },
    {
      question: "What is the official government fee for a Learner's Licence in 2026?",
      answer:
        "The official fee is strictly ₹200 (₹150 application processing + ₹50 computerized test fee) under Rule 32 of the Central Motor Vehicles Rules. Never pay extra to middlemen or agents.",
    },
    {
      question: "How long is a Learner's Licence (LLR) valid across India?",
      answer:
        "A Learner's Licence is valid for exactly 6 months (180 days) across all states and Union Territories in India. You can apply for a permanent licence 30 days after your LL is issued.",
    },
  ];

  const sampleSteps = [
    {
      id: "step-1",
      stepNumber: 1,
      title: "Submit Online Application via Sarathi Parivahan",
      where: "Official Sarathi Portal (parivahan.gov.in)",
      time: "15 minutes",
      description:
        "Visit the official Ministry of Road Transport portal. Select Gujarat, choose 'Apply for Learner Licence', and enter your Aadhaar number for instant e-KYC identity verification.",
      officialLink: {
        label: "Open Parivahan Sarathi Portal",
        href: "https://sarathi.parivahan.gov.in",
      },
      isDone: true,
    },
    {
      id: "step-2",
      stepNumber: 2,
      title: "Upload Documents & Fee Payment (₹200)",
      where: "Online Payment Gateway (Debit/UPI)",
      time: "10 minutes",
      description:
        "Upload scanned self-attested copies of your Age Proof (Aadhaar/10th Marksheet) and Address Proof. Pay the ₹200 statutory government fee via SBI ePay or UPI.",
      callout: {
        variant: "warning" as const,
        title: "Transaction Receipt Mandatory",
        content:
          "Save and print your e-receipt (Form 2) and acknowledgment slip. You must carry this if visiting the RTO.",
      },
    },
    {
      id: "step-3",
      stepNumber: 3,
      title: "Appear for Online Computerized Traffic Rule Test",
      where: "Online from Home (or RTO Sub-Center)",
      time: "20 minutes (15 questions)",
      description:
        "Take the 15-question multiple choice test on road traffic signs, signals, and driver duties. You need 11 correct answers to pass. Your digital learner licence is generated immediately upon passing.",
    },
  ];

  return (
    <div className="bg-background text-text min-h-screen">
      {/* Header Banner */}
      <div className="border-border bg-surface border-b px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-chip bg-accent px-2.5 py-0.5 text-xs font-bold text-white">
                  Design System v1.0
                </span>
                <span className="rounded-chip bg-surface-alt text-muted px-2.5 py-0.5 text-xs font-medium">
                  Light Theme Only • WCAG AA 4.5:1+
                </span>
              </div>
              <h1 className="text-h1 text-text font-black tracking-tight">
                Design System Catalog & UI Showcase
              </h1>
              <p className="text-body text-muted mt-1 max-w-2xl">
                Visual index of all design tokens, typography scales, civic components, cards,
                states, and SVG illustrations across desktop and mobile screens.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button href="#categories" variant="secondary" size="md">
                Jump to Categories
              </Button>
              <Button href="#illustrations" variant="primary" size="md">
                Illustrations
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl space-y-16 px-4 py-12 sm:px-6 lg:px-8">
        {/* Section 1: Color Tokens */}
        <section>
          <div className="border-border mb-6 border-b pb-3">
            <h2 className="text-h2 text-text font-bold">1. Light Color Tokens & Contrast</h2>
            <p className="text-muted text-sm">
              Strict light-only palette. Dark mode forced off via meta tag and CSS.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4 lg:grid-cols-6">
            <div className="border-border rounded-xl border bg-white p-3 shadow-xs">
              <div className="border-border mb-2 h-10 w-full rounded-lg border bg-white" />
              <div className="font-bold">Background</div>
              <div className="text-muted font-mono">#FFFFFF</div>
            </div>
            <div className="border-border rounded-xl border bg-white p-3 shadow-xs">
              <div className="border-border mb-2 h-10 w-full rounded-lg border bg-[#F7F9FC]" />
              <div className="font-bold">Surface</div>
              <div className="text-muted font-mono">#F7F9FC</div>
            </div>
            <div className="border-border rounded-xl border bg-white p-3 shadow-xs">
              <div className="border-border mb-2 h-10 w-full rounded-lg border bg-[#EEF3FB]" />
              <div className="font-bold">Surface Alt</div>
              <div className="text-muted font-mono">#EEF3FB</div>
            </div>
            <div className="border-border rounded-xl border bg-white p-3 shadow-xs">
              <div className="mb-2 h-10 w-full rounded-lg bg-[#2563EB]" />
              <div className="text-primary font-bold">Primary Blue</div>
              <div className="text-muted font-mono">#2563EB</div>
            </div>
            <div className="border-border rounded-xl border bg-white p-3 shadow-xs">
              <div className="mb-2 h-10 w-full rounded-lg bg-[#F59E0B]" />
              <div className="text-accent font-bold">Saffron Accent</div>
              <div className="text-muted font-mono">#F59E0B</div>
            </div>
            <div className="border-border rounded-xl border bg-white p-3 shadow-xs">
              <div className="mb-2 h-10 w-full rounded-lg bg-[#15803D]" />
              <div className="text-success font-bold">Success Green</div>
              <div className="text-muted font-mono">#15803D</div>
            </div>
            <div className="border-border rounded-xl border bg-white p-3 shadow-xs">
              <div className="mb-2 h-10 w-full rounded-lg bg-[#B45309]" />
              <div className="text-warning font-bold">Warning Amber</div>
              <div className="text-muted font-mono">#B45309</div>
            </div>
            <div className="border-border rounded-xl border bg-white p-3 shadow-xs">
              <div className="mb-2 h-10 w-full rounded-lg bg-[#B91C1C]" />
              <div className="text-danger font-bold">Danger Red</div>
              <div className="text-muted font-mono">#B91C1C</div>
            </div>
            <div className="border-border rounded-xl border bg-white p-3 shadow-xs">
              <div className="mb-2 h-10 w-full rounded-lg bg-[#0F172A]" />
              <div className="font-bold">Text Primary</div>
              <div className="text-muted font-mono">#0F172A (14.2:1)</div>
            </div>
            <div className="border-border rounded-xl border bg-white p-3 shadow-xs">
              <div className="mb-2 h-10 w-full rounded-lg bg-[#475569]" />
              <div className="text-muted font-bold">Muted Text</div>
              <div className="text-muted font-mono">#475569 (5.4:1)</div>
            </div>
            <div className="border-border rounded-xl border bg-white p-3 shadow-xs">
              <div className="border-primary/20 mb-2 h-10 w-full rounded-lg border bg-[#EAF1FF]" />
              <div className="text-primary font-bold">Primary Soft</div>
              <div className="text-muted font-mono">#EAF1FF</div>
            </div>
            <div className="border-border rounded-xl border bg-white p-3 shadow-xs">
              <div className="border-accent/20 mb-2 h-10 w-full rounded-lg border bg-[#FFF4DB]" />
              <div className="text-accent font-bold">Accent Soft</div>
              <div className="text-muted font-mono">#FFF4DB</div>
            </div>
          </div>
        </section>

        {/* Section 2: Buttons */}
        <section>
          <div className="border-border mb-6 border-b pb-3">
            <h2 className="text-h2 text-text font-bold">2. Buttons & Touch Targets</h2>
            <p className="text-muted text-sm">
              All buttons have a minimum 44px height for mobile ergonomics, visible focus rings, and
              loading states.
            </p>
          </div>

          <div className="space-y-6">
            {/* Variants */}
            <div>
              <h3 className="text-muted mb-3 text-sm font-semibold tracking-wider uppercase">
                Variants (Medium - 44px)
              </h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary">Primary Action</Button>
                <Button variant="secondary">Secondary Action</Button>
                <Button variant="ghost">Ghost Action</Button>
                <Button variant="danger">Danger Action</Button>
                <Button variant="link" href="/guides">
                  Link Button →
                </Button>
              </div>
            </div>

            {/* Sizes & States */}
            <div>
              <h3 className="text-muted mb-3 text-sm font-semibold tracking-wider uppercase">
                Sizes & Interactive States
              </h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="lg" variant="primary">
                  Large Size (52px)
                </Button>
                <Button size="md" variant="primary" isLoading>
                  Loading State
                </Button>
                <Button size="md" variant="secondary" disabled>
                  Disabled State
                </Button>
                <Button
                  size="md"
                  variant="primary"
                  leftIcon={
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  }
                >
                  With Left Icon
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Form Controls */}
        <section>
          <div className="border-border mb-6 border-b pb-3">
            <h2 className="text-h2 text-text font-bold">3. Form Controls & Inputs</h2>
            <p className="text-muted text-sm">
              Labels always placed above input fields (never placeholder-only). 48px height, 10px
              border radius.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <TextInput
              label="Applicant Full Name"
              placeholder="e.g. Rahul Ramesh Patel"
              helperText="Must match exact spelling on your Aadhaar card."
              required
            />

            <Select
              label="Select State of Residence"
              helperText="Determines applicable RTO rules and portal links."
              options={[
                { label: "Gujarat", value: "GJ" },
                { label: "Maharashtra", value: "MH" },
                { label: "Delhi", value: "DL" },
                { label: "Karnataka", value: "KA" },
              ]}
              defaultValue="GJ"
            />

            <SearchField
              label="Search Procedures"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onClear={() => setSearchValue("")}
              placeholder="e.g. driving licence, PAN..."
              helperText="Type to filter across 200+ procedures."
            />
          </div>

          {/* Error state sample */}
          <div className="mt-4 max-w-md">
            <TextInput
              label="Aadhaar Number"
              placeholder="12-digit Aadhaar number"
              defaultValue="1234 5678"
              error="Aadhaar number must contain exactly 12 numerical digits."
            />
          </div>
        </section>

        {/* Section 4: Badges & Chips */}
        <section>
          <div className="border-border mb-6 border-b pb-3">
            <h2 className="text-h2 text-text font-bold">4. Badges & Filter Chips</h2>
            <p className="text-muted text-sm">
              Every status badge pairs color with text or icons. Filter chips feature active states
              and 44px tap areas.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-muted mb-3 text-sm font-semibold tracking-wider uppercase">
                Status Badges
              </h3>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="verified" date="14 Nov 2026" />
                <Badge variant="official" />
                <Badge variant="needs-update" date="Fee revision pending" />
                <Badge variant="new">New Guide</Badge>
                <Badge variant="difficulty" difficulty="easy" />
                <Badge variant="difficulty" difficulty="medium" />
                <Badge variant="difficulty" difficulty="hard" />
              </div>
            </div>

            <div>
              <h3 className="text-muted mb-3 text-sm font-semibold tracking-wider uppercase">
                Interactive Filter Chips
              </h3>
              <div className="flex flex-wrap items-center gap-2.5">
                <Chip
                  selected={activeChip === "all"}
                  onClick={() => setActiveChip("all")}
                  count={30}
                >
                  All Procedures
                </Chip>
                <Chip
                  selected={activeChip === "vehicles"}
                  onClick={() => setActiveChip("vehicles")}
                  count={12}
                >
                  Vehicles & RTO
                </Chip>
                <Chip
                  selected={activeChip === "identity"}
                  onClick={() => setActiveChip("identity")}
                  count={8}
                >
                  Identity & PAN
                </Chip>
                <Chip
                  selected={activeChip === "gujarat"}
                  onClick={() => setActiveChip("gujarat")}
                  onRemove={() => setActiveChip("all")}
                >
                  Gujarat State
                </Chip>
                <Chip disabled count={0}>
                  Archived Rules
                </Chip>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4B: Card Primitives */}
        <section>
          <div className="border-border mb-6 border-b pb-3">
            <h2 className="text-h2 text-text font-bold">4B. Card Components & Category Tiles</h2>
            <p className="text-muted text-sm">
              Standard 12px radius cards with soft shadows, hover lift, and IconCard category tiles.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card hoverLift padding="md">
              <CardTitle>Standard Info Card</CardTitle>
              <CardBody>
                12px border radius, 1px border, and soft shadow with hover elevation effect for
                card-based navigation.
              </CardBody>
              <CardFooter>
                <span className="text-primary text-xs font-semibold">View details →</span>
              </CardFooter>
            </Card>

            <IconCard
              icon={
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.1 11.1 2 11.5 2 12v4c0 .6.4 1 1 1h2" />
                  <circle cx="7" cy="17" r="2" />
                  <path d="M9 17h6" />
                  <circle cx="17" cy="17" r="2" />
                </svg>
              }
              iconBgColor="bg-accent-soft text-accent"
              title="Driving Licence Renewal"
              description="Step-by-step renewal process under Gujarat RTO rules with zero agent fees."
              href="/driving-licence-learner"
              badge="Gujarat"
            />

            <IconCard
              icon={
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="4" width="18" height="16" rx="3" />
                  <circle cx="9" cy="10" r="2" />
                  <line x1="15" y1="8" x2="17" y2="8" />
                  <line x1="15" y1="12" x2="17" y2="12" />
                  <line x1="7" y1="16" x2="17" y2="16" />
                </svg>
              }
              iconBgColor="bg-primary-soft text-primary"
              title="New PAN Application"
              description="Get instant paperless e-PAN within 10 minutes using Aadhaar e-KYC."
              href="/passport-renewal"
              badge="National"
            />
          </div>
        </section>

        {/* Section 5: Callout Primitives */}
        <section>
          <div className="border-border mb-6 border-b pb-3">
            <h2 className="text-h2 text-text font-bold">5. Callouts & Advisory Alerts</h2>
            <p className="text-muted text-sm">
              Semantic advisory banners used throughout checklists for important tips, warnings, and
              rules.
            </p>
          </div>

          <div className="space-y-4">
            <Callout variant="tip" title="Helpful Tip: Slot Booking Timing">
              Appointment slots on the Sarathi Parivahan portal open daily at 10:00 AM IST. Log in 5
              minutes early to secure your preferred date.
            </Callout>

            <Callout variant="important" title="Mandatory Rule: Carry Physical Originals">
              You must carry original documents along with one set of self-attested photocopies to
              the RTO. Digital copies in DigiLocker are accepted for road inspections, but initial
              granting requires original physical verification.
            </Callout>

            <Callout variant="warning" title="Anti-Fraud Warning: Never Pay Middlemen">
              The statutory government fee is strictly ₹200. Do not pay unauthorized agents or touts
              outside the RTO premise.
            </Callout>

            <Callout variant="success" title="Instant Online Verification Eligible">
              Applicants with Aadhaar-linked mobile numbers can complete the entire application and
              online learner test from home without visiting the RTO.
            </Callout>
          </div>
        </section>

        {/* Section 6: Step List & Checklist Items */}
        <section>
          <div className="border-border mb-6 border-b pb-3">
            <h2 className="text-h2 text-text font-bold">
              6. Step List & Checklist Item Components
            </h2>
            <p className="text-muted text-sm">
              Numbered steps connected by vertical lines, with interactive completion toggles and
              collapsible document helpers.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* StepList Showcase */}
            <div className="rounded-card border-border shadow-soft-sm border bg-white p-6">
              <h3 className="text-h3 text-text mb-4 font-bold">Procedure Steps</h3>
              <StepList steps={sampleSteps} />
            </div>

            {/* Checklist Items Showcase */}
            <div className="rounded-card border-border shadow-soft-sm space-y-4 border bg-white p-6">
              <h3 className="text-h3 text-text mb-2 font-bold">Required Documents</h3>
              <p className="text-muted mb-4 text-xs">
                Click checkbox to mark done. Click &quot;What is this?&quot; to expand help.
              </p>

              <ChecklistItem
                id="doc1"
                name="Proof of Age (Aadhaar Card, Birth Certificate, or 10th Marksheet)"
                requirementType="required"
                copiesHint="Original + 1 self-attested photocopy"
                description="Document must clearly show your full date of birth (DD/MM/YYYY). For school marksheets, ensure board name and candidate name match exactly."
                checked={checkedDocs.doc1}
                onChange={() => toggleDoc("doc1")}
              />

              <ChecklistItem
                id="doc2"
                name="Proof of Current Address (Electricity Bill or Rent Agreement)"
                requirementType="required"
                copiesHint="Original + 1 photocopy"
                description="Electricity bill must not be older than 3 months. If using a registered rent agreement, it must have a minimum 1-year validity."
                checked={checkedDocs.doc2}
                onChange={() => toggleDoc("doc2")}
              />

              <ChecklistItem
                id="doc3"
                name="Form 1A Medical Fitness Certificate"
                requirementType="conditional"
                copiesHint="Original doctor signed certificate"
                description="Mandatory only if the applicant is over 40 years of age or applying for a commercial transport licence. Must be signed by a registered MBBS medical practitioner."
                checked={checkedDocs.doc3}
                onChange={() => toggleDoc("doc3")}
              />
            </div>
          </div>
        </section>

        {/* Section 7: Accordion & FAQ */}
        <section>
          <div className="border-border mb-6 border-b pb-3">
            <h2 className="text-h2 text-text font-bold">7. Accordion & FAQ List</h2>
            <p className="text-muted text-sm">
              Accessible accordion headers with 24px plus/minus icons, smooth height transitions,
              and one-open-at-a-time control.
            </p>
          </div>

          <div className="grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-card border-border shadow-soft-sm border bg-white p-6">
              <h3 className="text-text mb-4 text-base font-bold">Built-in FaqList Component</h3>
              <FaqList items={sampleFaqs} />
            </div>

            <div className="rounded-card border-border shadow-soft-sm border bg-white p-6">
              <h3 className="text-text mb-4 text-base font-bold">
                Custom Accordion with Multi-Open
              </h3>
              <Accordion onlyOneOpen={false}>
                <AccordionItem id="acc-1" title="DigiLocker Validity for Traffic Police">
                  Under the revised Motor Vehicles Act, showing documents via DigiLocker or
                  mParivahan is legally equivalent to physical original documents during road
                  traffic checks.
                </AccordionItem>
                <AccordionItem id="acc-2" title="Grace Period for Expired Licence">
                  You have a 1-year grace period after expiry to renew your driving licence without
                  having to re-take the driving test.
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>

        {/* Section 8: Tabs & Segmented Control */}
        <section>
          <div className="border-border mb-6 border-b pb-3">
            <h2 className="text-h2 text-text font-bold">8. Tabs & Segmented Controls</h2>
            <p className="text-muted text-sm">
              Horizontal scroll snap on mobile, visible focus indicators, and keyboard arrow
              navigation.
            </p>
          </div>

          <div className="max-w-3xl space-y-6">
            <div>
              <h3 className="text-muted mb-3 text-sm font-semibold tracking-wider uppercase">
                Segmented Control (Online vs Offline / Language)
              </h3>
              <div className="flex flex-wrap gap-4">
                <SegmentedControl
                  value={activeMode}
                  onChange={(v) => setActiveMode(v)}
                  options={[
                    { value: "online", label: "Online (Aadhaar e-KYC)" },
                    { value: "offline", label: "Offline (RTO Visit)" },
                  ]}
                />

                <SegmentedControl
                  value={activeLang}
                  onChange={(v) => setActiveLang(v)}
                  options={[
                    { value: "en", label: "English" },
                    { value: "hi", label: "हिन्दी" },
                    { value: "gu", label: "ગુજરાતી" },
                  ]}
                />
              </div>
            </div>

            <div>
              <h3 className="text-muted mb-3 text-sm font-semibold tracking-wider uppercase">
                Guide Section Tabs (Underline Variant)
              </h3>
              <Tabs
                activeId={activeTab}
                onChange={(id) => setActiveTab(id)}
                items={[
                  {
                    id: "docs",
                    label: "1. Documents (3)",
                    content: (
                      <div className="border-border bg-surface text-text rounded-xl border p-4 text-sm">
                        Tab Content: View all mandatory and conditional documents.
                      </div>
                    ),
                  },
                  {
                    id: "steps",
                    label: "2. Step-by-Step (3)",
                    content: (
                      <div className="border-border bg-surface text-text rounded-xl border p-4 text-sm">
                        Tab Content: Complete procedure breakdown with direct portal links.
                      </div>
                    ),
                  },
                  {
                    id: "fees",
                    label: "3. Verified Fees (₹200)",
                    content: (
                      <div className="border-border bg-surface text-text rounded-xl border p-4 text-sm">
                        Tab Content: Statutory government fees breakdown.
                      </div>
                    ),
                  },
                  {
                    id: "faqs",
                    label: "4. FAQs (3)",
                    content: (
                      <div className="border-border bg-surface text-text rounded-xl border p-4 text-sm">
                        Tab Content: Frequently asked questions by citizens.
                      </div>
                    ),
                  },
                ]}
              />
            </div>
          </div>
        </section>

        {/* Section 9: Breadcrumbs */}
        <section>
          <div className="border-border mb-6 border-b pb-3">
            <h2 className="text-h2 text-text font-bold">9. Breadcrumbs with Schema</h2>
            <p className="text-muted text-sm">
              Displays hierarchy with middle item truncation on mobile and JSON-LD BreadcrumbList
              output. Last item is plain text.
            </p>
          </div>

          <div className="rounded-card border-border shadow-soft-sm max-w-3xl space-y-4 border bg-white p-6">
            <div>
              <span className="text-muted mb-2 block text-xs font-semibold tracking-wider uppercase">
                4-Level Hierarchy (Home &gt; Category &gt; Task &gt; State)
              </span>
              <Breadcrumbs
                items={[
                  { name: "Vehicles & Transport", href: "/category/vehicles" },
                  { name: "Learner's Licence", href: "/driving-licence-learner" },
                  { name: "Gujarat Variant (2026 Rules)" },
                ]}
              />
            </div>
          </div>
        </section>

        {/* Section 10: Feedback & Loading States */}
        <section>
          <div className="border-border mb-6 border-b pb-3">
            <h2 className="text-h2 text-text font-bold">10. Loading, Empty & Error States</h2>
            <p className="text-muted text-sm">
              Next.js feedback primitives with actionable messages.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Skeletons */}
            <div className="space-y-4">
              <h3 className="text-muted text-sm font-semibold tracking-wider uppercase">
                Card & Text Skeletons
              </h3>
              <SkeletonCard />
              <div className="border-border space-y-3 rounded-xl border bg-white p-4">
                <Skeleton className="h-5 w-1/3" />
                <SkeletonText lines={3} />
              </div>
            </div>

            {/* Empty State */}
            <div>
              <h3 className="text-muted mb-3 text-sm font-semibold tracking-wider uppercase">
                Empty State
              </h3>
              <EmptyState
                title="No Guides Found"
                description="We could not find any government service matching your query."
                actionText="Clear Search"
                onAction={() => setSearchValue("")}
              />
            </div>

            {/* Error State */}
            <div>
              <h3 className="text-muted mb-3 text-sm font-semibold tracking-wider uppercase">
                Error State
              </h3>
              <ErrorState
                title="Failed to Load"
                description="Unable to fetch official fee schedule. Please retry."
                reset={() => alert("Retrying action...")}
              />
            </div>
          </div>
        </section>

        {/* Section 11: 10 Core Category Themes (Prompt 24) */}
        <section id="categories">
          <div className="border-border mb-6 border-b pb-3">
            <h2 className="text-h2 text-text font-bold">
              11. 10 Core Category Themes & Lucide Icons
            </h2>
            <p className="text-muted text-sm">
              Every civic category is mapped to a designated Lucide icon and soft light background
              badge.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {Object.values(CATEGORY_THEMES).map((cat) => {
              const IconComponent = cat.icon;
              return (
                <div
                  key={cat.slug}
                  className="rounded-card border-border shadow-soft-sm hover:shadow-soft-md flex flex-col items-center border bg-white p-5 text-center transition-all hover:-translate-y-0.5"
                >
                  <div
                    className={`mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border ${cat.bgColor} ${cat.textColor} ${cat.borderColor}`}
                  >
                    <IconComponent className="h-7 w-7" />
                  </div>
                  <h4 className="text-text text-sm font-bold">{cat.name}</h4>
                  <span className="text-muted mt-1 font-mono text-[11px]">{cat.slug}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 12: 3 Flat SVG Illustrations (Prompt 24) */}
        <section id="illustrations">
          <div className="border-border mb-6 border-b pb-3">
            <h2 className="text-h2 text-text font-bold">
              12. Friendly Flat SVG Illustrations (Blue & Saffron Palette)
            </h2>
            <p className="text-muted text-sm">
              Custom responsive vector graphics created for Hero banner, Empty search results, and
              Task success completion.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Hero Illustration */}
            <div className="rounded-card border-border shadow-soft-sm flex flex-col items-center border bg-white p-6 text-center">
              <span className="text-muted mb-4 text-xs font-semibold tracking-wider uppercase">
                Hero Section Graphic
              </span>
              <HeroIllustration className="max-w-[260px]" />
              <p className="text-muted mt-4 text-xs">
                Clipboard, checkmarks, and official verified seal.
              </p>
            </div>

            {/* Empty State Illustration */}
            <div className="rounded-card border-border shadow-soft-sm flex flex-col items-center border bg-white p-6 text-center">
              <span className="text-muted mb-4 text-xs font-semibold tracking-wider uppercase">
                Empty / Not Found Graphic
              </span>
              <EmptyIllustration className="max-w-[220px]" />
              <p className="text-muted mt-4 text-xs">
                Magnifying glass searching through civic folder.
              </p>
            </div>

            {/* Success Illustration */}
            <div className="rounded-card border-border shadow-soft-sm flex flex-col items-center border bg-white p-6 text-center">
              <span className="text-muted mb-4 text-xs font-semibold tracking-wider uppercase">
                Success & Verified Graphic
              </span>
              <SuccessIllustration className="max-w-[220px]" />
              <p className="text-muted mt-4 text-xs">
                Approved certificate with green shield and confetti.
              </p>
            </div>
          </div>
        </section>

        {/* Section 13: Multilingual Typography & Prose Scale */}
        <section>
          <div className="border-border mb-6 border-b pb-3">
            <h2 className="text-h2 text-text font-bold">13. Typography Scale & Prose Wrapper</h2>
            <p className="text-muted text-sm">
              70-character line width constraint, display swap fonts (Inter, Noto Sans Devanagari,
              Noto Sans Gujarati).
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-card border-border shadow-soft-sm border bg-white p-6">
              <span className="text-primary mb-2 block text-xs font-semibold tracking-wider uppercase">
                English (Inter)
              </span>
              <Prose lang="en">
                <h3 className="text-h3">Applying for Official Documents</h3>
                <p className="text-body">
                  Always verify exact prerequisites on official government portals before visiting
                  sub-registrar or RTO centers.
                </p>
              </Prose>
            </div>

            <div className="rounded-card border-border shadow-soft-sm border bg-white p-6">
              <span className="text-accent mb-2 block text-xs font-semibold tracking-wider uppercase">
                Hindi / हिन्दी (Noto Sans Devanagari)
              </span>
              <Prose lang="hi">
                <h3 className="text-h3">नागरिक दस्तावेज़ प्रक्रिया</h3>
                <p className="text-body">
                  सरकारी सेवाओं के लिए हमेशा अधिकृत पोर्टल पर दी गई नियमावली और निर्धारित शुल्क की ही पुष्टि
                  करें।
                </p>
              </Prose>
            </div>

            <div className="rounded-card border-border shadow-soft-sm border bg-white p-6">
              <span className="text-success mb-2 block text-xs font-semibold tracking-wider uppercase">
                Gujarati / ગુજરાતી (Noto Sans Gujarati)
              </span>
              <Prose lang="gu">
                <h3 className="text-h3">ગુજરાત સરકારી સેવાઓ</h3>
                <p className="text-body">
                  ડ્રાઇવિંગ લાયસન્સ, રેશન કાર્ડ અને આવકના દાખલા માટેની તમામ સત્તાવાર માહિતી અને ફી વિગતો.
                </p>
              </Prose>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
