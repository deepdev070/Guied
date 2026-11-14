import type { Metadata } from "next";
import { HomePageView } from "@/components/home/HomePageView";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "भारत कागजी कार्रवाई गाइड | सत्यापित नागरिक दस्तावेज़ चेकलिस्ट एवं सरकारी शुल्क",
  description:
    "ड्राइविंग लाइसेंस, नया पासपोर्ट, जन्म प्रमाण पत्र और 100+ भारतीय नागरिक सेवाओं के लिए आधिकारिक चेकलिस्ट और सरकारी शुल्क विवरण।",
  alternates: {
    canonical: `${siteConfig.baseUrl}/hi`,
    languages: {
      en: siteConfig.baseUrl,
      hi: `${siteConfig.baseUrl}/hi`,
      gu: `${siteConfig.baseUrl}/gu`,
    },
  },
};

export default async function HindiHomePage() {
  return <HomePageView locale="hi" />;
}

