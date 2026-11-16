import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { colors, radius, spacing, typography, layout } from "../../theme/tokens";
import { Card, Badge, Skeleton, SearchField } from "../../components/ui";

export interface MobileCategory {
  slug: string;
  name: string;
  icon: string;
  guideCount: number;
}

export interface PopularGuide {
  slug: string;
  name: string;
  category: string;
  cost: string;
  timeEstimate: string;
  difficulty: "easy" | "medium" | "hard";
  isVerified: boolean;
}

const CIVIC_CATEGORIES: MobileCategory[] = [
  { slug: "identity", name: "Identity & Passports", icon: "🪪", guideCount: 6 },
  { slug: "vehicles", name: "Vehicles & Driving", icon: "🚗", guideCount: 8 },
  { slug: "money-and-tax", name: "Money & Taxes", icon: "💰", guideCount: 5 },
  { slug: "property-and-land", name: "Property & Land", icon: "🏠", guideCount: 4 },
  { slug: "family-and-certificates", name: "Family & Certificates", icon: "📜", guideCount: 6 },
  { slug: "business-and-licences", name: "Business & Licences", icon: "🏢", guideCount: 4 },
  { slug: "health-and-welfare", name: "Health & Welfare", icon: "🏥", guideCount: 5 },
  { slug: "utilities-and-connections", name: "Utilities & Electricity", icon: "⚡", guideCount: 3 },
];

const POPULAR_GUIDES: PopularGuide[] = [
  {
    slug: "driving-licence-learner",
    name: "Learner Driving Licence (LLR)",
    category: "Vehicles",
    cost: "₹150 – ₹200",
    timeEstimate: "1–3 days",
    difficulty: "easy",
    isVerified: true,
  },
  {
    slug: "driving-licence-new",
    name: "Permanent Driving Licence (DL)",
    category: "Vehicles",
    cost: "₹200 – ₹1,000",
    timeEstimate: "15–30 days",
    difficulty: "medium",
    isVerified: true,
  },
  {
    slug: "passport-renewal",
    name: "Passport Re-issue & Renewal",
    category: "Travel & Identity",
    cost: "₹1,500 – ₹3,500",
    timeEstimate: "7–21 days",
    difficulty: "medium",
    isVerified: true,
  },
  {
    slug: "pan-card-new",
    name: "New PAN Card (Form 49A)",
    category: "Identity & Tax",
    cost: "₹107 – ₹1,017",
    timeEstimate: "10–15 days",
    difficulty: "easy",
    isVerified: true,
  },
];

const POPULAR_STATES = [
  { code: "GJ", name: "Gujarat", launchState: true },
  { code: "MH", name: "Maharashtra", launchState: false },
  { code: "DL", name: "Delhi (NCT)", launchState: false },
  { code: "KA", name: "Karnataka", launchState: false },
  { code: "RJ", name: "Rajasthan", launchState: false },
  { code: "UP", name: "Uttar Pradesh", launchState: false },
  { code: "MP", name: "Madhya Pradesh", launchState: false },
  { code: "TN", name: "Tamil Nadu", launchState: false },
];

