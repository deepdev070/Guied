import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  generateIcsCalendar,
  formatIcsDateTime,
  calculateEndDateTime,
  escapeIcsText,
} from "../src/lib/calendar.ts";
import type { DocumentRequirement } from "../src/types/content.ts";

describe("Prompt 68: Calendar Reminders (.ics Generation)", () => {
  const sampleDocuments: DocumentRequirement[] = [
    {
      name: "Original Existing Passport",
      requirementType: "required",
      copiesHint: "1 self-attested photocopy of first 2 and last 2 pages",
      status: "PUBLISHED",
      displayOrder: 1,
    },
    {
      name: "Proof of Present Address",
      requirementType: "required",
      description: "Aadhaar Card, Electricity Bill, or Voter ID",
      copiesHint: "Original + 1 self-attested copy",
      status: "PUBLISHED",
      displayOrder: 2,
    },
    {
      name: "Annexure E Declaration",
      requirementType: "optional",
      status: "PUBLISHED",
      displayOrder: 3,
    },
  ];

  it("escapes special characters per RFC 5545 specification", () => {
    const raw = "Note: Bring A, B; also \\folder\\ with new\nline";
    const escaped = escapeIcsText(raw);
    assert.ok(escaped.includes("A\\, B\\;"));
    assert.ok(escaped.includes("\\\\folder\\\\"));
    assert.ok(escaped.includes("\\nline"));
  });

  it("formats appointment date and time into iCalendar floating format", () => {
    const formatted = formatIcsDateTime("2026-11-25", "10:30");
    assert.equal(formatted, "20261125T103000");
  });

  it("calculates end time with default 60 minutes duration", () => {
    const end = calculateEndDateTime("2026-11-25", "10:30", 60);
    assert.equal(end, "20261125T113000");
  });

  it("calculates end time rolling over hour boundaries", () => {
    const end = calculateEndDateTime("2026-11-25", "23:45", 30);
    assert.equal(end, "20261126T001500");
  });

  it("generates a complete RFC 5545 .ics file with 1-day-before alert and document checklist", () => {
    const ics = generateIcsCalendar({
      taskTitle: "Passport Renewal",
      stateName: "Gujarat",
      appointmentDate: "2026-12-05",
      appointmentTime: "11:15",
      location: "Passport Seva Kendra, Mithakhali, Ahmedabad",
      canonicalUrl: "https://indiapaperworkguide.in/passport-renewal/gujarat",
      documents: sampleDocuments,
    });

    // Check VCALENDAR envelope
    assert.ok(ics.startsWith("BEGIN:VCALENDAR"), "Must start with BEGIN:VCALENDAR");
    assert.ok(ics.endsWith("END:VCALENDAR"), "Must end with END:VCALENDAR");
    assert.ok(ics.includes("VERSION:2.0"), "Must specify VERSION:2.0");
    assert.ok(ics.includes("PRODID:-//India Paperwork Guide"), "Must have custom PRODID");

    // Check VEVENT and timestamps
    assert.ok(ics.includes("BEGIN:VEVENT"), "Must contain VEVENT block");
    assert.ok(ics.includes("DTSTART:20261205T111500"), "Must include exact start date and time");
    assert.ok(ics.includes("DTEND:20261205T121500"), "Must include end time 1 hour later");
    assert.ok(
      ics.includes("SUMMARY:Appointment: Passport Renewal (Gujarat)"),
      "Must include task and state"
    );
    assert.ok(
      ics.includes("LOCATION:Passport Seva Kendra\\, Mithakhali\\, Ahmedabad"),
      "Must include location"
    );
    assert.ok(
      ics.includes("URL:https://indiapaperworkguide.in/passport-renewal/gujarat"),
      "Must include URL"
    );

    // Check 1-Day-Before Alert (VALARM)
    assert.ok(ics.includes("BEGIN:VALARM"), "Must include VALARM alarm block");
    assert.ok(ics.includes("TRIGGER:-P1D"), "Must trigger 1 day (-P1D) before appointment");
    assert.ok(ics.includes("ACTION:DISPLAY"), "Must specify DISPLAY action for mobile alerts");
    assert.ok(ics.includes("END:VALARM"), "Must close VALARM block");

    // Check document checklist in DESCRIPTION
    assert.ok(ics.includes("DESCRIPTION:"), "Must include DESCRIPTION field");
    assert.ok(ics.includes("Original Existing Passport"), "Must contain document 1 name");
    assert.ok(ics.includes("1 self-attested photocopy"), "Must contain copies hint");
    assert.ok(ics.includes("Proof of Present Address"), "Must contain document 2 name");
    assert.ok(ics.includes("Annexure E Declaration"), "Must contain document 3 name");
    assert.ok(ics.includes("[Optional]"), "Must indicate optional documents");
    assert.ok(ics.includes("IMPORTANT REMINDERS"), "Must include reminders");
  });

  it("verifies CalendarReminderModal component implementation", () => {
    const modalPath = path.join(process.cwd(), "src/components/task/CalendarReminderModal.tsx");
    assert.ok(fs.existsSync(modalPath), "CalendarReminderModal.tsx must exist");

    const code = fs.readFileSync(modalPath, "utf-8");
    assert.ok(code.includes('role="dialog"'), "Must have role=dialog for accessibility");
    assert.ok(code.includes("generateIcsCalendar"), "Must use generateIcsCalendar");
    assert.ok(code.includes("downloadIcsFile"), "Must trigger download");
    assert.ok(code.includes("1-Day-Before Alert"), "Must mention 1-day alert to user");
    assert.ok(code.includes("Full Checklist in Description"), "Must mention checklist");
  });

  it("verifies TaskSidebar and DocumentSection integrate reminder triggers", () => {
    const sidebarCode = fs.readFileSync(
      path.join(process.cwd(), "src/components/task/TaskSidebar.tsx"),
      "utf-8"
    );
    assert.ok(
      sidebarCode.includes("CalendarReminderModal"),
      "TaskSidebar must import and render CalendarReminderModal"
    );
    assert.ok(
      sidebarCode.includes("Add Appointment Reminder"),
      "TaskSidebar must have Add Appointment Reminder button"
    );

    const docSectionCode = fs.readFileSync(
      path.join(process.cwd(), "src/components/task/DocumentSection.tsx"),
      "utf-8"
    );
    assert.ok(
      docSectionCode.includes("CalendarReminderModal"),
      "DocumentSection must import and render CalendarReminderModal"
    );
    assert.ok(
      docSectionCode.includes("Add reminder"),
      "DocumentSection must have Add reminder button"
    );
  });
});
