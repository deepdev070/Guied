import fs from "node:fs";
import path from "node:path";

export interface PlainLanguageIssue {
  file: string;
  fieldPath: string;
  wordCount: number;
  sentence: string;
  suggestions: string[];
}

export interface PlainLanguageReport {
  totalFiles: number;
  totalSentences: number;
  compliantSentences: number;
  flaggedSentences: number;
  complianceRate: number;
  issues: PlainLanguageIssue[];
}

const COMPLEX_PHRASE_REPLACEMENTS: Record<string, string> = {
  "in order to": "to",
  "prior to": "before",
  "subsequent to": "after",
  "in the event that": "if",
  "in the event of": "in case of",
  utilize: "use",
  utilise: "use",
  utilization: "use",
  utilisation: "use",
  furnish: "provide",
  furnishing: "providing",
  commence: "start",
  commencing: "starting",
  terminate: "end",
  terminating: "ending",
  "is required to": "must",
  "are required to": "must",
  "shall be required to": "must",
  "shall be responsible for": "must",
  "for the purpose of": "to / for",
  "in accordance with": "under / following",
  "with regard to": "about",
  "pertaining to": "about",
  "at the present time": "now",
  "in close proximity to": "near",
  "in possession of": "have",
  notwithstanding: "despite / even if",
  expedite: "speed up",
  "deemed to be": "considered",
};

/**
 * Splits prose into individual sentences while respecting numbers, decimals, and common abbreviations.
 */
export function splitIntoSentences(text: string): string[] {
  if (!text || typeof text !== "string") return [];

  // Protect common civic abbreviations from splitting
  const normalized = text
    .replace(/\be\.g\./gi, "e__g__")
    .replace(/\bi\.e\./gi, "i__e__")
    .replace(/\bGovt\./gi, "Govt__")
    .replace(/\bNo\./gi, "No__")
    .replace(/\bDr\./gi, "Dr__")
    .replace(/\bMr\./gi, "Mr__")
    .replace(/\bMrs\./gi, "Mrs__")
    .replace(/\bRs\./gi, "Rs__")
    .replace(/\bapprox\./gi, "approx__")
    .replace(/(\d+)\.(\d+)/g, "$1__dot__$2");

  // Split on sentence-ending punctuation followed by whitespace or end of string
  const rawSentences = normalized.split(/(?<=[.!?])\s+/);

  return rawSentences
    .map((s) =>
      s
        .replace(/e__g__/g, "e.g.")
        .replace(/i__e__/g, "i.e.")
        .replace(/Govt__/g, "Govt.")
        .replace(/No__/g, "No.")
        .replace(/Dr__/g, "Dr.")
        .replace(/Mr__/g, "Mr.")
        .replace(/Mrs__/g, "Mrs.")
        .replace(/Rs__/g, "Rs.")
        .replace(/approx__/g, "approx.")
        .replace(/__dot__/g, ".")
        .trim()
    )
    .filter((s) => s.length > 0);
}

/**
 * Counts words in a sentence, excluding standalone punctuation.
 */
export function countWords(sentence: string): number {
  const matches = sentence.match(/[\p{L}\p{N}]+/gu);
  return matches ? matches.length : 0;
}

/**
 * Generates simpler wording suggestions for a long sentence.
 */
export function suggestSimplerWording(sentence: string): string[] {
  const suggestions: string[] = [];
  const lower = sentence.toLowerCase();

  // 1. Check for complex/bureaucratic phrase replacements
  for (const [complex, simple] of Object.entries(COMPLEX_PHRASE_REPLACEMENTS)) {
    if (lower.includes(complex)) {
      suggestions.push(`Replace "${complex}" with simpler word "${simple}".`);
    }
  }

  // 2. Suggest splitting points
  const splitConjunctions: string[] = [];
  const conjunctions = [" and ", " but ", " which ", " because ", " although ", " while ", "; "];
  for (const conj of conjunctions) {
    if (lower.includes(conj)) {
      splitConjunctions.push(`"${conj.trim()}"`);
    }
  }

  if (splitConjunctions.length > 0) {
    suggestions.push(`Split into two shorter sentences at ${splitConjunctions.join(" or ")}.`);
  } else {
    suggestions.push("Break into two shorter sentences to keep reading level under Class 8.");
  }

  return suggestions;
}

/**
 * Recursively extracts natural language string fields from task content objects.
 */
