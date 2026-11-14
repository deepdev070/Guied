import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SearchAutocomplete } from "@/components/search/SearchAutocomplete";
import { NotFoundTracker } from "@/components/layout/NotFoundTracker";

const SIX_POPULAR_TASKS = [
  {
    slug: "driving-licence-new",
    name: "New Permanent Driving Licence",
    category: "Vehicles & Driving",
    cost: "₹700",
    time: "7–14 days",
    description: "Book RTO driving test and convert your Learner permit into a permanent DL.",
  },
  {
    slug: "driving-licence-learner",
    name: "Learner's Licence Application (Form 2)",
    category: "Vehicles & Driving",
    cost: "₹200",
    time: "3–7 days",
    description: "Step-by-step guidance for obtaining an Indian Learner permit online.",
  },
  {
    slug: "passport-renewal",
    name: "Passport Renewal (Normal & Tatkaal)",
    category: "Identity & Travel",
    cost: "₹1,500 – ₹3,500",
    time: "5–20 days",
    description: "Re-issue or renew expired Indian passport under Normal or Tatkaal scheme.",
  },
  {
    slug: "pan-card-new",
    name: "New PAN Card (Form 49A)",
    category: "Money & Tax",
    cost: "₹107",
    time: "10–15 days",
    description: "Apply for Permanent Account Number online through NSDL or UTIITSL.",
  },
  {
    slug: "aadhaar-update",
    name: "Aadhaar Card: Address & Mobile Update",
    category: "Identity Documents",
    cost: "₹50",
    time: "7–14 days",
    description: "Update residential address, mobile phone, or demographic details on UIDAI.",
  },
  {
    slug: "ration-card-new",
    name: "Ration Card: Member Addition",
    category: "Family & Food",
    cost: "₹20 – ₹50",
    time: "15–30 days",
    description: "Apply for new household ration card or add newly married spouse or child.",
  },
];

export default function NotFound() {
  return (
    <div className="bg-surface min-h-screen py-10 sm:py-16">
      {/* Client-side telemetry logging missing 404 URL */}
      <NotFoundTracker />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Top Civic Apology Card */}
        <div className="rounded-card border-border shadow-soft-sm border bg-white p-6 text-center sm:p-10">
          <div className="bg-accent-soft text-accent mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
            <svg
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <span className="text-muted text-xs font-bold tracking-wider uppercase">
            Error 404 • Page Not Found
          </span>
          <h1 className="text-h2 text-text sm:text-h1 mt-2 font-extrabold">
            We are sorry, we couldn&apos;t find that page
          </h1>
          <p className="text-body text-muted mx-auto mt-2 max-w-xl">
            The paperwork guide you are looking for may have been moved, renamed, or is currently
            being verified from official gazette notifications.
          </p>

          {/* Prominent Search Bar */}
          <div className="mx-auto mt-6 max-w-xl">
            <SearchAutocomplete
              id="not-found-search-field"
              placeholder="Search paperwork (e.g. Passport, Driving Licence, PAN)..."
            />
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Button href="/" variant="primary" size="md">
              Return Home
            </Button>
            <Button href="/#categories" variant="secondary" size="md">
              Browse Categories
            </Button>
          </div>
        </div>

        {/* 6 Popular Citizen Tasks */}
        <section className="mt-12" aria-labelledby="not-found-popular-heading">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 id="not-found-popular-heading" className="text-h3 text-text font-bold">
                Popular Guides You Might Need
              </h2>
              <p className="text-muted text-xs">
                Frequently searched government procedures with verified statutory fees.
              </p>
            </div>
            <Link
              href="/#categories"
              className="text-primary hidden text-xs font-semibold hover:underline sm:inline-block"
            >
              View all categories →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SIX_POPULAR_TASKS.map((task) => (
              <Link
                key={task.slug}
                href={`/${task.slug}`}
                className="group rounded-card border-border shadow-soft-sm hover:border-primary/40 hover:shadow-soft-md flex flex-col justify-between border bg-white p-5 transition-all duration-200"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="neutral">{task.category}</Badge>
                    <span className="text-text text-xs font-medium">{task.cost}</span>
                  </div>
                  <h3 className="text-text group-hover:text-primary mt-3 text-base font-semibold transition-colors">
                    {task.name}
                  </h3>
                  <p className="text-muted mt-1.5 line-clamp-2 text-xs leading-relaxed">
                    {task.description}
                  </p>
                </div>

                <div className="border-border/50 text-muted mt-4 flex items-center justify-between border-t pt-2.5 text-xs">
                  <span>⏱ {task.time}</span>
                  <span className="text-primary inline-flex items-center font-medium transition-transform group-hover:translate-x-0.5">
                    Checklist →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
