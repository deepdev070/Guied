"use client";

import React, { useMemo } from "react";
import { findGlossaryMatches } from "@/lib/glossary";
import { GlossaryTooltip } from "./GlossaryTooltip";

export function wrapGlossaryTerms(text: string): React.ReactNode[] {
  const segments = findGlossaryMatches(text);

  if (segments.length === 1 && !segments[0]?.termSlug) {
    return [text];
  }

  return segments.map((seg, idx) => {
    if (seg.termSlug) {
      return (
        <GlossaryTooltip key={`${seg.termSlug}-${idx}`} termSlug={seg.termSlug}>
          {seg.text}
        </GlossaryTooltip>
      );
    }
    return seg.text;
  });
}

export interface GlossaryTextProps {
  text: string;
  className?: string;
}

export function GlossaryText({ text, className = "" }: GlossaryTextProps) {
  const elements = useMemo(() => wrapGlossaryTerms(text), [text]);

  return <span className={className}>{elements}</span>;
}
