/**
 * Mobile Appointment Reminders Service (Prompt 126)
 * Local notification reminders using expo-notifications.
 * Schedules alerts 24 hours before and 1 hour before civic appointments.
 */

export interface AppointmentReminder {
  id: string;
  taskSlug: string;
  taskTitle: string;
  appointmentDate: string; // ISO string
  oneDayNotificationId?: string;
  oneHourNotificationId?: string;
  createdAt: string;
}

export interface ReminderTriggers {
  oneDayBefore: Date | null;
  oneHourBefore: Date | null;
  isValid: boolean;
  error?: string;
}

const REMINDERS_STORAGE_KEY = "civic_appointment_reminders";

// In-memory fallback for testing / SSR
const memoryReminders = new Map<string, AppointmentReminder>();

/**
 * Computes the 24-hour and 1-hour notification trigger times.
 */
export function computeReminderTriggers(
  appointmentDate: Date,
  now: Date = new Date()
): ReminderTriggers {
  if (isNaN(appointmentDate.getTime())) {
    return {
      oneDayBefore: null,
      oneHourBefore: null,
      isValid: false,
      error: "Invalid appointment date.",
    };
  }

  const apptTime = appointmentDate.getTime();
  const nowTime = now.getTime();

  if (apptTime <= nowTime) {
    return {
      oneDayBefore: null,
      oneHourBefore: null,
      isValid: false,
      error: "Appointment date must be in the future.",
    };
  }

  const oneDayTime = apptTime - 24 * 60 * 60 * 1000;
  const oneHourTime = apptTime - 60 * 60 * 1000;

  return {
    oneDayBefore: oneDayTime > nowTime ? new Date(oneDayTime) : null,
    oneHourBefore: oneHourTime > nowTime ? new Date(oneHourTime) : null,
    isValid: true,
  };
}

interface NotificationsModule {
  getPermissionsAsync: () => Promise<{ status: string; granted: boolean }>;
  requestPermissionsAsync: () => Promise<{ status: string; granted: boolean }>;
  scheduleNotificationAsync: (req: {
    content: { title: string; body: string; data?: Record<string, unknown> };
    trigger: Date | { date: Date };
  }) => Promise<string>;
  cancelScheduledNotificationAsync: (id: string) => Promise<void>;
}

// Mock/fallback driver for testing or when native expo-notifications is absent
let mockNotificationsDriver: NotificationsModule = {
  getPermissionsAsync: async () => ({ status: "granted", granted: true }),
  requestPermissionsAsync: async () => ({ status: "granted", granted: true }),
  scheduleNotificationAsync: async () =>
    `notif_${Date.now()}_${Math.random().toString(36).substring(7)}`,
  cancelScheduledNotificationAsync: async () => {},
};

export function setNotificationsDriver(driver: NotificationsModule) {
  mockNotificationsDriver = driver;
}

async function getNotificationsModule(): Promise<NotificationsModule> {
  try {
    const mod = await import("expo-notifications");
    if (typeof mod.scheduleNotificationAsync === "function") {
      return mod;
    }
  } catch {
    // Fall back to mock
  }
  return mockNotificationsDriver;
}

/**
 * Requests notification permissions politely.
 */
export async function requestNotificationPermissions(): Promise<{
  granted: boolean;
  status: string;
}> {
  const notifications = await getNotificationsModule();
  const current = await notifications.getPermissionsAsync();
  if (current.granted) {
    return current;
  }
  return await notifications.requestPermissionsAsync();
}

/**
 * Schedules local notifications 24 hours and 1 hour before an appointment.
 */
