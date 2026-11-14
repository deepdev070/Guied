/**
 * Calendar Reminder (.ics) Utility
 * Generates RFC 5545 compliant iCalendar (.ics) files for citizen paperwork appointments.
 * Runs 100% client-side without any user accounts or external server dependencies.
 */

import type { DocumentRequirement } from "@/types/content";

export interface CalendarEventOptions {
  taskTitle: string;
  stateName?: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:mm (24-hour format)
  durationMinutes?: number; // default 60
  location?: string;
  canonicalUrl?: string;
  documents?: DocumentRequirement[];
  notes?: string;
}

/**
 * Escapes characters for iCalendar text fields per RFC 5545
 * Comma (,), semicolon (;), and backslash (\) must be backslash-escaped.
 * Newlines must be represented as literal \n.
 */
export function escapeIcsText(text: string): string {
  if (!text) return "";
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/**
 * Formats a local date and time string into iCalendar local format: YYYYMMDDTHHmm00
 */
export function formatIcsDateTime(dateStr: string, timeStr: string): string {
  const cleanDate = dateStr.replace(/-/g, "");
  const [hours = "10", minutes = "00"] = timeStr.split(":");
  const padH = hours.padStart(2, "0");
  const padM = minutes.padStart(2, "0");
  return `${cleanDate}T${padH}${padM}00`;
}

/**
 * Calculates end time given start date, start time, and duration in minutes
 */
export function calculateEndDateTime(
  dateStr: string,
  timeStr: string,
  durationMinutes = 60
): string {
  const [hours = 10, minutes = 0] = timeStr.split(":").map(Number);
  const dateObj = new Date(
    `${dateStr}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`
  );

  dateObj.setMinutes(dateObj.getMinutes() + durationMinutes);

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  const h = String(dateObj.getHours()).padStart(2, "0");
  const m = String(dateObj.getMinutes()).padStart(2, "0");

  return `${year}${month}${day}T${h}${m}00`;
}

/**
 * Formats UTC timestamp for DTSTAMP: YYYYMMDDTHHmmssZ
 */
export function formatUtcTimestamp(date: Date = new Date()): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

/**
 * Generates an RFC 5545 iCalendar string (.ics) with:
 * - VEVENT with appointment summary and location
 * - Full document checklist formatted into DESCRIPTION
 * - 1-day-before alert (VALARM with TRIGGER:-P1D)
 */
export function generateIcsCalendar(options: CalendarEventOptions): string {
  const {
    taskTitle,
    stateName,
    appointmentDate,
    appointmentTime,
    durationMinutes = 60,
    location,
    canonicalUrl,
    documents = [],
    notes,
  } = options;

  const summary = `Appointment: ${taskTitle}${stateName ? ` (${stateName})` : ""}`;
  const dtStart = formatIcsDateTime(appointmentDate, appointmentTime);
  const dtEnd = calculateEndDateTime(appointmentDate, appointmentTime, durationMinutes);
  const dtStamp = formatUtcTimestamp();
  const uid = `ipg-${appointmentDate.replace(/-/g, "")}-${Date.now()}@indiapaperworkguide.in`;

  // Build structured document description
  const docLines: string[] = [];
  docLines.push(`APPOINTMENT CHECKLIST: ${taskTitle}`);
  if (stateName) {
    docLines.push(`State: ${stateName}`);
  }
  docLines.push(`Date & Time: ${appointmentDate} at ${appointmentTime}`);
  docLines.push("");
  docLines.push("REQUIRED DOCUMENTS TO CARRY:");

  if (documents.length > 0) {
    documents.forEach((doc, idx) => {
      const copiesNote = doc.copiesHint ? ` (${doc.copiesHint})` : "";
      const reqNote =
        doc.requirementType === "required"
          ? ""
          : ` [${doc.requirementType === "optional" ? "Optional" : "Conditional"}]`;
      docLines.push(`${idx + 1}. [ ] ${doc.name}${copiesNote}${reqNote}`);
    });
  } else {
    docLines.push("- Please bring all original identity, address, and application documents.");
  }

  docLines.push("");
  docLines.push("IMPORTANT REMINDERS:");
  docLines.push("- Carry both original documents and 2 sets of self-attested photocopies.");
  docLines.push("- Carry printed appointment acknowledgment slip & payment receipt.");
  docLines.push("- Arrive 15 minutes before your scheduled appointment slot.");

  if (notes) {
    docLines.push("");
    docLines.push(`Notes: ${notes}`);
  }

  if (canonicalUrl) {
    docLines.push("");
    docLines.push(`Verify checklist on official guide: ${canonicalUrl}`);
  }

  const description = escapeIcsText(docLines.join("\n"));
  const cleanSummary = escapeIcsText(summary);
  const cleanLocation = escapeIcsText(
    location || (stateName ? `${stateName} Seva Kendra / Office` : "Official Seva Kendra / Office")
  );

  // Assemble iCalendar RFC 5545 lines (CRLF line endings)
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//India Paperwork Guide//Civic Portal//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${cleanSummary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${cleanLocation}`,
  ];

  if (canonicalUrl) {
    lines.push(`URL:${canonicalUrl}`);
  }

  // 1-Day-Before Alert (VALARM with -P1D trigger)
  lines.push(
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:Reminder: Appointment for ${escapeIcsText(taskTitle)} tomorrow. Prepare your documents folder!`,
    "TRIGGER:-P1D",
    "END:VALARM"
  );

  lines.push("END:VEVENT", "END:VCALENDAR");

  return lines.join("\r\n");
}

/**
 * Triggers browser download of the generated .ics file
 */
export function downloadIcsFile(filename: string, icsContent: string): void {
  if (typeof window === "undefined") return;

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  const safeFilename = filename.endsWith(".ics") ? filename : `${filename}.ics`;
  link.href = url;
  link.setAttribute("download", safeFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
