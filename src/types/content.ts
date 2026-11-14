import { z } from "zod";

/**
 * Zod Schemas & Inferred TypeScript Types for Civic Paperwork Content System.
 * Mirrors the Prisma schema with strict validation and citizen-readable error messages.
 */

// 1. Content Status
export const ContentStatusSchema = z.enum(["DRAFT", "REVIEW", "PUBLISHED", "ARCHIVED"], {
  errorMap: () => ({
    message: "Status must be DRAFT, REVIEW, PUBLISHED, or ARCHIVED",
  }),
});
export type ContentStatus = z.infer<typeof ContentStatusSchema>;

// 2. Conditional Rule Schema (appliesWhen)
export const ValueComparisonSchema = z.object({
  eq: z.unknown().optional(),
  ne: z.unknown().optional(),
  lt: z.number({ message: "Comparison value for 'lt' must be a number" }).optional(),
  lte: z.number({ message: "Comparison value for 'lte' must be a number" }).optional(),
  gt: z.number({ message: "Comparison value for 'gt' must be a number" }).optional(),
  gte: z.number({ message: "Comparison value for 'gte' must be a number" }).optional(),
  in: z.array(z.unknown(), { message: "'in' operator requires an array of values" }).optional(),
  nin: z.array(z.unknown(), { message: "'nin' operator requires an array of values" }).optional(),
});

export const RuleSchema: z.ZodType<unknown> = z.lazy(() =>
  z.union([
    z.boolean(),
    z.record(
      z.string(),
      z.union([z.unknown(), ValueComparisonSchema, z.array(z.lazy(() => RuleSchema))])
    ),
  ])
);

// 3. Document Specification Schema (PROMPT 67: Passport photos, signatures, file limits)
export const DocumentSpecSchema = z.object({
  dimensions: z.string().optional(), // e.g. "35mm x 45mm"
  backgroundColor: z.string().optional(), // e.g. "Plain white background"
  maxFileSizeBytes: z.number().int().positive().optional(), // e.g. 204800 (200 KB)
  maxFileSizeLabel: z.string().optional(), // e.g. "20 KB to 200 KB"
  acceptedFormats: z.array(z.string()).default(["JPEG", "JPG"]), // e.g. ["JPEG", "JPG"]
  diagramType: z.enum(["photo", "signature", "document_scan"]).default("photo"),
  guidanceUrl: z.string().url().optional(), // official guidance portal
  instructions: z.array(z.string()).optional(),
});
export type DocumentSpec = z.infer<typeof DocumentSpecSchema>;

// 4. Document Requirement Schema
export const DocumentRequirementSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, { message: "Document name must be at least 3 characters long" }),
  description: z.string().optional(),
  requirementType: z.enum(["required", "optional", "conditional"], {
    errorMap: () => ({
      message: "Requirement type must be 'required', 'optional', or 'conditional'",
    }),
  }),
  copiesHint: z.string().optional(), // e.g. "Original + 1 self-attested photocopy"
  specs: DocumentSpecSchema.optional(), // Technical rules for photos, signatures, scans
  appliesWhen: RuleSchema.optional().nullable(),
  status: ContentStatusSchema.default("PUBLISHED"),
  lastVerifiedAt: z.string().datetime().or(z.date()).optional(),
  verifiedBy: z.string().optional(),
  sourceUrl: z.string().url({ message: "Document source must be a valid portal URL" }).optional(),
  displayOrder: z.number().int().default(0),
});
export type DocumentRequirement = z.infer<typeof DocumentRequirementSchema>;

// 4. Step Schema
export const StepSchema = z.object({
  id: z.string().optional(),
  stepNumber: z.number().int().positive({ message: "Step number must be a positive integer" }),
  title: z.string().min(3, { message: "Step title must be at least 3 characters long" }),
  description: z.string().min(10, { message: "Step description must explain the action clearly" }),
  where: z.string().optional(), // e.g. "Online (Parivahan Portal)" or "Physical RTO"
  estimatedTime: z.string().optional(), // e.g. "15 minutes"
  officialLinkUrl: z.string().url({ message: "Official step link must be a valid URL" }).optional(),
  officialLinkLabel: z.string().optional(),
  calloutType: z.enum(["tip", "important", "warning", "success"]).optional(),
  calloutTitle: z.string().optional(),
  calloutText: z.string().optional(),
  status: ContentStatusSchema.default("PUBLISHED"),
  lastVerifiedAt: z.string().datetime().or(z.date()).optional(),
  verifiedBy: z.string().optional(),
  sourceUrl: z.string().url().optional(),
});
export type Step = z.infer<typeof StepSchema>;

