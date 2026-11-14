import React from "react";

export interface HighlightProps {
  text: string;
  query?: string;
  className?: string;
}

/**
 * Escapes regex special characters to prevent regex injection.
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Highlight component that splits text on query tokens and highlights matches
 * with light-only saffron-soft / amber background.
 */
export function Highlight({ text, query, className }: HighlightProps) {
  if (!query || !query.trim() || !text) {
    return <span className={className}>{text}</span>;
  }

  // Tokenize query words, ignoring short words (1 char) to avoid over-highlighting
  const tokens = query
    .trim()
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1)
    .map(escapeRegex);

  if (tokens.length === 0) {
    return <span className={className}>{text}</span>;
  }

  const regex = new RegExp(`(${tokens.join("|")})`, "gi");
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        const isMatch = tokens.some((token) => new RegExp(`^${token}$`, "i").test(part));
        return isMatch ? (
          <mark key={index} className="bg-accent-soft text-text rounded px-1 py-0.5 font-semibold">
            {part}
          </mark>
        ) : (
          part
        );
      })}
    </span>
  );
}
