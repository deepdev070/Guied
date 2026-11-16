import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { colors, radius, spacing, typography, layout } from "../../theme/tokens";
import { Button, Callout } from "../ui";
import {
  scheduleAppointmentReminders,
  type AppointmentReminder,
} from "../../lib/mobile-reminders.ts";

export interface AppointmentReminderModalProps {
  visible: boolean;
  onClose: () => void;
  taskSlug: string;
  taskTitle: string;
  onReminderScheduled?: (reminder: AppointmentReminder) => void;
}

export function AppointmentReminderModal({
  visible,
  onClose,
  taskSlug,
  taskTitle,
  onReminderScheduled,
}: AppointmentReminderModalProps) {
  const [step, setStep] = useState<"explain" | "schedule" | "success">("explain");
  const [dateInput, setDateInput] = useState(() => {
    const defaultDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    return defaultDate.toISOString().split("T")[0]; // YYYY-MM-DD
  });
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("10:30");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleReset = () => {
    setStep("explain");
    setErrorMessage(null);
    onClose();
  };

  const handleProceedToSchedule = () => {
    setStep("schedule");
  };

  const handleSchedule = async () => {
    setErrorMessage(null);

    // Combine date and time
    const dateTimeString = `${dateInput}T${selectedTimeSlot}:00`;
    const targetDate = new Date(dateTimeString);

    if (isNaN(targetDate.getTime())) {
      setErrorMessage("Please enter a valid date in YYYY-MM-DD format (e.g. 2026-11-20).");
      return;
    }

    if (targetDate.getTime() <= Date.now()) {
      setErrorMessage("Appointment date and time must be in the future.");
      return;
    }

    const result = await scheduleAppointmentReminders({
      taskSlug,
      taskTitle,
      appointmentDate: targetDate,
    });

    if (result.success && result.reminder) {
      setStep("success");
      if (onReminderScheduled) {
        onReminderScheduled(result.reminder);
      }
    } else {
      setErrorMessage(result.error || "Failed to schedule notification.");
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={handleReset}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Appointment Reminders</Text>
            <TouchableOpacity
              onPress={handleReset}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Close appointment reminder modal"
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
            {/* Step 1: Polite Explanation Screen */}
            {step === "explain" && (
              <View style={styles.explainStep}>
                <View style={styles.iconCircle}>
                  <Text style={styles.bellIcon}>🔔</Text>
                </View>

                <Text style={styles.explainHeading}>Never Miss Your Government Slot</Text>
                <Text style={styles.explainText}>
                  RTO driving test slots, Passport Seva Kendra visits, and Sub-Registrar hearings
                  are hard to book and strictly timed.
                </Text>

                <View style={styles.featureBox}>
                  <View style={styles.featureRow}>
                    <Text style={styles.featureBullet}>📅</Text>
                    <View style={styles.featureTextCol}>
                      <Text style={styles.featureTitle}>The Day Before (24 Hours Ahead)</Text>
                      <Text style={styles.featureDesc}>
                        Alert to print Form slips, check self-declarations, and gather original
                        documents.
                      </Text>
                    </View>
                  </View>

                  <View style={styles.featureRow}>
                    <Text style={styles.featureBullet}>⏰</Text>
                    <View style={styles.featureTextCol}>
                      <Text style={styles.featureTitle}>One Hour Before Appointment</Text>
                      <Text style={styles.featureDesc}>
                        Final alert with your document checklist link right before you head out.
                      </Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.privacyNotice}>
                  🔒 100% private on your phone. We never store personal data or send promotional
                  notifications.
                </Text>

                <View style={styles.buttonStack}>
                  <Button
                    variant="primary"
                    size="lg"
                    onPress={handleProceedToSchedule}
                    accessibilityLabel="Continue to schedule reminders"
                  >
                    Set Appointment Reminders
                  </Button>
                  <Button
                    variant="ghost"
                    size="md"
                    onPress={handleReset}
                    accessibilityLabel="Skip reminders for now"
                  >
                    Not Now
                  </Button>
                </View>
              </View>
            )}

            {/* Step 2: Date & Time Picker */}
            {step === "schedule" && (
              <View style={styles.scheduleStep}>
                <Text style={styles.sectionSubtitle}>
                  For: <Text style={styles.taskTitleHighlight}>{taskTitle}</Text>
                </Text>

                {errorMessage ? (
                  <Callout variant="error" style={styles.calloutSpacing}>
                    {errorMessage}
                  </Callout>
                ) : null}

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>APPOINTMENT DATE (YYYY-MM-DD)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={dateInput}
                    onChangeText={setDateInput}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={colors.textSubtle}
                    keyboardType="numbers-and-punctuation"
                    accessibilityLabel="Appointment date in YYYY-MM-DD format"
                  />
                  <Text style={styles.fieldHelp}>
                    Enter the date of your confirmed RTO or government appointment.
                  </Text>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>TIME SLOT</Text>
                  <View style={styles.timeSlotsGrid}>
                    {[
                      { label: "09:30 AM", value: "09:30" },
                      { label: "11:30 AM", value: "11:30" },
                      { label: "02:30 PM", value: "14:30" },
                      { label: "04:30 PM", value: "16:30" },
                    ].map((slot) => {
                      const isSelected = selectedTimeSlot === slot.value;
                      return (
                        <TouchableOpacity
                          key={slot.value}
                          style={[styles.timeSlotChip, isSelected && styles.timeSlotChipSelected]}
                          onPress={() => setSelectedTimeSlot(slot.value)}
                          accessibilityRole="button"
                          accessibilityLabel={`Select appointment slot at ${slot.label}`}
                          accessibilityState={{ selected: isSelected }}
                        >
                          <Text
                            style={[styles.timeSlotText, isSelected && styles.timeSlotTextSelected]}
                          >
                            {slot.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.buttonStack}>
                  <Button
                    variant="primary"
                    size="lg"
                    onPress={handleSchedule}
                    accessibilityLabel="Confirm and schedule local notification reminders"
                  >
                    Confirm & Schedule Alerts
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    onPress={() => setStep("explain")}
                    accessibilityLabel="Go back to explanation screen"
                  >
                    Back
                  </Button>
                </View>
              </View>
            )}

            {/* Step 3: Success Screen */}
            {step === "success" && (
              <View style={styles.successStep}>
                <View style={[styles.iconCircle, styles.iconCircleSuccess]}>
                  <Text style={styles.successIcon}>✓</Text>
                </View>

                <Text style={styles.explainHeading}>Reminders Scheduled!</Text>
                <Text style={styles.explainText}>
                  Your alerts for <Text style={styles.taskTitleHighlight}>{taskTitle}</Text> are
                  active:
                </Text>

                <View style={styles.scheduledInfoBox}>
                  <Text style={styles.scheduledInfoItem}>
                    • <Text style={styles.boldText}>24 Hours Before:</Text> Document packing
                    checklist reminder
                  </Text>
                  <Text style={styles.scheduledInfoItem}>
                    • <Text style={styles.boldText}>1 Hour Before:</Text> Final departure warning
                    with checklist link
                  </Text>
                </View>

                <Button
                  variant="primary"
                  size="lg"
                  onPress={handleReset}
                  accessibilityLabel="Done"
                  style={styles.doneBtn}
                >
                  Done
                </Button>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    maxHeight: "85%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  headerTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: "bold",
    color: colors.text,
  },
  closeBtn: {
    minWidth: layout.minTouchTarget,
    minHeight: layout.minTouchTarget,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textMuted,
  },
  scrollArea: {
    maxHeight: 460,
  },
  scrollContent: {
    paddingBottom: spacing.md,
  },
  explainStep: {
    alignItems: "center",
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  iconCircleSuccess: {
    backgroundColor: "#DCFCE7",
  },
  bellIcon: {
    fontSize: 32,
  },
  successIcon: {
    fontSize: 32,
    color: colors.success,
    fontWeight: "bold",
  },
  explainHeading: {
    fontSize: typography.h3.fontSize,
    fontWeight: "bold",
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  explainText: {
    fontSize: typography.bodySm.fontSize,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  featureBox: {
    width: "100%",
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureRow: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "flex-start",
  },
  featureBullet: {
    fontSize: 18,
  },
  featureTextCol: {
    flex: 1,
  },
  featureTitle: {
    fontSize: typography.bodySm.fontSize,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 16,
  },
  privacyNotice: {
    fontSize: 11,
    color: colors.textSubtle,
    textAlign: "center",
    lineHeight: 16,
    marginBottom: spacing.lg,
  },
  buttonStack: {
    width: "100%",
    gap: spacing.sm,
  },
  scheduleStep: {
    paddingTop: 4,
  },
  sectionSubtitle: {
    fontSize: typography.body.fontSize,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  taskTitleHighlight: {
    color: colors.primary,
    fontWeight: "700",
  },
  calloutSpacing: {
    marginBottom: spacing.md,
  },
  fieldGroup: {
    marginBottom: spacing.md,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textSubtle,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  textInput: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: typography.body.fontSize,
    color: colors.text,
    minHeight: layout.minTouchTarget,
  },
  fieldHelp: {
    fontSize: 11,
    color: colors.textSubtle,
    marginTop: 4,
  },
  timeSlotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  timeSlotChip: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: layout.minTouchTarget,
  },
  timeSlotChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  timeSlotText: {
    fontSize: typography.bodySm.fontSize,
    fontWeight: "600",
    color: colors.text,
  },
  timeSlotTextSelected: {
    color: colors.primary,
    fontWeight: "700",
  },
  successStep: {
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  scheduledInfoBox: {
    width: "100%",
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  scheduledInfoItem: {
    fontSize: 12,
    color: colors.text,
    lineHeight: 18,
  },
  boldText: {
    fontWeight: "700",
  },
  doneBtn: {
    width: "100%",
  },
});
