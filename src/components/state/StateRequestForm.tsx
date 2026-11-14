"use client";

import React, { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";

export interface StateRequestFormProps {
  stateName: string;
}

export function StateRequestForm({ stateName }: StateRequestFormProps) {
  const [serviceNeeded, setServiceNeeded] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceNeeded.trim()) return;

    try {
      const requests = JSON.parse(localStorage.getItem("guide_requests") || "[]");
      requests.push({
        stateName,
        serviceNeeded,
        email,
        notes,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem("guide_requests", JSON.stringify(requests));
    } catch {
      // Ignore storage errors
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="rounded-card border-success/30 bg-success-soft/30 p-6 text-center">
        <CheckCircle2 className="text-success mx-auto h-9 w-9" aria-hidden="true" />
        <h4 className="text-body text-text mt-3 font-bold">Request Received!</h4>
        <p className="text-small text-muted mx-auto mt-1 max-w-md">
          Thank you. Our civic research team prioritizes guides based on citizen demand for{" "}
          <strong>{stateName}</strong>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="service-needed" className="text-small text-text mb-1.5 block font-semibold">
          Which document or service do you need in {stateName}?{" "}
          <span className="text-danger">*</span>
        </label>
        <input
          id="service-needed"
          type="text"
          required
          value={serviceNeeded}
          onChange={(e) => setServiceNeeded(e.target.value)}
          placeholder="e.g. Ration card member addition, Caste certificate, Property registration..."
          className="rounded-input border-border text-text focus-visible:border-primary focus-visible:ring-primary/40 h-[44px] w-full border bg-white px-3.5 text-sm focus-visible:ring-2 focus-visible:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="requester-email"
            className="text-small text-text mb-1.5 block font-semibold"
          >
            Your Email (Optional - to get notified when published)
          </label>
          <input
            id="requester-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="citizen@example.com"
            className="rounded-input border-border text-text focus-visible:border-primary focus-visible:ring-primary/40 h-[44px] w-full border bg-white px-3.5 text-sm focus-visible:ring-2 focus-visible:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="additional-notes"
            className="text-small text-text mb-1.5 block font-semibold"
          >
            District / Any Specific Query
          </label>
          <input
            id="additional-notes"
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Surat RTO, urgent counter query..."
            className="rounded-input border-border text-text focus-visible:border-primary focus-visible:ring-primary/40 h-[44px] w-full border bg-white px-3.5 text-sm focus-visible:ring-2 focus-visible:outline-none"
          />
        </div>
      </div>

      <button
        type="submit"
        className="rounded-input bg-primary hover:bg-primary-hover shadow-soft-xs inline-flex h-11 items-center justify-center gap-2 px-5 text-xs font-bold text-white transition-all active:scale-98"
      >
        <Send className="h-4 w-4" aria-hidden="true" />
        <span>Submit Guide Request</span>
      </button>
    </form>
  );
}
