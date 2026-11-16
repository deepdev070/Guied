import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Offline | India Paperwork Guide",
  description:
    "You are currently offline. Access your saved citizen checklists and previously opened guides without an internet connection.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OfflinePage() {
  return (
    <div className="bg-surface min-h-[70vh] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        {/* Offline Badge & Visual Icon */}
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-amber-600 shadow-xs">
          <svg
            className="h-10 w-10"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 4.243a9.002 9.002 0 01-5.636-2.671M3 3l18 18M9.879 9.879a5 5 0 00-2.829 4.243m4.243-4.243l4.243 4.243"
            />
          </svg>
        </div>

        <span className="mb-3 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold tracking-wide text-amber-800">
          No Internet Connection
        </span>

        <h1 className="text-text text-3xl font-extrabold tracking-tight sm:text-4xl">
          You are currently offline
        </h1>

        <p className="text-text-muted mx-auto mt-4 max-w-xl text-base leading-relaxed">
          Don&apos;t worry — your paperwork progress is not lost. You can still view any checklist
          or guide you opened earlier on this device.
        </p>

        {/* Quick Actions */}
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/my-checklists"
            className="bg-primary hover:bg-primary-hover focus:ring-primary inline-flex w-full items-center justify-center rounded-lg border border-transparent px-6 py-3 text-base font-medium text-white shadow-xs transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none sm:w-auto"
          >
            <svg
              className="mr-2 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
            View Saved Checklists
          </Link>

          <Link
            href="/"
            className="border-border text-text hover:bg-surface-subtle focus:ring-primary inline-flex w-full items-center justify-center rounded-lg border bg-white px-6 py-3 text-base font-medium transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none sm:w-auto"
          >
            Go to Home
          </Link>
        </div>

        {/* Helpful Citizen Offline Tips */}
        <div className="border-border mt-12 rounded-xl border bg-white p-6 text-left shadow-xs">
          <h2 className="text-text mb-3 flex items-center text-lg font-bold">
            <svg
              className="text-accent-green mr-2 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Helpful tips while offline
          </h2>
          <ul className="text-small text-text-muted space-y-3">
            <li className="flex items-start">
              <span className="text-text mr-2 font-semibold">•</span>
              <span>
                <strong>Saved checklists keep working:</strong> Any item you check or uncheck is
                saved directly on your phone or computer.
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-text mr-2 font-semibold">•</span>
              <span>
                <strong>Gather your physical documents:</strong> You don&apos;t need an internet
                connection to locate your physical Aadhaar, Ration Card, or school certificates.
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-text mr-2 font-semibold">•</span>
              <span>
                <strong>Online portal links:</strong> Official government links (.gov.in / .nic.in)
                will open once your mobile data or Wi-Fi reconnects.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
