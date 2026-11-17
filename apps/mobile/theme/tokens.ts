/**
 * Design Tokens for Mobile App (Expo / React Native)
 * Ports the web design system to React Native with strict LIGHT THEME ONLY
 * and 44pt minimum touch targets for citizen accessibility.
 */

export const colors = {
  // Brand & Primary
  primary: "#2563EB", // Blue 600
  primaryDark: "#1D4ED8", // Blue 700
  primaryLight: "#EFF6FF", // Blue 50
  primaryBorder: "#BFDBFE", // Blue 200

  // Surface & Background (Strict Light Theme)
  surface: "#FFFFFF",
  background: "#F8FAFC", // Slate 50
  surfaceSubtle: "#F1F5F9", // Slate 100

  // Text & Content
  text: "#0F172A", // Slate 900
  textMuted: "#475569", // Slate 600
  textSubtle: "#94A3B8", // Slate 400
  textInverse: "#FFFFFF",

  // Borders & Dividers
  border: "#E2E8F0", // Slate 200
  borderDark: "#CBD5E1", // Slate 300
  borderFocus: "#2563EB",

  // Status & Feedback
  success: "#16A34A", // Green 600
  successLight: "#F0FDF4", // Green 50
  successBorder: "#BBF7D0", // Green 200
  successText: "#15803D", // Green 700

  warning: "#D97706", // Amber 600
  warningLight: "#FFFBEB", // Amber 50
  warningBorder: "#FDE68A", // Amber 200
  warningText: "#B45309", // Amber 700

  error: "#DC2626", // Red 600
  errorLight: "#FEF2F2", // Red 50
  errorBorder: "#FECACA", // Red 200
  errorText: "#B91C1C", // Red 700
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const typography = {
  h1: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "bold" as const,
  },
  h2: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "bold" as const,
  },
  h3: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "normal" as const,
  },
  bodySm: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "normal" as const,
  },
  caption: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "500" as const,
  },
} as const;

export const layout = {
  minTouchTarget: 44, // Minimum 44pt touch area for WCAG 2.2 AA / Mobile OS guidelines
  searchFieldHeight: 48,
  buttonHeightMd: 44,
  buttonHeightLg: 48,
} as const;

export const theme = {
  colors,
  spacing,
  radius,
  typography,
  layout,
};

export default theme;

