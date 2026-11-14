import { z } from "zod";

const isServer = typeof window === "undefined";

const serverSchema = z.object({
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL must be specified")
    .url("DATABASE_URL must be a valid connection URL"),
  ADMIN_EMAIL: z
    .string()
    .email("ADMIN_EMAIL must be a valid email address")
    .optional()
    .or(z.literal("")),
  ADMIN_PASSWORD_HASH: z.string().optional().or(z.literal("")),
  REVALIDATE_SECRET_TOKEN: z.string().optional().default("paperwork-revalidate-secret-token-2026"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

const clientSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .url("NEXT_PUBLIC_SITE_URL must be a valid URL")
    .default("http://localhost:3000"),
  NEXT_PUBLIC_ADS_ENABLED: z
    .enum(["true", "false"])
    .default("false")
    .transform((val) => val === "true"),
  NEXT_PUBLIC_ADSENSE_CLIENT: z.string().optional().or(z.literal("")),
  NEXT_PUBLIC_ANALYTICS_ID: z.string().optional().or(z.literal("")),
  NEXT_PUBLIC_PLAUSIBLE_DOMAIN: z.string().optional().or(z.literal("")),
  NEXT_PUBLIC_GSC_VERIFICATION: z.string().optional().or(z.literal("")),
});

const combinedSchema = isServer ? serverSchema.and(clientSchema) : clientSchema;

const rawEnv = {
  DATABASE_URL: process.env.DATABASE_URL,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH,
  REVALIDATE_SECRET_TOKEN: process.env.REVALIDATE_SECRET_TOKEN,
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_ADS_ENABLED: process.env.NEXT_PUBLIC_ADS_ENABLED,
  NEXT_PUBLIC_ADSENSE_CLIENT: process.env.NEXT_PUBLIC_ADSENSE_CLIENT,
  NEXT_PUBLIC_ANALYTICS_ID: process.env.NEXT_PUBLIC_ANALYTICS_ID,
  NEXT_PUBLIC_PLAUSIBLE_DOMAIN: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
  NEXT_PUBLIC_GSC_VERIFICATION: process.env.NEXT_PUBLIC_GSC_VERIFICATION,
};

function parseEnv() {
  const result = combinedSchema.safeParse(rawEnv);

  if (!result.success) {
    const errorDetails = Object.entries(result.error.flatten().fieldErrors)
      .map(([name, errs]) => `  - ${name}: ${(errs ?? []).join(", ")}`)
      .join("\n");

    const message = `❌ Invalid environment variables detected:\n${errorDetails}\nPlease check your .env or .env.local file against .env.example.`;
    console.error(message);
    throw new Error(message);
  }

  return result.data;
}

export type Env = z.infer<typeof serverSchema> & z.infer<typeof clientSchema>;

export const env = parseEnv() as Env;
