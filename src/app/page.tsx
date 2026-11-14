import { HomeHero } from "@/components/home/HomeHero";
import { TrustStrip } from "@/components/home/TrustStrip";
import { PopularTasks } from "@/components/home/PopularTasks";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { HowItWorks } from "@/components/home/HowItWorks";
import { LeaderboardAd } from "@/components/ads/LeaderboardAd";
import { AdSlot } from "@/components/ads/AdSlot";
import { AD_PLACEMENTS } from "@/components/ads/placements";
import { getCategories, getPopularTasks } from "@/lib/queries";

export default async function HomePage() {
  const [categories, popularTasks] = await Promise.all([getCategories(), getPopularTasks(8)]);

  return (
    <div className="flex w-full flex-1 flex-col">
      {/* 1. Hero Section with Search, State Selector & Example Chips */}
      <HomeHero />

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 sm:px-6">
        {/* 2. Reserved Leaderboard Ad Slot Directly Below Hero (Prompt 86: HOME_BELOW_HERO) */}
        <LeaderboardAd slotId={AD_PLACEMENTS.HOME_BELOW_HERO.slotId} />

        {/* 3. Trust Strip */}
        <TrustStrip />

        {/* 4. Most Searched Guides (8 Task Cards with Category Chip, Time, Cost) */}
        <PopularTasks tasks={popularTasks} />

        {/* Prompt 86: HOME_MID Mid-Page Rectangle Ad Slot */}
        <AdSlot
          name={AD_PLACEMENTS.HOME_MID.name}
          format={AD_PLACEMENTS.HOME_MID.format}
          placementId={AD_PLACEMENTS.HOME_MID.slotId}
          className="my-8"
        />

        {/* 5. Browse by Category Grid (10 Categories, 2-3-5 Responsive Columns) */}
        <CategoryGrid categories={categories} />

        {/* 6. How It Works 3-Step Explainer */}
        <HowItWorks />
      </div>
    </div>
  );
}
