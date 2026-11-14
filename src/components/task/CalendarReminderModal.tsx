"use client";

import React, { useState } from "react";
import { Calendar, X, Bell, CheckCircle2, Download } from "lucide-react";
import { generateIcsCalendar, downloadIcsFile } from "@/lib/calendar";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import type { DocumentRequirement } from "@/types/content";

export interface CalendarReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskTitle: string;
  stateName?: string;
  documents?: DocumentRequirement[];
  canonicalUrl?: string;
}

export function CalendarReminderModal({
  isOpen,
  onClose,
  taskTitle,
  stateName,
  documents = [],
  canonicalUrl,
}: CalendarReminderModalProps) {
  // Tomorrow's date as default
  const getDefaultDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [date, setDate] = useState(getDefaultDate);
  const [time, setTime] = useState("10:00");
  const [location, setLocation] = useState("");
  const [isDownloaded, setIsDownloaded] = useState(false);

  const modalRef = useFocusTrap<HTMLDivElement>({
    isOpen,
    onClose,
    returnFocus: true,
  });

  if (!isOpen) return null;

  const handleDownload = (e: React.FormEvent) => {
    e.preventDefault();

    const icsContent = generateIcsCalendar({
      taskTitle,
      stateName,
      appointmentDate: date,
      appointmentTime: time,
      location: location.trim() || undefined,
      canonicalUrl,
      documents,
    });

    const slugName = taskTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const filename = `${slugName}-appointment-reminder.ics`;

    downloadIcsFile(filename, icsContent);
    setIsDownloaded(true);

    setTimeout(() => {
      setIsDownloaded(false);
      onClose();
    }, 1800);
  };

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="calendar-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Content */}
      <div className="rounded-card border-border bg-background shadow-soft-xl relative z-10 w-full max-w-lg border p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary-soft text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
              <Calendar className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h3 id="calendar-modal-title" className="text-h3 text-text font-bold">
                Add Appointment Reminder
              </h3>
              <p className="text-muted text-xs">
                Downloads an .ics file compatible with Google Calendar, Apple Calendar, and Outlook.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-input text-muted hover:bg-surface-alt hover:text-text cursor-pointer p-1.5 transition-colors"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleDownload} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Date Input */}
            <div>
              <label htmlFor="reminder-date" className="text-text block text-xs font-bold">
                Appointment Date
              </label>
              <div className="relative mt-1.5">
                <input
                  id="reminder-date"
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="rounded-input border-border bg-surface text-text focus:border-primary focus:ring-primary/20 h-11 w-full border px-3 text-sm font-medium focus:ring-2 focus:outline-none"
                />
              </div>
            </div>

            {/* Time Input */}
            <div>
              <label htmlFor="reminder-time" className="text-text block text-xs font-bold">
                Appointment Time
              </label>
              <div className="relative mt-1.5">
                <input
                  id="reminder-time"
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="rounded-input border-border bg-surface text-text focus:border-primary focus:ring-primary/20 h-11 w-full border px-3 text-sm font-medium focus:ring-2 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Location Input (Optional) */}
          <div>
            <label htmlFor="reminder-location" className="text-text block text-xs font-bold">
              Kendra / Office Location <span className="text-muted font-normal">(Optional)</span>
            </label>
            <div className="relative mt-1.5">
              <input
                id="reminder-location"
                type="text"
                placeholder={
                  stateName
                    ? `e.g. ${stateName} Seva Kendra or RTO`
                    : "e.g. Passport Seva Kendra / RTO"
                }
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="rounded-input border-border bg-surface text-text placeholder:text-muted/60 focus:border-primary focus:ring-primary/20 h-11 w-full border px-3 text-sm focus:ring-2 focus:outline-none"
              />
            </div>
          </div>

          {/* Features Callout */}
          <div className="rounded-input border-border/80 bg-surface-alt/70 space-y-2 border p-3.5 text-xs">
            <div className="flex items-center gap-2 font-medium text-slate-700">
              <Bell className="text-accent h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                <strong>1-Day-Before Alert:</strong> Your phone will alert you 24 hours prior to get
                papers ready.
              </span>
            </div>
            <div className="flex items-center gap-2 font-medium text-slate-700">
              <CheckCircle2 className="text-success h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                <strong>Full Checklist in Description:</strong> All{" "}
                {documents.length > 0 ? documents.length : "required"} documents listed right in
                your calendar event.
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-input border-border hover:bg-surface-alt text-muted hover:text-text cursor-pointer border px-4 py-2.5 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isDownloaded}
              className="rounded-input bg-primary hover:bg-primary-hover shadow-soft-xs flex cursor-pointer items-center gap-2 px-5 py-2.5 text-xs font-bold text-white transition-all disabled:opacity-75"
            >
              {isDownloaded ? (
                <>
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  <span>Downloaded (.ics)</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" aria-hidden="true" />
                  <span>Download .ics File</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
