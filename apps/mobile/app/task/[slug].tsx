import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Modal } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { evaluate, type Rule } from "@civic/utils";
import { colors, radius, spacing, typography, layout } from "../../theme/tokens";
import { Card, Badge, Callout, StepList, ChecklistItem, Button } from "../../components/ui";
import { MobilePersonalizationWizard } from "../../components/wizard/MobilePersonalizationWizard";
import { AppointmentReminderModal } from "../../components/reminders/AppointmentReminderModal.tsx";
import { getBundledGuide, type BundledGuide } from "../../lib/offline-datapack.ts";
import { getCachedGuide, cacheViewedGuide, formatUpdatedAgo } from "../../lib/guide-cache.ts";
import { shareToWhatsApp, shareSystemSheet, printAndSharePdf } from "../../lib/mobile-share.ts";
import {
  getStoredCompletedDocs,
  saveStoredCompletedDocs,
  clearStoredCompletedDocs,
  getAllChecklistsIndex,
} from "../../lib/checklist-storage.ts";

interface GuideFee {
  label: string;
  amount: number;
  isOptional?: boolean;
}

interface GuideDoc {
  id: string;
  name: string;
  description: string;
  isMandatory: boolean;
  instructions?: string[];
  appliesWhen?: Rule;
}

interface GuideData {
  slug: string;
  title: string;
  summary: string;
  categoryName: string;
  department: string;
  sourceUrl: string;
  lastVerifiedAt: string;
  difficulty: "easy" | "medium" | "hard";
  estimatedTime: string;
  stateCode: string;
  stateName: string;
  isLaunchState: boolean;
  fees: GuideFee[];
  documents: GuideDoc[];
  steps: Array<{
    stepNumber: number;
    title: string;
    description: string;
    estimatedTime?: string;
    isOnline?: boolean;
  }>;
  mistakes: Array<{
    title: string;
    description: string;
  }>;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  officialLinks: Array<{
    title: string;
    url: string;
    description: string;
  }>;
}

