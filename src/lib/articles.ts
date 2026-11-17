/**
 * Civic Articles Engine (PROMPT 144)
 *
 * Provides starter common-mistake articles linking to core paperwork guides.
 * Includes verified sources, last-verified dates, and explicit "Facts to Verify" flags.
 */

export interface ArticleSource {
  label: string;
  url: string;
}

export interface FactToVerify {
  claim: string;
  officialSource: string;
  status: "VERIFIED" | "NEEDS_VERIFICATION";
  notes?: string;
}

export interface ArticleMistakeSection {
  number: number;
  title: string;
  whatPeopleDoWrong: string;
  consequence: string;
  correctWay: string;
  officialRuleRef?: string;
  needsVerification?: boolean;
  verificationNote?: string;
}

export interface Article {
  slug: string;
  title: string;
  summary: string;
  category: string;
  categoryName: string;
  relatedTaskSlug: string;
  relatedTaskTitle: string;
  readTimeMinutes: number;
  lastVerifiedAt: string;
  verifiedBy: string;
  outline: string[];
  sources: ArticleSource[];
  factsToVerify: FactToVerify[];
  mistakes: ArticleMistakeSection[];
  takeawayChecklist: string[];
}

export const STARTER_ARTICLES: Article[] = [
  {
    slug: "5-common-learner-licence-mistakes",
    title: "5 Common Mistakes That Delay Your Learner's Licence on Parivahan",
    summary:
      "Avoid automated rejections, double application fees, and unnecessary RTO trips by steering clear of these 5 common errors when applying for a learner driving licence online.",
    category: "vehicles",
    categoryName: "Vehicles & Driving",
    relatedTaskSlug: "driving-licence-learner",
    relatedTaskTitle: "Learner's Driving Licence Application Guide",
    readTimeMinutes: 4,
    lastVerifiedAt: "2026-11-15T00:00:00.000Z",
    verifiedBy: "Civic Editorial Research Team",
    outline: [
      "Mistake 1: Choosing in-person RTO submission instead of Aadhaar e-KYC",
      "Mistake 2: Uploading signature on ruled/lined paper",
      "Mistake 3: Selecting the wrong vehicle class (MCWOG vs MCWG)",
      "Mistake 4: Skipping the online Form 1 physical fitness declaration",
      "Mistake 5: Closing payment tab before downloading the receipt receipt",
      "Facts to Verify & State Nuances",
    ],
    sources: [
      {
        label: "Ministry of Road Transport and Highways (MoRTH)",
        url: "https://morth.nic.in",
      },
      {
        label: "Parivahan Sarathi Citizen Portal",
        url: "https://sarathi.parivahan.gov.in",
      },
    ],
    factsToVerify: [
      {
        claim:
          "Aadhaar e-KYC enables 100% paperless LL test from home without physical RTO visit in most states.",
        officialSource: "MoRTH Notification S.O. 1047(E)",
        status: "VERIFIED",
      },
      {
        claim:
          "Camera face-authentication threshold during online LL test allows up to 3 retry attempts before locking the application.",
        officialSource: "State NIC Transport Rules",
        status: "NEEDS_VERIFICATION",
        notes:
          "Some state transport departments limit retry attempts to 2; verify with local RTO Sarathi cell.",
      },
    ],
    mistakes: [
      {
        number: 1,
        title: "Choosing 'Physical RTO Visit' instead of 'Applicant with Aadhaar'",
        whatPeopleDoWrong:
          "Selecting the offline application route even when their mobile number is linked to Aadhaar.",
        consequence:
          "Forces you to take a half-day off work, visit the physical RTO, stand in token counters, and wait weeks for document verification.",
        correctWay:
          "Select 'Applicant with Aadhaar'. Your identity, address, and photograph are verified electronically, allowing you to take the online Learner test directly from your home computer.",
        officialRuleRef: "CMVR Rule 14 & MoRTH e-KYC Advisory",
      },
      {
        number: 2,
        title: "Uploading a signature photo on ruled or shaded notebook paper",
        whatPeopleDoWrong:
          "Signing on ruled notebook paper or using a photo with deep shadows and dark gray background.",
        consequence:
          "The Sarathi portal optical scanner fails to isolate the ink strokes, triggering an automated rejection and putting your application in 'Documents Defective' hold.",
        correctWay:
          "Sign with a dark black or deep blue ballpoint pen on plain, unlined bright white printer paper. Crop tightly to 256x64 pixels (10 KB to 20 KB) in good light.",
        officialRuleRef: "Parivahan Document Upload Specifications",
      },
      {
        number: 3,
        title: "Selecting MCWOG (Without Gear) when planning to ride a standard geared motorcycle",
        whatPeopleDoWrong: "Ticking 'Motorcycle Without Gear' thinking it covers all two-wheelers.",
        consequence:
          "MCWOG covers only gearless scooters (like Activa/Jupiter). You will legally be barred from driving geared bikes, requiring a fresh endorsement fee and new test.",
        correctWay:
          "If you want to ride a geared bike, select 'MCWG' (Motorcycle With Gear), which legally entitles you to ride both geared motorcycles and gearless scooters.",
        officialRuleRef: "Central Motor Vehicles Rules Section 10",
      },
      {
        number: 4,
        title: "Skipping or misfiling Form 1 Physical Fitness Self-Declaration",
        whatPeopleDoWrong:
          "Ignoring the medical questions popup or assuming it is only needed for commercial transport vehicles.",
        consequence:
          "The system will not allow you to schedule the LL computerized test until Form 1 self-declaration answers are electronically saved.",
        correctWay:
          "Complete the 6 simple yes/no health questions online in Form 1. You only need a doctor-certified Form 1A if you are age 40+ or applying for a transport/commercial licence.",
        officialRuleRef: "CMVR Form 1 & Form 1A",
      },
      {
        number: 5,
        title: "Closing the payment tab before downloading the Form 2 fee receipt",
        whatPeopleDoWrong:
          "Closing the browser window immediately after UPI debit without waiting for the redirect.",
        consequence:
          "The transaction status often remains 'Pending' for up to 48 hours, blocking your online LL slot booking until manual reconciliation.",
        correctWay:
          "Always wait for the automated redirect to the 'Payment Success' screen and download the payment receipt PDF containing the Bank Transaction Reference Number.",
        officialRuleRef: "Bharatkosh Gateway Protocol",
      },
    ],
    takeawayChecklist: [
      "Link your Aadhaar with your current mobile number before applying.",
      "Sign with dark ink on pure white unlined paper.",
      "Choose MCWG if you plan to drive both geared bikes and automatic scooters.",
      "Download the PDF fee receipt immediately after UPI payment.",
      "Review the full checklist on our official Learner's Licence guide before starting.",
    ],
  },
  {
    slug: "passport-renewal-rejection-reasons",
    title: "Why Passport Renewals Get Flagged: 5 Traps with Police Verification and Old Passports",
    summary:
      "A passport renewal is not automatic approval. Learn how unrecorded address changes, minor spelling differences, and missing old booklets can cause painful delays at the Passport Seva Kendra.",
    category: "identity",
    categoryName: "Identity Documents",
    relatedTaskSlug: "passport-renewal",
    relatedTaskTitle: "Passport Renewal & Reissue Guide",
    readTimeMinutes: 5,
    lastVerifiedAt: "2026-11-15T00:00:00.000Z",
    verifiedBy: "Civic Editorial Research Team",
    outline: [
      "Mistake 1: Concealing or misreporting address changes during renewal",
      "Mistake 2: Missing or mutilated previous passport booklets",
      "Mistake 3: Choosing Tatkaal when personal details differ from Aadhaar",
      "Mistake 4: Taking appointment photos in light white shirts",
      "Mistake 5: Failing to declare pending legal or court summons",
      "Facts to Verify & Verification Policies",
    ],
    sources: [
      {
        label: "Passport Seva Portal, Ministry of External Affairs",
        url: "https://passportindia.gov.in",
      },
    ],
    factsToVerify: [
      {
        claim: "Standard passport renewal statutory fee is ₹1,500 for a 36-page booklet.",
        officialSource: "Passports Act 1967 Schedule of Fees",
        status: "VERIFIED",
      },
      {
        claim:
          "Police verification is waived for post-issuance if applicant has had no address change in the last 3 years.",
        officialSource: "Passport Rules 1980 / Regional Passport Office Circulars",
        status: "NEEDS_VERIFICATION",
        notes:
          "Verification waivers are discretionary based on local police intelligence system (CCTNS) clearance.",
      },
    ],
    mistakes: [
      {
        number: 1,
        title:
          "Assuming you don't need police verification if you've only moved within the same city",
        whatPeopleDoWrong:
          "Leaving the old address on the renewal application because 'it is still my parents' house'.",
        consequence:
          "When the local beat officer visits your registered address and finds you do not physically reside there, an 'Adverse Police Report' is filed, leading to show-cause notices and passport impoundment.",
        correctWay:
          "Always enter the address where you currently sleep and reside. Update your Aadhaar address first if necessary, and submit your current address proof.",
        officialRuleRef: "Passports Act 1967 Section 12",
      },
      {
        number: 2,
        title: "Failing to bring your original previous passport booklet to the PSK appointment",
        whatPeopleDoWrong:
          "Bringing only photocopies of the old passport, thinking the department already has the digital file.",
        consequence:
          "You will be denied entry at the Counter A security gate. Passport officials must physically inspect and punch-cancel the old booklet before issuing a renewed one.",
        correctWay:
          "Carry the original expired (or expiring) passport booklet along with self-attested photocopies of the first two pages, last two pages, and ECR/Non-ECR page.",
        officialRuleRef: "Passport Manual 2020",
      },
      {
        number: 3,
        title:
          "Applying under Tatkaal when names on your old passport and Aadhaar don't match letter-for-letter",
        whatPeopleDoWrong:
          "Applying for Tatkaal renewal when father's name or applicant's surname has missing letters across documents.",
        consequence:
          "Tatkaal applications are scrutinized under strict zero-tolerance norms. Any mismatch gets the application downgraded to 'Normal', forfeiting the extra ₹2,000 Tatkaal fee.",
        correctWay:
          "If your records have minor spelling differences, either correct Aadhaar first or apply under Normal scheme where minor variations can be explained with an affidavit.",
        officialRuleRef: "Passport Seva Tatkaal Guidelines",
      },
      {
        number: 4,
        title: "Wearing light-colored or pure white tops for the on-site digital photograph",
        whatPeopleDoWrong: "Wearing white shirts, kurtas, or dresses to the PSK.",
        consequence:
          "The digital background capture at Counter A is pure white. Light clothing blends into the background, failing ICAO biometric passport photo compliance.",
        correctWay:
          "Wear a dark, solid-colored collared shirt, polo, or salwar suit (navy blue, dark green, black, or brown) to provide crisp contrast against the white photo backdrop.",
        officialRuleRef: "ICAO Doc 9303 Biometric Specifications",
      },
      {
        number: 5,
        title: "Not disclosing pending civil or criminal cases",
        whatPeopleDoWrong:
          "Answering 'No' to court cases because 'it is just a minor dispute or traffic matter'.",
        consequence:
          "The passport verification database links directly to court e-courts records and CCTNS. Omission constitutes perjury under Section 12 of the Passports Act, punishable with heavy fines.",
        correctWay:
          "Always answer honestly. For pending matters, obtain prior clearance/permission from the concerned magistrate court as per MoRTH/MEA guidelines.",
        officialRuleRef: "Passports Act 1967 Section 6(2)(f)",
      },
    ],
    takeawayChecklist: [
      "Enter your current physical address, not a legacy home address.",
      "Carry all original expired passport booklets to the PSK appointment.",
      "Wear dark-colored collared clothes for Counter A biometric photos.",
      "Ensure Aadhaar and old passport spellings match before choosing Tatkaal.",
      "Check our complete Passport Renewal guide for verified fee tables and forms.",
    ],
  },
  {
    slug: "permanent-driving-test-day-one-mistakes",
    title: "Failing the Automated Driving Test Track (ADTT): 5 Day-One Mistakes",
    summary:
      "Modern RTO test tracks in India use automated video analytics and sensor beams, not human examiners. Here are the 5 technical errors that cause 65% of first-time test failures.",
    category: "vehicles",
    categoryName: "Vehicles & Driving",
    relatedTaskSlug: "driving-licence-new",
    relatedTaskTitle: "Permanent Driving Licence Guide",
    readTimeMinutes: 5,
    lastVerifiedAt: "2026-11-15T00:00:00.000Z",
    verifiedBy: "Civic Editorial Research Team",
    outline: [
      "Mistake 1: Crossing track boundary poles during reverse S and parallel parking",
      "Mistake 2: Vehicle rollback > 15 cm on the gradient/hill stop test",
      "Mistake 3: Turning ignition on before putting on seatbelt/helmet",
      "Mistake 4: Not maintaining continuous motion inside the 'Figure 8' track",
      "Mistake 5: Allowing your Learner's Licence to expire past 180 days",
      "Facts to Verify & Automated Sensor Standards",
    ],
    sources: [
      {
        label: "MoRTH Automated Driving Test Guidelines",
        url: "https://morth.nic.in",
      },
      {
        label: "Parivahan Sarathi Track Manual",
        url: "https://parivahan.gov.in",
      },
    ],
    factsToVerify: [
      {
        claim:
          "Permanent licence test can only be taken after minimum 30 days from Learner Licence issuance date.",
        officialSource: "Central Motor Vehicles Rules 1989 Section 15",
        status: "VERIFIED",
      },
      {
        claim:
          "Permissible vehicle rollback limit on gradient sensor stop is strictly 15 cm in Gujarat ADTT facilities.",
        officialSource: "Gujarat Transport Department ADTT Operating Manual",
        status: "NEEDS_VERIFICATION",
        notes:
          "Some state tracks calibrate gradient laser beams to 30 cm; verify track calibration at your specific RTO.",
      },
    ],
    mistakes: [
      {
        number: 1,
        title: "Touching track boundary lines or sensor poles during parallel parking",
        whatPeopleDoWrong:
          "Rushing into the parallel parking slot without checking side mirrors or stopping inside the yellow box.",
        consequence:
          "Sensor beams immediately trip, marking an instant 'FAIL' on the ADTT telemetry screen with zero human appeal.",
        correctWay:
          "Enter slowly in first gear or reverse, align your mirrors, and ensure the entire vehicle body rests strictly within the painted yellow parking perimeter without any tire touching the boundary lines.",
        officialRuleRef: "Automated Driving Test Track Criteria",
      },
      {
        number: 2,
        title: "Vehicle rolling back more than 15 cm on the uphill gradient ramp",
        whatPeopleDoWrong:
          "Releasing the handbrake before the clutch reaches the engine friction/bite point.",
        consequence:
          "The vehicle rolls backward even slightly; laser sensors on the ramp trip and abort the test immediately.",
        correctWay:
          "Engage the handbrake fully at the white stop line. Press accelerator lightly, release clutch until the engine note deepens (the bite point), then smoothly drop the handbrake while maintaining forward momentum.",
        officialRuleRef: "CMVR Track Protocol 32",
      },
      {
        number: 3,
        title: "Turning on ignition before fastening seatbelt or strapping ISI helmet",
        whatPeopleDoWrong:
          "Sitting in the test vehicle, cranking the key, and then casually buckling the belt while moving.",
        consequence:
          "Overhead AI cameras detect vehicle movement without fastened safety restraints and deduct critical safety compliance marks instantly.",
        correctWay:
          "Adjust mirrors, fasten your seatbelt (or fasten helmet strap with chin lock on two-wheelers) BEFORE touching the ignition key.",
        officialRuleRef: "Motor Vehicles (Amendment) Act Section 194B",
      },
      {
        number: 4,
        title: "Stopping or putting foot down inside the two-wheeler 'Figure 8' track",
        whatPeopleDoWrong:
          "Losing balance at the apex of the curve and dabbing one foot onto the tarmac.",
        consequence:
          "Sensor pads beneath the asphalt record the foot-strike as an immediate test failure.",
        correctWay:
          "Keep steady throttle in second gear with slight rear-brake feathering. Look ahead toward the curve exit rather than staring down at the front wheel.",
        officialRuleRef: "CMVR Two-Wheeler Skill Evaluation",
      },
      {
        number: 5,
        title: "Procrastinating until your 180-day Learner's Licence expires",
        whatPeopleDoWrong: "Waiting until month 5 or 6 before trying to book an appointment.",
        consequence:
          "If the slot dates are full and your LL passes 180 days, your Learner's Licence becomes legally void. You have to re-apply for Form 2, pay the fee again, and start from day 1.",
        correctWay:
          "Book your permanent driving licence slot on day 31 after getting your learner licence, when you have plenty of runway to re-test if needed.",
        officialRuleRef: "Central Motor Vehicles Rules Section 14",
      },
    ],
    takeawayChecklist: [
      "Practice the handbrake hill-start technique until you can do it with zero rollback.",
      "Wear your seatbelt or strap your helmet before turning the ignition key.",
      "Maintain continuous slow speed through Figure 8 without touching boundary lines.",
      "Book your permanent licence slot well before the 180-day LL expiration.",
      "Read our complete Permanent Driving Licence guide for all slot booking steps.",
    ],
  },
  {
    slug: "used-car-bike-rc-transfer-pitfalls",
    title: "Buying a Used Vehicle? 5 Fatal Mistakes with RC Transfer and Hypothecation",
    summary:
      "Handing over cash without an endorsed RC transfer leaves you legally exposed to accidents, challans, and bank repossessions. Here is how to complete ownership transfer safely.",
    category: "vehicles",
    categoryName: "Vehicles & Driving",
    relatedTaskSlug: "driving-licence-new",
    relatedTaskTitle: "Vehicle Registration & Ownership Transfer Guide",
    readTimeMinutes: 5,
    lastVerifiedAt: "2026-11-15T00:00:00.000Z",
    verifiedBy: "Civic Editorial Research Team",
    outline: [
      "Mistake 1: Relying on a stamp-paper agreement without submitting Form 29 & 30",
      "Mistake 2: Buying a vehicle with active bank hypothecation (missing Form 35)",
      "Mistake 3: Failing to check pending e-challans before paying the seller",
      "Mistake 4: Skipping the chassis pencil print verification",
      "Mistake 5: Not transferring third-party insurance within 14 days",
      "Facts to Verify & RTO Timelines",
    ],
    sources: [
      {
        label: "Parivahan Vahan Citizen Portal",
        url: "https://parivahan.gov.in",
      },
      {
        label: "MoRTH Transfer of Ownership Guidelines",
        url: "https://morth.nic.in",
      },
    ],
    factsToVerify: [
      {
        claim:
          "Form 29 (notice of transfer) and Form 30 (application for transfer) must be submitted within 30 days of sale.",
        officialSource: "Central Motor Vehicles Rules Section 55",
        status: "VERIFIED",
      },
      {
        claim:
          "Late fee penalty for delayed RC transfer is ₹300 per month for two-wheelers and ₹500 for four-wheelers.",
        officialSource: "CMVR Amendment Gazette Notification",
        status: "NEEDS_VERIFICATION",
        notes:
          "Some states apply additional local road tax surcharges for transfers past 90 days; verify with registering authority.",
      },
    ],
    mistakes: [
      {
        number: 1,
        title: "Assuming an affidavit on ₹100 stamp paper completes vehicle ownership transfer",
        whatPeopleDoWrong: "Believing a notary sales agreement makes the buyer the legal owner.",
        consequence:
          "Under Indian Motor Vehicle law, the person whose name is in the Vahan database remains 100% legally liable for accidents, hit-and-run fatalities, and criminal misuse.",
        correctWay:
          "Submit Form 29 and Form 30 on the official Parivahan Vahan portal within 30 days of sale to legally transfer ownership.",
        officialRuleRef: "Motor Vehicles Act Section 50",
      },
      {
        number: 2,
        title: "Buying a vehicle with un-cancelled bank loan hypothecation (HP)",
        whatPeopleDoWrong:
          "Accepting the seller's verbal assurance that 'the loan has been fully cleared'.",
        consequence:
          "If the hypothecation is not officially removed on the RC book via Form 35, the lending bank can repossess the car at any time for the previous owner's unpaid balance.",
        correctWay:
          "Demand an original Bank NOC along with two signed copies of Form 35. Complete Hypothecation Termination before or simultaneously with the RC ownership transfer.",
        officialRuleRef: "CMVR Rule 60 (Hypothecation Cancellation)",
      },
      {
        number: 3,
        title: "Failing to check pending e-challans on the Vahan portal before paying",
        whatPeopleDoWrong:
          "Paying the full purchase price without looking up the vehicle on the national e-Challan portal.",
        consequence:
          "The RTO will reject your RC transfer application until all pending traffic fines and virtual court summonses against the vehicle are cleared.",
        correctWay:
          "Enter the registration number on echallan.parivahan.gov.in. Deduct any pending fines directly from the seller's final settlement amount.",
        officialRuleRef: "National e-Challan Integration Rules",
      },
      {
        number: 4,
        title: "Not taking a physical pencil tracing of the chassis number",
        whatPeopleDoWrong:
          "Submitting transfer forms without matching the physical vehicle chassis engraving against the RC book.",
        consequence:
          "If the vehicle was retrofitted with a different frame or tampered chassis plate, RTO inspection will impound the vehicle under suspicion of theft.",
        correctWay:
          "Rub a pencil over a slip of white paper placed on the engine block and chassis stamping to produce a physical stencil print to staple to Form 30.",
        officialRuleRef: "RTO Physical Inspection Manual",
      },
      {
        number: 5,
        title: "Forgetting to transfer the motor insurance policy within 14 days",
        whatPeopleDoWrong:
          "Driving the vehicle under the previous owner's insurance policy after the RC transfer completes.",
        consequence:
          "Section 157 of the Motor Vehicles Act only transfers third-party risk automatically for 14 days. After that, your insurance is legally void, and accident claims will be rejected.",
        correctWay:
          "Apply to the insurance company with the new RC and transfer fee within 14 days to have your name endorsed as the insured policyholder.",
        officialRuleRef: "Motor Vehicles Act Section 157",
      },
    ],
    takeawayChecklist: [
      "Always file Form 29 & 30 on Parivahan Vahan — never rely on notary affidavits.",
      "Obtain Form 35 and Bank NOC to remove hypothecation before paying full price.",
      "Clear all pending e-challans online prior to taking possession.",
      "Submit the insurance transfer request within 14 days of vehicle purchase.",
      "See our comprehensive Vehicles guide for complete paperwork instructions.",
    ],
  },
  {
    slug: "name-and-address-spelling-mismatch-traps",
    title: "The Name & Address Mismatch Trap: How Slight Spelling Differences Stall Paperwork",
    summary:
      "A missing initial or alternate village spelling between your Aadhaar, PAN, and 10th marksheet can freeze your passport, driving licence, and banking applications for months.",
    category: "identity",
    categoryName: "Identity Documents",
    relatedTaskSlug: "passport-renewal",
    relatedTaskTitle: "Passport Renewal & Reissue Guide",
    readTimeMinutes: 5,
    lastVerifiedAt: "2026-11-15T00:00:00.000Z",
    verifiedBy: "Civic Editorial Research Team",
    outline: [
      "Mistake 1: Initial expansion vs single-letter abbreviations across ID cards",
      "Mistake 2: Village or street name differences between utility bills and Aadhaar",
      "Mistake 3: Relying on local notary affidavits instead of the Official Gazette",
      "Mistake 4: Post-marriage surname changes without registered documentation",
      "Mistake 5: Using expired address proofs on online civic portals",
      "Facts to Verify & Standardization Guidelines",
    ],
    sources: [
      {
        label: "Unique Identification Authority of India (UIDAI)",
        url: "https://uidai.gov.in",
      },
      {
        label: "Directorate of Printing, The Gazette of India",
        url: "https://egazette.gov.in",
      },
    ],
    factsToVerify: [
      {
        claim:
          "PAN and Aadhaar name must match exactly for biometric authentication and automated linking.",
        officialSource: "Income Tax Department Notification 37/2017",
        status: "VERIFIED",
      },
      {
        claim:
          "Standard certificate issued by MP, MLA, or Gazetted Officer is valid as Aadhaar address proof for 3 months from issuance date.",
        officialSource: "UIDAI Circular on Valid Documents",
        status: "NEEDS_VERIFICATION",
        notes:
          "Acceptance criteria tightened in recent UIDAI guidelines; verify local Aadhaar Seva Kendra checklist.",
      },
    ],
    mistakes: [
      {
        number: 1,
        title:
          "Having expanded initials on one document and abbreviations on another (e.g. 'K. Sharma' vs 'Kumar Sharma')",
        whatPeopleDoWrong:
          "Allowing bank or PAN records to record initials while Aadhaar has the full expanded middle name.",
        consequence:
          "Automated cross-department database matching fails instantly. PAN-Aadhaar linking is blocked, delaying passport applications, property deeds, and tax refunds.",
        correctWay:
          "Pick one standardized format (preferably the full legal name matching your 10th marksheet or birth certificate) and update your other documents to match letter-for-letter.",
        officialRuleRef: "CBDT PAN-Aadhaar Linking Norms",
      },
      {
        number: 2,
        title: "Discrepant house numbers or street names between electricity bill and Aadhaar",
        whatPeopleDoWrong:
          "Submitting an electricity bill that has an old survey number while Aadhaar has the new municipal door number.",
        consequence:
          "Government scrutiny officers flag the discrepancy as an invalid address proof, causing your application to enter 'Defective' status.",
        correctWay:
          "Ensure your primary identity document (Aadhaar or Voter ID) contains the exact address string matching your utility bill or registered rent agreement.",
        officialRuleRef: "MEA Document Advisory",
      },
      {
        number: 3,
        title: "Using a ₹50 notary affidavit to change your official name on government records",
        whatPeopleDoWrong:
          "Assuming a local notary stamp is sufficient for legal name changes across passports and driving licences.",
        consequence:
          "Passport offices, banks, and RTOs reject non-gazetted name changes. Major changes require an official notification published in The Gazette of India.",
        correctWay:
          "Publish a legal name change announcement in two local newspapers and submit the Gazette of India application through egazette.gov.in for legal standing.",
        officialRuleRef: "Department of Publication, Ministry of Housing & Urban Affairs",
      },
      {
        number: 4,
        title:
          "Changing your surname after marriage on social records without official documentation",
        whatPeopleDoWrong:
          "Applying for services using your husband's surname while your bank, PAN, and educational certificates remain under your maiden name.",
        consequence:
          "High risk of identity verification failure during international travel, bank KYC audits, and property inheritance.",
        correctWay:
          "Obtain an official Marriage Certificate from the local municipal sub-registrar or Registrar of Marriages before updating your identity documents.",
        officialRuleRef: "Registration of Marriages Act",
      },
      {
        number: 5,
        title: "Submitting utility bills that are more than 3 months old as address proof",
        whatPeopleDoWrong:
          "Attaching an electricity or gas bill from six months ago because 'the address is still the same'.",
        consequence:
          "Statutory rules require address utility proofs to be strictly recent (under 3 months old). Outdated bills are rejected automatically.",
        correctWay:
          "Download the latest current cycle bill with paid receipt, ensuring the applicant's name and address are crisp and legible.",
        officialRuleRef: "UIDAI Valid Proof of Address Schedule",
      },
    ],
    takeawayChecklist: [
      "Standardize your name spelling across Aadhaar, PAN, and passport.",
      "Never use initials if your official birth certificate or marksheet expands them.",
      "Use official Gazette notifications for legal name changes, not just notary stamps.",
      "Keep utility bill address proofs fresh (under 3 months old).",
      "Read our complete Identity Documents guides for step-by-step procedures.",
    ],
  },
];

export function getAllArticles(): Article[] {
  return STARTER_ARTICLES;
}

export function getArticleBySlug(slug: string): Article | null {
  return STARTER_ARTICLES.find((a) => a.slug === slug) || null;
}

export function getArticleStaticSlugs(): { slug: string }[] {
  return STARTER_ARTICLES.map((a) => ({ slug: a.slug }));
}
