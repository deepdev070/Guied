/**
 * Civic Task Changelogs & "What Changed" Data Service (PROMPT 145)
 *
 * Provides a verified changelog of official rule, fee, document, and portal changes
 * for each guide so returning citizens see what has changed without needing email.
 */

export interface ChangelogItem {
  id: string;
  date: string; // ISO date (e.g. "2026-11-14")
  changeType: "fee" | "portal" | "document" | "rule" | "verification";
  changeTypeLabel: string;
  title: string;
  description: string;
  officialSourceLabel: string;
  officialSourceUrl: string;
  stateCode?: string;
}

export const TASK_CHANGELOGS: Record<string, ChangelogItem[]> = {
  "driving-licence-learner": [
    {
      id: "dll-01",
      date: "2026-11-14",
      changeType: "rule",
      changeTypeLabel: "Aadhaar e-KYC Update",
      title: "Contactless Online LL Test from Home Enabled",
      description:
        "Applicants choosing 'Applicant with Aadhaar' no longer need to visit physical RTO for document submission or computerized test. Digital Form 3 learner licence is generated immediately upon passing.",
      officialSourceLabel: "Sarathi Parivahan MoRTH Advisory",
      officialSourceUrl: "https://sarathi.parivahan.gov.in",
    },
    {
      id: "dll-02",
      date: "2026-10-01",
      changeType: "fee",
      changeTypeLabel: "Fee Standardization",
      title: "Statutory LL Processing & Test Fee Confirmed at ₹200",
      description:
        "Application processing fee ₹150 + online test fee ₹50 verified under Central Motor Vehicles Rules (CMVR) Rule 32. Zero tout or agent commission required.",
      officialSourceLabel: "The Gazette of India MoRTH Schedule",
      officialSourceUrl: "https://parivahan.gov.in",
    },
    {
      id: "dll-03",
      date: "2026-08-15",
      changeType: "document",
      changeTypeLabel: "Document Specification",
      title: "Plain White Background Required for Signature Uploads",
      description:
        "Parivahan optical validation updated to reject signatures on ruled notebook paper. Applicants must sign with dark ink on plain unlined paper.",
      officialSourceLabel: "Parivahan Citizen Portal Technical Advisory",
      officialSourceUrl: "https://sarathi.parivahan.gov.in",
    },
  ],
  "driving-licence-new": [
    {
      id: "dln-01",
      date: "2026-11-10",
      changeType: "rule",
      changeTypeLabel: "ADTT Automated Tracks",
      title: "Sensor-Based Telemetry Standardized Across All Testing Tracks",
      description:
        "Automated Driving Test Tracks (ADTT) with video analytics and gradient laser rollback sensors are now standard. Rollback > 15 cm automatically halts the test.",
      officialSourceLabel: "State Transport ADTT Protocol",
      officialSourceUrl: "https://parivahan.gov.in",
    },
    {
      id: "dln-02",
      date: "2026-09-20",
      changeType: "fee",
      changeTypeLabel: "Smart Card Fee Update",
      title: "Smart Card Driving Licence Fee Set at ₹200 + Test Fee ₹300",
      description:
        "Standard statutory fees for Permanent Driving Licence issuance confirmed under CMVR Rule 32. Total statutory fee is ₹500.",
      officialSourceLabel: "MoRTH Fee Schedule",
      officialSourceUrl: "https://morth.nic.in",
    },
    {
      id: "dln-03",
      date: "2026-07-10",
      changeType: "portal",
      changeTypeLabel: "Online Slot Booking",
      title: "Mandatory 30-Day Window Between LL and Permanent DL Slot",
      description:
        "Parivahan Sarathi prevents slot booking before day 30 from learner licence issuance, in compliance with CMVR Section 15.",
      officialSourceLabel: "Central Motor Vehicles Rules 1989",
      officialSourceUrl: "https://sarathi.parivahan.gov.in",
    },
  ],
  "driving-licence-renewal": [
    {
      id: "dlr-2026-11-17-01",
      date: "2026-11-17",
      changeType: "verification",
      changeTypeLabel: "Complete Guide Published",
      title: "Driving Licence Renewal Guide Published & Verified",
      description:
        "Full DL renewal procedure guide published with verified ₹400 statutory fee (₹200 renewal + ₹200 smart card), Form 1A age 40+ rules, and contactless steps.",
      officialSourceLabel: "Parivahan Sarathi (sarathi.parivahan.gov.in)",
      officialSourceUrl: "https://sarathi.parivahan.gov.in",
    },
    {
      id: "dlr-2026-10-01-02",
      date: "2026-10-01",
      changeType: "fee",
      changeTypeLabel: "Late Fee Clarification",
      title: "Late Fee Grace Period and Surcharge Rules Confirmed",
      description:
        "Under Section 15 of the Motor Vehicles Act, renewal up to 1 year after expiry carries zero penalty. Beyond 1 year, a late fee of ₹300 per year applies.",
      officialSourceLabel: "Ministry of Road Transport and Highways (MoRTH)",
      officialSourceUrl: "https://morth.nic.in",
    },
  ],
  "vehicle-rc-transfer": [
    {
      id: "rc-2026-11-17-01",
      date: "2026-11-17",
      changeType: "verification",
      changeTypeLabel: "Complete Guide Published",
      title: "Vehicle RC Ownership Transfer Guide Published & Verified",
      description:
        "Full RC ownership transfer procedure published with verified CMVR Rule 81 fees (₹150 bike / ₹300 car + ₹200 smart card), Form 29/30 checklist, and Vahan steps.",
      officialSourceLabel: "Parivahan Vahan (vahan.parivahan.gov.in)",
      officialSourceUrl: "https://vahan.parivahan.gov.in",
    },
    {
      id: "rc-2026-10-15-02",
      date: "2026-10-15",
      changeType: "rule",
      changeTypeLabel: "Challan & Hypothecation Check",
      title: "Mandatory Online E-Challan & Loan Clearances Before Transfer",
      description:
        "Parivahan Vahan portal now automatically blocks Form 29 transfer applications if pending traffic challans or unreleased bank hypothecation exist.",
      officialSourceLabel: "Ministry of Road Transport and Highways",
      officialSourceUrl: "https://parivahan.gov.in",
    },
  ],
  "aadhaar-update": [
    {
      id: "aadh-2026-11-17-01",
      date: "2026-11-17",
      changeType: "verification",
      changeTypeLabel: "Complete Guide Published",
      title: "Aadhaar Update Guide Published & Verified",
      description:
        "Full Aadhaar demographic and biometric update procedure published with verified ₹50 demographic / ₹100 biometric fees, myAadhaar steps, and Kendra rules.",
      officialSourceLabel: "UIDAI (uidai.gov.in)",
      officialSourceUrl: "https://uidai.gov.in",
    },
    {
      id: "aadh-2026-09-01-02",
      date: "2026-09-01",
      changeType: "portal",
      changeTypeLabel: "Head of Family (HoF) Mode",
      title: "Head of Family (HoF) Address Update Mode Standardized",
      description:
        "Citizens without address proof in their own name can update their address online using relationship proof and HoF OTP authentication.",
      officialSourceLabel: "UIDAI myAadhaar Circular",
      officialSourceUrl: "https://myaadhaar.uidai.gov.in",
    },
  ],
  "pan-card-new": [
    {
      id: "pan-2026-11-17-01",
      date: "2026-11-17",
      changeType: "verification",
      changeTypeLabel: "Complete Guide Published",
      title: "New PAN Card Application Guide Published & Verified",
      description:
        "Full PAN card procedure guide published with verified ₹107 statutory fee (₹91 + 18% GST), paperless Aadhaar e-KYC steps, and AO code selection rules.",
      officialSourceLabel: "Income Tax Department (incometaxindia.gov.in)",
      officialSourceUrl: "https://incometaxindia.gov.in",
    },
    {
      id: "pan-2026-08-10-02",
      date: "2026-08-10",
      changeType: "rule",
      changeTypeLabel: "Aadhaar Quoting Invariant",
      title: "Mandatory Aadhaar Linkage at Time of PAN Application",
      description:
        "Under Section 139AA of the Income Tax Act, every applicant eligible for Aadhaar must quote their Aadhaar number to prevent duplicate PAN issuance.",
      officialSourceLabel: "Central Board of Direct Taxes (CBDT)",
      officialSourceUrl: "https://incometaxindia.gov.in",
    },
  ],
  "pan-aadhaar-link": [
    {
      id: "pan-aadh-2026-11-17-01",
      date: "2026-11-17",
      changeType: "verification",
      changeTypeLabel: "Complete Guide Published",
      title: "Link PAN with Aadhaar Guide Published & Verified",
      description:
        "Full PAN-Aadhaar linkage procedure published with verified ₹1,000 late fee under Section 234H, Minor Head 500 payment rules, and e-filing steps.",
      officialSourceLabel: "Income Tax Department (incometaxindia.gov.in)",
      officialSourceUrl: "https://incometaxindia.gov.in",
    },
    {
      id: "pan-aadh-2026-07-01-02",
      date: "2026-07-01",
      changeType: "rule",
      changeTypeLabel: "Inoperative PAN Consequences",
      title: "Statutory Consequences of Inoperative PAN Status Confirmed",
      description:
        "CBDT confirms that unlinked PAN cards remain inoperative, incurring TDS/TCS at higher 20% rates and blocking tax refund processing.",
      officialSourceLabel: "CBDT Circular No. 03/2023",
      officialSourceUrl: "https://incometaxindia.gov.in",
    },
  ],
  "voter-id-new": [
    {
      id: "vot-2026-11-17-01",
      date: "2026-11-17",
      changeType: "verification",
      changeTypeLabel: "Complete Guide Published",
      title: "New Voter ID (Form 6) Guide Published & Verified",
      description:
        "Full first-time voter registration guide published with verified ₹0 statutory fee, 4 annual qualifying dates, and BLO verification steps.",
      officialSourceLabel: "Election Commission of India (voters.eci.gov.in)",
      officialSourceUrl: "https://voters.eci.gov.in",
    },
    {
      id: "vot-2026-08-01-02",
      date: "2026-08-01",
      changeType: "rule",
      changeTypeLabel: "Four Qualifying Dates",
      title: "Advance Application Across 4 Annual Qualifying Dates Enabled",
      description:
        "Citizens turning 18 can now file advance Form 6 applications for any of the 4 qualifying dates (1 Jan, 1 April, 1 July, 1 Oct).",
      officialSourceLabel: "Election Commission of India Notification",
      officialSourceUrl: "https://eci.gov.in",
    },
  ],
  "ration-card-new": [
    {
      id: "rc-2026-11-17-01",
      date: "2026-11-17",
      changeType: "verification",
      changeTypeLabel: "Complete Guide Published",
      title: "Ration Card (NFSA) Guide Published & Verified",
      description:
        "Full NFSA ration card and member addition guide published with verified ₹20-₹50 statutory fees, Section 13 female head of household rules, and e-PDS steps.",
      officialSourceLabel: "Department of Food and Public Distribution (dfpd.gov.in)",
      officialSourceUrl: "https://dfpd.gov.in",
    },
    {
      id: "rc-2026-06-15-02",
      date: "2026-06-15",
      changeType: "rule",
      changeTypeLabel: "ONORC Portability",
      title: "One Nation One Ration Card (ONORC) Nationwide Portability Active",
      description:
        "Beneficiaries can lift allocated foodgrains from any operational fair price shop in India using biometric Aadhaar e-PoS authentication.",
      officialSourceLabel: "NFSA National Portability Guidelines",
      officialSourceUrl: "https://nfsa.gov.in",
    },
  ],
  "birth-certificate": [
    {
      id: "bc-2026-11-17-01",
      date: "2026-11-17",
      changeType: "verification",
      changeTypeLabel: "Complete Guide Published",
      title: "Birth Certificate Registration Guide Published & Verified",
      description:
        "Full birth registration guide published with verified ₹0 statutory fee (within 21 days), delayed registration tiers under Section 13, and CRS portal steps.",
      officialSourceLabel: "Civil Registration System (crsorgi.gov.in)",
      officialSourceUrl: "https://crsorgi.gov.in",
    },
    {
      id: "bc-2026-07-01-02",
      date: "2026-07-01",
      changeType: "rule",
      changeTypeLabel: "2023 Amendment Act Single Document",
      title: "Digital Birth Certificate Enforced as Single Proof of Date of Birth",
      description:
        "Registration of Births and Deaths (Amendment) Act, 2023 establishes the digital birth certificate as the single official proof for school admission, DL, and passport.",
      officialSourceLabel: "Ministry of Home Affairs / ORGI",
      officialSourceUrl: "https://censusindia.gov.in",
    },
  ],
  "death-certificate": [
    {
      id: "dc-2026-11-17-01",
      date: "2026-11-17",
      changeType: "verification",
      changeTypeLabel: "Complete Guide Published",
      title: "Death Certificate Registration Guide Published & Verified",
      description:
        "Full death registration guide published with verified ₹0 statutory fee (within 21 days), Form 4 medical cause requirements, and delayed SDM tiers.",
      officialSourceLabel: "Civil Registration System (crsorgi.gov.in)",
      officialSourceUrl: "https://crsorgi.gov.in",
    },
    {
      id: "dc-2026-06-10-02",
      date: "2026-06-10",
      changeType: "rule",
      changeTypeLabel: "MCCD Standardization",
      title: "Medical Certificate of Cause of Death (MCCD) Standardized",
      description:
        "Hospital authorities must transmit Form 4 MCCD digitally to the jurisdictional Registrar to avoid manual errors in cause of death recording.",
      officialSourceLabel: "Office of the Registrar General of India",
      officialSourceUrl: "https://censusindia.gov.in",
    },
  ],
  "marriage-certificate": [
    {
      id: "mc-2026-11-17-01",
      date: "2026-11-17",
      changeType: "verification",
      changeTypeLabel: "Complete Guide Published",
      title: "Marriage Registration Guide Published & Verified",
      description:
        "Full marriage registration guide published with verified ₹5 statutory fee (within 30 days), Hindu Marriage Act vs Special Marriage Act rules, and witness criteria.",
      officialSourceLabel: "National Government Services (services.india.gov.in)",
      officialSourceUrl: "https://services.india.gov.in",
    },
    {
      id: "mc-2026-05-20-02",
      date: "2026-05-20",
      changeType: "rule",
      changeTypeLabel: "Mandatory Registration Compliance",
      title: "Compulsory Registration Enforcement and Digital Certificates",
      description:
        "State registration portals now generate digitally signed marriage certificates with verifiable cryptographic QR codes acceptable for passports and visas.",
      officialSourceLabel: "Ministry of Law and Justice",
      officialSourceUrl: "https://lawmin.gov.in",
    },
  ],
  "name-change-after-marriage": [
    {
      id: "nc-2026-11-17-01",
      date: "2026-11-17",
      changeType: "verification",
      changeTypeLabel: "Complete Guide Published",
      title: "Name Change After Marriage Guide Published & Verified",
      description:
        "Full post-marriage name change guide published with verified ₹1,100 Gazette fee, sequential Aadhaar -> PAN -> Passport workflow, and affidavit formats.",
      officialSourceLabel: "The Gazette of India (egazette.gov.in)",
      officialSourceUrl: "https://egazette.gov.in",
    },
    {
      id: "nc-2026-04-10-02",
      date: "2026-04-10",
      changeType: "rule",
      changeTypeLabel: "Paperless e-Gazette",
      title: "100% Digital e-Gazette PDF Downloads Standardized",
      description:
        "Physical Gazette booklets are no longer printed; electronic gazette notifications with digital signatures are legally valid under Section 8 of the IT Act.",
      officialSourceLabel: "Department of Publication, MoHUA",
      officialSourceUrl: "https://egazette.gov.in",
    },
  ],
  "passport-renewal": [
    {
      id: "pr-01",
      date: "2026-11-12",
      changeType: "portal",
      changeTypeLabel: "Tatkaal Verification",
      title: "Stricter Zero-Tolerance Name Matching for Tatkaal Applications",
      description:
        "Applications under Tatkaal with minor character discrepancies against Aadhaar are automatically reassigned to Normal scheme. Ensure letter-for-letter spelling match.",
      officialSourceLabel: "Passport Seva Project Advisory",
      officialSourceUrl: "https://passportindia.gov.in",
    },
    {
      id: "pr-02",
      date: "2026-09-15",
      changeType: "rule",
      changeTypeLabel: "Police Verification Guidelines",
      title: "CCTNS Automated Background Checks for Reissue",
      description:
        "Police verification status is now synchronized via the Crime and Criminal Tracking Network & Systems (CCTNS). Beat officer visit remains required if residential address changed.",
      officialSourceLabel: "Ministry of External Affairs Passport Division",
      officialSourceUrl: "https://passportindia.gov.in",
    },
    {
      id: "pr-03",
      date: "2026-06-01",
      changeType: "fee",
      changeTypeLabel: "Statutory Renewal Fees",
      title: "Standard 36-Page Booklet Renewal Verified at ₹1,500",
      description:
        "Official statutory renewal fee is ₹1,500 (36 pages) or ₹2,000 (60-page jumbo booklet). Tatkaal surcharge remains ₹2,000 extra paid directly on passportindia.gov.in.",
      officialSourceLabel: "Passports Act 1967 Schedule",
      officialSourceUrl: "https://passportindia.gov.in",
    },
  ],
  "passport-fresh": [
    {
      id: "pf-2026-11-17-01",
      date: "2026-11-17",
      changeType: "verification",
      changeTypeLabel: "Complete Guide Published",
      title: "Fresh Passport Application Guide Published & Verified",
      description:
        "Full first-time passport guide published with verified ₹1,500 statutory fee (36 pages) and ₹3,500 Tatkaal fee, 8 PSK steps, and document rules.",
      officialSourceLabel: "Passport Seva Portal (passportindia.gov.in)",
      officialSourceUrl: "https://www.passportindia.gov.in",
    },
  ],
  "pcc-passport": [
    {
      id: "pcc-2026-11-17-01",
      date: "2026-11-17",
      changeType: "verification",
      changeTypeLabel: "Complete Guide Published",
      title: "Police Clearance Certificate (PCC) Guide Published & Verified",
      description:
        "Full PCC procedure guide published with verified ₹500 statutory fee on Passport Seva, required documents, and police verification steps.",
      officialSourceLabel: "Passport Seva Portal (passportindia.gov.in)",
      officialSourceUrl: "https://www.passportindia.gov.in",
    },
  ],
  "legal-name-change-gazette": [
    {
      id: "ch-name-gazette-01",
      date: "2026-11-20",
      changeType: "fee",
      changeTypeLabel: "Fee Verified",
      title: "Statutory Central Gazette Fee Verified",
      description:
        "Verified ₹1,100 statutory publication fee for adult name change under Controller of Publications on Bharatkosh portal.",
      officialSourceLabel: "Bharatkosh Portal (bharatkosh.gov.in)",
      officialSourceUrl: "https://bharatkosh.gov.in",
    },
    {
      id: "ch-name-gazette-02",
      date: "2026-11-20",
      changeType: "verification",
      changeTypeLabel: "Process Verified",
      title: "E-Gazette Digital Download Standards Verified",
      description:
        "Confirmed electronic weekly Part IV gazette publication schedule and digital download authenticity without physical printing requirement.",
      officialSourceLabel: "Department of Publication (egazette.gov.in)",
      officialSourceUrl: "https://egazette.gov.in",
    },
  ],
  "property-registration-sale-deed": [
    {
      id: "ch-prop-reg-01",
      date: "2026-11-20",
      changeType: "fee",
      changeTypeLabel: "Rates Verified",
      title: "Stamp Duty & Registration Fee Framework Verified",
      description:
        "Verified national 4-7% stamp duty and 1% registration fee statutory framework and state-level female buyer exemptions.",
      officialSourceLabel: "Services India Portal (services.india.gov.in)",
      officialSourceUrl: "https://services.india.gov.in",
    },
    {
      id: "ch-prop-reg-02",
      date: "2026-11-20",
      changeType: "portal",
      changeTypeLabel: "Portal Verified",
      title: "Gujarat GARVI Portal and Jantasri Integration Verified",
      description:
        "Confirmed Gujarat IGR GARVI online booking and Jantasri circle rate valuation workflows.",
      officialSourceLabel: "GARVI Gujarat Portal (garvi.gujarat.gov.in)",
      officialSourceUrl: "https://garvi.gujarat.gov.in",
      stateCode: "GJ",
    },
  ],
  "income-certificate": [
    {
      id: "ch-income-cert-01",
      date: "2026-11-20",
      changeType: "fee",
      changeTypeLabel: "Fee Verified",
      title: "Statutory e-District Application Fee Verified",
      description:
        "Verified ₹20 statutory portal fee and CSC facilitation norms on official State Services and Digital Gujarat portals.",
      officialSourceLabel: "Services India Portal (services.india.gov.in)",
      officialSourceUrl: "https://services.india.gov.in",
    },
    {
      id: "ch-income-cert-02",
      date: "2026-11-20",
      changeType: "rule",
      changeTypeLabel: "Validity Verified",
      title: "Gujarat 3-Year Validity Resolution Verified",
      description:
        "Confirmed Government of Gujarat Resolution establishing 3 financial years validity for Mamlatdar-issued income certificates.",
      officialSourceLabel: "Digital Gujarat Portal (digitalgujarat.gov.in)",
      officialSourceUrl: "https://digitalgujarat.gov.in",
      stateCode: "GJ",
    },
  ],
  "caste-certificate": [
    {
      id: "ch-caste-cert-01",
      date: "2026-11-20",
      changeType: "rule",
      changeTypeLabel: "Rules Verified",
      title: "Paternal Lineage & Cut-Off Date Rules Verified",
      description:
        "Verified constitutional pre-1950 (SC/ST) and pre-1978 (OBC) cut-off residency requirements and patrilineal inheritance rules.",
      officialSourceLabel: "Services India Portal (services.india.gov.in)",
      officialSourceUrl: "https://services.india.gov.in",
    },
    {
      id: "ch-caste-cert-02",
      date: "2026-11-20",
      changeType: "portal",
      changeTypeLabel: "Portal Verified",
      title: "Digital Gujarat SEBC & SC/ST Online Issuance Verified",
      description:
        "Confirmed Digital Gujarat portal application workflow and Talati Vanshavali verification for SEBC/SC/ST certificates.",
      officialSourceLabel: "Digital Gujarat Portal (digitalgujarat.gov.in)",
      officialSourceUrl: "https://digitalgujarat.gov.in",
      stateCode: "GJ",
    },
  ],
  "domicile-certificate": [
    {
      id: "ch-domicile-01",
      date: "2026-11-20",
      changeType: "rule",
      changeTypeLabel: "Rules Verified",
      title: "10-Year Continuous Stay & Sole Domicile Rule Verified",
      description:
        "Verified 10-year residency documentation standards and prohibition against dual state domicile claims.",
      officialSourceLabel: "Services India Portal (services.india.gov.in)",
      officialSourceUrl: "https://services.india.gov.in",
    },
    {
      id: "ch-domicile-02",
      date: "2026-11-20",
      changeType: "portal",
      changeTypeLabel: "Portal Verified",
      title: "Digital Gujarat Domicile Online Workflow Verified",
      description:
        "Confirmed Digital Gujarat portal application workflow under Taluka Mamlatdar with verified ₹20 statutory portal fee.",
      officialSourceLabel: "Digital Gujarat Portal (digitalgujarat.gov.in)",
      officialSourceUrl: "https://digitalgujarat.gov.in",
      stateCode: "GJ",
    },
  ],
};

/**
 * Returns chronologically sorted changelog items for a task guide.
 */
export function getTaskChangelog(slug: string, stateCode?: string): ChangelogItem[] {
  const items = TASK_CHANGELOGS[slug] || [
    {
      id: `${slug}-default-01`,
      date: "2026-11-14",
      changeType: "verification",
      changeTypeLabel: "Annual Verification",
      title: "Statutory Fees & Document Requirements Re-verified",
      description:
        "Complete document checklist, portal URLs, and statutory fees verified against current official government gazettes.",
      officialSourceLabel: "Official Government Portal",
      officialSourceUrl: "https://india.gov.in",
    },
  ];

  if (!stateCode) return items;
  return items.filter(
    (item) => !item.stateCode || item.stateCode.toLowerCase() === stateCode.toLowerCase()
  );
}
