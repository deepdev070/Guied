"use client";

import { useState } from "react";
import Link from "next/link";
import { Prose } from "@/components/ui/Prose";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle, CardBody, CardFooter, IconCard } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Chip } from "@/components/ui/Chip";
import { Callout } from "@/components/ui/Callout";
import { StepList, StepItem } from "@/components/ui/StepList";
import { ChecklistItem } from "@/components/ui/ChecklistItem";
import { TextInput } from "@/components/ui/TextInput";
import { Select } from "@/components/ui/Select";
import { SearchField } from "@/components/ui/SearchField";

const sampleStateOptions = [
  { value: "maharashtra", label: "Maharashtra" },
  { value: "delhi", label: "Delhi (NCT)" },
  { value: "karnataka", label: "Karnataka" },
  { value: "gujarat", label: "Gujarat" },
  { value: "tamil-nadu", label: "Tamil Nadu" },
  { value: "uttar-pradesh", label: "Uttar Pradesh" },
];

const sampleSteps: StepItem[] = [
  {
    stepNumber: 1,
    title: "Fill Application Form Online",
    description:
      "Navigate to the official Sarathi Parivahan portal, select your State, and submit the online application with Aadhaar authentication.",
    where: "Online (Parivahan Sewa)",
    timeEstimate: "15-20 Mins",
    link: {
      href: "https://parivahan.gov.in",
      label: "Open Parivahan Portal",
      isExternal: true,
    },
  },
  {
    stepNumber: 2,
    title: "Upload Documents & Fee Payment",
    description:
      "Upload scanned copies of your age proof and current address proof. Complete the government treasury payment of ₹200.",
    where: "Online Payment Gateway",
    timeEstimate: "5 Mins",
    callout: {
      variant: "tip",
      title: "Keep Scans Under 200 KB",
      content:
        "The government server rejects uploads larger than 200 KB. Save in clear PDF or JPG format before proceeding.",
    },
  },
  {
    stepNumber: 3,
    title: "Take Online Learner Licence Test",
    description:
      "Appear for the 15-question traffic signs and road safety test from home (or at your local RTO counter). 60% passing score is required.",
    where: "Online / Home Test",
    timeEstimate: "10 Mins",
  },
  {
    stepNumber: 4,
    title: "Download Learner's Licence Immediately",
    description:
      "Upon passing the test, your official Learner's Licence PDF is generated instantly with QR-code verification. Valid across India for 6 months.",
    where: "Instant PDF Download",
    timeEstimate: "Immediate",
  },
];

