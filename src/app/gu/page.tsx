import type { Metadata } from "next";
import { HomePageView } from "@/components/home/HomePageView";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "ભારત દસ્તાવેજ માર્ગદર્શિકા | ચકાસાયેલ સરકારી ચેકલિસ્ટ અને ફી",
  description:
    "ડ્રાઇવિંગ લાઇસન્સ, નવો પાસપોર્ટ, જન્મ પ્રમાણપત્ર અને 100+ નાગરિક સેવાઓ માટે સત્તાવાર દસ્તાવેજ ચેકલિસ્ટ અને સરકારી ફી વિગતો.",
  alternates: {
    canonical: `${siteConfig.baseUrl}/gu`,
    languages: {
      en: siteConfig.baseUrl,
      hi: `${siteConfig.baseUrl}/hi`,
      gu: `${siteConfig.baseUrl}/gu`,
    },
  },
};

export default async function GujaratiHomePage() {
  return <HomePageView locale="gu" />;
}
