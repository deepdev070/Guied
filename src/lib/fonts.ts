import { Inter, Noto_Sans_Devanagari, Noto_Sans_Gujarati } from "next/font/google";

/**
 * Preloaded high-performance fonts with display="swap" to guarantee LCP < 2.5s and zero FOIT.
 */
export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
});

export const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  display: "swap",
  variable: "--font-noto-devanagari",
  weight: ["400", "500", "600", "700"],
  preload: true,
});

export const notoSansGujarati = Noto_Sans_Gujarati({
  subsets: ["gujarati"],
  display: "swap",
  variable: "--font-noto-gujarati",
  weight: ["400", "500", "600", "700"],
  preload: true,
});

export const fontVariables = `${inter.variable} ${notoSansDevanagari.variable} ${notoSansGujarati.variable}`;
