import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Design System Showcase | India Paperwork Guide",
  description:
    "Internal visual catalog of all light-only design tokens, typography, civic components, and illustrations.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function DesignLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
