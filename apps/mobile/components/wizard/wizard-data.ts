export interface WizardQuestionOption {
  label: string;
  description?: string;
  values: Record<string, unknown>;
}

export interface WizardQuestion {
  id: string;
  title: string;
  subtitle: string;
  field: string;
  options: WizardQuestionOption[];
}

export const WIZARD_QUESTIONS: WizardQuestion[] = [
  {
    id: "age",
    title: "1. Applicant Age",
    subtitle: "Age determines mandatory medical practitioner certificate (Form 1-A).",
    field: "applicantAge",
    options: [
      {
        label: "Under 40 years (18–39)",
        description: "Self-declaration of fitness only (Form 1). No doctor visit required.",
        values: { applicantAge: 25 },
      },
      {
        label: "40 years or older (40+)",
        description:
          "Form 1-A certified by a registered medical practitioner (MBBS) is legally required.",
        values: { applicantAge: 45 },
      },
    ],
  },
  {
    id: "vehicleClass",
    title: "2. Vehicle Class",
    subtitle: "Select the class of motor vehicle you intend to drive.",
    field: "vehicleClass",
    options: [
      {
        label: "Two Wheeler (MCWG / Gearless)",
        description: "Motorcycles with gear or scooters without gear (16+ for 50cc).",
        values: { vehicleClass: "two_wheeler" },
      },
      {
        label: "Four Wheeler (LMV - Private Car)",
        description: "Light motor vehicles (private cars, jeeps).",
        values: { vehicleClass: "four_wheeler" },
      },
      {
        label: "Both Two Wheeler & Four Wheeler",
        description: "Combined application for both motorcycle and car categories.",
        values: { vehicleClass: "both" },
      },
    ],
  },
  {
    id: "commercial",
    title: "3. Commercial / Transport",
    subtitle: "Commercial transport licences require special commercial eligibility.",
    field: "commercial",
    options: [
      {
        label: "Private / Personal Non-Transport",
        description: "Standard private driving licence for personal daily commute.",
        values: { commercial: false, isCommercial: false },
      },
      {
        label: "Commercial Transport (Taxi, Heavy, Goods)",
        description:
          "Requires Form 1-A medical fitness regardless of age + driver training certificate.",
        values: { commercial: true, isCommercial: true },
      },
    ],
  },
  {
    id: "state",
    title: "4. State Jurisdiction",
    subtitle: "Personalize rules and portal integrations to your state.",
    field: "stateCode",
    options: [
      {
        label: "Gujarat (Launch State)",
        description: "Official Sarathi Gujarat eKYC integration with home computerized testing.",
        values: { state: "GJ", stateCode: "GJ" },
      },
      {
        label: "Other State / National",
        description: "Standard Central Motor Vehicles Rules (CMVR) procedure.",
        values: { state: "NATIONAL", stateCode: "NATIONAL" },
      },
    ],
  },
];
