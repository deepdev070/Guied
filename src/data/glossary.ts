/**
 * Civic Paperwork Glossary Dataset
 * Simple, Class-8 reading level definitions in English, Hindi, and Gujarati.
 * Explains legal, administrative, and government terminology for citizens.
 */

export interface GlossaryTerm {
  slug: string;
  termEn: string;
  termHi: string;
  termGu: string;
  aliases: string[]; // Variations that should trigger tooltip (e.g. "notarised", "notary public")
  defEn: string;
  defHi: string;
  defGu: string;
  whoIssues: string;
  commonCost?: string;
  whereUsed: string[];
  tips?: string;
}

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    slug: "affidavit",
    termEn: "Affidavit",
    termHi: "शपथ पत्र (Affidavit)",
    termGu: "સોગંદનામું (Affidavit)",
    aliases: ["affidavit", "affidavits", "sworn statement", "शपथ पत्र", "સોગંદનામું"],
    defEn:
      "A written statement sworn before an authorized notary or magistrate. It legally confirms that the facts stated by you are 100% true. Making a false affidavit is a criminal offense.",
    defHi:
      "नोटरी या मजिस्ट्रेट के सामने शपथ लेकर दिया गया लिखित बयान। यह कानूनी रूप से पुष्टि करता है कि आपके द्वारा दी गई जानकारी सच है।",
    defGu:
      "નોટરી અથવા મેજિસ્ટ્રેટ સમક્ષ સોગંદપૂર્વક કરાયેલું લેખિત નિવેદન, જે કાયદેસર રીતે સાબિત કરે છે કે તમારી માહિતી સંપૂર્ણપણે સાચી છે.",
    whoIssues:
      "Drafted on non-judicial stamp paper and signed before an Executive Magistrate or Notary Public.",
    commonCost: "₹50 or ₹100 stamp paper + ₹50 notary attestation fee.",
    whereUsed: [
      "Name change",
      "Address proof mismatch",
      "Lost passport declaration",
      "Vehicle transfer",
    ],
    tips: "Always check the required stamp paper denomination (e.g., ₹50 vs ₹100) before buying.",
  },
  {
    slug: "notary",
    termEn: "Notary / Notarised",
    termHi: "नोटरी (Notary)",
    termGu: "નોટરી (Notary)",
    aliases: ["notary", "notarized", "notarised", "notary public", "नोटरी"],
    defEn:
      "A government-appointed legal officer (advocate) authorized to verify your identity, witness your signature, and place an official seal and stamp on legal declarations.",
    defHi:
      "सरकार द्वारा अधिकृत वकील जो आपकी पहचान की पुष्टि करता है, आपके हस्ताक्षर देखता है और दस्तावेजों पर आधिकारिक मुहर लगाता है।",
    defGu:
      "સરકાર દ્વારા અધિકૃત વકીલ જે તમારી અસલ ઓળખ ચકાસીને તમારા દસ્તાવેજ પર સહી તથા સત્તાવાર સિક્કો મારે છે.",
    whoIssues: "Advocates appointed as Notaries by the Central or State Law Department.",
    commonCost: "₹30 – ₹50 per signature/seal.",
    whereUsed: ["Affidavits", "Rent agreements", "Power of attorney", "Annexures"],
    tips: "Ensure the notary writes their registration number and expiry date next to their seal.",
  },
  {
    slug: "gazette",
    termEn: "Gazette (Rajpatra)",
    termHi: "राजपत्र (Gazette)",
    termGu: "રાજપત્ર (Gazette)",
    aliases: ["gazette", "official gazette", "rajpatra", "राजपत्र", "રાજપત્ર"],
    defEn:
      "The official government publication where new statutes, statutory fee revisions, and legal name changes are published to make them legally recognized across India.",
    defHi:
      "सरकार का आधिकारिक प्रकाशन जहां नए कानून, सरकारी फीस और नाम बदलने की सूचनाएं कानूनी रूप से प्रकाशित होती हैं।",
    defGu:
      "સરકારનું સત્તાવાર પ્રકાશન જેમાં નવા કાયદા, સરકારી ફી અને નામ બદલવાની જાહેરાતો કાયદેસર રીતે જાહેર થાય છે.",
    whoIssues:
      "Department of Publication, Government of India (Central Gazette) or State Government Printing Press.",
    commonCost: "₹1,100 – ₹1,500 for legal name change notification.",
    whereUsed: [
      "Adult name change",
      "Religion change",
      "Gender change on official records",
      "Statutory fees verification",
    ],
    tips: "Download digital e-Gazette copies directly from egazette.gov.in free of cost.",
  },
  {
    slug: "self-attested",
    termEn: "Self-Attested",
    termHi: "स्व-प्रमाणित (Self-Attested)",
    termGu: "સ્વ-પ્રમાણિત (Self-Attested)",
    aliases: ["self-attested", "self attested", "self attestation", "स्व-प्रमाणित", "સ્વ-પ્રમાણિત"],
    defEn:
      "Writing 'Self-Attested' on a photocopy, followed by your regular signature and the current date. It certifies that the photocopy is a true copy of your original document. No gazetted officer or seal is required.",
    defHi:
      "फोटोकॉपी पर 'Self-Attested' लिखकर अपने खुद के हस्ताक्षर और तारीख डालना। इसके लिए किसी सरकारी अफसर की मुहर की जरूरत नहीं होती।",
    defGu:
      "ઝેરોક્ષ કોપી પર 'Self-Attested' લખીને તમારી પોતાની સહી અને તારીખ કરવી. આ માટે કોઈ સરકારી અધિકારીની સહીની જરૂર નથી હોતી.",
    whoIssues: "Done directly by you (the applicant).",
    commonCost: "Free (₹0).",
    whereUsed: ["Passport application", "Driving licence", "Aadhaar update", "PAN card"],
    tips: "Sign across the blank margin without obscuring vital document details or photo.",
  },
  {
    slug: "domicile",
    termEn: "Domicile Certificate",
    termHi: "मूल निवास प्रमाण पत्र (Domicile)",
    termGu: "રહેઠાણ પ્રમાણપત્ર (Domicile)",
    aliases: [
      "domicile",
      "domicile certificate",
      "residence certificate",
      "मूल निवास",
      "રહેઠાણ પ્રમાણપત્ર",
    ],
    defEn:
      "An official certificate issued by the state revenue department certifying that a person has been residing permanently in that particular state for a specified duration (usually 10 to 15 years).",
    defHi:
      "राज्य के राजस्व विभाग द्वारा जारी प्रमाण पत्र जो यह साबित करता है कि आप उस राज्य के स्थायी निवासी हैं।",
    defGu: "મહેસૂલ વિભાગ દ્વારા અપાતું પ્રમાણપત્ર જે સાબિત કરે છે કે તમે ઘણા વર્ષોથી રાજ્યમાં કાયમી રહેવાસી છો.",
    whoIssues: "Tehsildar, Sub-Divisional Magistrate (SDM), or Mamlatdar.",
    commonCost: "₹20 – ₹50 statutory fee on state citizen portal.",
    whereUsed: [
      "State government jobs",
      "College admissions & quota",
      "State scholarships",
      "Ration card",
    ],
    tips: "Electricity bills, school leaving certificates, and parent's voter ID are commonly accepted proofs.",
  },
  {
    slug: "noc",
    termEn: "No Objection Certificate (NOC)",
    termHi: "अनापत्ति प्रमाण पत्र (NOC)",
    termGu: "વાંધા પ્રમાણપત્ર મુક્તિ (NOC)",
    aliases: ["noc", "no objection certificate", "no-objection certificate", "अनापत्ति प्रमाण पत्र"],
    defEn:
      "An official document issued by a government authority, employer, or financer stating that they have zero objection to a requested transaction or application.",
    defHi:
      "संबंधित विभाग या बैंक द्वारा जारी दस्तावेज जिसमें लिखा होता है कि आपके आवेदन या ट्रांसफर से उन्हें कोई आपत्ति नहीं है।",
    defGu: "સંબંધિત વિભાગ કે બેંક દ્વારા અપાતો દસ્તાવેજ જેમાં દર્શાવાય છે કે તમારી અરજી સામે તેમને કોઈ વાંધો નથી.",
    whoIssues: "RTO (Form 28 for vehicle transfer), Police department, or financing bank.",
    commonCost: "₹100 (Form 28 at RTO).",
    whereUsed: [
      "Vehicle transfer to another state",
      "Government employees applying for passport",
      "Bank loan closure",
    ],
    tips: "Ensure vehicle NOC from RTO is used within its validity period (usually 6 months).",
  },
  {
    slug: "tatkal",
    termEn: "Tatkaal Scheme",
    termHi: "तत्काल सेवा (Tatkal)",
    termGu: "તત્કાલ યોજના (Tatkal)",
    aliases: ["tatkal", "tatkaal", "urgent processing", "तत्काल", "તત્કાલ"],
    defEn:
      "An official expedited fast-track government scheme that delivers passports or public services in 1 to 3 business days for an additional gazetted surcharge.",
    defHi:
      "आपातकालीन त्वरित सेवा जो अतिरिक्त सरकारी शुल्क लेकर 1 से 3 दिनों में पासपोर्ट या दस्तावेज तैयार करती है।",
    defGu:
      "સરકારી કટોકટી સેવા જે વધારાની સરકારી ફી લઈને ૧ થી ૩ દિવસમાં પાસપોર્ટ કે દસ્તાવેજ આપવાની સુવિધા આપે છે.",
    whoIssues: "Passport Seva Kendra (Ministry of External Affairs).",
    commonCost: "₹2,000 additional statutory surcharge for passport.",
    whereUsed: ["Urgent international travel", "Medical emergency passport renewal"],
    tips: "Police verification for Tatkaal passports happens after dispatch (Post-police verification).",
  },
  {
    slug: "annexure",
    termEn: "Annexure",
    termHi: "अनुलग्नक (Annexure)",
    termGu: "જોડાણ (Annexure)",
    aliases: ["annexure", "annexures", "annexure e", "अनुलग्नक", "જોડાણ"],
    defEn:
      "A standardized affidavit or declaration form attached to a government application to certify specific circumstances (such as citizenship declaration, spouse details, or lost document explanation).",
    defHi: "आवेदन के साथ लगने वाला आधिकारिक हलफनामा या घोषणा पत्र प्रारूप (जैसे पासपोर्ट के लिए Annexure E)।",
    defGu: "અરજી સાથે જોડવાનું સત્તાવાર સોગંદનામું કે બાંયધરી ફોર્મ (જેમ કે પાસપોર્ટ માટે Annexure E).",
    whoIssues: "Official format downloaded from the government portal and filled by the applicant.",
    commonCost: "Free download; printed on plain paper or stamp paper as specified.",
    whereUsed: [
      "Passport applications (Annexure E, D, F)",
      "OCI applications",
      "Government pension",
    ],
    tips: "Most passport annexures now only require self-declaration on plain paper rather than expensive stamp paper.",
  },
  {
    slug: "challan",
    termEn: "Challan / E-Challan",
    termHi: "चालान (Challan)",
    termGu: "ચલણ (Challan)",
    aliases: ["challan", "e-challan", "echallan", "चालान", "ચલણ"],
    defEn:
      "An official computerized receipt or payment demand note used to deposit statutory fees or penalties directly into the government treasury.",
    defHi: "सरकारी खजाने में फीस या जुर्माना जमा करने की आधिकारिक रसीદ।",
    defGu: "સરકારી તિજોરીમાં ફી અથવા દંડ જમા કરાવવાની સત્તાવાર કોમ્પ્યુટરાઈઝ્ડ રસીદ.",
    whoIssues: "State treasury department, traffic police, or Parivahan portal.",
    commonCost: "Matches the exact statutory fee or penalty.",
    whereUsed: [
      "Driving licence application fees",
      "Court fee deposit",
      "Traffic penalty settlement",
    ],
    tips: "Always preserve the 16-digit Challan Reference Number (CIN / GRN) for payment tracking.",
  },
];

export function getGlossaryTermBySlug(slug: string): GlossaryTerm | undefined {
  return GLOSSARY_TERMS.find((t) => t.slug.toLowerCase() === slug.toLowerCase());
}

export function getAllGlossaryTerms(): GlossaryTerm[] {
  return [...GLOSSARY_TERMS].sort((a, b) => a.termEn.localeCompare(b.termEn));
}
