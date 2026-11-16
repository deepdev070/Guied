import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from "react-native";
import { colors, radius, spacing, typography, layout } from "../../theme/tokens";
import { Button, Badge } from "../ui";
import { WIZARD_QUESTIONS, type WizardQuestion, type WizardQuestionOption } from "./wizard-data";

export { WIZARD_QUESTIONS, type WizardQuestion, type WizardQuestionOption };

export interface MobilePersonalizationWizardProps {
  visible: boolean;
  onClose: () => void;
  answers: Record<string, unknown>;
  onApplyAnswers: (answers: Record<string, unknown>) => void;
  onResetAnswers: () => void;
  activeFilterCount: number;
}

export function MobilePersonalizationWizard({
  visible,
  onClose,
  answers,
  onApplyAnswers,
  onResetAnswers,
  activeFilterCount,
}: MobilePersonalizationWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [draftAnswers, setDraftAnswers] = useState<Record<string, unknown>>(answers);

  const question = WIZARD_QUESTIONS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === WIZARD_QUESTIONS.length - 1;

  const handleSelectOption = (option: WizardQuestionOption) => {
    setDraftAnswers((prev) => ({
      ...prev,
      ...option.values,
    }));
  };

  const isOptionSelected = (option: WizardQuestionOption): boolean => {
    return Object.entries(option.values).every(([key, val]) => draftAnswers[key] === val);
  };

  const handleNext = () => {
    if (isLastStep) {
      onApplyAnswers(draftAnswers);
      onClose();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    setDraftAnswers({});
    onResetAnswers();
    setCurrentStep(0);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <View style={styles.headerTitleRow}>
                <Text style={styles.sheetTitle}>Personalize Checklist</Text>
                {activeFilterCount > 0 ? (
                  <Badge label={`${activeFilterCount} Active`} variant="info" />
                ) : null}
              </View>
              <Text style={styles.sheetSubtitle}>
                Answer 4 quick questions to filter only documents mandatory for you.
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Close personalization wizard"
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Progress Indicators */}
          <View style={styles.stepTrack}>
            {WIZARD_QUESTIONS.map((q, idx) => (
              <TouchableOpacity
                key={q.id}
                style={[
                  styles.stepSegment,
                  idx <= currentStep ? styles.stepSegmentActive : styles.stepSegmentInactive,
                ]}
                onPress={() => setCurrentStep(idx)}
                accessibilityRole="button"
                accessibilityLabel={`Go to question ${idx + 1}`}
              />
            ))}
          </View>
          <Text style={styles.stepCounterText}>
            Question {currentStep + 1} of {WIZARD_QUESTIONS.length}
          </Text>

          {/* Question Card */}
          <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
            <View style={styles.questionCard}>
              <Text style={styles.questionTitle}>{question.title}</Text>
              <Text style={styles.questionSubtitle}>{question.subtitle}</Text>

              {/* Options */}
              <View style={styles.optionsList}>
                {question.options.map((option, optIdx) => {
                  const selected = isOptionSelected(option);
                  return (
                    <TouchableOpacity
                      key={optIdx}
                      style={[styles.optionCard, selected && styles.optionCardSelected]}
                      onPress={() => handleSelectOption(option)}
                      accessibilityRole="button"
                      accessibilityLabel={`${option.label}. ${option.description || ""}`}
                      accessibilityState={{ selected }}
                    >
                      <View style={styles.optionTopRow}>
                        <View style={[styles.radioCircle, selected && styles.radioCircleSelected]}>
                          {selected ? <View style={styles.radioInnerDot} /> : null}
                        </View>
                        <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
                          {option.label}
                        </Text>
                      </View>

                      {option.description ? (
                        <Text style={styles.optionDescription}>{option.description}</Text>
                      ) : null}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Bottom Navigation Controls */}
          <View style={styles.bottomNav}>
            <Button
              variant="outline"
              size="md"
              disabled={isFirstStep}
              onPress={handlePrev}
              style={styles.navBtn}
              accessibilityLabel="Go to previous question"
            >
              Back
            </Button>

            <Button
              variant="primary"
              size="md"
              onPress={handleNext}
              style={styles.navBtnMain}
              accessibilityLabel={
                isLastStep ? "Apply answers and filter checklist" : "Next question"
              }
            >
              {isLastStep ? "Apply & Filter" : "Next →"}
            </Button>

            {activeFilterCount > 0 ? (
              <TouchableOpacity
                onPress={handleReset}
                style={styles.resetBtn}
                accessibilityRole="button"
                accessibilityLabel="Reset all profile filters"
              >
                <Text style={styles.resetBtnText}>Reset</Text>
              </TouchableOpacity>
            ) : null}
          </View>
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
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: 4,
  },
  sheetTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: "bold",
    color: colors.text,
  },
  sheetSubtitle: {
    fontSize: typography.bodySm.fontSize,
    color: colors.textMuted,
    lineHeight: 18,
    maxWidth: "90%",
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
  stepTrack: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 6,
  },
  stepSegment: {
    flex: 1,
    height: 6,
    borderRadius: radius.full,
  },
  stepSegmentActive: {
    backgroundColor: colors.primary,
  },
  stepSegmentInactive: {
    backgroundColor: colors.surfaceSubtle,
  },
  stepCounterText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: spacing.md,
  },
  scrollArea: {
    maxHeight: 360,
  },
  scrollContent: {
    paddingBottom: spacing.md,
  },
  questionCard: {
    backgroundColor: colors.surface,
  },
  questionTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  questionSubtitle: {
    fontSize: typography.bodySm.fontSize,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  optionsList: {
    gap: spacing.sm,
  },
  optionCard: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
    minHeight: layout.minTouchTarget,
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  optionTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioCircleSelected: {
    borderColor: colors.primary,
  },
  radioInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  optionLabel: {
    fontSize: typography.body.fontSize,
    fontWeight: "600",
    color: colors.text,
    flex: 1,
  },
  optionLabelSelected: {
    color: colors.primary,
  },
  optionDescription: {
    fontSize: typography.bodySm.fontSize,
    color: colors.textMuted,
    lineHeight: 18,
    marginTop: 4,
    paddingLeft: 28,
  },
  bottomNav: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.sm,
  },
  navBtn: {
    flex: 1,
  },
  navBtnMain: {
    flex: 2,
  },
  resetBtn: {
    minHeight: layout.minTouchTarget,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  resetBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.error,
  },
});
