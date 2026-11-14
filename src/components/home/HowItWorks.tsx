import React from "react";
import { Search, ListChecks, CheckCircle2 } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      number: "1",
      icon: Search,
      title: "Choose task",
      description: "Find your required service and select your state for localized guidelines.",
    },
    {
      number: "2",
      icon: ListChecks,
      title: "See your checklist",
      description:
        "Get exact lists of required originals, photocopies, passport photos, and official fees.",
    },
    {
      number: "3",
      icon: CheckCircle2,
      title: "Go prepared",
      description:
        "Follow clear counter steps or apply directly via verified government portal links.",
    },
  ];

  return (
    <section aria-labelledby="how-it-works-heading" className="my-12">
      <div className="mb-8 text-center sm:mb-10">
        <h2 id="how-it-works-heading" className="text-h2 text-text font-bold tracking-tight">
          How it works
        </h2>
        <p className="text-body text-muted mx-auto mt-2 max-w-xl">
          Three simple steps to avoid repeat counter visits and surprise document rejections.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div
              key={step.title}
              className="rounded-card border-border bg-background shadow-soft-xs hover:shadow-soft-sm relative flex flex-col items-center border p-6 text-center transition-all"
            >
              {/* Step Number & Icon Badge */}
              <div
                className="bg-primary-soft text-primary mb-4 flex h-12 w-12 items-center justify-center rounded-full font-bold"
                aria-hidden="true"
              >
                <Icon className="h-6 w-6" />
              </div>

              <h3 className="text-h3 text-text font-semibold">{step.title}</h3>

              <p className="text-small text-muted mt-2 leading-relaxed">{step.description}</p>

              {/* Decorative Arrow for Desktop between Step 1->2 and 2->3 */}
              {index < steps.length - 1 && (
                <div
                  className="text-border pointer-events-none absolute top-1/2 -right-4 hidden -translate-y-1/2 md:block lg:-right-5"
                  aria-hidden="true"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
