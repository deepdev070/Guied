/**
 * Civic Glossary Matching & Tokenization Engine
 * Scans content text for occurrences of registered civic glossary terms
 * and breaks them into plain text and term match segments.
 */

import { GLOSSARY_TERMS, type GlossaryTerm } from "../data/glossary.ts";

export interface TermSegment {
  text: string;
  termSlug?: string;
  term?: GlossaryTerm;
}

interface TermPattern {
  alias: string;
  term: GlossaryTerm;
}

// Compile terms sorted by alias length descending (longest phrases first)
const COMPILED_PATTERNS: TermPattern[] = (() => {
  const list: TermPattern[] = [];
  for (const t of GLOSSARY_TERMS) {
    for (const alias of t.aliases) {
      list.push({ alias, term: t });
    }
    list.push({ alias: t.termEn, term: t });
  }
  return list.sort((a, b) => b.alias.length - a.alias.length);
})();

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Scans a plain text string and breaks it into segments of plain text
 * and identified glossary terms.
 */
export function findGlossaryMatches(text: string): TermSegment[] {
  if (!text) return [{ text: "" }];

  const patterns = COMPILED_PATTERNS.map((p) => escapeRegex(p.alias));
  const regex = new RegExp(`(\\b(?:${patterns.join("|")})\\b)`, "gi");

  const parts = text.split(regex);
  if (parts.length <= 1) {
    return [{ text }];
  }

  const aliasMap = new Map<string, GlossaryTerm>();
  for (const item of COMPILED_PATTERNS) {
    aliasMap.set(item.alias.toLowerCase(), item.term);
  }

  const segments: TermSegment[] = [];

  for (const part of parts) {
    if (!part) continue;
    const lower = part.toLowerCase();
    const matchedTerm = aliasMap.get(lower);

    if (matchedTerm) {
      segments.push({
        text: part,
        termSlug: matchedTerm.slug,
        term: matchedTerm,
      });
    } else {
      segments.push({ text: part });
    }
  }

  return segments;
}

