import React from "react";

export interface JsonLdProps {
  schema?: unknown;
}

export function JsonLd({ schema }: JsonLdProps) {
  if (!schema) return null;

  // Filter out any nullish items in an array
  const cleanSchema = Array.isArray(schema)
    ? schema.filter((item): item is object => item !== null && item !== undefined)
    : schema;

  if (Array.isArray(cleanSchema) && cleanSchema.length === 0) return null;

  // Escape < characters to prevent XSS script break-outs
  const jsonString = JSON.stringify(cleanSchema).replace(/</g, "\\u003c");

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonString }} />;
}
