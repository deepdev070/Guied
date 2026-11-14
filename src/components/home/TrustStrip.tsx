import React from "react";
import { ShieldCheck, RefreshCw, Sparkles } from "lucide-react";

export function TrustStrip() {
  const trustPoints = [
    {
      icon: ShieldCheck,
      title: "Verified from official sources",
      description: "Direct citations from gazettes and official .gov.in / .nic.in portals.",
      iconBg: "bg-success-soft text-success",
    },
    {
      icon: RefreshCw,
      title: "Updated regularly",
      description: "Monitored statutory fees and recent counter rule changes.",
      iconBg: "bg-primary-soft text-primary",
    },
    {
      icon: Sparkles,
      title: "Free, no login",
      description: "Instant access without phone numbers, passwords, or hidden fees.",
      iconBg: "bg-accent-soft text-warning",
    },
  ];

  return (
    <section
      aria-label="Trust and reliability guarantees"
      className="rounded-card border-border bg-surface-alt/60 my-10 border p-6 sm:p-8"
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
        {trustPoints.map((point) => {
          const IconComponent = point.icon;
          return (
            <div key={point.title} className="flex items-start gap-4">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${point.iconBg}`}
                aria-hidden="true"
              >
                <IconComponent className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-body text-text font-semibold">{point.title}</h3>
                <p className="text-small text-muted mt-1 leading-relaxed">{point.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
