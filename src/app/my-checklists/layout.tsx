import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Checklists & Progress",
  description: "Track and manage your verified Indian citizen paperwork checklists offline.",
  robots: {
    index: false, // User checklist state is client-only
    follow: true,
  },
};

export default function MyChecklistsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