// 5. Fee Schema
export const FeeSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(2, { message: "Fee label is required (e.g. 'Computerized Test Fee')" }),
  amount: z
    .number()
    .int({ message: "Fee amount must be a whole number" })
    .min(0, { message: "Fee amount must be a number in rupees (0 or greater)" }),
  currency: z.string().default("INR"),
  isOptional: z.boolean().default(false),
  paymentMode: z
    .enum(["online", "counter", "both"], {
      errorMap: () => ({
        message: "Payment mode must be 'online', 'counter', or 'both'",
      }),
    })
    .default("both"),
  rulesReference: z.string().optional(), // e.g. "CMVR Rule 32"
  status: ContentStatusSchema.default("PUBLISHED"),
  lastVerifiedAt: z.string().datetime().or(z.date()).optional(),
  verifiedBy: z.string().optional(),
  sourceUrl: z.string().url().optional(),
});
export type Fee = z.infer<typeof FeeSchema>;

// 5b. Fee Calculator Configuration Schema (PROMPT 69: Variable fees calculator)
export const FeeCalculatorOptionChoiceSchema = z.object({
  id: z.string(),
  label: z.string(),
  amount: z.number().int(),
  description: z.string().optional(),
});
export type FeeCalculatorOptionChoice = z.infer<typeof FeeCalculatorOptionChoiceSchema>;

export const FeeCalculatorItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.string().default("scheme"), // e.g. "scheme", "pages", "applicant", "delivery", "classes", "addon"
  description: z.string().optional(),
  choices: z.array(FeeCalculatorOptionChoiceSchema),
  defaultChoiceId: z.string(),
});
export type FeeCalculatorItem = z.infer<typeof FeeCalculatorItemSchema>;

export const FeeCalculatorConfigSchema = z.object({
  title: z.string().default("Total Cost Calculator"),
  description: z.string().optional(),
  baseFee: z.number().int().min(0).default(0),
  baseFeeLabel: z.string().default("Statutory Application Fee"),
  options: z.array(FeeCalculatorItemSchema).default([]),
  officialSourceUrl: z.string().url({ message: "Fee calculator source URL must be valid" }),
  officialSourceLabel: z.string().default("Official Gazette Fee Schedule"),
  rulesReference: z.string().optional(),
});
export type FeeCalculatorConfig = z.infer<typeof FeeCalculatorConfigSchema>;

// 5c. Before You Go (Prompt 72: 5 Final Checks Mini Card)
export const BeforeYouGoItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  icon: z.string().optional(),
});
export type BeforeYouGoItem = z.infer<typeof BeforeYouGoItemSchema>;

export const BeforeYouGoSchema = z.object({
  title: z.string().default("Before you leave home"),
  subtitle: z.string().default("5 final checks before heading to the official centre"),
  items: z.array(BeforeYouGoItemSchema).optional(),
});
export type BeforeYouGo = z.infer<typeof BeforeYouGoSchema>;

// 6. Official Link Schema
export const OfficialLinkSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(3, { message: "Link label is required (e.g. 'Parivahan Sarathi Portal')" }),
  url: z
    .string()
    .url({ message: "Official link must be a valid HTTPS/HTTP URL" })
    .refine((u) => u.startsWith("https://") || u.startsWith("http://"), {
      message: "Official links must begin with https:// or http://",
    }),
  isPrimary: z.boolean().default(false),
  department: z.string().optional(),
  portalName: z.string().optional(),
  status: ContentStatusSchema.default("PUBLISHED"),
  lastVerifiedAt: z.string().datetime().or(z.date()).optional(),
  verifiedBy: z.string().optional(),
  sourceUrl: z.string().url().optional(),
});
export type OfficialLink = z.infer<typeof OfficialLinkSchema>;