export default function MobileHomeScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, _setIsLoading] = useState(false);
  const [selectedState, setSelectedState] = useState({ code: "GJ", name: "Gujarat" });
  const [showStateModal, setShowStateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  }, []);

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      router.push({
        pathname: "/(tabs)/search",
        params: { q: searchQuery.trim() },
      });
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      {/* 1. Header Banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerBadge}>OFFICIAL CITIZEN RESOURCE</Text>
        <Text style={styles.bannerTitle}>India Paperwork Guide</Text>
        <Text style={styles.bannerSubtitle}>
          Verified document checklists, exact statutory fees & direct portal links for citizens.
        </Text>
      </View>

      {/* 2. State Chip Selector */}
      <View style={styles.stateSelectorRow}>
        <TouchableOpacity
          style={styles.stateChip}
          onPress={() => setShowStateModal(true)}
          accessibilityRole="button"
          accessibilityLabel={`Selected state is ${selectedState.name}. Tap to change state.`}
        >
          <Text style={styles.stateChipIcon}>📍</Text>
          <Text style={styles.stateChipLabel}>State:</Text>
          <Text style={styles.stateChipValue}>
            {selectedState.name} ({selectedState.code}) ▾
          </Text>
        </TouchableOpacity>

        <View style={styles.verifiedTag}>
          <Text style={styles.verifiedTagText}>✓ 100% .gov.in verified</Text>
        </View>
      </View>

      {/* 3. Search Bar */}
      <SearchField
        label="Find Citizen Document Guide"
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={handleSearchSubmit}
        placeholder="e.g. driving licence, passport, ration card..."
        helperText="Class 8 reading level • Zero unverified procedures"
        style={styles.searchSection}
      />

      {/* Loading Skeleton Demo State */}
      {isLoading ? (
        <View style={styles.skeletonContainer}>
          <Skeleton height={24} width="40%" style={{ marginBottom: 12 }} />
          <View style={styles.grid}>
            {[1, 2, 3, 4].map((n) => (
              <Skeleton key={n} height={100} width="48%" borderRadius={12} />
            ))}
          </View>
        </View>
      ) : (
        <>
          {/* 4. Category Grid */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Browse by Civic Category</Text>
              <Text style={styles.sectionSubtext}>8 categories</Text>
            </View>

            <View style={styles.grid}>
              {CIVIC_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.slug}
                  style={styles.gridCard}
                  activeOpacity={0.7}
                  onPress={() =>
                    router.push({
                      pathname: "/category/[slug]",
                      params: { slug: cat.slug },
                    })
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`${cat.name}, ${cat.guideCount} guides`}
                >
                  <Text style={styles.gridIcon}>{cat.icon}</Text>
                  <Text style={styles.gridName} numberOfLines={2}>
                    {cat.name}
                  </Text>
                  <Text style={styles.gridCount}>{cat.guideCount} guides</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 5. Popular Guides List */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Popular Citizen Guides</Text>
              <Badge label="Frequently Accessed" variant="info" />
            </View>

            <View style={styles.guidesList}>
              {POPULAR_GUIDES.map((guide) => (
                <Card
                  key={guide.slug}
                  onPress={() =>
                    router.push({
                      pathname: "/task/[slug]",
                      params: { slug: guide.slug },
                    })
                  }
                  style={styles.guideCard}
                  accessibilityLabel={`${guide.name}, ${guide.cost}, ${guide.timeEstimate}`}
                >
                  <View style={styles.guideHeader}>
                    <Text style={styles.guideCategory}>{guide.category}</Text>
                    <Badge
                      label={guide.difficulty.toUpperCase()}
                      variant={guide.difficulty === "easy" ? "success" : "warning"}
                    />
                  </View>

                  <Text style={styles.guideTitle}>{guide.name}</Text>

                  <View style={styles.guideFooter}>
                    <Text style={styles.guideMetaItem}>💰 {guide.cost}</Text>
                    <Text style={styles.guideMetaItem}>⏱ {guide.timeEstimate}</Text>
                    <Text style={styles.guideArrow}>➔</Text>
                  </View>
                </Card>
              ))}
            </View>
          </View>
        </>
      )}

      {/* State Selection Modal */}
      <Modal
        visible={showStateModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowStateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Your State / UT</Text>
              <TouchableOpacity
                onPress={() => setShowStateModal(false)}
                style={styles.modalCloseBtn}
                accessibilityRole="button"
                accessibilityLabel="Close state modal"
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.stateList}>
              {POPULAR_STATES.map((st) => (
                <TouchableOpacity
                  key={st.code}
                  style={[
                    styles.stateItem,
                    selectedState.code === st.code && styles.stateItemActive,
                  ]}
                  onPress={() => {
                    setSelectedState({ code: st.code, name: st.name });
                    setShowStateModal(false);
                  }}
                  accessibilityRole="button"
                >
                  <View style={styles.stateTextCol}>
                    <Text
                      style={[
                        styles.stateItemName,
                        selectedState.code === st.code && styles.stateItemNameActive,
                      ]}
                    >
                      {st.name} ({st.code})
                    </Text>
                    {st.launchState ? (
                      <Text style={styles.launchTag}>Launch State (Full Portal)</Text>
                    ) : null}
                  </View>
                  {selectedState.code === st.code ? (
                    <Text style={styles.checkmarkIcon}>✓</Text>
                  ) : null}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
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
  banner: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  bannerBadge: {
    color: colors.primaryLight,
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 6,
  },
  bannerTitle: {
    fontSize: typography.h1.fontSize,
    fontWeight: "bold",
    color: colors.textInverse,
    marginBottom: 8,
  },
  bannerSubtitle: {
    fontSize: typography.bodySm.fontSize,
    lineHeight: 20,
    color: "#DBEAFE",
  },
  stateSelectorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  stateChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: layout.minTouchTarget,
  },
  stateChipIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  stateChipLabel: {
    fontSize: 13,
    color: colors.textMuted,
    marginRight: 4,
  },
  stateChipValue: {
    fontSize: 13,
    fontWeight: "bold",
    color: colors.primary,
  },
  verifiedTag: {
    backgroundColor: colors.successLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.successBorder,
  },
  verifiedTagText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.successText,
  },
  searchSection: {
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: "bold",
    color: colors.text,
  },
  sectionSubtext: {
    fontSize: 12,
    color: colors.textMuted,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridCard: {
    width: "48%",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    minHeight: 100,
    justifyContent: "space-between",
  },
  gridIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  gridName: {
    fontSize: typography.body.fontSize,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  gridCount: {
    fontSize: 12,
    color: colors.textMuted,
  },
  guidesList: {
    gap: spacing.md,
  },
  guideCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  guideHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  guideCategory: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
    textTransform: "uppercase",
  },
  guideTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  guideFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  guideMetaItem: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "500",
  },
  guideArrow: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "bold",
  },
  skeletonContainer: {
    paddingVertical: spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: "bold",
    color: colors.text,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCloseText: {
    fontSize: 16,
    color: colors.textMuted,
    fontWeight: "bold",
  },
  stateList: {
    paddingVertical: spacing.xs,
  },
  stateItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceSubtle,
    minHeight: layout.minTouchTarget,
  },
  stateItemActive: {
    backgroundColor: colors.primaryLight,
  },
  stateTextCol: {
    flex: 1,
  },
  stateItemName: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.text,
  },
  stateItemNameActive: {
    fontWeight: "bold",
    color: colors.primary,
  },
  launchTag: {
    fontSize: 11,
    color: colors.successText,
    fontWeight: "600",
    marginTop: 2,
  },
  checkmarkIcon: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "bold",
  },
});
