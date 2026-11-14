import React from "react";

export const OG_IMAGE_SIZE = {
  width: 1200,
  height: 630,
};

export const OG_IMAGE_CONTENT_TYPE = "image/png";

export interface OgCardProps {
  taskName: string;
  stateName?: string;
  estimatedTime?: string;
  cost?: string;
  documentCount?: number;
  year?: number;
}

/**
 * Creates the React virtual DOM tree for the 1200x630 OpenGraph card.
 * Uses pure React.createElement so it is compatible with both Satori/next/og
 * and the native Node.js test runner without requiring JSX compilation.
 */
export function createOgCardElement(props: OgCardProps): React.ReactElement {
  const {
    taskName,
    stateName,
    estimatedTime = "15-30 days",
    cost = "₹0 - ₹1,500",
    documentCount = 5,
  } = props;

  const h = React.createElement;

  // 1. Tricolor Top Bar (Saffron, White, Green)
  const tricolorBar = h(
    "div",
    {
      style: {
        display: "flex",
        width: "100%",
        height: "8px",
        borderRadius: "4px",
        overflow: "hidden",
        marginBottom: "20px",
      },
    },
    h("div", { style: { flex: 1, backgroundColor: "#F59E0B" } }),
    h("div", { style: { flex: 1, backgroundColor: "#FFFFFF" } }),
    h("div", { style: { flex: 1, backgroundColor: "#15803D" } })
  );

  // 2. Header Brand + State Badge
  const brandLeft = h(
    "div",
    { style: { display: "flex", alignItems: "center", gap: "12px" } },
    h(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "40px",
          height: "40px",
          borderRadius: "10px",
          backgroundColor: "#2563EB",
          color: "#FFFFFF",
          fontWeight: "bold",
          fontSize: "20px",
        },
      },
      "IP"
    ),
    h(
      "div",
      { style: { display: "flex", flexDirection: "column" } },
      h(
        "span",
        { style: { fontSize: "20px", fontWeight: "bold", color: "#0F172A" } },
        "India Paperwork Guide"
      ),
      h(
        "span",
        { style: { fontSize: "13px", color: "#475569" } },
        "Official Civic Portals • Zero Tout Fees"
      )
    )
  );

  const stateBadge = h(
    "div",
    {
      style: {
        display: "flex",
        alignItems: "center",
        padding: "8px 18px",
        borderRadius: "999px",
        fontSize: "14px",
        fontWeight: "bold",
        backgroundColor: stateName ? "#EAF1FF" : "#FFF4DB",
        color: stateName ? "#1D4ED8" : "#B45309",
        border: stateName ? "1px solid #BFDBFE" : "1px solid #FDE68A",
      },
    },
    stateName ? `${stateName} • State Guide` : "National Guide • All India"
  );

  const header = h(
    "div",
    {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
      },
    },
    brandLeft,
    stateBadge
  );

  // 3. Main Headline
  const body = h(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        marginTop: "16px",
      },
    },
    h(
      "div",
      {
        style: {
          fontSize: "42px",
          fontWeight: 800,
          color: "#0F172A",
          lineHeight: 1.2,
          letterSpacing: "-0.5px",
        },
      },
      taskName
    ),
    h(
      "div",
      {
        style: {
          fontSize: "18px",
          color: "#475569",
          marginTop: "8px",
          lineHeight: 1.4,
        },
      },
      stateName
        ? `Official step-by-step paperwork procedure, verified statutory fees & document checklist for ${stateName}.`
        : "Official step-by-step paperwork procedure, verified statutory fees & complete document checklist."
    )
  );

  // 4. 3 Key Facts Cards (Time, Cost, Documents count)
  const fact1Time = h(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        flex: 1,
        backgroundColor: "#F7F9FC",
        border: "1px solid #E2E8F0",
        borderRadius: "14px",
        padding: "16px 20px",
      },
    },
    h(
      "span",
      {
        style: {
          fontSize: "12px",
          fontWeight: "bold",
          color: "#64748B",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        },
      },
      "Estimated Time"
    ),
    h(
      "span",
      {
        style: {
          fontSize: "24px",
          fontWeight: 800,
          color: "#0F172A",
          marginTop: "4px",
        },
      },
      estimatedTime
    )
  );

  const fact2Cost = h(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        flex: 1,
        backgroundColor: "#E8F7EE",
        border: "1px solid #86EFAC",
        borderRadius: "14px",
        padding: "16px 20px",
      },
    },
    h(
      "span",
      {
        style: {
          fontSize: "12px",
          fontWeight: "bold",
          color: "#166534",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        },
      },
      "Govt Statutory Fee"
    ),
    h(
      "span",
      {
        style: {
          fontSize: "24px",
          fontWeight: 800,
          color: "#15803D",
          marginTop: "4px",
        },
      },
      cost
    )
  );

  const fact3Docs = h(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        flex: 1,
        backgroundColor: "#EAF1FF",
        border: "1px solid #BFDBFE",
        borderRadius: "14px",
        padding: "16px 20px",
      },
    },
    h(
      "span",
      {
        style: {
          fontSize: "12px",
          fontWeight: "bold",
          color: "#1E40AF",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        },
      },
      "Documents Needed"
    ),
    h(
      "span",
      {
        style: {
          fontSize: "24px",
          fontWeight: 800,
          color: "#2563EB",
          marginTop: "4px",
        },
      },
      `${documentCount} Required`
    )
  );

  const factsRow = h(
    "div",
    {
      style: {
        display: "flex",
        gap: "16px",
        marginTop: "20px",
        width: "100%",
      },
    },
    fact1Time,
    fact2Cost,
    fact3Docs
  );

  // 5. Footer Strip
  const footer = h(
    "div",
    {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        paddingTop: "16px",
        borderTop: "1px solid #F1F5F9",
      },
    },
    h(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          gap: "8px",
          color: "#15803D",
          fontSize: "14px",
          fontWeight: 600,
        },
      },
      "Verified Official .gov.in Portals • Avoid Middleman Commissions"
    ),
    h(
      "div",
      {
        style: {
          fontSize: "14px",
          fontWeight: "bold",
          color: "#0F172A",
        },
      },
      "indiapaperworkguide.in"
    )
  );

  // 6. Complete Inner Card
  const innerCard = h(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        flex: 1,
        backgroundColor: "#FFFFFF",
        borderRadius: "20px",
        border: "2px solid #E2E8F0",
        padding: "36px 40px",
      },
    },
    header,
    body,
    factsRow,
    footer
  );

  // 7. Full 1200x630 Canvas
  return h(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        width: "1200px",
        height: "630px",
        backgroundColor: "#F7F9FC",
        padding: "24px 32px",
        boxSizing: "border-box",
      },
    },
    tricolorBar,
    innerCard
  );
}
