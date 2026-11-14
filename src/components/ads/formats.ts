export type AdFormat =
  | "leaderboard" // 728x90
  | "mobile-banner" // 320x100
  | "rectangle" // 300x250
  | "large-rectangle" // 336x280
  | "skyscraper" // 160x600
  | "in-article" // fluid, min-h 250px
  | "anchor"; // 320x50 mobile sticky

export interface AdFormatConfig {
  label: string;
  dimensions: string;
  className: string;
  minHeightPx: number;
}

export const AD_FORMAT_CONFIGS: Record<AdFormat, AdFormatConfig> = {
  leaderboard: {
    label: "Leaderboard",
    dimensions: "728x90",
    className: "min-h-[90px] w-full max-w-[728px]",
    minHeightPx: 90,
  },
  "mobile-banner": {
    label: "Mobile Banner",
    dimensions: "320x100",
    className: "min-h-[100px] w-full max-w-[320px]",
    minHeightPx: 100,
  },
  rectangle: {
    label: "Medium Rectangle",
    dimensions: "300x250",
    className: "min-h-[250px] w-full max-w-[300px]",
    minHeightPx: 250,
  },
  "large-rectangle": {
    label: "Large Rectangle",
    dimensions: "336x280",
    className: "min-h-[280px] w-full max-w-[336px]",
    minHeightPx: 280,
  },
  skyscraper: {
    label: "Skyscraper",
    dimensions: "160x600",
    className: "min-h-[600px] w-full max-w-[160px]",
    minHeightPx: 600,
  },
  "in-article": {
    label: "In-Article Fluid",
    dimensions: "Fluid (min 250px)",
    className: "min-h-[250px] w-full max-w-2xl",
    minHeightPx: 250,
  },
  anchor: {
    label: "Mobile Anchor",
    dimensions: "320x50",
    className: "h-[50px] min-h-[50px] w-full max-w-[320px]",
    minHeightPx: 50,
  },
};

