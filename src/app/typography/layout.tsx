import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "UI Components & Typography Showcase",
  description:
    "Design system type scale verification and UI components: Button, TextInput, Select, SearchField, Card, Badge, and Chip.",
};

export default function TypographyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