const SAMPLE_GUIDES: Record<string, GuideData> = {
  "driving-licence-learner": {
    slug: "driving-licence-learner",
    title: "How to Apply for Learner Driving Licence (LLR) in Gujarat",
    summary:
      "Step-by-step procedure to apply for an Indian learner driving licence online via Sarathi Parivahan, take the computerised learner test, and obtain Form 2.",
    categoryName: "Vehicles & Driving",
    department: "Ministry of Road Transport and Highways (MoRTH) & Gujarat Transport Dept",
    sourceUrl: "https://sarathi.parivahan.gov.in",
    lastVerifiedAt: "2026-11-15",
    difficulty: "easy",
    estimatedTime: "1–3 days",
    stateCode: "GJ",
    stateName: "Gujarat",
    isLaunchState: true,
    fees: [
      { label: "Learner Licence Application Fee (Form 2)", amount: 150 },
      { label: "Computerized Online Driving Test Fee", amount: 50 },
    ],
    documents: [
      {
        id: "doc-1",
        name: "Proof of Age (Aadhaar / Birth Certificate / 10th Marksheet)",
        description:
          "Official document proving applicant is at least 18 years old (16 for gearless 50cc).",
        isMandatory: true,
        instructions: ["Clear scan in PDF format", "Maximum file size: 200 KB"],
      },
      {
        id: "doc-2",
        name: "Proof of Address (Aadhaar / Electricity Bill / Voter ID)",
        description: "Must show current residential address matching Gujarat jurisdiction.",
        isMandatory: true,
        instructions: ["Address must match the selected RTO office"],
      },
      {
        id: "doc-3",
        name: "Form 1 Self-Declaration as to Physical Fitness",
        description:
          "Self-declaration of medical fitness filled directly inside Sarathi online form.",
        isMandatory: true,
      },
      {
        id: "doc-4",
        name: "Form 1A Medical Certificate (if age > 40 or commercial transport)",
        description:
          "Signed and stamped certificate from a registered medical practitioner (MBBS).",
        isMandatory: false,
        instructions: ["Only required if applicant is over 40 years old or commercial transport"],
        appliesWhen: {
          or: [{ applicantAge: { gte: 40 } }, { commercial: true }],
        },
      },
      {
        id: "doc-5",
        name: "Recent Passport Size Photograph & Signature",
        description: "Digital photo and scanned signature on plain white paper with dark ink.",
        isMandatory: true,
      },
    ],
    steps: [
      {
        stepNumber: 1,
        title: "Submit Online Application on Sarathi Parivahan",
        description:
          "Visit sarathi.parivahan.gov.in, select Gujarat, and choose 'Apply for Learner Licence'. Authenticate using Aadhaar OTP.",
        estimatedTime: "15 mins",
        isOnline: true,
      },
      {
        stepNumber: 2,
        title: "Upload Required Documents & Photo",
        description:
          "Upload age proof, address proof, and signature. Aadhaar eKYC automatically auto-fills photo and address.",
        estimatedTime: "10 mins",
        isOnline: true,
      },
      {
        stepNumber: 3,
        title: "Pay Statutory Government Fees (₹200)",
        description:
          "Pay ₹150 for licence issuance and ₹50 for test fee using UPI, Net Banking, or Debit Card.",
        estimatedTime: "5 mins",
        isOnline: true,
      },
      {
        stepNumber: 4,
        title: "Appear for Online Learner Test",
        description:
          "Take the 15-question multiple choice test on road traffic rules and signs from home or at RTO.",
        estimatedTime: "20 mins",
        isOnline: true,
      },
      {
        stepNumber: 5,
        title: "Download Learner Licence (Form 2)",
        description:
          "Upon scoring 9+ marks, instant digital Learner Licence is generated with QR code. Valid across India for 6 months.",
        estimatedTime: "Immediate",
        isOnline: true,
      },
    ],
    mistakes: [
      {
        title: "Blurry or Incomplete Address Proof Upload",
        description:
          "Scans where the applicant's name or address is cut off will lead to application rejection by the RTO scrutinizer.",
      },
      {
        title: "Mismatched Name Between Marksheet and Aadhaar",
        description:
          "Ensure the name matches letter-for-letter. If married or changed, attach official gazette notification or marriage affidavit.",
      },
      {
        title: "Waiting Beyond 6 Months to Apply for Permanent DL",
        description:
          "A Learner Licence expires permanently after 180 days. You must apply for a permanent DL between day 30 and day 180.",
      },
    ],
    faqs: [
      {
        question: "Can I take the learner licence test from home in Gujarat?",
        answer:
          "Yes, through Aadhaar-based authentication on Sarathi Parivahan, applicants in Gujarat can take the computerised exam from home with webcam proctoring.",
      },
      {
        question: "What is the passing score for the Gujarat RTO learner exam?",
        answer:
          "You must score at least 9 correct answers out of 15 questions (60%) within 10 minutes to pass.",
      },
      {
        question: "Can I drive alone on a learner licence?",
        answer:
          "No. The Motor Vehicles Act requires an L-board on the vehicle and an instructor or permanent licence holder in the front passenger seat.",
      },
    ],
    officialLinks: [
      {
        title: "Sarathi Parivahan Gujarat Portal",
        url: "https://sarathi.parivahan.gov.in",
        description:
          "Official MoRTH portal for application submission, fee payment, and test scheduling.",
      },
      {
        title: "Gujarat Transport Commissioner Office",
        url: "https://cot.gujarat.gov.in",
        description: "Official notifications, RTO office jurisdictions, and gazette fee schedules.",
      },
    ],
  },
};

