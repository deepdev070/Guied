import React from "react";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { siteConfig } from "../site.ts";
import type { MergedTaskVariant } from "../queries.ts";
import type { TaskContent } from "@/types/content.ts";

/**
 * Architectural Rationale: Why @react-pdf/renderer over Headless Chromium (Puppeteer):
 * 1. Resource Efficiency: Headless Chromium requires ~300MB binary download and >200MB RAM
 *    per render, risking out-of-memory crashes in serverless/container environments.
 *    @react-pdf/renderer is pure Node/V8 running in ~15MB RAM with sub-200ms latency.
 * 2. Deterministic Vector A4 Output: Natively calculates page breaks, margins, and running
 *    headers/footers with dynamic page numbers ({pageNumber} of {totalPages}) without CSS
 *    print pagination glitches.
 * 3. Privacy & Security: Renders entirely in memory with zero cookies, no headless browser attack
 *    surface, and zero external ad requests.
 */

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 36,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#0F172A",
    backgroundColor: "#FFFFFF",
  },
  headerContainer: {
    borderBottomWidth: 1.5,
    borderBottomColor: "#0F172A",
    paddingBottom: 10,
    marginBottom: 12,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  logoBox: {
    width: 24,
    height: 24,
    backgroundColor: "#2563EB",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  logoText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
  },
  brandName: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#0F172A",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#0F172A",
    marginTop: 2,
    marginBottom: 4,
  },
  summary: {
    fontSize: 8.5,
    color: "#475569",
    lineHeight: 1.3,
    maxWidth: 380,
  },
  qrWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  qrImage: {
    width: 58,
    height: 58,
  },
  qrLabel: {
    fontSize: 6.5,
    color: "#64748B",
    marginTop: 2,
    textAlign: "center",
  },
  metaBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    borderWidth: 0.5,
    borderColor: "#E2E8F0",
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginTop: 8,
    fontSize: 8,
  },
  metaText: {
    color: "#334155",
  },
  metaBold: {
    fontFamily: "Helvetica-Bold",
    color: "#0F172A",
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#0F172A",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    borderBottomWidth: 1,
    borderBottomColor: "#CBD5E1",
    paddingBottom: 3,
    marginTop: 10,
    marginBottom: 6,
  },
  docItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E2E8F0",
  },
  checkbox: {
    width: 12,
    height: 12,
    borderWidth: 1.5,
    borderColor: "#0F172A",
    borderRadius: 2,
    marginRight: 8,
    marginTop: 1,
  },
  docContent: {
    flex: 1,
  },
  docHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  docName: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: "#0F172A",
  },
  docBadge: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: "#475569",
  },
  docDesc: {
    fontSize: 8,
    color: "#334155",
    marginTop: 1.5,
    lineHeight: 1.25,
  },
  table: {
    width: "100%",
    borderWidth: 0.5,
    borderColor: "#CBD5E1",
    marginVertical: 4,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderBottomWidth: 0.5,
    borderBottomColor: "#CBD5E1",
    paddingVertical: 3,
    paddingHorizontal: 6,
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#E2E8F0",
    paddingVertical: 3,
    paddingHorizontal: 6,
    fontSize: 8,
  },
  tableTotalRow: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    borderTopWidth: 1,
    borderTopColor: "#0F172A",
    paddingVertical: 4,
    paddingHorizontal: 6,
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
  },
  colDesc: {
    flex: 2,
  },
  colType: {
    flex: 1,
    color: "#64748B",
  },
  colAmount: {
    width: 70,
    textAlign: "right",
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 3,
  },
  stepNumber: {
    width: 16,
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    color: "#2563EB",
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: "#0F172A",
  },
  stepDesc: {
    fontSize: 7.5,
    color: "#334155",
    marginTop: 1,
    lineHeight: 1.2,
  },
  linkItem: {
    paddingVertical: 2,
    fontSize: 7.5,
  },
  linkName: {
    fontFamily: "Helvetica-Bold",
    color: "#0F172A",
  },
  linkUrl: {
    color: "#1D4ED8",
    fontFamily: "Courier",
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 36,
    right: 36,
    borderTopWidth: 0.5,
    borderTopColor: "#CBD5E1",
    paddingTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 7.5,
    color: "#64748B",
  },
  footerText: {
    fontFamily: "Helvetica-Bold",
    color: "#334155",
  },
});

export interface ChecklistPdfProps {
  task: TaskContent;
  variant: MergedTaskVariant;
  stateName: string;
  canonicalUrl: string;
  qrCodeDataUrl: string;
  generatedDate: string;
}

const h = React.createElement;

