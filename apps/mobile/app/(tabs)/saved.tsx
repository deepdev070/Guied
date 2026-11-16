import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Share,
} from "react-native";
import { useRouter } from "expo-router";
import { colors, radius, spacing, typography, layout } from "../../theme/tokens";
import { Card, Badge, Button, Callout } from "../../components/ui";
import {
  getAllChecklistsIndex,
  clearStoredCompletedDocs,
  exportChecklistsData,
  importChecklistsData,
  subscribeToChecklistUpdates,
  type ChecklistIndexEntry,
} from "../../lib/checklist-storage";

export default function SavedChecklistsScreen() {
  const router = useRouter();
  const [checklists, setChecklists] = useState<ChecklistIndexEntry[]>(() =>
    getAllChecklistsIndex()
  );
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState("");
  const [importStatus, setImportStatus] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);

  const loadLists = () => {
    setChecklists(getAllChecklistsIndex());
  };

  useEffect(() => {
    const unsubscribe = subscribeToChecklistUpdates(loadLists);
    return () => unsubscribe();
  }, []);

  const handleRemove = (taskSlug: string, stateSlug: string) => {
    clearStoredCompletedDocs(taskSlug, stateSlug);
    loadLists();
  };

  const handleShareExport = async () => {
    try {
      const data = exportChecklistsData();
      await Share.share({
        title: "India Paperwork Guide - Checklists Backup",
        message: data,
      });
    } catch {
      // User cancelled
    }
  };

  const handleExecuteImport = () => {
    if (!importText.trim()) {
      setImportStatus({ success: false, message: "Please paste your backup JSON code." });
      return;
    }

    const result = importChecklistsData(importText);
    if (result.success) {
      setImportStatus({
        success: true,
        message: `Successfully imported ${result.count} checklist items!`,
      });
      loadLists();
      setTimeout(() => {
        setShowImportModal(false);
        setImportText("");
        setImportStatus(null);
      }, 1500);
    } else {
      setImportStatus({
        success: false,
        message: result.error || "Failed to import JSON data.",
      });
    }
  };

  return (
    <View style={styles.screenWrapper}>
      {/* Header bar */}
      <View style={styles.topBar}>
        <View style={styles.titleRow}>
          <Text style={styles.screenTitle}>My Lists</Text>
          <Badge label={`${checklists.length} Saved`} variant="neutral" />
        </View>
        <Text style={styles.screenSubtitle}>
          Offline-first document checklists saved directly on your device. No account required.
        </Text>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setShowExportModal(true)}
            accessibilityRole="button"
            accessibilityLabel="Export Checklists Backup Code"
          >
            <Text style={styles.actionBtnText}>📤 Export Code</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              setImportText("");
              setImportStatus(null);
              setShowImportModal(true);
            }}
            accessibilityRole="button"
            accessibilityLabel="Import Checklists from Web or Mobile Code"
          >
            <Text style={styles.actionBtnText}>📥 Import Code</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {checklists.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No Checklists Saved Yet</Text>
            <Text style={styles.emptyText}>
              When you view any guide, tap &quot;Save checklist&quot; to track your documents and
              progress offline with zero account needed.
            </Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => router.push("/(tabs)/index")}
              accessibilityRole="button"
              accessibilityLabel="Browse Civic Guides"
            >
              <Text style={styles.browseButtonText}>Browse Civic Guides</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.listsContainer}>
            {checklists.map((item) => {
              const total = Math.max(item.totalCount, 1);
              const progressPct = Math.min(100, Math.round((item.completedCount / total) * 100));
              const isCompleted = item.completedCount >= item.totalCount && item.totalCount > 0;

              return (
                <Card key={`${item.taskSlug}_${item.stateSlug}`} style={styles.listCard}>
                  <View style={styles.cardHeaderRow}>
                    <Badge
                      label={item.stateSlug.toUpperCase()}
                      variant={item.stateSlug === "gj" ? "info" : "neutral"}
                    />
                    {isCompleted ? <Badge label="✓ Ready" variant="success" /> : null}
                  </View>

                  <Text style={styles.taskTitle}>{item.taskTitle}</Text>

                  {/* Progress Bar */}
                  <View style={styles.progressSection}>
                    <View style={styles.progressBarTrack}>
                      <View
                        style={[
                          styles.progressBarFill,
                          {
                            width: `${progressPct}%`,
                            backgroundColor: isCompleted ? colors.success : colors.primary,
                          },
                        ]}
                      />
                    </View>
                    <View style={styles.progressLabelRow}>
                      <Text style={styles.progressCountText}>
                        {item.completedCount} of {item.totalCount} documents ready
                      </Text>
                      <Text
                        style={[
                          styles.progressPctText,
                          { color: isCompleted ? colors.successText : colors.primary },
                        ]}
                      >
                        {progressPct}%
                      </Text>
                    </View>
                  </View>

                  {/* Card Actions */}
                  <View style={styles.cardButtonsRow}>
                    <Button
                      variant="primary"
                      style={styles.continueBtn}
                      onPress={() => router.push(`/task/${item.taskSlug}`)}
                      accessibilityLabel={`Continue checklist for ${item.taskTitle}`}
                    >
                      Continue Checklist
                    </Button>
                    <Button
                      variant="outline"
                      style={styles.removeBtn}
                      onPress={() => handleRemove(item.taskSlug, item.stateSlug)}
                      accessibilityLabel={`Remove ${item.taskTitle} checklist`}
                    >
                      Remove
                    </Button>
                  </View>
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Export Modal */}
      <Modal
        visible={showExportModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowExportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Export Checklists</Text>
              <TouchableOpacity
                onPress={() => setShowExportModal(false)}
                accessibilityRole="button"
                accessibilityLabel="Close export modal"
                style={styles.modalCloseBtn}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>
              This JSON backup code is 100% compatible with the web version. You can share it to
              your computer or another phone.
            </Text>

            <TextInput
              style={styles.jsonInput}
              value={exportChecklistsData()}
              editable={false}
              multiline={true}
              numberOfLines={8}
              accessibilityLabel="Export JSON code payload"
            />

            <View style={styles.modalActionsRow}>
              <Button variant="primary" onPress={handleShareExport} style={styles.flexBtn}>
                Share Backup Code ↗
              </Button>
              <Button
                variant="outline"
                onPress={() => setShowExportModal(false)}
                style={styles.flexBtn}
              >
                Close
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {/* Import Modal */}
      <Modal
        visible={showImportModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowImportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Import Checklists</Text>
              <TouchableOpacity
                onPress={() => setShowImportModal(false)}
                accessibilityRole="button"
                accessibilityLabel="Close import modal"
                style={styles.modalCloseBtn}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>
              Paste a JSON backup code exported from either the India Paperwork Guide website or
              mobile app to merge with your device lists.
            </Text>

            {importStatus ? (
              <Callout
                variant={importStatus.success ? "success" : "error"}
                style={styles.importCallout}
              >
                {importStatus.message}
              </Callout>
            ) : null}

            <TextInput
              style={[styles.jsonInput, styles.jsonInputEditable]}
              placeholder="Paste JSON backup code here..."
              placeholderTextColor={colors.textSubtle}
              value={importText}
              onChangeText={setImportText}
              multiline={true}
              numberOfLines={6}
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Paste backup JSON code"
            />

            <View style={styles.modalActionsRow}>
              <Button variant="primary" onPress={handleExecuteImport} style={styles.flexBtn}>
                Import & Restore
              </Button>
              <Button
                variant="outline"
                onPress={() => setShowImportModal(false)}
                style={styles.flexBtn}
              >
                Cancel
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  screenTitle: {
    fontSize: typography.h2.fontSize,
    fontWeight: "bold",
    color: colors.text,
  },
  screenSubtitle: {
    fontSize: typography.bodySm.fontSize,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingTop: 4,
  },
  actionBtn: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: layout.minTouchTarget,
    justifyContent: "center",
    alignItems: "center",
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xxl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  emptyText: {
    fontSize: typography.body.fontSize,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  browseButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: 12,
    paddingHorizontal: 24,
    minHeight: layout.minTouchTarget,
    justifyContent: "center",
  },
  browseButtonText: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: "600",
  },
  listsContainer: {
    gap: spacing.md,
  },
  listCard: {
    padding: spacing.md,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: spacing.md,
  },
  progressSection: {
    marginBottom: spacing.md,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.full,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: radius.full,
  },
  progressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressCountText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  progressPctText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  cardButtonsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  continueBtn: {
    flex: 2,
  },
  removeBtn: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  modalTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: "bold",
    color: colors.text,
  },
  modalCloseBtn: {
    minWidth: layout.minTouchTarget,
    minHeight: layout.minTouchTarget,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCloseText: {
    fontSize: 18,
    color: colors.textMuted,
    fontWeight: "bold",
  },
  modalSubtitle: {
    fontSize: typography.bodySm.fontSize,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  jsonInput: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 12,
    color: colors.text,
    fontFamily: "monospace",
    textAlignVertical: "top",
    minHeight: 120,
    marginBottom: spacing.md,
  },
  jsonInputEditable: {
    backgroundColor: colors.surface,
  },
  modalActionsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  flexBtn: {
    flex: 1,
  },
  importCallout: {
    marginBottom: spacing.md,
  },
});
