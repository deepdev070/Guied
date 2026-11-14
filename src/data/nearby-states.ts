import { STATES_SEED_DATA, type StateSeedData } from "../../prisma/data/states.ts";

/**
 * Neighboring states map for all 28 states and 8 union territories of India.
 * Key: 2-letter state code (e.g. "GJ", "MH", "DL").
 * Value: Array of neighboring state codes in geographical proximity order.
 */
export const NEARBY_STATES_MAP: Record<string, string[]> = {
  // Northern India
  JK: ["LA", "HP", "PB"], // Jammu and Kashmir -> Ladakh, Himachal Pradesh, Punjab
  LA: ["JK", "HP"], // Ladakh -> J&K, Himachal Pradesh
  HP: ["JK", "LA", "PB", "HR", "UT"], // Himachal Pradesh
  PB: ["JK", "HP", "HR", "RJ", "CH"], // Punjab
  CH: ["PB", "HR"], // Chandigarh
  UT: ["HP", "UP", "HR"], // Uttarakhand
  HR: ["PB", "HP", "RJ", "UP", "DL", "CH"], // Haryana
  DL: ["HR", "UP", "RJ", "PB"], // Delhi
  UP: ["UT", "HR", "DL", "RJ", "MP", "BR", "JH", "CT"], // Uttar Pradesh
  RJ: ["PB", "HR", "UP", "MP", "GJ"], // Rajasthan

  // Western India
  GJ: ["RJ", "MP", "MH", "DH"], // Gujarat -> Rajasthan, Madhya Pradesh, Maharashtra, Dadra & Nagar Haveli & Daman & Diu
  DH: ["GJ", "MH"], // Dadra and Nagar Haveli and Daman and Diu
  MH: ["GJ", "MP", "CT", "TG", "KA", "GA", "DH"], // Maharashtra
  GA: ["MH", "KA"], // Goa

  // Central India
  MP: ["UP", "RJ", "GJ", "MH", "CT"], // Madhya Pradesh
  CT: ["MP", "UP", "JH", "OR", "TG", "MH"], // Chhattisgarh

  // Eastern India
  BR: ["UP", "JH", "WB"], // Bihar
  JH: ["BR", "UP", "CT", "OR", "WB"], // Jharkhand
  OR: ["WB", "JH", "CT", "AP"], // Odisha
  WB: ["OR", "JH", "BR", "SK", "AS"], // West Bengal
  SK: ["WB", "AS"], // Sikkim

  // Southern India
  AP: ["OR", "CT", "TG", "KA", "TN", "PY"], // Andhra Pradesh
  TG: ["MH", "CT", "AP", "KA"], // Telangana
  KA: ["MH", "GA", "TG", "AP", "TN", "KL"], // Karnataka
  TN: ["AP", "KA", "KL", "PY"], // Tamil Nadu
  KL: ["KA", "TN", "PY"], // Kerala
  PY: ["TN", "AP", "KL"], // Puducherry
  AN: ["TN", "AP", "WB"], // Andaman & Nicobar (maritime / flight links)
  LD: ["KL", "KA"], // Lakshadweep (maritime / flight links)

  // North-Eastern India
  AS: ["WB", "AR", "NL", "MN", "MZ", "TR", "ML"], // Assam (connects all NE states)
  AR: ["AS", "NL"], // Arunachal Pradesh
  NL: ["AS", "AR", "MN"], // Nagaland
  MN: ["NL", "AS", "MZ"], // Manipur
  MZ: ["MN", "AS", "TR"], // Mizoram
  TR: ["MZ", "AS"], // Tripura
  ML: ["AS"], // Meghalaya
};

/**
 * Fallback prominent states for national view or unknown state codes.
 */
export const DEFAULT_POPULAR_STATE_CODES = ["GJ", "MH", "DL", "KA", "RJ", "UP"];

/**
 * Returns 3-5 neighboring StateSeedData objects for a given state slug or code.
 */
export function getNearbyStates(stateSlugOrCode?: string): StateSeedData[] {
  if (!stateSlugOrCode) {
    return STATES_SEED_DATA.filter((s) => DEFAULT_POPULAR_STATE_CODES.includes(s.code)).slice(0, 5);
  }

  const normalized = stateSlugOrCode.trim().toLowerCase();
  const currentState = STATES_SEED_DATA.find(
    (s) => s.slug.toLowerCase() === normalized || s.code.toLowerCase() === normalized
  );

  if (!currentState) {
    return STATES_SEED_DATA.filter((s) => DEFAULT_POPULAR_STATE_CODES.includes(s.code)).slice(0, 5);
  }

  const neighborCodes = NEARBY_STATES_MAP[currentState.code] || [];
  const neighborStates = STATES_SEED_DATA.filter((s) => neighborCodes.includes(s.code));

  if (neighborStates.length > 0) {
    return neighborStates.slice(0, 5);
  }

  // Fallback to nearby states in same region if not directly mapped
  return STATES_SEED_DATA.filter(
    (s) => s.code !== currentState.code && DEFAULT_POPULAR_STATE_CODES.includes(s.code)
  ).slice(0, 5);
}
