export interface JourneyStep {
  taskSlug: string;
  name: string;
  categorySlug: string;
  description: string;
  timeEstimate: string;
  cost: string;
}

export interface TaskJourney {
  id: string;
  title: string;
  description: string;
  steps: JourneyStep[];
}

export const TASK_JOURNEYS: TaskJourney[] = [
  {
    id: "driving-licence-journey",
    title: "Driving & Vehicle Permitting Journey",
    description:
      "The complete regulatory sequence from holding your first learner permit to permanent licence and vehicle ownership.",
    steps: [
      {
        taskSlug: "driving-licence-learner",
        name: "Learner's Licence (LL)",
        categorySlug: "vehicles",
        description: "Pass online computerized test and receive 6-month validity learner licence.",
        timeEstimate: "7–10 days",
        cost: "₹200",
      },
      {
        taskSlug: "driving-licence-new",
        name: "Permanent Driving Licence (DL)",
        categorySlug: "vehicles",
        description:
          "Pass RTO automated track test (ADTT) after 30 days of learner licence holding.",
        timeEstimate: "30–45 days",
        cost: "₹400 – ₹600",
      },
      {
        taskSlug: "vehicle-registration",
        name: "Vehicle Registration & RC Transfer",
        categorySlug: "vehicles",
        description:
          "Transfer vehicle ownership or register new vehicle with Parivahan Vahan portal.",
        timeEstimate: "15–30 days",
        cost: "₹300 – ₹500",
      },
      {
        taskSlug: "international-driving-permit",
        name: "International Driving Permit (IDP)",
        categorySlug: "vehicles",
        description:
          "Obtain Form 6A permit for driving overseas using valid permanent driving licence.",
        timeEstimate: "3–7 days",
        cost: "₹1,000",
      },
    ],
  },
  {
    id: "marriage-name-change-journey",
    title: "Marriage & Legal Document Update Journey",
    description:
      "Step-by-step sequence for updating official civil status, surname, and identity records across government databases.",
    steps: [
      {
        taskSlug: "marriage-registration",
        name: "Marriage Certificate Registration",
        categorySlug: "family",
        description:
          "Legal certificate issued by Sub-Divisional Magistrate or Municipal Registrar.",
        timeEstimate: "15–30 days",
        cost: "₹100 – ₹250",
      },
      {
        taskSlug: "name-change-gazette",
        name: "Name Change Gazette Notification",
        categorySlug: "family",
        description:
          "Official publication in the Central / State Gazette for legal change of name.",
        timeEstimate: "20–30 days",
        cost: "₹1,100",
      },
      {
        taskSlug: "passport-renewal",
        name: "Passport Spouse & Name Update",
        categorySlug: "identity",
        description:
          "Re-issue passport booklet with updated marital status and spouse endorsement.",
        timeEstimate: "3–15 days",
        cost: "₹1,500",
      },
      {
        taskSlug: "aadhaar-update",
        name: "Aadhaar Name & Address Update",
        categorySlug: "identity",
        description:
          "Update biometric/demographic details on UIDAI portal using marriage certificate.",
        timeEstimate: "7–14 days",
        cost: "₹50",
      },
      {
        taskSlug: "pan-card-new",
        name: "PAN Card Name Correction",
        categorySlug: "money-and-tax",
        description: "Update NSDL/UTIITSL permanent account record to match Aadhaar name.",
        timeEstimate: "10–15 days",
        cost: "₹107",
      },
    ],
  },
  {
    id: "international-travel-journey",
    title: "International Travel & Mobility Journey",
    description:
      "Verified sequence for citizens traveling abroad for tourism, employment, or higher education.",
    steps: [
      {
        taskSlug: "passport-renewal",
        name: "Passport Renewal / Fresh Issue",
        categorySlug: "identity",
        description: "Apply for 36-page or 60-page Type 'P' Indian citizen passport booklet.",
        timeEstimate: "3–15 days",
        cost: "₹1,500 – ₹3,500",
      },
      {
        taskSlug: "police-clearance-certificate",
        name: "Police Clearance Certificate (PCC)",
        categorySlug: "identity",
        description:
          "Mandatory background clearance issued via Passport Seva Kendra for long-term visa.",
        timeEstimate: "7–21 days",
        cost: "₹500",
      },
      {
        taskSlug: "international-driving-permit",
        name: "International Driving Permit (IDP)",
        categorySlug: "vehicles",
        description: "Authorised 1-year driving permit across 150+ Geneva Convention countries.",
        timeEstimate: "3–7 days",
        cost: "₹1,000",
      },
    ],
  },
];

/**
 * Returns matching journey and step index for a given task slug.
 */
export function getTaskJourney(taskSlug: string): {
  journey: TaskJourney | undefined;
  currentStepIndex: number;
} {
  for (const journey of TASK_JOURNEYS) {
    const idx = journey.steps.findIndex((s) => s.taskSlug === taskSlug);
    if (idx !== -1) {
      return { journey, currentStepIndex: idx };
    }
  }
  return { journey: undefined, currentStepIndex: -1 };
}
