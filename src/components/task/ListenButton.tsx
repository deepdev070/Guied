"use client";

import React, { useState, useEffect, useRef, useSyncExternalStore } from "react";
import { Volume2, VolumeX, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DocumentRequirement } from "@/types/content";

export interface ListenButtonProps {
  title: string;
  summary: string;
  documents?: DocumentRequirement[];
  locale?: string;
  className?: string;
  variant?: "button" | "chip";
}

type PlaybackStatus = "idle" | "playing" | "paused";

function subscribeToSpeech() {
  return () => {};
}

function getSpeechSnapshot() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function getSpeechServerSnapshot() {
  return false;
}

export function ListenButton({
  title,
  summary,
  documents = [],
  locale = "en",
  className,
  variant = "button",
}: ListenButtonProps) {
  const isSupported = useSyncExternalStore(
    subscribeToSpeech,
    getSpeechSnapshot,
    getSpeechServerSnapshot
  );

  const [status, setStatus] = useState<PlaybackStatus>("idle");
  const [liveAnnouncement, setLiveAnnouncement] = useState("");

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Cancel speech on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // If SpeechSynthesis is not supported, component is hidden (Prompt 102 requirement)
  if (!isSupported) {
    return null;
  }

  const buildSpeechText = (): string => {
    const parts: string[] = [];

    if (locale === "hi") {
      parts.push(`${title}।`);
      parts.push(`सारांश: ${summary}।`);
      if (documents.length > 0) {
        parts.push(`आवश्यक दस्तावेज़:`);
        documents.slice(0, 10).forEach((doc, idx) => {
          parts.push(`${idx + 1}: ${doc.name}। ${doc.description || ""}`);
        });
      }
    } else if (locale === "gu") {
      parts.push(`${title}।`);
      parts.push(`સારાંશ: ${summary}।`);
      if (documents.length > 0) {
        parts.push(`જરૂરી દસ્તાવેજો:`);
        documents.slice(0, 10).forEach((doc, idx) => {
          parts.push(`${idx + 1}: ${doc.name}। ${doc.description || ""}`);
        });
      }
    } else {
      // Default: English
      parts.push(`${title}.`);
      parts.push(`Summary: ${summary}`);
      if (documents.length > 0) {
        parts.push(`Required documents checklist:`);
        documents.slice(0, 10).forEach((doc, idx) => {
          parts.push(`Document ${idx + 1}: ${doc.name}. ${doc.description || ""}`);
        });
      }
    }

    return parts.join(" ");
  };

  const getBestVoice = (targetLocale: string): SpeechSynthesisVoice | null => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    const langPrefix = targetLocale === "hi" ? "hi" : targetLocale === "gu" ? "gu" : "en";

    // 1. Exact match (e.g. hi-IN, gu-IN, en-IN)
    const exact = voices.find((v) => v.lang.toLowerCase() === `${langPrefix}-in`);
    if (exact) return exact;

    // 2. Language prefix match
    const prefix = voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix));
    if (prefix) return prefix;

    return null;
  };

  const handlePlay = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (status === "paused") {
      window.speechSynthesis.resume();
      setStatus("playing");
      setLiveAnnouncement("Resumed audio guide.");
      return;
    }

    window.speechSynthesis.cancel();

    const textToSpeak = buildSpeechText();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utteranceRef.current = utterance;

    // Set voice language
    const langTag = locale === "hi" ? "hi-IN" : locale === "gu" ? "gu-IN" : "en-IN";
    utterance.lang = langTag;
    utterance.rate = 0.95; // Slightly measured rate for clear civic comprehension

    const voice = getBestVoice(locale);
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => {
      setStatus("playing");
      setLiveAnnouncement("Playing audio guide.");
    };

    utterance.onend = () => {
      setStatus("idle");
      setLiveAnnouncement("Audio guide finished.");
    };

    utterance.onerror = () => {
      setStatus("idle");
      setLiveAnnouncement("Audio guide stopped.");
    };

    window.speechSynthesis.speak(utterance);
  };

  const handlePause = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.pause();
    setStatus("paused");
    setLiveAnnouncement("Audio guide paused.");
  };

  const handleStop = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setStatus("idle");
    setLiveAnnouncement("Audio guide stopped.");
  };

  const label =
    locale === "hi"
      ? status === "playing"
        ? "रोकें"
        : status === "paused"
          ? "पुनः सुनें"
          : "सुनें"
      : locale === "gu"
        ? status === "playing"
          ? "રોકો"
          : status === "paused"
            ? "ફરી સાંભળો"
            : "સાંભળો"
        : status === "playing"
          ? "Pause"
          : status === "paused"
            ? "Resume"
            : "Listen";

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      {/* Screen Reader Live Announcement */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {liveAnnouncement}
      </div>

      {status === "idle" ? (
        <button
          type="button"
          onClick={handlePlay}
          aria-label={`Listen to ${title} summary and document checklist`}
          aria-pressed={false}
          className={cn(
            "rounded-input border-border/80 bg-surface text-text hover:border-primary hover:bg-surface-alt hover:text-primary focus-visible:ring-primary/40 flex min-h-[44px] cursor-pointer items-center gap-2 border px-3 text-xs font-semibold shadow-2xs transition-all focus-visible:ring-2 focus-visible:outline-none sm:min-h-[38px]",
            variant === "chip" && "rounded-full px-3 py-1 text-xs"
          )}
        >
          <Volume2 className="text-primary h-4 w-4" aria-hidden="true" />
          <span>{label}</span>
        </button>
      ) : (
        <div className="border-primary/40 bg-primary-soft/50 inline-flex items-center gap-1 rounded-lg border p-1 shadow-2xs">
          <button
            type="button"
            onClick={status === "playing" ? handlePause : handlePlay}
            aria-label={status === "playing" ? "Pause audio playback" : "Resume audio playback"}
            aria-pressed={status === "playing"}
            className="bg-primary hover:bg-primary-hover focus-visible:ring-primary flex min-h-[36px] cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-xs font-bold text-white transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            {status === "playing" ? (
              <>
                <Pause className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{label}</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-white" aria-hidden="true" />
                <span>{label}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleStop}
            aria-label="Stop audio playback"
            className="text-muted hover:text-danger hover:bg-danger-soft/60 focus-visible:ring-danger flex h-9 w-9 cursor-pointer items-center justify-center rounded-md transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            <VolumeX className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
