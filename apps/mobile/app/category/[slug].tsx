import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors, radius, spacing, typography, layout } from "../../theme/tokens";
import { Card, Badge, Skeleton, Callout } from "../../components/ui";
import { AppAdSlot } from "../../components/ads";

interface CategoryGuideItem {
  slug: string;
  name: string;
  description: string;
  cost: string;
  timeEstimate: string;
  difficulty: "easy" | "medium" | "hard";
  hasGujaratPortal: boolean;
}

const CATEGORY_MAP: Record<
  string,
  { name: string; description: string; icon: string; guides: CategoryGuideItem[] }
> = {
  vehicles: {
    name: "Vehicles & Driving Licences",
    description: "Official procedures for learner permits, permanent licences, renewals and RC.",
    icon: "🚗",
    guides: [
      {
        slug: "driving-licence-learner",
        name: "Learner Driving Licence (LLR)",
        description: "Application for Form 2 learner permit via Parivahan Sarathi portal.",
        cost: "₹150 – ₹200",
        timeEstimate: "1–3 days",
        difficulty: "easy",
        hasGujaratPortal: true,
      },
      {
        slug: "driving-licence-new",
        name: "Permanent Driving Licence (DL)",
        description: "Application for Form 4 permanent licence, slot booking & RTO driving test.",
        cost: "₹200 – ₹1,000",
        timeEstimate: "15–30 days",
        difficulty: "medium",
        hasGujaratPortal: true,
      },
    ],
  },
  identity: {
    name: "Identity & Passports",
    description: "Aadhaar updates, passport issuance & renewal, voter ID card procedures.",
    icon: "🪪",
    guides: [
      {
        slug: "passport-renewal",
        name: "Passport Re-issue & Renewal",
        description: "Application on Passport Seva portal for reissue before/after expiry.",
        cost: "₹1,500 – ₹3,500",
        timeEstimate: "7–21 days",
        difficulty: "medium",
        hasGujaratPortal: false,
      },
      {
        slug: "pan-card-new",
        name: "New PAN Card (Form 49A)",
        description: "Instant e-PAN via Aadhaar or physical card application via NSDL/UTIITSL.",
        cost: "₹107 – ₹1,017",
        timeEstimate: "10–15 days",
        difficulty: "easy",
        hasGujaratPortal: false,
      },
    ],
  },
  "money-and-tax": {
    name: "Money & Tax Procedures",
    description: "Income certificates, tax e-filing guidance, bank affidavits.",
    icon: "💰",
    guides: [
      {
        slug: "income-certificate",
        name: "Income Certificate (Gujarat / Digital Gujarat)",
        description: "Official income certificate issued by Talati / Mamlatdar for scholarships.",
        cost: "₹20 – ₹50",
        timeEstimate: "7–15 days",
        difficulty: "medium",
        hasGujaratPortal: true,
      },
    ],
  },
};

export default function MobileCategoryScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, _setIsLoading] = useState(false);

  const categorySlug = slug || "vehicles";
  const categoryInfo = CATEGORY_MAP[categorySlug] || {
    name: categorySlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    description: "Official government paperwork guides and statutory document requirements.",
    icon: "📋",
    guides: [],
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      {/* 1. Category Header Card */}
      <View style={styles.headerCard}>
        <Text style={styles.headerIcon}>{categoryInfo.icon}</Text>
        <Text style={styles.headerTitle}>{categoryInfo.name}</Text>
        <Text style={styles.headerDescription}>{categoryInfo.description}</Text>
        <View style={styles.headerMeta}>
          <Text style={styles.metaCount}>
            {categoryInfo.guides.length} {categoryInfo.guides.length === 1 ? "Guide" : "Guides"}{" "}
            Available
          </Text>
        </View>
      </View>

      {/* 2. Official Verification Notice */}
      <Callout variant="info" title="Verified Government Portals">
        All fees, application forms and links are cited from official .gov.in and .nic.in
        departments.
      </Callout>

      {/* 3. Skeleton Loading State Demo */}
      {isLoading ? (
        <View style={styles.skeletonBox}>
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} height={120} borderRadius={12} style={{ marginBottom: 12 }} />
          ))}
        </View>
      ) : (
        /* 4. Guides List */
        <View style={styles.guidesList}>
          {categoryInfo.guides.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>More Guides Coming Soon</Text>
              <Text style={styles.emptyText}>
                We are actively verifying citizen guides for this category against official
                gazettes.
              </Text>
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => router.back()}
                accessibilityRole="button"
              >
                <Text style={styles.backBtnText}>Browse Other Categories</Text>
              </TouchableOpacity>
            </Card>
          ) : (
            categoryInfo.guides.map((guide) => (
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
                <View style={styles.cardHeader}>
                  <Text style={styles.guideName}>{guide.name}</Text>
                  <Badge
                    label={guide.difficulty.toUpperCase()}
                    variant={guide.difficulty === "easy" ? "success" : "warning"}
                  />
                </View>

                <Text style={styles.guideDesc}>{guide.description}</Text>

                <View style={styles.cardFooter}>
                  <Text style={styles.metaBadge}>💰 {guide.cost}</Text>
                  <Text style={styles.metaBadge}>⏱ {guide.timeEstimate}</Text>
                  {guide.hasGujaratPortal ? (
                    <Text style={styles.gujaratBadge}>📍 Gujarat Ready</Text>
                  ) : null}
                </View>
              </Card>
            ))
          )}

          {/* 5. Banner Ad Slot Placeholder (Prompt 127) */}
          <AppAdSlot format="banner" placementId="cat-list-bottom" screenName="category_list" />
        </View>
      )}
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
  headerCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  headerIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: typography.h2.fontSize,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 6,
  },
  headerDescription: {
    fontSize: typography.body.fontSize,
    lineHeight: 22,
    color: colors.textMuted,
    marginBottom: 12,
  },
  headerMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaCount: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
  },
  guidesList: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  guideCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  guideName: {
    fontSize: typography.h4.fontSize,
    fontWeight: "bold",
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  guideDesc: {
    fontSize: typography.bodySm.fontSize,
    lineHeight: 18,
    color: colors.textMuted,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  metaBadge: {
    fontSize: 12,
    color: colors.text,
    fontWeight: "500",
  },
  gujaratBadge: {
    fontSize: 11,
    color: colors.successText,
    fontWeight: "600",
  },
  emptyCard: {
    padding: spacing.xl,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: typography.bodySm.fontSize,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 20,
  },
  backBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: radius.md,
    minHeight: layout.minTouchTarget,
    justifyContent: "center",
  },
  backBtnText: {
    color: colors.textInverse,
    fontWeight: "600",
    fontSize: 14,
  },
  skeletonBox: {
    marginTop: spacing.md,
  },
});
