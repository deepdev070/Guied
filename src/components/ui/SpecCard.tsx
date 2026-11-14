import React from "react";
import { Camera, PenTool, FileText, ExternalLink, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { DocumentSpec } from "@/types/content";
import { cn } from "@/lib/utils";

export interface SpecCardProps {
  spec: DocumentSpec;
  documentName?: string;
  className?: string;
}

export function SpecCard({ spec, documentName, className }: SpecCardProps) {
  const isPhoto = spec.diagramType === "photo";
  const isSignature = spec.diagramType === "signature";

  return (
    <div
      data-testid="spec-card"
      className={cn(
        "rounded-card border-border/90 bg-surface-alt/50 border p-4 text-xs transition-colors",
        className
      )}
    >
      {/* 1. Header Bar */}
      <div className="border-border/60 mb-3 flex items-center justify-between border-b pb-2">
        <div className="flex items-center gap-1.5">
          {isPhoto ? (
            <Camera className="text-primary h-4 w-4" aria-hidden="true" />
          ) : isSignature ? (
            <PenTool className="text-primary h-4 w-4" aria-hidden="true" />
          ) : (
            <FileText className="text-primary h-4 w-4" aria-hidden="true" />
          )}
          <span className="text-text text-[11px] font-bold tracking-wider uppercase">
            Technical Upload Specifications
          </span>
        </div>

        {spec.maxFileSizeLabel && (
          <span className="bg-primary-soft text-primary rounded-full px-2 py-0.5 text-[10px] font-bold">
            {spec.maxFileSizeLabel}
          </span>
        )}
      </div>

      {/* 2. Visual Diagram & Specifications Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-12 sm:items-center">
        {/* Visual Diagram Preview */}
        <div className="flex justify-center sm:col-span-4">
          {isPhoto ? (
            // Passport Photo Diagram (35:45 ratio)
            <div
              data-testid="spec-diagram-photo"
              className="relative flex h-[135px] w-[105px] flex-col items-center justify-center rounded border-2 border-dashed border-slate-300 bg-white p-2 text-center shadow-xs"
            >
              {/* Silhouette head */}
              <div className="mt-1 h-10 w-9 rounded-full border border-slate-300 bg-slate-200" />
              {/* Silhouette shoulders */}
              <div className="mt-0.5 h-7 w-16 rounded-t-full border-t border-slate-300 bg-slate-200" />

              {/* Dimension indicators */}
              <span className="absolute -bottom-2 rounded bg-slate-800 px-1 text-[8px] font-bold tracking-tight text-white">
                35 mm
              </span>
              <span className="absolute top-1/2 -right-3 -translate-y-1/2 rotate-90 rounded bg-slate-800 px-1 text-[8px] font-bold tracking-tight text-white">
                45 mm
              </span>
              <span className="absolute top-1 text-[8px] font-semibold text-slate-500">
                70-80% Face
              </span>
            </div>
          ) : isSignature ? (
            // Signature Scan Box Diagram (4:1 ratio)
            <div
              data-testid="spec-diagram-signature"
              className="relative flex h-[50px] w-[170px] flex-col items-center justify-center rounded border-2 border-dashed border-slate-300 bg-white p-2 text-center shadow-xs"
            >
              {/* Signature cursive line */}
              <span className="font-serif text-base tracking-wider text-slate-700 italic">
                Signature
              </span>
              <span className="absolute -bottom-2 rounded bg-slate-800 px-1 text-[8px] font-bold text-white">
                Dark ink on white paper
              </span>
            </div>
          ) : (
            // Document Scan Diagram
            <div
              data-testid="spec-diagram-doc"
              className="relative flex h-[120px] w-[90px] flex-col justify-between rounded border-2 border-dashed border-slate-300 bg-white p-2 text-left shadow-xs"
            >
              <div className="mt-1 space-y-1">
                <div className="h-1.5 w-10 rounded bg-slate-300" />
                <div className="h-1 w-full rounded bg-slate-200" />
                <div className="h-1 w-full rounded bg-slate-200" />
                <div className="h-1 w-12 rounded bg-slate-200" />
              </div>
              <span className="text-primary text-center text-[8px] font-bold uppercase">
                Clean PDF / Scan
              </span>
            </div>
          )}
        </div>

        {/* Spec Details Table */}
        <div className="space-y-2 sm:col-span-8">
          {spec.dimensions && (
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-muted font-medium">Dimensions:</span>
              <span className="text-text font-bold">{spec.dimensions}</span>
            </div>
          )}

          {spec.backgroundColor && (
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-muted font-medium">Background:</span>
              <span className="text-text font-semibold">{spec.backgroundColor}</span>
            </div>
          )}

          {spec.maxFileSizeLabel && (
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-muted font-medium">Max File Size:</span>
              <span className="text-text font-semibold">{spec.maxFileSizeLabel}</span>
            </div>
          )}

          {spec.acceptedFormats && spec.acceptedFormats.length > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted font-medium">Accepted Formats:</span>
              <div className="flex items-center gap-1">
                {spec.acceptedFormats.map((fmt) => (
                  <Badge key={fmt} variant="neutral">
                    {fmt}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Essential Rules Checklist */}
      {spec.instructions && spec.instructions.length > 0 && (
        <div className="border-border/60 mt-3 border-t pt-2.5">
          <ul className="space-y-1 text-[11px] text-slate-700">
            {spec.instructions.map((inst, idx) => (
              <li key={`inst-${idx}`} className="flex items-start gap-1.5">
                <CheckCircle2
                  className="text-success mt-0.5 h-3.5 w-3.5 shrink-0"
                  aria-hidden="true"
                />
                <span>{inst}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 4. Link to Official Upload Guidance */}
      {spec.guidanceUrl && (
        <div className="border-border/60 mt-3 border-t pt-2 text-right">
          <a
            href={spec.guidanceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary-hover inline-flex items-center gap-1 text-[11px] font-bold underline underline-offset-2 transition-colors"
          >
            <span>Official {documentName || "portal"} upload guidelines</span>
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        </div>
      )}
    </div>
  );
}
