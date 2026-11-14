import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

describe("Prompt 99: Keyboard and Screen Reader Accessibility Pass", () => {
  it("1. useFocusTrap Hook: provides cyclic Tab navigation, Escape key handler, and returns focus to trigger", () => {
    const hookPath = path.join(process.cwd(), "src/hooks/useFocusTrap.ts");
    assert.ok(fs.existsSync(hookPath), "src/hooks/useFocusTrap.ts must exist");

    const content = fs.readFileSync(hookPath, "utf8");
    assert.ok(
      content.includes("document.activeElement"),
      "Must capture activeElement before opening to restore focus"
    );
    assert.ok(content.includes('e.key === "Escape"'), "Must handle Escape key to trigger onClose");
    assert.ok(
      content.includes('e.key === "Tab"'),
      "Must intercept Tab key to cycle within container"
    );
    assert.ok(content.includes("e.shiftKey"), "Must support Shift+Tab backward wrapping");
    assert.ok(
      content.includes("elem.focus()"),
      "Must return focus to trigger element on dialog close"
    );
  });

  it("2. Search Combobox: complies with WAI-ARIA combobox pattern and keyboard navigation", () => {
    const searchPath = path.join(process.cwd(), "src/components/search/SearchAutocomplete.tsx");
    const content = fs.readFileSync(searchPath, "utf8");

    // Combobox attributes
    assert.ok(content.includes('role="combobox"'), "Must have role='combobox'");
    assert.ok(
      content.includes('aria-autocomplete="list"'),
      "Must declare aria-autocomplete='list'"
    );
    assert.ok(
      content.includes("aria-expanded={isDropdownVisible}"),
      "Must declare dynamic aria-expanded"
    );
    assert.ok(content.includes('aria-haspopup="listbox"'), "Must declare aria-haspopup='listbox'");
    assert.ok(
      content.includes("aria-controls={listboxId}"),
      "Must link to listbox via aria-controls"
    );
    assert.ok(content.includes("aria-activedescendant="), "Must track active descendant");

    // Keyboard handlers
    assert.ok(content.includes('case "ArrowDown":'), "Must navigate down on ArrowDown");
    assert.ok(content.includes('case "ArrowUp":'), "Must navigate up on ArrowUp");
    assert.ok(content.includes('case "Enter":'), "Must select on Enter");
    assert.ok(content.includes('case "Escape":'), "Must close and clear on Escape");

    // Screen reader announcement
    assert.ok(
      content.includes('aria-live="polite"'),
      "Search autocomplete must feature aria-live='polite' region for suggestions"
    );
  });

  it("3. State Selector Modal: implements focus trap, Escape to close, return focus, and search live region", () => {
    const modalPath = path.join(process.cwd(), "src/components/layout/StateSelectModal.tsx");
    const content = fs.readFileSync(modalPath, "utf8");

    assert.ok(content.includes('role="dialog"'), "State selector must declare role='dialog'");
    assert.ok(
      content.includes('aria-modal="true"'),
      "State selector must declare aria-modal='true'"
    );
    assert.ok(
      content.includes('aria-labelledby="state-select-title"'),
      "Must have aria-labelledby matching title"
    );
    assert.ok(
      content.includes("useFocusTrap"),
      "Must use useFocusTrap hook for strict focus management"
    );
    assert.ok(
      content.includes("initialFocusRef: inputRef"),
      "Must move initial focus to the search input"
    );
    assert.ok(content.includes("returnFocus: true"), "Must return focus to trigger on close");
    assert.ok(
      content.includes('aria-live="polite"'),
      "Must announce matching states count to screen readers"
    );
  });

  it("4. Accordion: buttons expand/collapse panels with correct ARIA attributes and Space/Enter support", () => {
    const accordionPath = path.join(process.cwd(), "src/components/ui/Accordion.tsx");
    const content = fs.readFileSync(accordionPath, "utf8");

    assert.ok(
      content.includes('type="button"'),
      "Accordion triggers must be standard HTML buttons"
    );
    assert.ok(
      content.includes("aria-expanded={isOpen}"),
      "Accordion triggers must announce expanded state"
    );
    assert.ok(
      content.includes("aria-controls={contentId}"),
      "Accordion triggers must reference content id"
    );
    assert.ok(content.includes('role="region"'), "Accordion panels must have role='region'");
    assert.ok(
      content.includes("aria-labelledby={headerId}"),
      "Accordion panels must link to header button"
    );
  });

  it("5. Tabs: implements WAI-ARIA tablist roving tabindex and arrow key navigation", () => {
    const tabsPath = path.join(process.cwd(), "src/components/ui/Tabs.tsx");
    const content = fs.readFileSync(tabsPath, "utf8");

    assert.ok(content.includes('role="tablist"'), "Tabs container must declare role='tablist'");
    assert.ok(content.includes('role="tab"'), "Individual tabs must have role='tab'");
    assert.ok(content.includes("aria-selected={isSelected}"), "Tabs must set aria-selected");
    assert.ok(
      content.includes("tabIndex={isSelected ? 0 : -1}"),
      "Tabs must use roving tabIndex (0 vs -1)"
    );
    assert.ok(content.includes('key === "ArrowRight"'), "Must handle ArrowRight to switch tabs");
    assert.ok(content.includes('key === "ArrowLeft"'), "Must handle ArrowLeft to switch tabs");
    assert.ok(content.includes('key === "Home"'), "Must handle Home key to jump to first tab");
    assert.ok(content.includes('key === "End"'), "Must handle End key to jump to last tab");
    assert.ok(content.includes('role="tabpanel"'), "Tab panels must declare role='tabpanel'");
    assert.ok(
      content.includes("tabIndex={0}"),
      "Tab panels must have tabIndex={0} for keyboard accessibility"
    );
  });

  it("6. Mobile Navigation Drawer: implements focus trap, Escape to close, and return focus", () => {
    const drawerPath = path.join(process.cwd(), "src/components/layout/MobileNav.tsx");
    const content = fs.readFileSync(drawerPath, "utf8");

    assert.ok(content.includes('role="dialog"'), "Mobile drawer must declare role='dialog'");
    assert.ok(
      content.includes('aria-modal="true"'),
      "Mobile drawer must declare aria-modal='true'"
    );
    assert.ok(content.includes("useFocusTrap"), "Mobile drawer must use useFocusTrap");
    assert.ok(
      content.includes("returnFocus: true"),
      "Must return focus to hamburger trigger button"
    );
  });

  it("7. Dialog Modals: ReportMistake, ResetConfirmation, and CalendarReminder trap focus and handle Escape", () => {
    const mistakePath = path.join(process.cwd(), "src/components/layout/ReportMistakeModal.tsx");
    const resetPath = path.join(
      process.cwd(),
      "src/components/checklist/ResetConfirmationModal.tsx"
    );
    const calendarPath = path.join(process.cwd(), "src/components/task/CalendarReminderModal.tsx");

    const mistakeContent = fs.readFileSync(mistakePath, "utf8");
    const resetContent = fs.readFileSync(resetPath, "utf8");
    const calendarContent = fs.readFileSync(calendarPath, "utf8");

    // All must use useFocusTrap with returnFocus
    assert.ok(mistakeContent.includes("useFocusTrap"), "ReportMistakeModal must use useFocusTrap");
    assert.ok(
      resetContent.includes("useFocusTrap"),
      "ResetConfirmationModal must use useFocusTrap"
    );
    assert.ok(
      calendarContent.includes("useFocusTrap"),
      "CalendarReminderModal must use useFocusTrap"
    );

    assert.ok(
      mistakeContent.includes('role="dialog"'),
      "ReportMistakeModal must have role='dialog'"
    );
    assert.ok(
      resetContent.includes('role="dialog"'),
      "ResetConfirmationModal must have role='dialog'"
    );
    assert.ok(
      calendarContent.includes('role="dialog"'),
      "CalendarReminderModal must have role='dialog'"
    );
  });

  it("8. Screen Reader Live Announcements: checklist progress and form errors are announced in real time", () => {
    const docSectionPath = path.join(process.cwd(), "src/components/task/DocumentSection.tsx");
    const mistakeModalPath = path.join(
      process.cwd(),
      "src/components/layout/ReportMistakeModal.tsx"
    );
    const standaloneFormPath = path.join(
      process.cwd(),
      "src/components/layout/ReportMistakeStandaloneForm.tsx"
    );
    const feedbackPath = path.join(process.cwd(), "src/components/task/HelpfulFeedbackWidget.tsx");

    const docContent = fs.readFileSync(docSectionPath, "utf8");
    const mistakeContent = fs.readFileSync(mistakeModalPath, "utf8");
    const standaloneContent = fs.readFileSync(standaloneFormPath, "utf8");
    const feedbackContent = fs.readFileSync(feedbackPath, "utf8");

    // Checklist progress live announcement
    assert.ok(
      docContent.includes('aria-live="polite"') && docContent.includes("documents ready"),
      "DocumentSection must provide aria-live='polite' announcement for checklist progress"
    );

    // Form errors: role="alert" and aria-live="assertive"
    assert.ok(
      mistakeContent.includes('role="alert"') && mistakeContent.includes('aria-live="assertive"'),
      "ReportMistakeModal must provide assertive live region for form errors"
    );
    assert.ok(
      mistakeContent.includes("aria-invalid="),
      "ReportMistakeModal must flag invalid fields with aria-invalid"
    );
    assert.ok(
      mistakeContent.includes("aria-describedby="),
      "ReportMistakeModal must link invalid fields with error id via aria-describedby"
    );

    assert.ok(
      standaloneContent.includes('role="alert"') &&
        standaloneContent.includes('aria-live="assertive"'),
      "ReportMistakeStandaloneForm must provide assertive live region for form errors"
    );

    // Feedback status announcement
    assert.ok(
      feedbackContent.includes('role="status"') && feedbackContent.includes('aria-live="polite"'),
      "HelpfulFeedbackWidget must announce thank-you state via aria-live='polite'"
    );
  });
});