export default function MobileTaskDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const taskSlug = slug || "driving-licence-learner";
  const cached = getCachedGuide(taskSlug, "gj");
  const guide = (cached?.guide as unknown as GuideData) ||
    (getBundledGuide(taskSlug, "gj") as unknown as GuideData) ||
    SAMPLE_GUIDES[taskSlug] || {
      ...SAMPLE_GUIDES["driving-licence-learner"],
      slug: taskSlug,
      title: taskSlug.replace(/-/g, " ").toUpperCase(),
    };

  // Cache viewed guide for offline airplane mode
  cacheViewedGuide(guide as unknown as BundledGuide, "bundled");

  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>(() => {
    const stored = getStoredCompletedDocs(taskSlug, (guide.stateCode || "gj").toLowerCase());
    const initialMap: Record<string, boolean> = {};
    stored.forEach((id) => {
      initialMap[id] = true;
    });
    return initialMap;
  });

  const [isSaved, setIsSaved] = useState(() => {
    const stored = getStoredCompletedDocs(taskSlug, (guide.stateCode || "gj").toLowerCase());
    const index = getAllChecklistsIndex();
    const exists = index.some(
      (item) =>
        item.taskSlug === taskSlug && item.stateSlug === (guide.stateCode || "gj").toLowerCase()
    );
    return exists || stored.length > 0;
  });

  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [wizardAnswers, setWizardAnswers] = useState<Record<string, unknown>>({});
  const [showWizardModal, setShowWizardModal] = useState(false);

  const activeFilterCount = Object.keys(wizardAnswers).length;

  const filteredDocuments = guide.documents.filter((doc) => {
    if (!doc.appliesWhen) return true;
    if (activeFilterCount === 0) return true;
    return evaluate(doc.appliesWhen, wizardAnswers);
  });

  const handleToggleDoc = (docId: string, nextChecked: boolean) => {
    const nextMap = {
      ...checkedDocs,
      [docId]: nextChecked,
    };
    setCheckedDocs(nextMap);

    const completedIds = Object.keys(nextMap).filter((id) => nextMap[id]);
    saveStoredCompletedDocs(taskSlug, guide.stateCode.toLowerCase(), completedIds, {
      taskTitle: guide.title,
      totalCount: guide.documents.length,
    });
    setIsSaved(true);
  };

  const totalFee = guide.fees.reduce((sum, f) => sum + (f.isOptional ? 0 : f.amount), 0);

  const completedDocsCount = guide.documents.filter((d) => checkedDocs[d.id]).length;

  const [showShareModal, setShowShareModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleShareWhatsApp = async () => {
    setShowShareModal(false);
    await shareToWhatsApp({
      title: guide.title,
      slug: guide.slug,
      fee: totalFee,
      stateName: guide.stateName,
    });
  };

  const handleShareSystem = async () => {
    setShowShareModal(false);
    // Triggers platform share dialog via Share.share
    await shareSystemSheet({
      title: guide.title,
      slug: guide.slug,
      fee: totalFee,
      stateName: guide.stateName,
    });
  };

  const handleSharePdf = async () => {
    setShowShareModal(false);
    await printAndSharePdf(guide as unknown as BundledGuide);
  };

  const handleSaveToggle = () => {
    if (isSaved) {
      clearStoredCompletedDocs(taskSlug, guide.stateCode.toLowerCase());
      setIsSaved(false);
    } else {
      const completedIds = Object.keys(checkedDocs).filter((id) => checkedDocs[id]);
      saveStoredCompletedDocs(taskSlug, guide.stateCode.toLowerCase(), completedIds, {
        taskTitle: guide.title,
        totalCount: guide.documents.length,
      });
      setIsSaved(true);
    }
  };

  const handleOpenLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch {
      // Cannot open url
    }
  };

  return (
    <View style={styles.screenWrapper}>
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        {/* 1. Summary & At-A-Glance Card */}
        <View style={styles.summaryCard}>
          <View style={styles.badgeRow}>
            <Badge label={guide.categoryName} variant="info" />
            <Badge
              label={guide.difficulty.toUpperCase()}
              variant={guide.difficulty === "easy" ? "success" : "warning"}
            />
            {guide.isLaunchState ? (
              <Badge label={`📍 ${guide.stateName}`} variant="neutral" />
            ) : null}
            <Badge label={formatUpdatedAgo(guide.lastVerifiedAt)} variant="success" />
          </View>

          <Text style={styles.title}>{guide.title}</Text>
          <Text style={styles.summaryText}>{guide.summary}</Text>

          {/* Quick specs grid */}
          <View style={styles.specsRow}>
            <View style={styles.specBox}>
              <Text style={styles.specLabel}>STATUTORY FEE</Text>
              <Text style={styles.specValue}>₹{totalFee}</Text>
            </View>
            <View style={styles.specBox}>
              <Text style={styles.specLabel}>ESTIMATED TIME</Text>
              <Text style={styles.specValue}>{guide.estimatedTime}</Text>
            </View>
            <View style={styles.specBox}>
              <Text style={styles.specLabel}>DOCUMENTS</Text>
              <Text style={styles.specValue}>{guide.documents.length} Items</Text>
            </View>
          </View>

          <View style={styles.verificationFooter}>
            <Text style={styles.verificationText}>
              ✓ Verified on {guide.lastVerifiedAt} • Source: {guide.department}
            </Text>
          </View>
        </View>

        {/* 2. State Portal Banner */}
        <Callout variant="info" title={`Official Portal: ${guide.stateName}`}>
          Procedures on this guide are verified specifically for {guide.stateName} with direct
          integration to the official state portal.
        </Callout>

        {/* 3. Documents Checklist Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Required Documents</Text>
            <Text style={styles.progressText}>
              {completedDocsCount}/{filteredDocuments.length} Ready
            </Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Tap each document as you gather it. Progress is saved offline on your device.
          </Text>

          {/* Personalization Wizard Trigger */}
          <View style={styles.filterBanner}>
            <TouchableOpacity
              style={[
                styles.personalizeButton,
                activeFilterCount > 0 && styles.personalizeButtonActive,
              ]}
              onPress={() => setShowWizardModal(true)}
              accessibilityRole="button"
              accessibilityLabel="Personalize checklist with 4 questions"
            >
              <Text
                style={[
                  styles.personalizeBtnText,
                  activeFilterCount > 0 && styles.personalizeBtnTextActive,
                ]}
              >
                {activeFilterCount > 0
                  ? `⚡ Filtered: ${filteredDocuments.length} of ${guide.documents.length} docs apply`
                  : "⚡ Personalize Checklist (4 Questions)"}
              </Text>
            </TouchableOpacity>

            {activeFilterCount > 0 ? (
              <TouchableOpacity
                onPress={() => setWizardAnswers({})}
                style={styles.clearFilterBtn}
                accessibilityRole="button"
                accessibilityLabel="Reset personalization filters"
              >
                <Text style={styles.clearFilterText}>Reset</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {filteredDocuments.map((doc) => (
            <ChecklistItem
              key={doc.id}
              id={doc.id}
              name={doc.name}
              description={doc.description}
              isMandatory={doc.isMandatory}
              isChecked={Boolean(checkedDocs[doc.id])}
              onToggle={handleToggleDoc}
              instructions={doc.instructions}
            />
          ))}
        </View>

        {/* 4. Step-by-Step Procedure */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Step-by-Step Procedure</Text>
          <Text style={styles.sectionSubtitle}>
            Follow these sequential steps in order for guaranteed first-time approval.
          </Text>

          {/* Appointment Reminder Card */}
          <Card style={styles.reminderCard}>
            <View style={styles.reminderCardRow}>
              <Text style={styles.reminderIcon}>⏰</Text>
              <View style={styles.reminderBody}>
                <Text style={styles.reminderTitle}>Booked an Appointment?</Text>
                <Text style={styles.reminderDesc}>
                  Get polite reminders the day before and 1 hour before with your document
                  checklist.
                </Text>
              </View>
            </View>
            <Button
              variant="outline"
              size="md"
              onPress={() => setShowReminderModal(true)}
              accessibilityLabel="Set appointment reminder notifications"
            >
              Set Appointment Reminder ⏰
            </Button>
          </Card>

          <StepList steps={guide.steps} />
        </View>

        {/* 5. Statutory Fees Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statutory Fees Breakdown</Text>
          <Card style={styles.feesCard}>
            {guide.fees.map((fee, idx) => (
              <View key={idx} style={[styles.feeRow, idx > 0 && styles.feeRowBorder]}>
                <Text style={styles.feeLabel}>{fee.label}</Text>
                <Text style={styles.feeAmount}>₹{fee.amount}</Text>
              </View>
            ))}
            <View style={styles.feeTotalRow}>
              <Text style={styles.feeTotalLabel}>Total Official Cost</Text>
              <Text style={styles.feeTotalAmount}>₹{totalFee}</Text>
            </View>
            <Text style={styles.feeDisclaimer}>
              * Statutory fees prescribed under Rule 32 of Central Motor Vehicles Rules. No
              broker/agent fee required.
            </Text>
          </Card>
        </View>

        {/* 6. Mistakes to Avoid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Common Mistakes to Avoid</Text>
          {guide.mistakes.map((mistake, idx) => (
            <Callout key={idx} variant="warning" title={mistake.title}>
              {mistake.description}
            </Callout>
          ))}
        </View>

        {/* 7. Frequently Asked Questions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {guide.faqs.map((faq, idx) => {
            const isExpanded = expandedFaq === idx;
            return (
              <Card key={idx} style={styles.faqCard}>
                <TouchableOpacity
                  onPress={() => setExpandedFaq(isExpanded ? null : idx)}
                  style={styles.faqHeader}
                  accessibilityRole="button"
                  accessibilityLabel={faq.question}
                >
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                  <Text style={styles.faqToggle}>{isExpanded ? "▲" : "▼"}</Text>
                </TouchableOpacity>
                {isExpanded ? <Text style={styles.faqAnswer}>{faq.answer}</Text> : null}
              </Card>
            );
          })}
        </View>

        {/* 8. Official Government Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Official Government Links</Text>
          <Text style={styles.sectionSubtitle}>
            Always verify that web addresses end in .gov.in or .nic.in before entering personal
            details.
          </Text>

          {guide.officialLinks.map((link, idx) => (
            <Card key={idx} style={styles.linkCard}>
              <View style={styles.linkInfo}>
                <Text style={styles.linkTitle}>{link.title}</Text>
                <Text style={styles.linkDesc}>{link.description}</Text>
                <Text style={styles.linkUrl}>{link.url}</Text>
              </View>
              <Button
                variant="outline"
                size="md"
                onPress={() => handleOpenLink(link.url)}
                accessibilityLabel={`Open ${link.title} in browser`}
              >
                Open Portal ↗
              </Button>
            </Card>
          ))}
        </View>
      </ScrollView>

      {/* 9. Sticky Bottom Bar */}
      <View style={styles.stickyBar}>
        <Button
          variant={isSaved ? "secondary" : "primary"}
          size="lg"
          onPress={handleSaveToggle}
          style={styles.saveBtn}
          accessibilityLabel={isSaved ? "Checklist is saved" : "Save this checklist"}
        >
          {isSaved ? "✓ Saved to My Lists" : "Save Checklist"}
        </Button>

        <Button
          variant="outline"
          size="lg"
          onPress={handleShare}
          style={styles.shareBtn}
          accessibilityLabel="Share this paperwork guide"
        >
          Share ↗
        </Button>
      </View>

      {/* 10. Personalization Wizard Bottom Sheet Modal */}
      <MobilePersonalizationWizard
        visible={showWizardModal}
        onClose={() => setShowWizardModal(false)}
        answers={wizardAnswers}
        onApplyAnswers={(ans) => setWizardAnswers(ans)}
        onResetAnswers={() => setWizardAnswers({})}
        activeFilterCount={activeFilterCount}
      />

      {/* 11. Share Modal (WhatsApp, System Sheet, PDF Checklist) */}
      <Modal
        visible={showShareModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowShareModal(false)}
      >
        <View style={styles.shareOverlay}>
          <View style={styles.shareSheet}>
            <View style={styles.shareHeader}>
              <Text style={styles.shareTitle}>Share Paperwork Guide</Text>
              <TouchableOpacity
                onPress={() => setShowShareModal(false)}
                style={styles.closeBtn}
                accessibilityRole="button"
                accessibilityLabel="Close share options"
              >
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.shareSubtitle}>
              Share verified citizen instructions, statutory fee breakdown, or download a printable
              PDF checklist.
            </Text>

            <View style={styles.shareOptionsList}>
              <TouchableOpacity
                style={styles.shareOptionCard}
                onPress={handleShareWhatsApp}
                accessibilityRole="button"
                accessibilityLabel="Share checklist via WhatsApp"
              >
                <Text style={styles.shareOptionIcon}>💬</Text>
                <View style={styles.shareOptionBody}>
                  <Text style={styles.shareOptionLabel}>Share via WhatsApp</Text>
                  <Text style={styles.shareOptionDesc}>
                    Send prefilled document list & fee summary directly to contacts or groups.
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shareOptionCard}
                onPress={handleSharePdf}
                accessibilityRole="button"
                accessibilityLabel="Download or share PDF checklist"
              >
                <Text style={styles.shareOptionIcon}>📄</Text>
                <View style={styles.shareOptionBody}>
                  <Text style={styles.shareOptionLabel}>Download / Share PDF Checklist</Text>
                  <Text style={styles.shareOptionDesc}>
                    Printable A4 checklist with checkboxes and official fees for offline filing.
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shareOptionCard}
                onPress={handleShareSystem}
                accessibilityRole="button"
                accessibilityLabel="Open native system share sheet"
              >
                <Text style={styles.shareOptionIcon}>🔗</Text>
                <View style={styles.shareOptionBody}>
                  <Text style={styles.shareOptionLabel}>More Share Options (System Sheet)</Text>
                  <Text style={styles.shareOptionDesc}>
                    Copy link, Bluetooth, SMS, email, or nearby share.
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <Button
              variant="outline"
              size="md"
              onPress={() => setShowShareModal(false)}
              style={styles.shareCancelBtn}
            >
              Cancel
            </Button>
          </View>
        </View>
      </Modal>

      {/* 12. Appointment Reminder Modal */}
      <AppointmentReminderModal
        visible={showReminderModal}
        onClose={() => setShowReminderModal(false)}
        taskSlug={guide.slug}
        taskTitle={guide.title}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  reminderCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  reminderCardRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  reminderIcon: {
    fontSize: 24,
  },
  reminderBody: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 2,
  },
  reminderDesc: {
    fontSize: typography.bodySm.fontSize,
    color: colors.textMuted,
    lineHeight: 18,
  },
  shareOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    justifyContent: "flex-end",
  },
  shareSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    maxHeight: "85%",
  },
  shareHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  shareTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: "bold",
    color: colors.text,
  },
  shareSubtitle: {
    fontSize: typography.bodySm.fontSize,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  shareOptionsList: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  shareOptionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    minHeight: layout.minTouchTarget,
    gap: spacing.md,
  },
  shareOptionIcon: {
    fontSize: 24,
  },
  shareOptionBody: {
    flex: 1,
  },
  shareOptionLabel: {
    fontSize: typography.body.fontSize,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 2,
  },
  shareOptionDesc: {
    fontSize: typography.bodySm.fontSize,
    color: colors.textMuted,
    lineHeight: 16,
  },
  shareCancelBtn: {
    width: "100%",
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
  filterBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  personalizeButton: {
    flex: 1,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
    minHeight: layout.minTouchTarget,
    justifyContent: "center",
  },
  personalizeButtonActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  personalizeBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
  },
  personalizeBtnTextActive: {
    color: colors.primaryDark,
    fontWeight: "bold",
  },
  clearFilterBtn: {
    minHeight: layout.minTouchTarget,
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  clearFilterText: {
    fontSize: 13,
    color: colors.error,
    fontWeight: "600",
  },
  screenWrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 100, // Room for sticky bottom bar
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.h2.fontSize,
    fontWeight: "bold",
    color: colors.text,
    lineHeight: 28,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: typography.body.fontSize,
    lineHeight: 22,
    color: colors.textMuted,
    marginBottom: 16,
  },
  specsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: 12,
  },
  specBox: {
    alignItems: "center",
  },
  specLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: colors.textSubtle,
    marginBottom: 4,
  },
  specValue: {
    fontSize: 15,
    fontWeight: "bold",
    color: colors.primary,
  },
  verificationFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  verificationText: {
    fontSize: 11,
    color: colors.successText,
    fontWeight: "500",
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  progressText: {
    fontSize: 13,
    fontWeight: "bold",
    color: colors.primary,
  },
  sectionSubtitle: {
    fontSize: typography.bodySm.fontSize,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: 12,
  },
  feesCard: {
    padding: spacing.md,
  },
  feeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  feeRowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.surfaceSubtle,
  },
  feeLabel: {
    fontSize: typography.bodySm.fontSize,
    color: colors.text,
    flex: 1,
  },
  feeAmount: {
    fontSize: typography.bodySm.fontSize,
    fontWeight: "600",
    color: colors.text,
  },
  feeTotalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 2,
    borderTopColor: colors.border,
    paddingTop: 12,
    marginTop: 8,
  },
  feeTotalLabel: {
    fontSize: typography.body.fontSize,
    fontWeight: "bold",
    color: colors.text,
  },
  feeTotalAmount: {
    fontSize: typography.h4.fontSize,
    fontWeight: "bold",
    color: colors.primary,
  },
  feeDisclaimer: {
    fontSize: 11,
    color: colors.textSubtle,
    marginTop: 8,
    lineHeight: 16,
  },
  faqCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: layout.minTouchTarget,
  },
  faqQuestion: {
    fontSize: typography.body.fontSize,
    fontWeight: "600",
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  faqToggle: {
    fontSize: 12,
    color: colors.textMuted,
  },
  faqAnswer: {
    fontSize: typography.bodySm.fontSize,
    lineHeight: 20,
    color: colors.textMuted,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 8,
  },
  linkCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  linkInfo: {
    marginBottom: 10,
  },
  linkTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  linkDesc: {
    fontSize: typography.bodySm.fontSize,
    color: colors.textMuted,
    marginBottom: 4,
  },
  linkUrl: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "500",
  },
  stickyBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: "row",
    gap: spacing.md,
  },
  saveBtn: {
    flex: 2,
  },
  shareBtn: {
    flex: 1,
  },
});