export function extractProseFields(
  obj: unknown,
  currentPath = ""
): Array<{ path: string; text: string }> {
  const results: Array<{ path: string; text: string }> = [];

  if (typeof obj === "string") {
    // Only evaluate natural prose (skip URLs, slug IDs, enum values, colors)
    if (
      obj.length > 15 &&
      !obj.startsWith("http://") &&
      !obj.startsWith("https://") &&
      !obj.startsWith("/") &&
      !obj.includes("_") &&
      !obj.startsWith("#")
    ) {
      results.push({ path: currentPath, text: obj });
    }
    return results;
  }

  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      results.push(...extractProseFields(item, `${currentPath}[${index}]`));
    });
    return results;
  }

  if (obj && typeof obj === "object") {
    for (const [key, val] of Object.entries(obj)) {
      // Skip technical metadata fields
      if (
        key === "slug" ||
        key === "id" ||
        key === "url" ||
        key === "officialUrl" ||
        key === "code" ||
        key === "appliesWhen"
      ) {
        continue;
      }
      const nextPath = currentPath ? `${currentPath}.${key}` : key;
      results.push(...extractProseFields(val, nextPath));
    }
  }

  return results;
}

/**
 * Runs plain-language review across task files.
 */
export function reviewPlainLanguage(tasksDir: string): PlainLanguageReport {
  const files = fs
    .readdirSync(tasksDir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => path.join(tasksDir, f));

  let totalSentences = 0;
  const issues: PlainLanguageIssue[] = [];

  for (const filePath of files) {
    const raw = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(raw);
    const proseFields = extractProseFields(data);

    for (const { path: fieldPath, text } of proseFields) {
      const sentences = splitIntoSentences(text);
      for (const sentence of sentences) {
        totalSentences++;
        const words = countWords(sentence);
        if (words > 25) {
          issues.push({
            file: path.basename(filePath),
            fieldPath,
            wordCount: words,
            sentence,
            suggestions: suggestSimplerWording(sentence),
          });
        }
      }
    }
  }

  const flagged = issues.length;
  const compliant = totalSentences - flagged;
  const rate = totalSentences > 0 ? (compliant / totalSentences) * 100 : 100;

  return {
    totalFiles: files.length,
    totalSentences,
    compliantSentences: compliant,
    flaggedSentences: flagged,
    complianceRate: Math.round(rate * 10) / 10,
    issues,
  };
}

// Direct execution from CLI
if (
  typeof process !== "undefined" &&
  process.argv[1] &&
  process.argv[1].endsWith("check-plain-language.ts")
) {
  const tasksDirectory = path.join(process.cwd(), "src/content/tasks");
  const isStrict = process.argv.includes("--strict");

  console.log("📖 Running Plain-Language & Sentence Length Auditor (Prompt 100)...");
  console.log("Rule: Sentences must not exceed 25 words to ensure Class 8 reading ease.\n");

  const report = reviewPlainLanguage(tasksDirectory);

  if (report.issues.length > 0) {
    console.log(`⚠️ Found ${report.issues.length} sentences exceeding 25 words:\n`);
    report.issues.forEach((issue, idx) => {
      console.log(`[${idx + 1}] ${issue.file} -> ${issue.fieldPath} (${issue.wordCount} words)`);
      console.log(`    "${issue.sentence}"`);
      issue.suggestions.forEach((sug) => console.log(`    💡 Suggestion: ${sug}`));
      console.log();
    });
  } else {
    console.log("✅ All sentences comply with the <= 25 words readability rule!");
  }

  console.table([
    { Metric: "Total Task Files Checked", Count: report.totalFiles },
    { Metric: "Total Sentences Scanned", Count: report.totalSentences },
    { Metric: "Compliant Sentences (<= 25 words)", Count: report.compliantSentences },
    { Metric: "Flagged Sentences (> 25 words)", Count: report.flaggedSentences },
    { Metric: "Readability Compliance Rate", Count: `${report.complianceRate}%` },
  ]);

  if (isStrict && report.flaggedSentences > 0) {
    console.error(
      `\n❌ Plain-language check failed under --strict: ${report.flaggedSentences} sentences over 25 words.`
    );
    process.exit(1);
  } else {
    console.log(
      `\n✨ Readability audit complete. Target reading level: Class 8 civic comprehension.`
    );
    process.exit(0);
  }
}
