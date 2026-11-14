import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  GLOSSARY_TERMS,
  getGlossaryTermBySlug,
  getAllGlossaryTerms,
} from "../src/data/glossary.ts";
import { findGlossaryMatches } from "../src/lib/glossary.ts";

describe("Prompt 70: Civic Glossary & Tooltips", () => {
  const requiredTermSlugs = [
    "affidavit",
    "notary",
    "gazette",
    "self-attested",
    "domicile",
    "noc",
    "tatkal",
    "annexure",
    "challan",
  ];

  it("includes all civic glossary terms required by prompt", () => {
    for (const slug of requiredTermSlugs) {
      const found = getGlossaryTermBySlug(slug);
      assert.ok(found, `Must include glossary term '${slug}'`);
    }
  });

  it("provides simple Class-8 definitions in English, Hindi, and Gujarati for every term", () => {
    for (const term of GLOSSARY_TERMS) {
      assert.ok(term.slug, "Term must have slug");
      assert.ok(term.termEn && term.defEn, `English definition missing for ${term.slug}`);
      assert.ok(term.termHi && term.defHi, `Hindi definition missing for ${term.slug}`);
      assert.ok(term.termGu && term.defGu, `Gujarati definition missing for ${term.slug}`);
      assert.ok(term.whoIssues, `Who issues it missing for ${term.slug}`);
      assert.ok(term.aliases.length > 0, `Aliases missing for ${term.slug}`);
      assert.ok(term.whereUsed.length > 0, `Where used missing for ${term.slug}`);
    }
  });

  it("retrieves terms case-insensitively and returns sorted all terms", () => {
    assert.ok(getGlossaryTermBySlug("AFFIDAVIT"));
    assert.ok(getGlossaryTermBySlug("Self-Attested"));
    assert.ok(getGlossaryTermBySlug("nOtArY"));
    assert.equal(getGlossaryTermBySlug("unknown-term-xyz"), undefined);

    const all = getAllGlossaryTerms();
    assert.equal(all.length, GLOSSARY_TERMS.length);
  });

  it("identifies glossary terms in text using findGlossaryMatches", () => {
    const raw = "Please carry a self-attested photocopy and sworn affidavit to the notary public.";
    const matches = findGlossaryMatches(raw);

    assert.ok(Array.isArray(matches), "Must return array of segments");
    const matchedSlugs = matches.filter((m) => m.termSlug).map((m) => m.termSlug);

    assert.ok(matchedSlugs.includes("self-attested"), "Must identify 'self-attested'");
    assert.ok(matchedSlugs.includes("affidavit"), "Must identify 'affidavit'");
    assert.ok(matchedSlugs.includes("notary"), "Must identify 'notary public'");
  });

  it("returns single untouched segment when no glossary terms are present", () => {
    const raw = "Regular appointment slot at 10 AM.";
    const matches = findGlossaryMatches(raw);
    assert.equal(matches.length, 1);
    assert.equal(matches[0]?.text, raw);
    assert.equal(matches[0]?.termSlug, undefined);
  });

  it("verifies Glossary index page and dynamic term page exist", () => {
    const indexPath = path.join(process.cwd(), "src/app/glossary/page.tsx");
    assert.ok(fs.existsSync(indexPath), "src/app/glossary/page.tsx must exist");

    const termPath = path.join(process.cwd(), "src/app/glossary/[term]/page.tsx");
    assert.ok(fs.existsSync(termPath), "src/app/glossary/[term]/page.tsx must exist");

    const termCode = fs.readFileSync(termPath, "utf-8");
    assert.ok(termCode.includes("generateStaticParams"), "Must use generateStaticParams");
    assert.ok(termCode.includes("generateMetadata"), "Must use generateMetadata");
    assert.ok(termCode.includes("defHi"), "Must show Hindi definition");
    assert.ok(termCode.includes("defGu"), "Must show Gujarati definition");
  });

  it("verifies ChecklistItem and MistakesSection integrate GlossaryText", () => {
    const checkItemCode = fs.readFileSync(
      path.join(process.cwd(), "src/components/ui/ChecklistItem.tsx"),
      "utf-8"
    );
    assert.ok(
      checkItemCode.includes("GlossaryText"),
      "ChecklistItem must import and use GlossaryText"
    );

    const mistakesCode = fs.readFileSync(
      path.join(process.cwd(), "src/components/task/MistakesSection.tsx"),
      "utf-8"
    );
    assert.ok(
      mistakesCode.includes("GlossaryText"),
      "MistakesSection must import and use GlossaryText"
    );
  });

  it("verifies GlossaryTooltip component handles accessibility and mobile tap", () => {
    const tooltipCode = fs.readFileSync(
      path.join(process.cwd(), "src/components/glossary/GlossaryTooltip.tsx"),
      "utf-8"
    );
    assert.ok(tooltipCode.includes('role="tooltip"'), "Must have role=tooltip");
    assert.ok(tooltipCode.includes("aria-expanded"), "Must have aria-expanded");
    assert.ok(
      tooltipCode.includes("handleOutsideClick"),
      "Must handle outside click for mobile tap dismiss"
    );
    assert.ok(
      tooltipCode.includes("href={`/glossary/${term.slug}`}"),
      "Must link to /glossary/<term>"
    );
  });
});