export default function TypographyShowcasePage() {
  const [activeCategory, setActiveCategory] = useState("all");
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8 sm:px-6">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="text-small text-muted flex items-center gap-2">
          <li>
            <Link href="/" className="hover:text-primary focus:underline">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-text font-medium">Design System Primitives</li>
        </ol>
      </nav>

      {/* Header */}
      <header className="rounded-card border-border bg-background shadow-soft-sm mb-10 border p-6 sm:p-8">
        <span className="rounded-chip border-primary/20 bg-primary-soft text-small text-primary border px-3 py-1 font-semibold">
          Design System Primitives
        </span>
        <h1 className="text-h1 text-text mt-3">UI Components & Typography Showcase</h1>
        <p className="text-body text-muted mt-2">
          Testing font rendering, Button primitives, and accessible Form Controls (TextInput,
          Select, SearchField) with 48px heights, clear labels, error states, and visible focus
          rings.
        </p>
      </header>

      {/* Form Controls Showcase */}
      <section className="rounded-card border-border bg-background shadow-soft-sm mb-10 border p-6 sm:p-8">
        <h2 className="text-h2 text-text mb-2">Form Controls (TextInput, Select, SearchField)</h2>
        <p className="text-body text-muted mb-8">
          Features: 48px height, accessible labels above field, helper text, error text with icon,
          1px light borders with primary focus rings, and clear (x) buttons.
        </p>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* 1. SearchField with Clear Button */}
          <div className="md:col-span-2">
            <SearchField
              label="Search Paperwork Service or Portal"
              defaultValue="Driving Licence"
              helperText="Try typing or clicking the (x) button to clear the search input."
            />
          </div>

          {/* 2. TextInput (Normal) */}
          <TextInput
            label="Full Name (as per Aadhaar Card)"
            required
            placeholder="e.g. Ramesh Kumar Patel"
            helperText="Enter your official name matching government identity records."
          />

          {/* 3. TextInput (Error State) */}
          <TextInput
            label="10-Digit Mobile Number"
            required
            defaultValue="98765"
            error="Please enter a valid 10-digit Indian mobile number."
          />

          {/* 4. Select (Normal) */}
          <Select
            label="Select Your State / UT"
            required
            placeholder="Choose your state..."
            options={sampleStateOptions}
            helperText="Procedures, fees, and RTO portals vary by state."
          />

          {/* 5. Select (Error State) */}
          <Select
            label="Category / Vehicle Class"
            required
            placeholder="Choose category..."
            options={[
              { value: "mcwg", label: "Motorcycle with Gear (MCWG)" },
              { value: "lmv", label: "Light Motor Vehicle (LMV / Car)" },
            ]}
            error="Please select an eligible vehicle category to view fee details."
          />
        </div>
      </section>

      {/* Button Primitives Interactive Showcase */}
      <section className="rounded-card border-border bg-background shadow-soft-sm mb-10 border p-6 sm:p-8">
        <h2 className="text-h2 text-text mb-2">Button Component Primitives</h2>
        <p className="text-body text-muted mb-6">
          Complies with WCAG AA: 44px/52px heights, visible 3px 40% focus ring, loading spinner,
          icon slots, and automatic <code>&lt;a&gt;</code> tag rendering with href.
        </p>

        {/* 1. All Variants */}
        <div className="mb-8">
          <h3 className="text-h3 text-text mb-3">1. Variants (Size: md - 44px)</h3>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="link">Link Button</Button>
          </div>
        </div>

        {/* 2. Sizes */}
        <div className="mb-8">
          <h3 className="text-h3 text-text mb-3">2. Sizes</h3>
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="primary" size="md">
              Medium (44px)
            </Button>
            <Button variant="primary" size="lg">
              Large (52px)
            </Button>
            <Button variant="secondary" size="md">
              Secondary (44px)
            </Button>
            <Button variant="secondary" size="lg">
              Secondary (52px)
            </Button>
          </div>
        </div>

        {/* 3. States & Icon Slots */}
        <div className="mb-8">
          <h3 className="text-h3 text-text mb-3">3. States & Icon Slots</h3>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              leftIcon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              }
            >
              Left Icon
            </Button>
            <Button
              variant="secondary"
              rightIcon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              }
            >
              Right Icon
            </Button>
            <Button variant="primary" isLoading>
              Saving Changes
            </Button>
            <Button variant="primary" disabled>
              Disabled Primary
            </Button>
            <Button variant="secondary" disabled>
              Disabled Secondary
            </Button>
          </div>
        </div>

        {/* 4. Link Rendering (href) */}
        <div className="mb-8">
          <h3 className="text-h3 text-text mb-3">4. Semantic Link Rendering (as &lt;a&gt;)</h3>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" href="/">
              Renders as Link (to Home)
            </Button>
            <Button variant="secondary" href="#tokens">
              Anchor Link
            </Button>
            <Button variant="link" href="/">
              Inline Navigation Link
            </Button>
          </div>
        </div>

        {/* 5. Full Width */}
        <div>
          <h3 className="text-h3 text-text mb-3">5. Full Width Option</h3>
          <div className="max-w-md space-y-3">
            <Button variant="primary" fullWidth size="lg">
              Full Width Primary (52px)
            </Button>
            <Button variant="secondary" fullWidth size="md">
              Full Width Secondary (44px)
            </Button>
          </div>
        </div>
      </section>

      {/* Card & IconCard Primitives Showcase (Prompt 13) */}
      <section className="rounded-card border-border bg-background shadow-soft-sm mb-10 border p-6 sm:p-8">
        <h2 className="text-h2 text-text mb-2">Card & IconCard Primitives</h2>
        <p className="text-body text-muted mb-8">
          Features: padding options (sm, md, lg), optional hover lift, clickable card via href (with
          focus ring), CardTitle, CardBody, CardFooter, and 48px soft-colour IconCard tiles.
        </p>

        {/* 1. Category Tiles (IconCard) */}
        <div className="mb-10">
          <h3 className="text-h3 text-text mb-4">1. Category Tiles (IconCard with 48px circles)</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <IconCard
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                  />
                </svg>
              }
              title="Identity & Citizenship"
              description="Passport, Aadhaar, Voter ID, PAN"
              href="#category-identity"
              iconBgColor="bg-primary-soft text-primary"
            />
            <IconCard
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
                  />
                </svg>
              }
              title="Vehicles & Transport"
              description="Driving Licence, RC transfer, permits"
              href="#category-transport"
              iconBgColor="bg-accent-soft text-warning"
            />
            <IconCard
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              }
              title="Land & Property"
              description="Deed registration, 7/12 extract, mutation"
              href="#category-property"
              iconBgColor="bg-success-soft text-success"
            />
            <IconCard
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              }
              title="Business & Trade"
              description="Gumasta, MSME / Udyam, GST registration"
              href="#category-business"
              iconBgColor="bg-surface-alt text-muted"
            />
          </div>
        </div>

        {/* 2. Structured Card with Header, Body, Footer */}
        <div>
          <h3 className="text-h3 text-text mb-4">
            2. Structured Card (Title, Body, Footer, Padding)
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card padding="md" hoverLift>
              <CardTitle as="h3">Driving Licence Renewal (Maharashtra)</CardTitle>
              <CardBody>
                Complete list of required forms, medical certificates (Form 1A), and online
                appointment steps for renewed smart card licence delivery.
              </CardBody>
              <CardFooter>
                <span>Estimated Fee: ₹450</span>
                <span className="text-primary font-semibold">Explore steps →</span>
              </CardFooter>
            </Card>

            <Card padding="md" hoverLift href="/#passport-guide">
              <div className="mb-2 flex items-center justify-between">
                <span className="rounded-chip bg-primary-soft text-primary px-2.5 py-0.5 text-xs font-semibold">
                  National Portal
                </span>
                <span className="text-muted text-xs">Clickable Entire Card</span>
              </div>
              <CardTitle as="h3">Fresh Passport Application Guide</CardTitle>
              <CardBody>
                Step-by-step guidance on Passport Seva Kendra (PSK) appointment booking, document
                verification, and police verification expectations.
              </CardBody>
              <CardFooter>
                <span>Processing Time: 15-20 Days</span>
                <span className="text-primary font-semibold">Open Guide →</span>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Badges & Chips Showcase (Prompt 14) */}
      <section className="rounded-card border-border bg-background shadow-soft-sm mb-10 border p-6 sm:p-8">
        <h2 className="text-h2 text-text mb-2">Badge & Chip Primitives</h2>
        <p className="text-body text-muted mb-8">
          Features: Verified with date, Needs-update, New, Official source, and Difficulty dots.
          Filter Chips with active selected state, counts, remove action, and 44px tap targets.
          Always pairs colour with text or icons.
        </p>

        {/* 1. Badges */}
        <div className="mb-8">
          <h3 className="text-h3 text-text mb-3">
            1. Badge Variants (Always paired with icon/text)
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="verified" date="14 Nov 2026" />
            <Badge variant="official" />
            <Badge variant="needs-update" date="Awaiting 2026 Fee Revision" />
            <Badge variant="new">New Guide</Badge>
            <Badge variant="difficulty" difficulty="easy" />
            <Badge variant="difficulty" difficulty="medium" />
            <Badge variant="difficulty" difficulty="hard" />
          </div>
        </div>

        {/* 2. Filter Chips */}
        <div>
          <h3 className="text-h3 text-text mb-3">
            2. Filter Chips (Selectable, min 44px tap target)
          </h3>
          <div className="flex flex-wrap items-center gap-2.5">
            <Chip
              selected={activeCategory === "all"}
              onClick={() => setActiveCategory("all")}
              count={30}
            >
              All Services
            </Chip>
            <Chip
              selected={activeCategory === "transport"}
              onClick={() => setActiveCategory("transport")}
              count={12}
            >
              Transport & RTO
            </Chip>
            <Chip
              selected={activeCategory === "revenue"}
              onClick={() => setActiveCategory("revenue")}
              count={8}
            >
              Revenue & Land
            </Chip>
            <Chip
              selected={activeCategory === "identity"}
              onClick={() => setActiveCategory("identity")}
              count={5}
            >
              Identity & PAN
            </Chip>
            <Chip
              selected={activeCategory === "gujarat"}
              onClick={() => setActiveCategory("gujarat")}
              onRemove={() => setActiveCategory("all")}
            >
              Gujarat Only
            </Chip>
            <Chip disabled count={0}>
              Archived Rules
            </Chip>
          </div>
        </div>
      </section>

      {/* Callout Component Showcase (Prompt 15) */}
      <section className="rounded-card border-border bg-background shadow-soft-sm mb-10 border p-6 sm:p-8">
        <h2 className="text-h2 text-text mb-2">Callout Component Primitives</h2>
        <p className="text-body text-muted mb-6">
          Features: 4 distinct semantic variants with dedicated icons, bold titles, and
          high-contrast bodies. Used throughout guides for tips, critical requirements, fee
          warnings, and success messages.
        </p>

        <div className="space-y-4">
          <Callout variant="tip" title="Helpful Tip: Morning Slot Booking">
            Appointment slots on the official Sarathi Parivahan portal refresh daily at 10:00 AM
            IST. Log in 5 minutes early to secure your nearest RTO date.
          </Callout>

          <Callout variant="important" title="Mandatory Rule: Carry Originals AND One Photocopy">
            You must carry both the original documents and one set of self-attested photocopies to
            your physical appointment. Officers cannot verify without originals.
          </Callout>

          <Callout variant="warning" title="Anti-Fraud Warning: Never Pay Agents or Middlemen">
            The official government fee for a Learner&apos;s Licence is strictly ₹200 (₹150
            application + ₹50 test fee). Do not pay unauthorized agents outside the RTO premise.
          </Callout>

          <Callout variant="success" title="Instant Verification Available via Aadhaar OTP">
            Applicants who verify their identity using Aadhaar e-KYC can complete the entire
            application online without visiting the RTO for document submission in eligible states.
          </Callout>
        </div>
      </section>

      {/* StepList Component Showcase (Prompt 16) */}
      <section className="rounded-card border-border bg-background shadow-soft-sm mb-10 border p-6 sm:p-8">
        <h2 className="text-h2 text-text mb-2">StepList Component Primitives</h2>
        <p className="text-body text-muted mb-8">
          Features: Big numbered circles joined by vertical line, bold step titles, Where/Time
          chips, embedded step Callout, official external action link, and interactive completion
          toggle.
        </p>

        <StepList steps={sampleSteps} interactive={true} />
      </section>

      {/* ChecklistItem Component Showcase (Prompt 17) */}
      <section className="rounded-card border-border bg-background shadow-soft-sm mb-10 border p-6 sm:p-8">
        <h2 className="text-h2 text-text mb-2">ChecklistItem Component Primitives</h2>
        <p className="text-body text-muted mb-6">
          Features: 28px accessible checkbox (Space to toggle), document name, collapsible
          &quot;What is this?&quot; guidance, Mandatory/If applicable badges, Original + 1 copy hint
          chips, and strike-free soft green checked states.
        </p>

        <div className="space-y-3">
          <ChecklistItem
            name="Aadhaar Card with Linked Mobile Number"
            requirementType="required"
            copiesHint="Original + 1 self-attested copy"
            description="Your 12-digit Unique Identification Authority of India (UIDAI) card. Required for online OTP verification and proof of residential address."
          />
          <ChecklistItem
            name="Proof of Age (10th Standard Marksheet / Birth Certificate)"
            requirementType="required"
            copiesHint="Original + 1 copy"
            defaultChecked={true}
            description="Must clearly state your date of birth matching the application form. Accepted documents: 10th CBSE/State Board certificate, Municipal Birth Certificate, or valid Indian Passport."
          />
          <ChecklistItem
            name="Medical Fitness Certificate (Form 1A)"
            requirementType="conditional"
            copiesHint="Original with Doctor Stamp"
            description="Mandatory for applicants aged 40 and above or those applying for a commercial transport vehicle endorsement. Must be signed and stamped by an authorized registered medical practitioner (MBBS)."
          />
          <ChecklistItem
            name="Current Address Proof (if different from Aadhaar)"
            requirementType="optional"
            copiesHint="Original + 1 copy"
            description="Accepted when current residing address differs from permanent Aadhaar address: electricity bill, water bill, or registered rent agreement with police NOC."
          />
        </div>
      </section>

      {/* Type Scale Reference Spec Card */}
      <section
        id="tokens"
        className="rounded-card border-border bg-background shadow-soft-sm mb-10 border p-6"
      >
        <h2 className="text-h2 text-text mb-4">Defined Type Scale Tokens</h2>
        <div className="overflow-x-auto">
          <table className="text-small w-full border-collapse text-left">
            <thead>
              <tr className="border-border bg-surface text-muted border-b">
                <th className="px-3 py-2.5 font-semibold">Level</th>
                <th className="px-3 py-2.5 font-semibold">Desktop (Size / Line-Height)</th>
                <th className="px-3 py-2.5 font-semibold">Mobile</th>
                <th className="px-3 py-2.5 font-semibold">Utility Class</th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              <tr>
                <td className="text-text px-3 py-2.5 font-medium">Heading 1</td>
                <td className="px-3 py-2.5">36px / 44px</td>
                <td className="px-3 py-2.5">28px / 36px</td>
                <td className="text-primary px-3 py-2.5 font-mono text-xs">.text-h1</td>
              </tr>
              <tr>
                <td className="text-text px-3 py-2.5 font-medium">Heading 2</td>
                <td className="px-3 py-2.5">28px / 36px</td>
                <td className="px-3 py-2.5">28px / 36px</td>
                <td className="text-primary px-3 py-2.5 font-mono text-xs">.text-h2</td>
              </tr>
              <tr>
                <td className="text-text px-3 py-2.5 font-medium">Heading 3</td>
                <td className="px-3 py-2.5">22px / 30px</td>
                <td className="px-3 py-2.5">22px / 30px</td>
                <td className="text-primary px-3 py-2.5 font-mono text-xs">.text-h3</td>
              </tr>
              <tr>
                <td className="text-text px-3 py-2.5 font-medium">Body</td>
                <td className="px-3 py-2.5">17px / 28px</td>
                <td className="px-3 py-2.5">17px / 28px</td>
                <td className="text-primary px-3 py-2.5 font-mono text-xs">.text-body</td>
              </tr>
              <tr>
                <td className="text-text px-3 py-2.5 font-medium">Small / Meta</td>
                <td className="px-3 py-2.5">14px / 22px</td>
                <td className="px-3 py-2.5">14px / 22px</td>
                <td className="text-primary px-3 py-2.5 font-mono text-xs">.text-small</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Multilingual Prose Demonstrations */}
      <div className="space-y-10">
        {/* 1. English Showcase */}
        <article className="rounded-card border-border bg-background shadow-soft-sm border p-6 sm:p-8">
          <div className="border-border mb-4 flex items-center justify-between border-b pb-3">
            <span className="text-small text-primary font-semibold tracking-wider uppercase">
              1. English (Inter)
            </span>
            <span className="rounded-chip bg-surface-alt text-muted px-2.5 py-0.5 text-xs font-medium">
              lang=&quot;en&quot;
            </span>
          </div>

          <Prose>
            <h2 className="text-h1">How to Apply for a Driving Licence in India</h2>
            <p className="text-body text-text">
              Every citizen who plans to drive a motor vehicle on public roads must hold an
              authentic Driving Licence issued under the Motor Vehicles Act. All procedures are
              standardized nationally through the official Parivahan portal.
            </p>

            <h2 className="text-h2">Step 1: Obtain a Learner&apos;s Licence (LLR)</h2>
            <p className="text-body text-text">
              Before applying for a permanent licence, you must first clear the computerized learner
              test. Once approved, the learner permit remains valid for 6 months across India.
            </p>

            <h3 className="text-h3">Mandatory Document Checklist</h3>
            <ul>
              <li>Proof of Age (Aadhaar Card, Birth Certificate, or 10th Marksheet)</li>
              <li>Proof of Current Address (Voter ID, Utility Bill, or Passport)</li>
              <li>Three recent passport-sized color photographs</li>
              <li>Form 1 (Self-declaration of physical fitness)</li>
            </ul>

            <small className="text-small mt-4 block">
              Last verified: 14 November 2026 • Official Source: MoRTH Parivahan Portal
            </small>
          </Prose>
        </article>

        {/* 2. Hindi Showcase */}
        <article className="rounded-card border-border bg-background shadow-soft-sm border p-6 sm:p-8">
          <div className="border-border mb-4 flex items-center justify-between border-b pb-3">
            <span className="text-small text-accent font-semibold tracking-wider uppercase">
              2. Hindi / हिन्दी (Noto Sans Devanagari)
            </span>
            <span className="rounded-chip bg-surface-alt text-muted px-2.5 py-0.5 text-xs font-medium">
              lang=&quot;hi&quot;
            </span>
          </div>

          <Prose lang="hi">
            <h2 className="text-h1">भारत में ड्राइविंग लाइसेंस के लिए आवेदन कैसे करें</h2>
            <p className="text-body text-text">
              सार्वजनिक सड़कों पर मोटर वाहन चलाने की योजना बनाने वाले प्रत्येक नागरिक के पास मोटर वाहन अधिनियम
              के तहत जारी वैध ड्राइविंग लाइसेंस होना अनिवार्य है। सभी प्रक्रियाएं आधिकारिक परिवहन पोर्टल के माध्यम
              से मानकीकृत हैं।
            </p>

            <h2 className="text-h2">चरण 1: लर्नर लाइसेंस (LLR) प्राप्त करें</h2>
            <p className="text-body text-text">
              स्थायी लाइसेंस के लिए आवेदन करने से पहले, आपको सबसे पहले कम्प्यूटरीकृत लर्नर टेस्ट पास करना होगा। जारी
              होने के बाद, लर्नर परमिट पूरे भारत में 6 महीने के लिए वैध रहता है।
            </p>

            <h3 className="text-h3">अनिवार्य दस्तावेजों की सूची</h3>
            <ul>
              <li>आयु प्रमाण (आधार कार्ड, जन्म प्रमाण पत्र, या 10वीं की अंकतालिका)</li>
              <li>निवास प्रमाण (मतदाता पहचान पत्र, बिजली का बिल, या पासपोर्ट)</li>
              <li>हाल ही में ली गई तीन पासपोर्ट आकार की रंगीन तस्वीरें</li>
              <li>प्रपत्र 1 (शारीरिक फिटनेस का स्व-घोषणा पत्र)</li>
            </ul>

            <small className="text-small mt-4 block">
              अंतिम सत्यापन: 14 नवंबर 2026 • आधिकारिक स्रोत: MoRTH परिवहन सेवा पोर्टल
            </small>
          </Prose>
        </article>

        {/* 3. Gujarati Showcase */}
        <article className="rounded-card border-border bg-background shadow-soft-sm border p-6 sm:p-8">
          <div className="border-border mb-4 flex items-center justify-between border-b pb-3">
            <span className="text-small text-success font-semibold tracking-wider uppercase">
              3. Gujarati / ગુજરાતી (Noto Sans Gujarati)
            </span>
            <span className="rounded-chip bg-surface-alt text-muted px-2.5 py-0.5 text-xs font-medium">
              lang=&quot;gu&quot;
            </span>
          </div>

          <Prose lang="gu">
            <h2 className="text-h1">ભારતમાં ડ્રાઇવિંગ લાયસન્સ માટે અરજી કેવી રીતે કરવી</h2>
            <p className="text-body text-text">
              જાહેર રસ્તાઓ પર વાહન ચલાવવા ઇચ્છતા દરેક નાગરિક પાસે મોટર વાહન અધિનિયમ હેઠળ જારી કરાયેલ અધિકૃત
              ડ્રાઇવિંગ લાયસન્સ હોવું ફરજિયાત છે. આ તમામ પ્રક્રિયાઓ સત્તાવાર પરિવહન પોર્ટલ દ્વારા રાષ્ટ્રીય સ્તરે
              ઉપલબ્ધ છે.
            </p>

            <h2 className="text-h2">પગલું 1: લર્નર્સ લાયસન્સ (LLR) મેળવો</h2>
            <p className="text-body text-text">
              કાયમી લાયસન્સ માટે અરજી કરતા પહેલા, તમારે પ્રથમ કમ્પ્યુટરાઇઝ્ડ લર્નર ટેસ્ટ પાસ કરવી પડશે. એકવાર મંજૂર
              થયા પછી, લર્નર પરમિટ સમગ્ર ભારતમાં 6 મહિના માટે માન્ય રહેશે.
            </p>

            <h3 className="text-h3">જરૂરી દસ્તાવેજોની યાદી</h3>
            <ul>
              <li>ઉંમરનો પુરાવો (આધાર કાર્ડ, જન્મ પ્રમાણપત્ર અથવા ધોરણ 10 ની માર્કશીટ)</li>
              <li>સરનામાનો પુરાવો (ચૂંટણી કાર્ડ, લાઇટ બિલ અથવા પાસપોર્ટ)</li>
              <li>તાજેતરના ત્રણ પાસપોર્ટ સાઇઝના કલર ફોટોગ્રાફ્સ</li>
              <li>ફોર્મ 1 (શારીરિક તંદુરસ્તીનું સ્વ-ઘોષણાપત્ર)</li>
            </ul>

            <small className="text-small mt-4 block">
              છેલ્લી ચકાસણી: 14 નવેમ્બર 2026 • સત્તાવાર સ્ત્રોત: MoRTH પરિવહન સેવા પોર્ટલ
            </small>
          </Prose>
        </article>
      </div>
    </div>
  );
}
