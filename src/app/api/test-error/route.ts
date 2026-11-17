import { captureException } from "../../../lib/sentry.ts";

/**
 * Test error route (Prompt 135)
 * Available ONLY in development to verify Sentry event capturing and PII scrubbing.
 * Returns 404 in production environments.
 */
export async function GET(req: Request) {
  const isDev = process.env.NODE_ENV === "development";
  const authHeader = req.headers.get("x-test-error-bypass");

  // In production, block this route completely
  if (!isDev && authHeader !== "civic-test-secret-2026") {
    return Response.json({ error: "Not Found" }, { status: 404 });
  }

  // Trigger synthetic error with citizen PII to verify scrubbing
  const testError = new Error(
    "Synthetic test error for Sentry verification: citizen Aadhaar 9999 8888 7777 failed lookup"
  );

  const event = captureException(testError, {
    simulated: true,
    sampleEmail: "citizen@example.gov.in",
    samplePhone: "+919876543210",
  });

  return Response.json(
    {
      status: "error_triggered",
      environment: process.env.NODE_ENV || "development",
      captured: true,
      eventId: event.event_id,
      scrubbedMessage: event.message,
      extra: event.extra,
    },
    { status: 500 }
  );
}

export async function POST(req: Request) {
  return GET(req);
}
