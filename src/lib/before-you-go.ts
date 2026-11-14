import type { BeforeYouGoItem } from "../types/content.ts";

export function getDefaultBeforeYouGoItems(taskTitle: string): BeforeYouGoItem[] {
  return [
    {
      id: "originals",
      title: "All Original Documents",
      description: `Carry physical originals of all proof papers (Aadhaar, proof of address, birth date proof) for live verification at the counter for ${taskTitle}.`,
      icon: "FolderCheck",
    },
    {
      id: "photocopies",
      title: "2 Sets of Self-Attested Photocopies",
      description:
        "Black-and-white photocopies signed with your signature and today's date in blue or black ink across the blank margin.",
      icon: "Copy",
    },
    {
      id: "photos",
      title: "Passport Photographs",
      description:
        "2 to 4 recent passport photos (35mm x 45mm, plain white background, front-facing without tinted glasses).",
      icon: "Camera",
    },
    {
      id: "payment",
      title: "Accepted Payment Mode",
      description:
        "UPI app or active debit card for statutory portal fees, plus ₹200–₹500 exact cash change if counter fees apply.",
      icon: "CreditCard",
    },
    {
      id: "printout",
      title: "Appointment Slip & SMS",
      description:
        "Physical printout of your appointment booking acknowledgment receipt & application reference number (ARN).",
      icon: "FileText",
    },
  ];
}