// 7. Faq Item Schema
export const FaqItemSchema = z.object({
  id: z.string().optional(),
  question: z.string().min(5, { message: "FAQ question must be at least 5 characters long" }),
  answer: z.string().min(10, { message: "FAQ answer must provide clear citizen guidance" }),
  displayOrder: z.number().int().default(0),
  status: ContentStatusSchema.default("PUBLISHED"),
  lastVerifiedAt: z.string().datetime().or(z.date()).optional(),
  verifiedBy: z.string().optional(),
  sourceUrl: z.string().url().optional(),
});
export type FaqItem = z.infer<typeof FaqItemSchema>;

// 8. Rejection Reason / Common Mistake Schema
export const RejectionReasonSchema = z.object({
  id: z.string().optional(),
  title: z
    .string()
    .min(5, { message: "Mistake title is required (e.g. 'Name Mismatch on Aadhaar')" }),
  description: z
    .string()
    .min(10, { message: "Explain why this mistake leads to application delay or rejection" }),
  solution: z
    .string()
    .min(10, { message: "Provide the exact corrective step to resolve this mistake" }),
  status: ContentStatusSchema.default("PUBLISHED"),
  lastVerifiedAt: z.string().datetime().or(z.date()).optional(),
  verifiedBy: z.string().optional(),
  sourceUrl: z.string().url().optional(),
});
export type RejectionReason = z.infer<typeof RejectionReasonSchema>;

// 9. Source Reference Schema
export const SourceRefSchema = z.object({
  id: z.string().optional(),
  title: z
    .string()
    .min(3, { message: "Source title is required (e.g. 'Central Motor Vehicles Rules')" }),
  actOrRuleNumber: z.string().optional(),
  issuingAuthority: z.string().optional(),
  publishedDate: z.string().or(z.date()).optional(),
  url: z.string().url({ message: "Source URL must be valid" }).optional(),
  status: ContentStatusSchema.default("PUBLISHED"),
  lastVerifiedAt: z.string().datetime().or(z.date()).optional(),
  verifiedBy: z.string().optional(),
  sourceUrl: z.string().url().optional(),
});
export type SourceRef = z.infer<typeof SourceRefSchema>;

// 10. Task Variant Schema (National default or State-specific override)
export const TaskVariantSchema = z.object({
  title: z
    .string()
    .min(5, { message: "Variant title is required (e.g. 'Learner\\'s Licence Application')" }),
  summary: z
    .string()
    .min(15, { message: "Summary must provide at least a 15-character overview of the procedure" }),
  estimatedTime: z.string().default("15-30 days"),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  status: ContentStatusSchema.default("PUBLISHED"),
  lastVerifiedAt: z.string().datetime().or(z.date()).optional(),
  verifiedBy: z.string().optional(),
  sourceUrl: z.string().url({ message: "Primary source URL must be valid" }).optional(),
  steps: z.array(StepSchema).min(1, { message: "Procedure must include at least 1 step" }),
  documentRequirements: z
    .array(DocumentRequirementSchema)
    .min(1, { message: "Procedure must require at least 1 document" }),
  fees: z.array(FeeSchema).default([]),
  feeCalculator: FeeCalculatorConfigSchema.optional(),
  beforeYouGo: BeforeYouGoSchema.optional(),
  officialLinks: z
    .array(OfficialLinkSchema)
    .min(1, { message: "At least 1 official government link is required" }),
  faqItems: z.array(FaqItemSchema).default([]),
  rejectionReasons: z.array(RejectionReasonSchema).default([]),
  sourceRefs: z.array(SourceRefSchema).default([]),
});
export type TaskVariant = z.infer<typeof TaskVariantSchema>;

// 11. Authoring Task JSON File Schema (src/content/tasks/<slug>.json)
export const TaskContentSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "Task slug must contain only lowercase letters, numbers, and hyphens",
  }),
  name: z.string().min(3, { message: "Task name is required" }),
  description: z.string().optional(),
  categorySlug: z.string().min(2, { message: "Category slug is required" }),
  national: TaskVariantSchema,
  states: z.record(z.string(), TaskVariantSchema.partial()).optional().default({}),
});
export type TaskContent = z.infer<typeof TaskContentSchema>;
