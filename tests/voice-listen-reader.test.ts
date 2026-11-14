import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

describe("Prompt 102: Voice-Friendly Content & SpeechSynthesis Audio Reader", () => {
  it("1. ListenButton Component: exists and defines required props and playback states", () => {
    const compPath = path.join(process.cwd(), "src/components/task/ListenButton.tsx");
    assert.ok(fs.existsSync(compPath), "ListenButton.tsx must exist");

    const content = fs.readFileSync(compPath, "utf8");
    assert.ok(content.includes("export function ListenButton"), "Must export ListenButton");
    assert.ok(content.includes("title: string"), "Must accept title prop");
    assert.ok(content.includes("summary: string"), "Must accept summary prop");
    assert.ok(content.includes("documents?: DocumentRequirement[]"), "Must accept documents prop");
    assert.ok(content.includes("locale?: string"), "Must accept locale prop");
  });

  it("2. Hidden When Not Supported: safely detects SpeechSynthesis API and returns null if absent", () => {
    const compPath = path.join(process.cwd(), "src/components/task/ListenButton.tsx");
    const content = fs.readFileSync(compPath, "utf8");

    assert.ok(
      content.includes('"speechSynthesis" in window'),
      "Must check for speechSynthesis in window"
    );
    assert.ok(
      content.includes("if (!isSupported) {") && content.includes("return null;"),
      "Must return null when SpeechSynthesis is not supported"
    );
  });

  it("3. Content Synthesis: reads title, summary, and required documents checklist", () => {
    const compPath = path.join(process.cwd(), "src/components/task/ListenButton.tsx");
    const content = fs.readFileSync(compPath, "utf8");

    assert.ok(content.includes("buildSpeechText"), "Must compile text to speak");
    assert.ok(content.includes("parts.push(`${title}"), "Must include title in speech text");
    assert.ok(
      content.includes("parts.push(`Summary: ${summary}`"),
      "Must include summary in speech text"
    );
    assert.ok(
      content.includes("Required documents") || content.includes("checklist"),
      "Must include checklist items in speech text"
    );
  });

  it("4. Multilingual Voices: supports en-IN, hi-IN, and gu-IN voice selection", () => {
    const compPath = path.join(process.cwd(), "src/components/task/ListenButton.tsx");
    const content = fs.readFileSync(compPath, "utf8");

    assert.ok(content.includes("getBestVoice"), "Must implement voice selection helper");
    assert.ok(content.includes("hi-IN"), "Must support Hindi voice locale");
    assert.ok(content.includes("gu-IN"), "Must support Gujarati voice locale");
    assert.ok(content.includes("en-IN"), "Must support Indian English voice locale");
  });

  it("5. Playback Controls & Memory Cleanup: handles play, pause, resume, stop, and cancels speech on unmount", () => {
    const compPath = path.join(process.cwd(), "src/components/task/ListenButton.tsx");
    const content = fs.readFileSync(compPath, "utf8");

    assert.ok(content.includes("window.speechSynthesis.speak"), "Must call speak() to start audio");
    assert.ok(
      content.includes("window.speechSynthesis.pause"),
      "Must call pause() to pause playback"
    );
    assert.ok(
      content.includes("window.speechSynthesis.resume"),
      "Must call resume() to continue playback"
    );
    assert.ok(
      content.includes("window.speechSynthesis.cancel"),
      "Must call cancel() to stop or clean up"
    );
    assert.ok(
      content.includes("return () => {") && content.includes("speechSynthesis.cancel()"),
      "Must cancel active speech in unmount cleanup effect"
    );
  });

  it("6. Accessibility: includes aria-label, aria-pressed, screen reader live announcement, and touch target size", () => {
    const compPath = path.join(process.cwd(), "src/components/task/ListenButton.tsx");
    const content = fs.readFileSync(compPath, "utf8");

    assert.ok(content.includes("aria-label="), "Buttons must have descriptive aria-label");
    assert.ok(content.includes("aria-pressed="), "Play button must announce active pressed state");
    assert.ok(
      content.includes('aria-live="polite"') && content.includes('aria-atomic="true"'),
      "Must provide polite live region for audio status announcements"
    );
    assert.ok(
      content.includes("min-h-[44px]") || content.includes("min-h-[38px]"),
      "Must maintain accessible touch target height"
    );
  });

  it("7. TaskPageView Integration: ListenButton is integrated into the guide page view", () => {
    const pagePath = path.join(process.cwd(), "src/components/task/TaskPageView.tsx");
    const content = fs.readFileSync(pagePath, "utf8");

    assert.ok(content.includes("<ListenButton"), "TaskPageView must render ListenButton");
    assert.ok(content.includes("title={pageTitle}"), "Must pass pageTitle");
    assert.ok(content.includes("summary={pageSummary}"), "Must pass pageSummary");
    assert.ok(content.includes("documents={variant.documentRequirements}"), "Must pass documents");
    assert.ok(content.includes("locale={locale}"), "Must pass current locale");
  });
});
