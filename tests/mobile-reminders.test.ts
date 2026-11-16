import { test, describe, before, beforeEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

describe("Prompt 126: Mobile Appointment Reminders & Local Notifications (expo-notifications)", () => {
  const mobileDir = path.join(process.cwd(), "apps", "mobile");
  const remindersServicePath = path.join(mobileDir, "lib", "mobile-reminders.ts");
  const reminderModalPath = path.join(
    mobileDir,
    "components",
    "reminders",
    "AppointmentReminderModal.tsx"
  );
  const taskDetailPath = path.join(mobileDir, "app", "task", "[slug].tsx");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let remindersModule: any;
  let scheduledCalls: Array<{
    content: { title: string; body: string };
    trigger: Date | { date: Date };
  }>;
  let cancelledCalls: string[];

  before(async () => {
    remindersModule = await import(remindersServicePath);
  });

  beforeEach(() => {
    scheduledCalls = [];
    cancelledCalls = [];
    remindersModule.clearAllReminders();

    remindersModule.setNotificationsDriver({
      getPermissionsAsync: async () => ({ status: "granted", granted: true }),
      requestPermissionsAsync: async () => ({ status: "granted", granted: true }),
      scheduleNotificationAsync: async (req: {
        content: { title: string; body: string };
        trigger: Date | { date: Date };
      }) => {
        scheduledCalls.push(req);
        return `notif_id_${scheduledCalls.length}`;
      },
      cancelScheduledNotificationAsync: async (id: string) => {
        cancelledCalls.push(id);
      },
    });
  });

  test("1. computeReminderTriggers calculates exact 24h and 1h triggers for future appointments", () => {
    const { computeReminderTriggers } = remindersModule;
    const now = new Date("2026-11-16T10:00:00.000Z");

    // Appointment 3 days from now
    const apptDate = new Date("2026-11-19T10:00:00.000Z");
    const triggers = computeReminderTriggers(apptDate, now);

    assert.equal(triggers.isValid, true);
    assert.ok(triggers.oneDayBefore);
    assert.ok(triggers.oneHourBefore);

    // 24h before should be 2026-11-18T10:00:00.000Z
    assert.equal(triggers.oneDayBefore?.toISOString(), "2026-11-18T10:00:00.000Z");

    // 1h before should be 2026-11-19T09:00:00.000Z
    assert.equal(triggers.oneHourBefore?.toISOString(), "2026-11-19T09:00:00.000Z");
  });

  test("2. computeReminderTriggers rejects past appointments and handles same-day appointments", () => {
    const { computeReminderTriggers } = remindersModule;
    const now = new Date("2026-11-16T10:00:00.000Z");

    // Past appointment
    const pastAppt = new Date("2026-11-15T10:00:00.000Z");
    const pastTriggers = computeReminderTriggers(pastAppt, now);
    assert.equal(pastTriggers.isValid, false);
    assert.match(pastTriggers.error || "", /future/i);

    // Appointment in 5 hours (less than 24h away)
    const fiveHoursAppt = new Date("2026-11-16T15:00:00.000Z");
    const sameDayTriggers = computeReminderTriggers(fiveHoursAppt, now);
    assert.equal(sameDayTriggers.isValid, true);
    assert.equal(
      sameDayTriggers.oneDayBefore,
      null,
      "24h notification should not be scheduled if already passed"
    );
    assert.equal(sameDayTriggers.oneHourBefore?.toISOString(), "2026-11-16T14:00:00.000Z");
  });

  test("3. scheduleAppointmentReminders schedules both alerts and stores reminder record", async () => {
    const { scheduleAppointmentReminders, getStoredReminders } = remindersModule;
    const now = new Date("2026-11-16T10:00:00.000Z");
    const apptDate = new Date("2026-11-20T11:30:00.000Z");

    const result = await scheduleAppointmentReminders({
      taskSlug: "driving-licence-learner",
      taskTitle: "Learner Driving Licence (LLR)",
      appointmentDate: apptDate,
      now,
    });

    assert.equal(result.success, true);
    assert.ok(result.reminder);
    assert.equal(scheduledCalls.length, 2, "Must schedule both 24h and 1h notifications");

    // Notification 1: 24h before
    assert.match(scheduledCalls[0]!.content.title, /Tomorrow/);
    assert.match(scheduledCalls[0]!.content.body, /driving-licence-learner/);

    // Notification 2: 1h before
    assert.match(scheduledCalls[1]!.content.title, /1 Hour/);
    assert.match(scheduledCalls[1]!.content.body, /appointment starts in 1 hour/i);

    const stored = getStoredReminders();
    assert.equal(stored.length, 1);
    assert.equal(stored[0]!.taskSlug, "driving-licence-learner");
    assert.equal(stored[0]!.oneDayNotificationId, "notif_id_1");
    assert.equal(stored[0]!.oneHourNotificationId, "notif_id_2");
  });

  test("4. cancelAppointmentReminder cancels native notifications and removes from storage", async () => {
    const { scheduleAppointmentReminders, cancelAppointmentReminder, getStoredReminders } =
      remindersModule;
    const now = new Date("2026-11-16T10:00:00.000Z");
    const apptDate = new Date("2026-11-20T11:30:00.000Z");

    const result = await scheduleAppointmentReminders({
      taskSlug: "passport-renewal",
      taskTitle: "Passport Renewal",
      appointmentDate: apptDate,
      now,
    });

    assert.equal(result.success, true);
    assert.equal(getStoredReminders().length, 1);

    const reminderId = result.reminder.id;
    const cancelled = await cancelAppointmentReminder(reminderId);

    assert.equal(cancelled, true);
    assert.equal(cancelledCalls.length, 2, "Must cancel both scheduled notifications");
    assert.equal(getStoredReminders().length, 0, "Reminder must be removed from storage");
  });

  test("5. AppointmentReminderModal implements polite explanation screen and date/time selector", () => {
    assert.ok(fs.existsSync(reminderModalPath), "AppointmentReminderModal.tsx must exist");
    const content = fs.readFileSync(reminderModalPath, "utf-8");

    // Polite explanation screen (verbatim Prompt 126 requirement)
    assert.match(content, /Never Miss Your Government Slot|Never Miss/i);
    assert.match(content, /24 Hours Ahead/i);
    assert.match(content, /One Hour Before/i);
    assert.match(content, /100% private on your phone/i);

    // Stepper navigation
    assert.match(content, /step === "explain"/);
    assert.match(content, /step === "schedule"/);
    assert.match(content, /step === "success"/);

    // Date & Time picker inputs
    assert.match(content, /APPOINTMENT DATE/i);
    assert.match(content, /TIME SLOT/i);
    assert.match(content, /09:30 AM/);
    assert.match(content, /02:30 PM/);

    // Touch targets and light theme
    assert.match(content, /layout\.minTouchTarget/);
    assert.match(content, /colors\.primary/);
    assert.match(content, /colors\.surface/);
  });

  test("6. Guide detail screen integrates appointment reminder button and modal", () => {
    assert.ok(fs.existsSync(taskDetailPath), "Task detail screen must exist");
    const content = fs.readFileSync(taskDetailPath, "utf-8");

    assert.match(content, /AppointmentReminderModal/);
    assert.match(content, /showReminderModal/);
    assert.match(content, /Booked an Appointment\?/i);
    assert.match(content, /Set Appointment Reminder ⏰/);
  });
});
