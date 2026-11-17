"use client";

import React, { useState, useSyncExternalStore } from "react";
import { Copy, Check, Share2, Send, Download, Image as ImageIcon } from "lucide-react";
import {
  buildWhatsAppShareUrl,
  buildTelegramShareUrl,
  buildShareUrl,
  buildWebShareData,
} from "@/lib/share";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";
import { analytics } from "@/lib/analytics";

export interface ShareButtonGroupProps {
  taskTitle: string;
  stateName?: string;
  canonicalPath?: string;
  className?: string;
}

const emptySubscribe = () => () => {};

export function ShareButtonGroup({
  taskTitle,
  stateName = "All India",
  canonicalPath,
  className,
}: ShareButtonGroupProps) {
  const [copied, setCopied] = useState(false);

  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const fallbackUrl = canonicalPath
    ? `${siteConfig.baseUrl}${canonicalPath.startsWith("/") ? canonicalPath : `/${canonicalPath}`}`
    : siteConfig.baseUrl;

  const currentUrl =
    isClient && typeof window !== "undefined"
      ? window.location.href.split("?")[0] || window.location.href
      : fallbackUrl;

  const canWebShare =
    isClient && typeof navigator !== "undefined" && typeof navigator.share === "function";

  const whatsAppUrl = buildWhatsAppShareUrl(taskTitle, stateName, currentUrl);
  const telegramUrl = buildTelegramShareUrl(taskTitle, stateName, currentUrl);
  const copyTrackedUrl = buildShareUrl({ pageUrl: currentUrl, source: "copylink" });
  const cardSlug = canonicalPath
    ? canonicalPath
        .replace(/^\/task\//, "")
        .replace(/^\//, "")
        .split("/")[0]
    : null;

  const handleCopyLink = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(copyTrackedUrl);
        setCopied(true);
        analytics.shareClick("copy_link", taskTitle, stateName);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // Fallback
    }
  };

  const handleWebShare = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        const shareData = buildWebShareData(taskTitle, stateName, currentUrl);
        await navigator.share(shareData);
        analytics.shareClick("web_share", taskTitle, stateName);
      }
    } catch {
      // Ignore user cancellation
    }
  };

  return (
    <div
      aria-label="Share this guide"
      className={cn(
        "rounded-card border-border bg-background shadow-soft-xs border p-4 print:hidden",
        className
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-text text-xs font-bold tracking-wider uppercase">
          Share Verified Guide
        </h4>
        <span className="text-muted text-[11px]">Help family & friends</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* 1. WhatsApp Button */}
        <a
          href={whatsAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => analytics.shareClick("whatsapp", taskTitle, stateName)}
          aria-label="Share guide on WhatsApp"
          className="rounded-input border-success/30 bg-success-soft hover:bg-success-soft/80 text-success flex h-9 min-w-[100px] flex-1 cursor-pointer items-center justify-center gap-1.5 border px-3 text-xs font-bold transition-all active:scale-98"
        >
          {/* WhatsApp SVG Icon */}
          <svg className="h-4 w-4 shrink-0 fill-current" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
          </svg>
          <span>WhatsApp</span>
        </a>

        {/* 2. Telegram Button */}
        <a
          href={telegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => analytics.shareClick("telegram", taskTitle, stateName)}
          aria-label="Share guide on Telegram"
          className="rounded-input border-border/80 bg-surface-alt/70 hover:bg-surface-alt text-text flex h-9 min-w-[90px] flex-1 cursor-pointer items-center justify-center gap-1.5 border px-3 text-xs font-semibold transition-all active:scale-98"
        >
          <Send className="text-primary h-3.5 w-3.5" aria-hidden="true" />
          <span>Telegram</span>
        </a>

        {/* 3. Social Status Card Download Button (PROMPT 142) */}
        {cardSlug && (
          <a
            href={`/api/cards/${cardSlug}?download=true`}
            target="_blank"
            rel="noopener noreferrer"
            download={`${cardSlug}-checklist-card.svg`}
            aria-label="Download 1080x1350 checklist card for WhatsApp status and social media"
            title="Download 1080x1350 Checklist Card for WhatsApp Status, Instagram & Pinterest"
            className="rounded-input border-border/80 bg-surface-alt/70 hover:bg-surface-alt text-text flex h-9 min-w-[70px] flex-1 cursor-pointer items-center justify-center gap-1.5 border px-2.5 text-xs font-semibold transition-all active:scale-98"
          >
            <ImageIcon className="text-primary h-3.5 w-3.5" aria-hidden="true" />
            <span>Card</span>
          </a>
        )}

        {/* 4. Native Web Share API Button (Mobile browsers) */}
        {canWebShare && (
          <button
            type="button"
            onClick={handleWebShare}
            aria-label="Share via system dialog"
            className="rounded-input border-border/80 bg-surface-alt/70 hover:bg-surface-alt text-text flex h-9 min-w-[80px] flex-1 cursor-pointer items-center justify-center gap-1.5 border px-3 text-xs font-semibold transition-all active:scale-98"
          >
            <Share2 className="text-primary h-3.5 w-3.5" aria-hidden="true" />
            <span>Share</span>
          </button>
        )}

        {/* 4. Copy Link Button */}
        <button
          type="button"
          onClick={handleCopyLink}
          aria-label={copied ? "Link copied to clipboard" : "Copy link to clipboard"}
          className={cn(
            "rounded-input flex h-9 cursor-pointer items-center justify-center gap-1.5 border px-3 text-xs font-semibold transition-all active:scale-98",
            copied
              ? "border-success bg-success-soft text-success"
              : "border-border/80 bg-surface-alt/70 hover:bg-surface-alt text-text"
          )}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="text-muted h-3.5 w-3.5" aria-hidden="true" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