export function ChecklistPdfDocument({
  task,
  variant,
  stateName,
  qrCodeDataUrl,
  generatedDate,
}: ChecklistPdfProps) {
  const mandatoryFees = variant.fees.filter((f) => !f.isOptional);
  const totalMandatory = mandatoryFees.reduce((acc, f) => acc + f.amount, 0);

  return h(
    Document,
    {
      title: `${task.name} - Official Checklist (${stateName})`,
      author: siteConfig.name,
    },
    h(
      Page,
      { size: "A4", style: styles.page },
      // Header Container
      h(
        View,
        { style: styles.headerContainer },
        h(
          View,
          { style: styles.headerTopRow },
          h(
            View,
            null,
            h(
              View,
              { style: styles.brandRow },
              h(View, { style: styles.logoBox }, h(Text, { style: styles.logoText }, "IP")),
              h(Text, { style: styles.brandName }, `${siteConfig.name} • CITIZEN PAPERWORK GUIDE`)
            ),
            h(Text, { style: styles.title }, task.name),
            h(Text, { style: styles.summary }, variant.summary)
          ),
          qrCodeDataUrl
            ? h(
                View,
                { style: styles.qrWrapper },
                h(Image, { src: qrCodeDataUrl, style: styles.qrImage }),
                h(Text, { style: styles.qrLabel }, "Scan for live updates")
              )
            : null
        ),
        // Meta Bar
        h(
          View,
          { style: styles.metaBar },
          h(
            Text,
            { style: styles.metaText },
            "State / UT: ",
            h(Text, { style: styles.metaBold }, stateName)
          ),
          h(
            Text,
            { style: styles.metaText },
            "Date generated: ",
            h(Text, { style: styles.metaBold }, generatedDate)
          ),
          variant.lastVerifiedAt
            ? h(
                Text,
                { style: styles.metaText },
                "Verified: ",
                h(Text, { style: styles.metaBold }, String(variant.lastVerifiedAt))
              )
            : null
        )
      ),

      // 1. Required Documents Checklist
      h(
        View,
        null,
        h(
          Text,
          { style: styles.sectionTitle },
          `Required Documents Checklist (${variant.documentRequirements.length} Items)`
        ),
        ...variant.documentRequirements.map((doc, idx) => {
          const typeLabel =
            doc.requirementType === "optional"
              ? "Optional"
              : doc.requirementType === "conditional"
                ? "Conditional"
                : "Mandatory";
          const badgeText = doc.copiesHint ? `${typeLabel} • ${doc.copiesHint}` : typeLabel;

          return h(
            View,
            { key: doc.id || `doc-${idx}`, style: styles.docItem, wrap: false },
            h(View, { style: styles.checkbox }),
            h(
              View,
              { style: styles.docContent },
              h(
                View,
                { style: styles.docHeader },
                h(Text, { style: styles.docName }, doc.name),
                h(Text, { style: styles.docBadge }, badgeText)
              ),
              doc.description ? h(Text, { style: styles.docDesc }, doc.description) : null
            )
          );
        })
      ),

      // 2. Statutory Fees
      variant.fees.length > 0
        ? h(
            View,
            { wrap: false },
            h(Text, { style: styles.sectionTitle }, "Official Statutory Fees (Gazette Rates)"),
            h(
              View,
              { style: styles.table },
              h(
                View,
                { style: styles.tableHeader },
                h(Text, { style: styles.colDesc }, "Fee Description"),
                h(Text, { style: styles.colType }, "Type"),
                h(Text, { style: styles.colAmount }, "Amount (INR)")
              ),
              ...variant.fees.map((fee, idx) =>
                h(
                  View,
                  { key: `fee-${idx}`, style: styles.tableRow },
                  h(Text, { style: styles.colDesc }, fee.label),
                  h(
                    Text,
                    { style: styles.colType },
                    fee.isOptional ? "Optional / Express" : "Mandatory"
                  ),
                  h(Text, { style: styles.colAmount }, `₹${fee.amount.toLocaleString("en-IN")}`)
                )
              ),
              h(
                View,
                { style: styles.tableTotalRow },
                h(Text, { style: styles.colDesc }, "Total Mandatory Statutory Fee"),
                h(Text, { style: styles.colType }, "Standard"),
                h(Text, { style: styles.colAmount }, `₹${totalMandatory.toLocaleString("en-IN")}`)
              )
            )
          )
        : null,

      // 3. Procedure Steps
      variant.steps.length > 0
        ? h(
            View,
            { wrap: false },
            h(Text, { style: styles.sectionTitle }, "Procedure Steps (Compact)"),
            ...variant.steps.map((step) =>
              h(
                View,
                { key: `step-${step.stepNumber}`, style: styles.stepItem },
                h(Text, { style: styles.stepNumber }, `${step.stepNumber}.`),
                h(
                  View,
                  { style: styles.stepContent },
                  h(
                    Text,
                    { style: styles.stepTitle },
                    `${step.title}${step.where ? ` [${step.where}]` : ""}`
                  ),
                  h(Text, { style: styles.stepDesc }, step.description)
                )
              )
            )
          )
        : null,

      // 4. Official Links
      variant.officialLinks.length > 0
        ? h(
            View,
            { wrap: false },
            h(Text, { style: styles.sectionTitle }, "Official Portals & URLs"),
            ...variant.officialLinks.map((link, idx) =>
              h(
                View,
                { key: `link-${idx}`, style: styles.linkItem },
                h(
                  Text,
                  null,
                  h(Text, { style: styles.linkName }, `${link.label}: `),
                  h(Text, { style: styles.linkUrl }, link.url)
                )
              )
            )
          )
        : null,

      // Footer with dynamic page numbers
      h(
        View,
        { style: styles.footer, fixed: true },
        h(
          Text,
          { style: styles.footerText },
          `Generated by ${siteConfig.name} - verify on official portal`
        ),
        h(Text, {
          render: ({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`,
        })
      )
    )
  );
}
