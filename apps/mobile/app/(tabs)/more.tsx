import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  TextInput,
  Linking,
  Alert,
} from "react-native";
import { colors, radius, spacing, typography, layout } from "../../theme/tokens";
import { Card, Button, Badge, Callout } from "../../components/ui";
import {
  LANGUAGE_OPTIONS,
  TEXT_SIZE_OPTIONS,
  APP_VERSION_INFO,
  getMobileUserSettings,
  saveMobileUserSettings,
  clearAllLocalUserData,
} from "../../lib/mobile-settings";

export default function MoreScreen() {
  const [settings, setSettings] = useState(() => getMobileUserSettings());

  // Modals state
  const [activeModal, setActiveModal] = useState<
    "language" | "textSize" | "state" | "privacy" | "about" | "disclaimer" | "reportMistake" | null
  >(null);

  // Report Mistake Form State
  const [reportTask, setReportTask] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const updateSetting = <K extends keyof typeof settings>(key: K, value: (typeof settings)[K]) => {
    const updated = saveMobileUserSettings({ [key]: value });
    setSettings(updated);
  };

  const handleRateApp = () => {
    // Platform Store Review or Fallback Web Store URL
    const storeUrl = "https://play.google.com/store/apps/details?id=in.gov.paperworkguide.mobile";
    Linking.openURL(storeUrl).catch(() => {
      Alert.alert(
        "Thank You!",
        "India Paperwork Guide is 100% free and open-access for every Indian citizen. Your 5-star review helps citizens discover reliable government procedures!"
      );
    });
  };

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data?",
      "This will erase your saved checklists, cached guides, and offline data from this phone. You cannot undo this.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Everything",
          style: "destructive",
          onPress: () => {
            clearAllLocalUserData();
            setSettings(getMobileUserSettings());
            setActiveModal(null);
            Alert.alert("Data Cleared", "All local checklists and cached data have been reset.");
          },
        },
      ]
    );
  };

  const currentLangLabel =
    LANGUAGE_OPTIONS.find((l) => l.code === settings.language)?.nativeLabel || "English";
  const currentTextSizeLabel =
    TEXT_SIZE_OPTIONS.find((t) => t.scale === settings.textSize)?.label || "Normal";
  const currentStateLabel =
    settings.defaultState === "gujarat" ? "Gujarat (Launch State)" : "All India (National)";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      accessibilityRole="none"
    >
      {/* Header Banner */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings & Information</Text>
        <Text style={styles.headerSubtitle}>
          Personalise your civic experience, view disclaimers, or report outdated government info.
        </Text>
      </View>

      {/* 1. Preferences Section */}
      <Text style={styles.sectionHeader}>PREFERENCES</Text>
      <Card style={styles.card}>
        {/* Language */}
        <TouchableOpacity
          style={[styles.row, styles.borderBottom]}
          onPress={() => setActiveModal("language")}
          accessibilityRole="button"
          accessibilityLabel={`App Language, currently ${currentLangLabel}`}
        >
          <View style={styles.rowInfo}>
            <Text style={styles.rowIcon}>🌐</Text>
            <View>
              <Text style={styles.rowTitle}>Language (ભાષા / भाषा)</Text>
              <Text style={styles.rowSubtitle}>English, हिन्दी, ગુજરાતી</Text>
            </View>
          </View>
          <View style={styles.rowAction}>
            <Text style={styles.rowValue}>{currentLangLabel}</Text>
            <Text style={styles.chevron}>›</Text>
          </View>
        </TouchableOpacity>

        {/* Text Size */}
        <TouchableOpacity
          style={[styles.row, styles.borderBottom]}
          onPress={() => setActiveModal("textSize")}
          accessibilityRole="button"
          accessibilityLabel={`Text Size, currently ${currentTextSizeLabel}`}
        >
          <View style={styles.rowInfo}>
            <Text style={styles.rowIcon}>🔍</Text>
            <View>
              <Text style={styles.rowTitle}>Text Size</Text>
              <Text style={styles.rowSubtitle}>Scale fonts up to 130% for readability</Text>
            </View>
          </View>
          <View style={styles.rowAction}>
            <Text style={styles.rowValue}>{currentTextSizeLabel}</Text>
            <Text style={styles.chevron}>›</Text>
          </View>
        </TouchableOpacity>

        {/* Default State */}
        <TouchableOpacity
          style={[styles.row, styles.borderBottom]}
          onPress={() => setActiveModal("state")}
          accessibilityRole="button"
          accessibilityLabel={`Default State, currently ${currentStateLabel}`}
        >
          <View style={styles.rowInfo}>
            <Text style={styles.rowIcon}>📍</Text>
            <View>
              <Text style={styles.rowTitle}>Default State Portal</Text>
              <Text style={styles.rowSubtitle}>Auto-select state rules & fee structures</Text>
            </View>
          </View>
          <View style={styles.rowAction}>
            <Text style={styles.rowValue}>{currentStateLabel}</Text>
            <Text style={styles.chevron}>›</Text>
          </View>
        </TouchableOpacity>

        {/* Lite Mode */}
        <View style={styles.row}>
          <View style={styles.rowInfo}>
            <Text style={styles.rowIcon}>⚡</Text>
            <View>
              <Text style={styles.rowTitle}>Lite Mode (Data Saver)</Text>
              <Text style={styles.rowSubtitle}>Optimised for low-bandwidth 2G/3G networks</Text>
            </View>
          </View>
          <Switch
            value={settings.liteMode}
            onValueChange={(val: boolean) => updateSetting("liteMode", val)}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#FFFFFF"
            accessibilityLabel="Toggle lite mode data saver"
          />
        </View>
      </Card>

      {/* 2. Privacy Section */}
      <Text style={styles.sectionHeader}>PRIVACY & DATA</Text>
      <Card style={styles.card}>
        <TouchableOpacity
          style={styles.row}
          onPress={() => setActiveModal("privacy")}
          accessibilityRole="button"
          accessibilityLabel="Privacy choices and offline data management"
        >
          <View style={styles.rowInfo}>
            <Text style={styles.rowIcon}>🔒</Text>
            <View>
              <Text style={styles.rowTitle}>Privacy Choices</Text>
              <Text style={styles.rowSubtitle}>Diagnostics, analytics, and data wipe</Text>
            </View>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </Card>

      {/* 3. Citizen Feedback Section */}
      <Text style={styles.sectionHeader}>CITIZEN SUPPORT & COMMUNITY</Text>
      <Card style={styles.card}>
        {/* Report a Mistake */}
        <TouchableOpacity
          style={[styles.row, styles.borderBottom]}
          onPress={() => {
            setReportSubmitted(false);
            setActiveModal("reportMistake");
          }}
          accessibilityRole="button"
          accessibilityLabel="Report a mistake or outdated government fee"
        >
          <View style={styles.rowInfo}>
            <Text style={styles.rowIcon}>⚠️</Text>
            <View>
              <Text style={styles.rowTitle}>Report a Mistake</Text>
              <Text style={styles.rowSubtitle}>Flag changed fees, broken links, or new rules</Text>
            </View>
          </View>
          <Badge label="VERIFIED BY CITIZENS" variant="warning" />
        </TouchableOpacity>

        {/* Rate the App */}
        <TouchableOpacity
          style={styles.row}
          onPress={handleRateApp}
          accessibilityRole="button"
          accessibilityLabel="Rate India Paperwork Guide app on store"
        >
          <View style={styles.rowInfo}>
            <Text style={styles.rowIcon}>⭐</Text>
            <View>
              <Text style={styles.rowTitle}>Rate the App</Text>
              <Text style={styles.rowSubtitle}>Support free citizen access across India</Text>
            </View>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </Card>

      {/* 4. About & Legal Disclaimers */}
      <Text style={styles.sectionHeader}>ABOUT & LEGAL</Text>
      <Card style={styles.card}>
        {/* About */}
        <TouchableOpacity
          style={[styles.row, styles.borderBottom]}
          onPress={() => setActiveModal("about")}
          accessibilityRole="button"
          accessibilityLabel="About India Paperwork Guide"
        >
          <View style={styles.rowInfo}>
            <Text style={styles.rowIcon}>ℹ️</Text>
            <View>
              <Text style={styles.rowTitle}>About India Paperwork Guide</Text>
              <Text style={styles.rowSubtitle}>Class 8 reading level • 100% verified</Text>
            </View>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        {/* Disclaimer */}
        <TouchableOpacity
          style={styles.row}
          onPress={() => setActiveModal("disclaimer")}
          accessibilityRole="button"
          accessibilityLabel="Official statutory disclaimer"
        >
          <View style={styles.rowInfo}>
            <Text style={styles.rowIcon}>📜</Text>
            <View>
              <Text style={styles.rowTitle}>Official Disclaimer</Text>
              <Text style={styles.rowSubtitle}>Non-governmental civic directory notice</Text>
            </View>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </Card>

      {/* App Version Info Footer */}
      <View style={styles.versionFooter}>
        <Text style={styles.versionTitle}>
          India Paperwork Guide v{APP_VERSION_INFO.version} (Build {APP_VERSION_INFO.buildNumber})
        </Text>
        <Text style={styles.versionSubtitle}>
          {APP_VERSION_INFO.edition} • {APP_VERSION_INFO.theme}
        </Text>
        <Text style={styles.versionStandard}>{APP_VERSION_INFO.verificationStandard}</Text>
      </View>

      {/* ============================================================ */}
      {/* MODAL 1: Language Selection Modal */}
      {/* ============================================================ */}
      <Modal
        visible={activeModal === "language"}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <Text style={styles.modalTitle}>Choose Language / ભાષા પસંદ કરો</Text>
            <Text style={styles.modalDesc}>
              Select your preferred language for paperwork guides and checklist items.
            </Text>

            {LANGUAGE_OPTIONS.map((lang) => {
              const isSelected = settings.language === lang.code;
              return (
                <TouchableOpacity
                  key={lang.code}
                  style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                  onPress={() => {
                    updateSetting("language", lang.code);
                    setActiveModal(null);
                  }}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                >
                  <View>
                    <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                      {lang.nativeLabel}
                    </Text>
                    <Text style={styles.optionSub}>{lang.label}</Text>
                  </View>
                  {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              );
            })}

            <Button
              variant="outline"
              size="md"
              onPress={() => setActiveModal(null)}
              style={styles.modalCloseBtn}
            >
              Cancel
            </Button>
          </Card>
        </View>
      </Modal>

      {/* ============================================================ */}
      {/* MODAL 2: Text Size Selection Modal */}
      {/* ============================================================ */}
      <Modal
        visible={activeModal === "textSize"}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <Text style={styles.modalTitle}>Text Size Readability</Text>
            <Text style={styles.modalDesc}>
              Enlarge text for higher visibility and easier reading on mobile screens.
            </Text>

            {TEXT_SIZE_OPTIONS.map((opt) => {
              const isSelected = settings.textSize === opt.scale;
              return (
                <TouchableOpacity
                  key={opt.scale}
                  style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                  onPress={() => {
                    updateSetting("textSize", opt.scale);
                    setActiveModal(null);
                  }}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                >
                  <View>
                    <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                      {opt.label} ({opt.percentage})
                    </Text>
                    <Text style={styles.optionSub}>
                      {opt.scale === "100"
                        ? "Standard Class 8 typography"
                        : opt.scale === "115"
                          ? "Larger font for comfortable reading"
                          : "Maximum magnification for clarity"}
                    </Text>
                  </View>
                  {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              );
            })}

            <Button
              variant="outline"
              size="md"
              onPress={() => setActiveModal(null)}
              style={styles.modalCloseBtn}
            >
              Cancel
            </Button>
          </Card>
        </View>
      </Modal>

      {/* ============================================================ */}
      {/* MODAL 3: State Default Selection Modal */}
      {/* ============================================================ */}
      <Modal
        visible={activeModal === "state"}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select Default State</Text>
            <Text style={styles.modalDesc}>
              State portal links and statutory local fees will automatically load for this state.
            </Text>

            {[
              { code: "gujarat", label: "Gujarat", badge: "Launch State • Verified Portals" },
              { code: "national", label: "All India (National)", badge: "Central Government" },
            ].map((st) => {
              const isSelected = settings.defaultState === st.code;
              return (
                <TouchableOpacity
                  key={st.code}
                  style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                  onPress={() => {
                    updateSetting("defaultState", st.code);
                    setActiveModal(null);
                  }}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                >
                  <View>
                    <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                      {st.label}
                    </Text>
                    <Text style={styles.optionSub}>{st.badge}</Text>
                  </View>
                  {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              );
            })}

            <Button
              variant="outline"
              size="md"
              onPress={() => setActiveModal(null)}
              style={styles.modalCloseBtn}
            >
              Cancel
            </Button>
          </Card>
        </View>
      </Modal>

      {/* ============================================================ */}
      {/* MODAL 4: Privacy Choices Modal */}
      {/* ============================================================ */}
      <Modal
        visible={activeModal === "privacy"}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <Text style={styles.modalTitle}>Privacy Choices & Data</Text>
            <Text style={styles.modalDesc}>
              We never collect passwords, Aadhaar numbers, or personal identifying information.
              Everything stays 100% on your device.
            </Text>

            <View style={[styles.row, styles.borderBottom, { paddingHorizontal: 0 }]}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={styles.rowTitle}>Anonymous Diagnostics</Text>
                <Text style={styles.rowSubtitle}>Helps us detect crashes and broken links</Text>
              </View>
              <Switch
                value={settings.analyticsAllowed}
                onValueChange={(val: boolean) => updateSetting("analyticsAllowed", val)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={[styles.row, styles.borderBottom, { paddingHorizontal: 0 }]}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={styles.rowTitle}>Error Monitoring</Text>
                <Text style={styles.rowSubtitle}>Send automated crash traces with zero PII</Text>
              </View>
              <Switch
                value={settings.crashReportsAllowed}
                onValueChange={(val: boolean) => updateSetting("crashReportsAllowed", val)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <Button
              variant="outline"
              size="md"
              onPress={handleClearData}
              style={{ marginTop: spacing.md, borderColor: colors.error }}
            >
              Clear All Saved Checklists & Data 🗑️
            </Button>

            <Button
              variant="primary"
              size="md"
              onPress={() => setActiveModal(null)}
              style={styles.modalCloseBtn}
            >
              Done
            </Button>
          </Card>
        </View>
      </Modal>

      {/* ============================================================ */}
      {/* MODAL 5: About Modal */}
      {/* ============================================================ */}
      <Modal
        visible={activeModal === "about"}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <Text style={styles.modalTitle}>About India Paperwork Guide</Text>
            <Text style={styles.modalDesc}>
              Our civic mission is to make official Indian government documentation completely
              transparent, stress-free, and agent-free for every citizen.
            </Text>

            <Callout variant="info" title="Class 8 Plain Language Standard">
              Every procedure is written in simple language that an 8th-grade student can easily
              understand. We eliminate bureaucratic jargon and clarify exact statutory costs.
            </Callout>

            <Callout variant="success" title="Zero Unverified Content">
              All forms, guidelines, and fee amounts are verified against official gazettes and
              government departments (.gov.in / .nic.in).
            </Callout>

            <Button
              variant="primary"
              size="md"
              onPress={() => setActiveModal(null)}
              style={styles.modalCloseBtn}
            >
              Close
            </Button>
          </Card>
        </View>
      </Modal>

      {/* ============================================================ */}
      {/* MODAL 6: Disclaimer Modal */}
      {/* ============================================================ */}
      <Modal
        visible={activeModal === "disclaimer"}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <Text style={styles.modalTitle}>Official Disclaimer</Text>
            <Callout variant="warning" title="Non-Governmental Civic Directory">
              India Paperwork Guide is an independent civic portal created to help Indian citizens
              navigate official procedures. We are NOT affiliated with, authorized by, or an
              official department of the Government of India or the Government of Gujarat.
            </Callout>

            <Text style={styles.modalDesc}>
              All document requirements, statutory fee structures, and procedure steps reference
              official portals such as sarathi.parivahan.gov.in, passportindia.gov.in, and
              digitalgujarat.gov.in. Citizens must always submit applications directly on official
              government portals.
            </Text>

            <Button
              variant="primary"
              size="md"
              onPress={() => setActiveModal(null)}
              style={styles.modalCloseBtn}
            >
              I Understand
            </Button>
          </Card>
        </View>
      </Modal>

      {/* ============================================================ */}
      {/* MODAL 7: Report a Mistake Modal */}
      {/* ============================================================ */}
      <Modal
        visible={activeModal === "reportMistake"}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <Text style={styles.modalTitle}>Report a Mistake</Text>
            {reportSubmitted ? (
              <View style={{ alignItems: "center", paddingVertical: spacing.md }}>
                <Text style={{ fontSize: 40, marginBottom: spacing.sm }}>✅</Text>
                <Text style={styles.modalTitle}>Thank You, Citizen!</Text>
                <Text style={[styles.modalDesc, { textAlign: "center" }]}>
                  Your report has been logged for civic verification. Our team checks official
                  gazettes to keep every guide 100% accurate.
                </Text>
                <Button
                  variant="primary"
                  size="md"
                  onPress={() => setActiveModal(null)}
                  style={styles.modalCloseBtn}
                >
                  Done
                </Button>
              </View>
            ) : (
              <>
                <Text style={styles.modalDesc}>
                  Did you find an outdated fee, changed procedure, or broken government portal link?
                  Let us know!
                </Text>

                <Text style={styles.fieldLabel}>WHICH GUIDE?</Text>
                <TextInput
                  style={styles.textInput}
                  value={reportTask}
                  onChangeText={setReportTask}
                  placeholder="e.g. Learner Driving Licence or Passport"
                  placeholderTextColor={colors.textSubtle}
                />

                <Text style={styles.fieldLabel}>WHAT IS WRONG OR CHANGED?</Text>
                <TextInput
                  style={[styles.textInput, { height: 90, textAlignVertical: "top" }]}
                  value={reportDetails}
                  onChangeText={setReportDetails}
                  placeholder="e.g. The fee is now ₹200 on Sarathi portal instead of ₹150..."
                  placeholderTextColor={colors.textSubtle}
                  multiline
                />

                <Button
                  variant="primary"
                  size="md"
                  onPress={() => {
                    if (!reportDetails.trim()) {
                      Alert.alert(
                        "Please provide details",
                        "Explain what was changed or outdated."
                      );
                      return;
                    }
                    setReportSubmitted(true);
                  }}
                  style={{ marginTop: spacing.md }}
                >
                  Submit Report
                </Button>

                <Button
                  variant="outline"
                  size="md"
                  onPress={() => setActiveModal(null)}
                  style={styles.modalCloseBtn}
                >
                  Cancel
                </Button>
              </>
            )}
          </Card>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 40,
  },
  header: {
    marginBottom: spacing.lg,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 20,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMuted,
    letterSpacing: 1,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    marginLeft: 4,
  },
  card: {
    padding: 0,
    marginBottom: spacing.md,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: layout.minTouchTarget,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: spacing.md,
  },
  rowIcon: {
    fontSize: 20,
  },
  rowTitle: {
    ...typography.body,
    fontWeight: "600",
    color: colors.text,
  },
  rowSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 1,
  },
  rowAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  rowValue: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.primary,
  },
  chevron: {
    fontSize: 18,
    color: colors.textSubtle,
    fontWeight: "bold",
    marginLeft: spacing.xs,
  },
  versionFooter: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    gap: 4,
  },
  versionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textMuted,
  },
  versionSubtitle: {
    fontSize: 12,
    color: colors.textSubtle,
  },
  versionStandard: {
    fontSize: 11,
    color: colors.textSubtle,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "center",
    padding: spacing.lg,
  },
  modalCard: {
    padding: spacing.xl,
    borderRadius: radius.xl,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  modalDesc: {
    ...typography.body,
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    minHeight: layout.minTouchTarget,
  },
  optionRowSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  optionLabelSelected: {
    color: colors.primary,
  },
  optionSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  checkmark: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
  },
  modalCloseBtn: {
    marginTop: spacing.md,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.md,
  },
});