export async function scheduleAppointmentReminders(options: {
  taskSlug: string;
  taskTitle: string;
  appointmentDate: Date;
  now?: Date;
}): Promise<{
  success: boolean;
  reminder?: AppointmentReminder;
  error?: string;
}> {
  const { taskSlug, taskTitle, appointmentDate, now = new Date() } = options;
  const triggers = computeReminderTriggers(appointmentDate, now);

  if (!triggers.isValid) {
    return { success: false, error: triggers.error };
  }

  const perm = await requestNotificationPermissions();
  if (!perm.granted) {
    return {
      success: false,
      error:
        "Notification permission was not granted. Please enable notifications in device settings.",
    };
  }

  const notifications = await getNotificationsModule();
  const reminderId = `rem_${Date.now()}_${taskSlug}`;
  let oneDayId: string | undefined;
  let oneHourId: string | undefined;

  // 1. Schedule 24-hour reminder
  if (triggers.oneDayBefore) {
    oneDayId = await notifications.scheduleNotificationAsync({
      content: {
        title: `📅 Tomorrow: ${taskTitle}`,
        body: `Your official appointment is tomorrow. Check your required documents and fees: https://paperwork.gov.in/${taskSlug}`,
        data: {
          taskSlug,
          type: "one_day_before",
          appointmentDate: appointmentDate.toISOString(),
        },
      },
      trigger: triggers.oneDayBefore,
    });
  }

  // 2. Schedule 1-hour reminder
  if (triggers.oneHourBefore) {
    oneHourId = await notifications.scheduleNotificationAsync({
      content: {
        title: `⏰ 1 Hour: ${taskTitle}`,
        body: `Your appointment starts in 1 hour. Ensure you have your printed slot slip and original documents ready!`,
        data: {
          taskSlug,
          type: "one_hour_before",
          appointmentDate: appointmentDate.toISOString(),
        },
      },
      trigger: triggers.oneHourBefore,
    });
  }

  const reminder: AppointmentReminder = {
    id: reminderId,
    taskSlug,
    taskTitle,
    appointmentDate: appointmentDate.toISOString(),
    oneDayNotificationId: oneDayId,
    oneHourNotificationId: oneHourId,
    createdAt: new Date().toISOString(),
  };

  saveReminderLocally(reminder);

  return {
    success: true,
    reminder,
  };
}

/**
 * Saves reminder record to local storage.
 */
function saveReminderLocally(reminder: AppointmentReminder): void {
  const existing = getStoredReminders();
  existing.unshift(reminder);

  if (typeof globalThis !== "undefined") {
    try {
      const storage = (
        globalThis as unknown as { localStorage?: { setItem: (k: string, v: string) => void } }
      ).localStorage;
      if (storage) {
        storage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(existing.slice(0, 50)));
        return;
      }
    } catch {
      // Fallback
    }
  }
  memoryReminders.set(reminder.id, reminder);
}

/**
 * Retrieves all scheduled reminders from storage.
 */
export function getStoredReminders(): AppointmentReminder[] {
  if (typeof globalThis !== "undefined") {
    try {
      const storage = (
        globalThis as unknown as { localStorage?: { getItem: (k: string) => string | null } }
      ).localStorage;
      if (storage) {
        const raw = storage.getItem(REMINDERS_STORAGE_KEY);
        if (raw) return JSON.parse(raw);
      }
    } catch {
      // Fallback
    }
  }
  return Array.from(memoryReminders.values());
}

/**
 * Cancels a scheduled appointment reminder and its notification triggers.
 */
export async function cancelAppointmentReminder(reminderId: string): Promise<boolean> {
  const reminders = getStoredReminders();
  const target = reminders.find((r) => r.id === reminderId);

  if (target) {
    const notifications = await getNotificationsModule();
    if (target.oneDayNotificationId) {
      await notifications.cancelScheduledNotificationAsync(target.oneDayNotificationId);
    }
    if (target.oneHourNotificationId) {
      await notifications.cancelScheduledNotificationAsync(target.oneHourNotificationId);
    }

    const filtered = reminders.filter((r) => r.id !== reminderId);
    if (typeof globalThis !== "undefined") {
      try {
        const storage = (
          globalThis as unknown as { localStorage?: { setItem: (k: string, v: string) => void } }
        ).localStorage;
        if (storage) {
          storage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(filtered));
        }
      } catch {
        // Fallback
      }
    }
    memoryReminders.delete(reminderId);
    return true;
  }

  return false;
}

/**
 * Clears all reminders (useful for testing).
 */
export function clearAllReminders(): void {
  if (typeof globalThis !== "undefined") {
    try {
      const storage = (
        globalThis as unknown as { localStorage?: { removeItem: (k: string) => void } }
      ).localStorage;
      if (storage) {
        storage.removeItem(REMINDERS_STORAGE_KEY);
      }
    } catch {
      // Fallback
    }
  }
  memoryReminders.clear();
}
