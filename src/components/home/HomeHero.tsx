import React from "react";
import { HeroIllustration } from "@/components/illustrations/HeroIllustration";
import { HeroSearch } from "./HeroSearch";

export function HomeHero() {
  return (
    <section
      aria-label="Welcome and search"
      className="border-border to-primary-soft/30 -mx-4 -mt-8 border-b bg-gradient-to-b from-white via-white px-4 py-12 sm:-mx-6 sm:px-6 md:py-16 lg:py-20"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Heading, Subtitle, Search and State Selector */}
          <div className="flex flex-col lg:col-span-7">
            <div className="rounded-chip border-primary/20 bg-primary-soft text-primary inline-flex w-fit items-center gap-2 border px-3 py-1 text-xs font-semibold">
              <span className="bg-primary h-2 w-2 rounded-full" aria-hidden="true" />
              <span>Verified Indian Government Procedures</span>
            </div>

            <h1 className="text-h1 text-text mt-4 font-bold tracking-tight">
              Know exactly what you need before you go to the office
            </h1>

            <p className="text-body text-muted mt-3 font-normal">
              Official document checklists, statutory fees, and step-by-step counter procedures for
              everyday Indian public services.
            </p>

            <div className="mt-8">
              <HeroSearch />
            </div>
          </div>

          {/* Right Column: Friendly Civic Illustration (Hidden on mobile) */}
          <div className="hidden lg:col-span-5 lg:flex lg:items-center lg:justify-center">
            <div className="relative w-full max-w-[380px]">
              <HeroIllustration className="h-auto w-full drop-shadow-sm" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
