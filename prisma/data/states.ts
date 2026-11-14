export interface StateSeedData {
  name: string;
  nativeName?: string;
  slug: string;
  code: string;
  primaryLanguages: string[];
  launchState?: boolean;
  portalName?: string;
  portalUrl: string; // to be verified
}

export const STATES_SEED_DATA: StateSeedData[] = [
  // --- 28 States ---
  {
    name: "Andhra Pradesh",
    nativeName: "ఆంధ్రప్రదేశ్",
    slug: "andhra-pradesh",
    code: "AP",
    primaryLanguages: ["te", "en"],
    portalName: "Meeseva",
    portalUrl: "", // to be verified
  },
  {
    name: "Arunachal Pradesh",
    nativeName: "अरुणाचल प्रदेश",
    slug: "arunachal-pradesh",
    code: "AR",
    primaryLanguages: ["en", "hi"],
    portalName: "ServicePlus Arunachal",
    portalUrl: "", // to be verified
  },
  {
    name: "Assam",
    nativeName: "অসম",
    slug: "assam",
    code: "AS",
    primaryLanguages: ["as", "en"],
    portalName: "SewaSetu Assam",
    portalUrl: "", // to be verified
  },
  {
    name: "Bihar",
    nativeName: "बिहार",
    slug: "bihar",
    code: "BR",
    primaryLanguages: ["hi"],
    portalName: "RTPS Bihar",
    portalUrl: "", // to be verified
  },
  {
    name: "Chhattisgarh",
    nativeName: "छत्तीसगढ़",
    slug: "chhattisgarh",
    code: "CG",
    primaryLanguages: ["hi"],
    portalName: "e-District Chhattisgarh",
    portalUrl: "", // to be verified
  },
  {
    name: "Goa",
    nativeName: "गोंय",
    slug: "goa",
    code: "GA",
    primaryLanguages: ["kok", "en", "mr"],
    portalName: "Goa Online",
    portalUrl: "", // to be verified
  },
  {
    name: "Gujarat",
    nativeName: "ગુજરાત",
    slug: "gujarat",
    code: "GJ",
    primaryLanguages: ["gu", "en", "hi"],
    launchState: true,
    portalName: "Digital Gujarat",
    portalUrl: "", // to be verified
  },
  {
    name: "Haryana",
    nativeName: "हरियाणा",
    slug: "haryana",
    code: "HR",
    primaryLanguages: ["hi", "en", "pa"],
    portalName: "Antyodaya Saral Haryana",
    portalUrl: "", // to be verified
  },
  {
    name: "Himachal Pradesh",
    nativeName: "हिमाचल प्रदेश",
    slug: "himachal-pradesh",
    code: "HP",
    primaryLanguages: ["hi", "en"],
    portalName: "e-District Himachal",
    portalUrl: "", // to be verified
  },
  {
    name: "Jharkhand",
    nativeName: "झारखंड",
    slug: "jharkhand",
    code: "JH",
    primaryLanguages: ["hi"],
    portalName: "JharSewa Jharkhand",
    portalUrl: "", // to be verified
  },
  {
    name: "Karnataka",
    nativeName: "ಕರ್ನಾಟಕ",
    slug: "karnataka",
    code: "KA",
    primaryLanguages: ["kn", "en"],
    portalName: "Seva Sindhu",
    portalUrl: "", // to be verified
  },
  {
    name: "Kerala",
    nativeName: "കേരളം",
    slug: "kerala",
    code: "KL",
    primaryLanguages: ["ml", "en"],
    portalName: "e-District Kerala",
    portalUrl: "", // to be verified
  },
  {
    name: "Madhya Pradesh",
    nativeName: "मध्य प्रदेश",
    slug: "madhya-pradesh",
    code: "MP",
    primaryLanguages: ["hi"],
    portalName: "MP e-District",
    portalUrl: "", // to be verified
  },
  {
    name: "Maharashtra",
    nativeName: "महाराष्ट्र",
    slug: "maharashtra",
    code: "MH",
    primaryLanguages: ["mr", "en", "hi"],
    portalName: "Aaple Sarkar",
    portalUrl: "", // to be verified
  },
  {
    name: "Manipur",
    nativeName: "মণিপুর",
    slug: "manipur",
    code: "MN",
    primaryLanguages: ["mni", "en"],
    portalName: "e-District Manipur",
    portalUrl: "", // to be verified
  },
  {
    name: "Meghalaya",
    nativeName: "Meghalaya",
    slug: "meghalaya",
    code: "ML",
    primaryLanguages: ["en"],
    portalName: "e-District Meghalaya",
    portalUrl: "", // to be verified
  },
  {
    name: "Mizoram",
    nativeName: "Mizoram",
    slug: "mizoram",
    code: "MZ",
    primaryLanguages: ["lus", "en"],
    portalName: "Mizoram State Portal",
    portalUrl: "", // to be verified
  },
  {
    name: "Nagaland",
    nativeName: "Nagaland",
    slug: "nagaland",
    code: "NL",
    primaryLanguages: ["en"],
    portalName: "e-District Nagaland",
    portalUrl: "", // to be verified
  },
  {
    name: "Odisha",
    nativeName: "ଓଡ଼ିଶା",
    slug: "odisha",
    code: "OD",
    primaryLanguages: ["or", "en"],
    portalName: "Odisha e-District",
    portalUrl: "", // to be verified
  },
  {
    name: "Punjab",
    nativeName: "ਪੰਜਾਬ",
    slug: "punjab",
    code: "PB",
    primaryLanguages: ["pa", "en"],
    portalName: "Connect Punjab",
    portalUrl: "", // to be verified
  },
  {
    name: "Rajasthan",
    nativeName: "राजस्थान",
    slug: "rajasthan",
    code: "RJ",
    primaryLanguages: ["hi", "en"],
    portalName: "e-Mitra Rajasthan",
    portalUrl: "", // to be verified
  },
  {
    name: "Sikkim",
    nativeName: "सिक्किम",
    slug: "sikkim",
    code: "SK",
    primaryLanguages: ["ne", "en", "hi"],
    portalName: "Sikkim State Portal",
    portalUrl: "", // to be verified
  },
  {
    name: "Tamil Nadu",
    nativeName: "தமிழ்நாடு",
    slug: "tamil-nadu",
    code: "TN",
    primaryLanguages: ["ta", "en"],
    portalName: "e-Sevai Tamil Nadu",
    portalUrl: "", // to be verified
  },
  {
    name: "Telangana",
    nativeName: "తెలంగాణ",
    slug: "telangana",
    code: "TG",
    primaryLanguages: ["te", "en", "ur"],
    portalName: "MeeSeva Telangana",
    portalUrl: "", // to be verified
  },
  {
    name: "Tripura",
    nativeName: "ত্রিপুরা",
    slug: "tripura",
    code: "TR",
    primaryLanguages: ["bn", "en"],
    portalName: "e-District Tripura",
    portalUrl: "", // to be verified
  },
  {
    name: "Uttar Pradesh",
    nativeName: "उत्तर प्रदेश",
    slug: "uttar-pradesh",
    code: "UP",
    primaryLanguages: ["hi", "ur", "en"],
    portalName: "e-District UP",
    portalUrl: "", // to be verified
  },
  {
    name: "Uttarakhand",
    nativeName: "उत्तराखंड",
    slug: "uttarakhand",
    code: "UK",
    primaryLanguages: ["hi", "en"],
    portalName: "e-Sewa Uttarakhand",
    portalUrl: "", // to be verified
  },
  {
    name: "West Bengal",
    nativeName: "পশ্চিমবঙ্গ",
    slug: "west-bengal",
    code: "WB",
    primaryLanguages: ["bn", "en"],
    portalName: "Banglarbhumi / e-District WB",
    portalUrl: "", // to be verified
  },

  // --- 8 Union Territories ---
  {
    name: "Andaman and Nicobar Islands",
    nativeName: "अंडमान और निकोबार द्वीप समूह",
    slug: "andaman-and-nicobar-islands",
    code: "AN",
    primaryLanguages: ["en", "hi"],
    portalName: "e-District Andaman",
    portalUrl: "", // to be verified
  },
  {
    name: "Chandigarh",
    nativeName: "ਚੰਡੀਗੜ੍ਹ",
    slug: "chandigarh",
    code: "CH",
    primaryLanguages: ["en", "pa", "hi"],
    portalName: "e-Sampark Chandigarh",
    portalUrl: "", // to be verified
  },
  {
    name: "Dadra and Nagar Haveli and Daman and Diu",
    nativeName: "દાદરા અને નગર હવેલી અને દમણ અને દીવ",
    slug: "dadra-and-nagar-haveli-and-daman-and-diu",
    code: "DN",
    primaryLanguages: ["gu", "hi", "en"],
    portalName: "e-District Daman Diu",
    portalUrl: "", // to be verified
  },
  {
    name: "Delhi",
    nativeName: "दिल्ली (NCR)",
    slug: "delhi",
    code: "DL",
    primaryLanguages: ["hi", "en", "pa", "ur"],
    portalName: "e-District Delhi",
    portalUrl: "", // to be verified
  },
  {
    name: "Jammu and Kashmir",
    nativeName: "جموں و کشمیر",
    slug: "jammu-and-kashmir",
    code: "JK",
    primaryLanguages: ["ks", "ur", "en", "hi"],
    portalName: "e-UNNAT J&K",
    portalUrl: "", // to be verified
  },
  {
    name: "Ladakh",
    nativeName: "ལ་དྭགས",
    slug: "ladakh",
    code: "LA",
    primaryLanguages: ["en", "hi"],
    portalName: "e-District Ladakh",
    portalUrl: "", // to be verified
  },
  {
    name: "Lakshadweep",
    nativeName: "ലക്ഷദ്വീപ്",
    slug: "lakshadweep",
    code: "LD",
    primaryLanguages: ["ml", "en"],
    portalName: "Lakshadweep Portal",
    portalUrl: "", // to be verified
  },
  {
    name: "Puducherry",
    nativeName: "புதுச்சேரி",
    slug: "puducherry",
    code: "PY",
    primaryLanguages: ["ta", "en", "fr"],
    portalName: "e-District Puducherry",
    portalUrl: "", // to be verified
  },
];
