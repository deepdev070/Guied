import { describe, it } from "node:test";
import assert from "node:assert";
import { TASK_JOURNEYS, getTaskJourney } from "../src/data/task-journeys.ts";

describe("Task Journeys: What People Usually Do Next", () => {
  it("defines standard citizen life event journeys", () => {
    assert.ok(TASK_JOURNEYS.length >= 3);
    const drivingJourney = TASK_JOURNEYS.find((j) => j.id === "driving-licence-journey");
    assert.ok(drivingJourney);
    assert.strictEqual(drivingJourney.steps[0]?.taskSlug, "driving-licence-learner");
    assert.strictEqual(drivingJourney.steps[1]?.taskSlug, "driving-licence-new");
  });

  it("finds matching journey and correct step index for learner licence", () => {
    const { journey, currentStepIndex } = getTaskJourney("driving-licence-learner");
    assert.ok(journey);
    assert.strictEqual(currentStepIndex, 0);
    assert.strictEqual(journey.steps[currentStepIndex]?.name, "Learner's Licence (LL)");
  });

  it("finds matching journey and correct step index for permanent driving licence", () => {
    const { journey, currentStepIndex } = getTaskJourney("driving-licence-new");
    assert.ok(journey);
    assert.strictEqual(currentStepIndex, 1);
  });

  it("finds matching journey for passport renewal", () => {
    const { journey, currentStepIndex } = getTaskJourney("passport-renewal");
    assert.ok(journey);
    assert.ok(currentStepIndex >= 0);
  });

  it("returns undefined and -1 for unknown task slug", () => {
    const { journey, currentStepIndex } = getTaskJourney("unknown-task-xyz");
    assert.strictEqual(journey, undefined);
    assert.strictEqual(currentStepIndex, -1);
  });

  it("ensures every journey step has cost, time estimate, and description", () => {
    for (const journey of TASK_JOURNEYS) {
      for (const step of journey.steps) {
        assert.ok(step.name.length > 2, `Step in ${journey.id} missing name`);
        assert.ok(step.cost.length > 0, `Step ${step.name} missing cost`);
        assert.ok(step.timeEstimate.length > 0, `Step ${step.name} missing timeEstimate`);
        assert.ok(step.description.length > 10, `Step ${step.name} missing description`);
      }
    }
  });
});
